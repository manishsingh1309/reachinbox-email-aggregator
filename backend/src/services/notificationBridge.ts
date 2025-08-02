// src/services/webhookService
import { logger } from '../utils/logger';
import { EmailDocument } from '../models';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const WEBHOOK_URL = process.env.WEBHOOK_URL;

/**
 * Sends an HTTP POST request to a configured webhook URL.
 * This is triggered when an email is categorized as 'Interested'.
 * @param email The EmailDocument that triggered the webhook.
 */
export async function triggerWebhook(email: EmailDocument): Promise<void> {
    if (!WEBHOOK_URL) {
        logger.warn('Webhook URL not found in .env. Webhooks will not be triggered for email:', email.subject);
        return;
    }

    try {
        const payload = {
            event: 'email_categorized_interested',
            timestamp: new Date().toISOString(),
            email: {
                accountId: email.accountId,
                messageId: email.messageId,
                subject: email.subject,
                from: email.from,
                to: email.to,
                date: email.date.toISOString(),
                aiCategory: email.aiCategory,
                // You can include more email details here if needed
            }
        };

        const response = await axios.post(WEBHOOK_URL, payload);
        logger.info(`Webhook successfully triggered for interested email: '${email.subject}' to ${WEBHOOK_URL}. Status: ${response.status}`);
        logger.debug('Webhook response data:', response.data);
    } catch (error: any) {
        logger.error(`Failed to trigger webhook for email '${email.subject}':`, error.message, error.response?.data);
    }
}