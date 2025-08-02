// src/services/imapService
import IMAP from 'node-imap';
import { simpleParser, AddressObject } from 'mailparser';
import { inspect } from 'util';
import { logger } from '../utils/logger';
import { elasticClient, indexEmail } from './searchIndexer';
import { IMAPAccountConfig, EmailDocument } from '../models';
import { applyAICategorization } from './aiEngine';
import { sendInterestedEmailNotification } from './channelAlertService';
import { triggerWebhook } from './notificationBridge';
import dotenv from 'dotenv';
import { EventEmitter } from 'events';

dotenv.config();

const imapClients = new Map<string, IMAP>();
const imapConnectionStatus = new Map<string, string>();
const imapSyncEvents = new EventEmitter();

// Rate limiting for AI categorization (30 seconds between calls)
let lastAICategorizeTime = 0;
const AI_RATE_LIMIT_MS = 30 * 1000; // 30 seconds
const aiCategorizationQueue: EmailDocument[] = [];
let isProcessingAIQueue = false;

async function processAICategorizationQueue(): Promise<void> {
    if (isProcessingAIQueue || aiCategorizationQueue.length === 0) {
        return;
    }

    isProcessingAIQueue = true;

    while (aiCategorizationQueue.length > 0) {
        const now = Date.now();
        const timeSinceLastCall = now - lastAICategorizeTime;

        if (timeSinceLastCall < AI_RATE_LIMIT_MS) {
            const waitTime = AI_RATE_LIMIT_MS - timeSinceLastCall;
            logger.info(`Rate limiting AI categorization. Waiting ${waitTime}ms before next call.`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }

        const emailToProcess = aiCategorizationQueue.shift();
        if (!emailToProcess) break;

        try {
            logger.info(`Processing AI categorization for email: ${emailToProcess.subject}`);
            const categorizedEmail = await applyAICategorization(emailToProcess);
            lastAICategorizeTime = Date.now();

            // Re-index the email with the AI category
            await indexEmail(categorizedEmail);
            logger.info(`AI categorization completed for email: ${categorizedEmail.subject} (Category: ${categorizedEmail.aiCategory})`);

            // Check if it's an interested email and send notifications
            if (categorizedEmail.aiCategory === 'Interested') {
                logger.info(`Detected 'Interested' email: ${categorizedEmail.subject}. Sending Slack notification and triggering webhook.`);
                sendInterestedEmailNotification(categorizedEmail);
                triggerWebhook(categorizedEmail);
            }
        } catch (error) {
            logger.error(`Error during AI categorization for email ${emailToProcess.subject}:`, error);
        }
    }

    isProcessingAIQueue = false;
}

function getIMAPAccountConfigs(): IMAPAccountConfig[] {
    const configs: IMAPAccountConfig[] = [];
    let i = 1;
    while (process.env[`IMAP_USER_${i}`]) {
        const config: IMAPAccountConfig = {
            id: `account-${i}`,
            email: process.env[`IMAP_USER_${i}`]!,
            password: process.env[`IMAP_PASS_${i}`]!,
            host: process.env[`IMAP_HOST_${i}`]!,
            port: parseInt(process.env[`IMAP_PORT_${i}`] || '993'),
            tls: process.env[`IMAP_TLS_${i}`] === 'true',
            lastSyncDate: undefined
        };
        configs.push(config);
        i++;
    }
    return configs;
}

async function connectAndSyncAccount(config: IMAPAccountConfig): Promise<void> {
    return new Promise((resolve, reject) => {
        if (imapClients.has(config.id)) {
            logger.warn(`IMAP client for ${config.email} already exists. Ending existing connection to re-establish.`);
            imapClients.get(config.id)?.end();
            imapClients.delete(config.id);
        }

        const imap = new IMAP({
            user: config.email,
            password: config.password,
            host: config.host,
            port: config.port,
            tls: config.tls,
            tlsOptions: { rejectUnauthorized: false }
        });

        imapClients.set(config.id, imap);
        imapConnectionStatus.set(config.id, 'connecting');
        logger.info(`Attempting to connect to IMAP account: ${config.email}`);

        imap.once('ready', () => {
            logger.info(`IMAP connection established for ${config.email}`);
            imapConnectionStatus.set(config.id, 'connected');
            resolve();

            syncAccountEmails(imap, config);

            imap.on('mail', (numNewMsgs) => {
                logger.info(`New mail in INBOX for ${config.email}! (${numNewMsgs} new messages)`);
                imap.end();
            });

            imap.on('expunge', (seqno) => {
                logger.info(`Email expunged in INBOX for ${config.email} at seqno ${seqno}.`);
            });

            imap.on('error', (err: Error) => {
                logger.error(`IMAP Error for ${config.email}:`, err);
                imapConnectionStatus.set(config.id, 'error');
                setTimeout(() => connectAndSyncAccount(config), 5000);
            });

            imap.once('end', () => {
                logger.warn(`IMAP connection ended for ${config.email}. Attempting to reconnect.`);
                imapConnectionStatus.set(config.id, 'disconnected');
                setTimeout(() => connectAndSyncAccount(config), 5000);
            });
        });

        imap.once('error', (err: Error) => {
            logger.error(`IMAP connection initial error for ${config.email}:`, err);
            imapConnectionStatus.set(config.id, 'error');
            reject(err);
        });

        imap.connect();
    });
}

async function startIdleMode(imap: IMAP, config: IMAPAccountConfig): Promise<void> {
    return new Promise((resolve) => {
        // Check if 'idle' method exists and is a function
        if (typeof (imap as any).idle === 'function') {
            // If it exists, attempt to start IDLE mode
            (imap as any).idle((err: Error) => {
                if (err) {
                    logger.error(`Error starting IDLE for ${config.email}:`, err);
                    imap.end(); // End connection to trigger a reconnect if IDLE fails
                } else {
                    logger.info(`IMAP IDLE mode started for ${config.email}`);
                }
                resolve();
            });
        } else {
            // If 'idle' method is not found, log a warning and fall back to polling
            logger.warn(`IMAP.idle() method not found for ${config.email}. Falling back to polling for real-time updates (not ideal for battery/network).`);
            // Fallback to periodic polling: end connection to force a re-open and re-sync
            // This simulates checking for new mail without proper IDLE
            setInterval(() => {
                logger.debug(`Polling for new emails for ${config.email}...`);
                imap.end(); // This will trigger the 'end' event, which calls connectAndSyncAccount again.
            }, 60 * 1000); // Poll every 1 minute (60 seconds)
            resolve();
        }
    });
}


async function syncAccountEmails(imap: IMAP, config: IMAPAccountConfig) {
    let openBoxRetries = 0;
    const MAX_OPEN_BOX_RETRIES = 5;

    const openInbox = () => {
        imap.openBox('INBOX', false, (err, box) => {
            if (err) {
                logger.error(`Failed to open INBOX for ${config.email}:`, err);
                if (openBoxRetries < MAX_OPEN_BOX_RETRIES) {
                    openBoxRetries++;
                    logger.warn(`Retrying open INBOX for ${config.email} (Attempt ${openBoxRetries})...`);
                    setTimeout(openInbox, 5000);
                } else {
                    logger.error(`Max retries reached for INBOX for ${config.email}. Giving up for now.`);
                    imap.end();
                }
                return;
            }

            logger.info(`Opened INBOX for ${config.email}. Total messages: ${box.messages.total}`);

            let searchCriteria: any[] = [];
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            if (config.lastSyncDate) {
                const lastSyncAdjusted = new Date(config.lastSyncDate);
                lastSyncAdjusted.setDate(lastSyncAdjusted.getDate() - 1);
                const sinceDate = lastSyncAdjusted > thirtyDaysAgo ? lastSyncAdjusted : thirtyDaysAgo;
                searchCriteria = [['SINCE', sinceDate]];
                logger.info(`Fetching emails for ${config.email} since ${sinceDate.toDateString()}`);
            } else {
                searchCriteria = [['SINCE', thirtyDaysAgo]];
                logger.info(`Performing initial fetch for ${config.email} (last 30 days) since ${thirtyDaysAgo.toDateString()}`);
            }

            imap.search(searchCriteria, (searchErr, uids) => {
                if (searchErr) {
                    logger.error(`IMAP search error for ${config.email}:`, searchErr);
                    imap.end();
                    return;
                }

                if (uids.length === 0) {
                    logger.info(`No new emails found for ${config.email} based on criteria. Attempting to start IDLE.`);
                    config.lastSyncDate = new Date();
                    imapSyncEvents.emit('syncComplete', config.id);
                    startIdleMode(imap, config); // <--- CALLING HELPER HERE
                    return;
                }

                logger.info(`Found ${uids.length} emails to fetch for ${config.email}.`);

                const fetch = imap.fetch(uids, {
                    bodies: [''],
                    struct: true,
                    envelope: true,
                    markSeen: false
                });

                fetch.on('message', (msg, seqno) => {
                    const prefix = `(#${seqno})`;
                    let emailData: Partial<EmailDocument> = {
                        accountId: config.id,
                        folder: box.name,
                        seqno: seqno,
                        flags: [],
                        createdAt: new Date(),
                        updatedAt: new Date()
                    };
                    let rawEmailSize = 0;
                    let emailBodyStream: Buffer[] = [];

                    msg.on('body', (stream, info) => {
                        rawEmailSize = info.size;
                        stream.on('data', (chunk) => {
                            emailBodyStream.push(chunk);
                        });
                        stream.once('end', async () => {
                            try {
                                const parsed = await simpleParser(Buffer.concat(emailBodyStream));

                                const getAddressText = (addresses?: AddressObject | AddressObject[] | null) => {
                                    if (!addresses) return undefined;
                                    if (Array.isArray(addresses)) {
                                        return addresses.map(addr => addr.text).join(', ');
                                    }
                                    return addresses.text;
                                };

                                emailData = {
                                    ...emailData,
                                    messageId: parsed.messageId || `no-message-id-${config.id}-${seqno}-${Date.now()}`,
                                    uid: emailData.uid || seqno,
                                    from: getAddressText(parsed.from) || 'unknown',
                                    to: getAddressText(parsed.to) || 'unknown',
                                    cc: getAddressText(parsed.cc),
                                    bcc: getAddressText(parsed.bcc),
                                    subject: parsed.subject || '(no subject)',
                                    date: parsed.date || new Date(),
                                    html: parsed.html || undefined,
                                    text: parsed.text || undefined,
                                    size: rawEmailSize,
                                };

                                if (parsed.attachments && parsed.attachments.length > 0) {
                                    emailData.attachments = parsed.attachments.map(att => ({
                                        filename: att.filename || 'untitled',
                                        size: att.size || 0,
                                        contentType: att.contentType || 'application/octet-stream'
                                    }));
                                }

                               
                                let categorizedEmail = emailData as EmailDocument;

                                await indexEmail(categorizedEmail);
                                imapSyncEvents.emit('emailIndexed', categorizedEmail);
                                logger.debug(`${prefix} Successfully indexed email from ${config.email}: ${categorizedEmail.subject} (Category: ${categorizedEmail.aiCategory})`);

                                if (categorizedEmail.aiCategory === 'Interested') {
                                    logger.info(`Detected 'Interested' email: ${categorizedEmail.subject}. Sending Slack notification and triggering webhook.`);
                                    sendInterestedEmailNotification(categorizedEmail);
                                    triggerWebhook(categorizedEmail);
                                }

                            } catch (parseErr) {
                                logger.error(`${prefix} Error parsing or indexing email for ${config.email}:`, parseErr);
                            }
                        });
                    });

                    msg.on('attributes', (attrs) => {
                        emailData.flags = attrs.flags;
                        emailData.uid = attrs.uid;
                        logger.debug(`${prefix} Attributes for ${config.email}: ${inspect(attrs, false, 8)}`);
                    });

                    msg.once('end', () => {
                        logger.debug(`${prefix} Finished processing message for ${config.email}`);
                    });
                });

                fetch.once('error', (err: Error) => {
                    logger.error(`Fetch error for ${config.email}:`, err);
                    imap.end();
                });

                fetch.once('end', () => {
                    logger.info(`Finished fetching all messages for ${config.email}. Attempting to start IDLE.`);
                    config.lastSyncDate = new Date();
                    imapSyncEvents.emit('syncComplete', config.id);
                    startIdleMode(imap, config); // <--- CALLING HELPER HERE
                });
            });
        });
    };
    openInbox();
}

export async function connectIMAPAccounts(): Promise<void> {
    const configs = getIMAPAccountConfigs();
    if (configs.length === 0) {
        logger.warn('No IMAP account configurations found in .env.');
        return;
    }

    const connectionPromises = configs.map(config => connectAndSyncAccount(config)
        .catch(err => {
            logger.error(`Failed to connect/sync ${config.email} on initial attempt:`, err);
        }));

    await Promise.allSettled(connectionPromises);
    logger.info('Attempted to connect to all IMAP accounts.');
}

export function getImapConnectionStatus(): Map<string, string> {
    return imapConnectionStatus;
}

export function getIMAPAccountById(accountId: string): IMAPAccountConfig | undefined {
    const configs = getIMAPAccountConfigs();
    return configs.find(config => config.id === accountId);
}

export const imapEvents = imapSyncEvents;

process.on('SIGINT', () => {
    logger.info('Closing IMAP connections due to SIGINT...');
    imapClients.forEach(imap => imap.end());
    process.exit();
});

process.on('SIGTERM', () => {
    logger.info('Closing IMAP connections due to SIGTERM...');
    imapClients.forEach(imap => imap.end());
    process.exit();
});