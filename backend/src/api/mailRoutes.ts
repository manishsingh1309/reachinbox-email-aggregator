// src/api/emailRoutes.ts
import { Router, Request, Response } from 'express';
import { searchEmails, elasticClient } from '../services/searchIndexer';
import { getSuggestedReply } from '../services/aiEngine'; // NEW: Import getSuggestedReply
import { logger } from '../utils/logger';
import { EmailDocument } from '../models'; // NEW: Import EmailDocument

const router = Router();

/**
 * GET /api/emails
 * Fetches emails from Elasticsearch with optional search and filters.
 * Query Parameters:
 * - q: Search query string (e.g., subject, sender, body content)
 * - accountId: Filter by specific email account ID
 * - folder: Filter by IMAP folder (e.g., 'INBOX', 'Sent Items')
 * - aiCategory: Filter by AI categorization label
 */
router.get('/', async (req: Request, res: Response) => {
    try {
        const { q, accountId, folder, aiCategory } = req.query;

        const filters: { accountId?: string; folder?: string; aiCategory?: string } = {};
        if (typeof accountId === 'string' && accountId) {
            filters.accountId = accountId;
        }
        if (typeof folder === 'string' && folder) {
            filters.folder = folder;
        }
        if (typeof aiCategory === 'string' && aiCategory) {
            filters.aiCategory = aiCategory;
        }

        const emails = await searchEmails(q as string || '', filters);
        res.json(emails);
    } catch (error: any) {
        logger.error('Error fetching emails from Elasticsearch:', error);
        res.status(500).json({ message: 'Failed to fetch emails', error: error.message });
    }
});

/**
 * GET /api/emails/:id
 * Fetches a single email by its ID (Elasticsearch document ID: accountId-uid).
 */
router.get('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const response = await elasticClient.get({
            index: 'emails',
            id: id
        });

        if (response.body && response.body._source) {
            res.json(response.body._source);
        } else {
            res.status(404).json({ message: 'Email not found' });
        }
    } catch (error: any) {
        if (error.statusCode === 404) {
            res.status(404).json({ message: 'Email not found' });
        } else {
            logger.error(`Error fetching email with ID ${req.params.id}:`, error);
            res.status(500).json({ message: 'Failed to fetch email', error: error.message });
        }
    }
});

/**
 * GET /api/emails/:id/suggest-reply
 * Generates a suggested reply for a specific email using AI.
 */
router.get('/:id/suggest-reply', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // First, fetch the original email content from Elasticsearch
        const emailResponse = await elasticClient.get({
            index: 'emails',
            id: id
        });

        if (!emailResponse.body || !emailResponse.body._source) {
            return res.status(404).json({ message: 'Original email not found to suggest a reply.' });
        }

        const originalEmail: EmailDocument = emailResponse.body._source as EmailDocument;

        // Then, use the AI service to get a suggested reply
        const suggestedReply = await getSuggestedReply(originalEmail);

        res.json({ reply: suggestedReply });

    } catch (error: any) {
        logger.error(`Error generating suggested reply for email ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Failed to generate suggested reply', error: error.message });
    }
});

export default router;