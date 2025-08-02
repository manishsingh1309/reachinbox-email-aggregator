// src/services/slackService
import { WebClient } from '@slack/web-api';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';
import { EmailDocument } from '../models';
import { getIMAPAccountById } from './mailboxConnector'; // Import the helper from imapService

dotenv.config();

const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const SLACK_CHANNEL_ID = process.env.SLACK_CHANNEL_ID;

let slackClient: WebClient | null = null;

/**
 * Initializes the Slack WebClient. Call this once on application startup.
 */
export function initializeSlackClient(): void {
    if (!SLACK_BOT_TOKEN || !SLACK_CHANNEL_ID) {
        logger.warn('Slack bot token or channel ID not found in .env. Slack notifications will be disabled.');
        return;
    }

    try {
        slackClient = new WebClient(SLACK_BOT_TOKEN);
        logger.info('Slack client initialized. Notifications will be sent to channel ID:', SLACK_CHANNEL_ID);
    } catch (error) {
        logger.error('Failed to initialize Slack client:', error);
        slackClient = null;
    }
}

/**
 * Sends a Slack notification for a new 'Interested' email.
 * @param email The categorized EmailDocument.
 */
export async function sendInterestedEmailNotification(email: EmailDocument): Promise<void> {
    if (!slackClient || !SLACK_CHANNEL_ID) {
        logger.warn('Slack client not initialized or channel ID missing. Cannot send notification for email:', email.subject);
        return;
    }

    const accountConfig = getIMAPAccountById(email.accountId); // Fetch the account config
    const accountEmail = accountConfig ? accountConfig.email : 'Unknown Account'; // Get the email address

    const message = `
    📧 *New Interested Email!* 🥳
    *From:* ${email.from}
    *Subject:* ${email.subject}
    *Account:* ${email.accountId} (${accountEmail})
    *Category:* ${email.aiCategory}
    *Date:* ${email.date.toLocaleString()}
    `;

    try {
        await slackClient.chat.postMessage({
            channel: SLACK_CHANNEL_ID,
            text: message,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: message
                    }
                }
            ]
        });
        logger.info(`Slack notification sent for interested email: '${email.subject}' from ${email.from}`);
    } catch (error: any) {
        logger.error(`Failed to send Slack notification for email '${email.subject}':`, error.message, error.response?.data);
    }
}