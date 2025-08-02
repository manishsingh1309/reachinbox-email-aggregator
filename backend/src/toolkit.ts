import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectIMAPAccounts } from './services/mailboxConnector';
import { connectElasticsearch } from './services/searchIndexer';
import { initializeSlackClient } from './services/channelAlertService';
// NEW: Import Ollama/Gemini Embedding initialization functions


import emailRoutes from './api/mailRoutes';
import { logger } from './utils/logger';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: true, // Allow all origins for development
    credentials: true
}));

app.use(express.json());

// --- Routes ---
app.use('/api/emails', emailRoutes);

// Basic health check route
app.get('/', (req: Request, res: Response) => {
  res.send('Next Level Onebox Backend is Running!');
});

// --- Server Start ---
const startServer = async () => {
  try {
    await connectElasticsearch();
    logger.info('Connected to Elasticsearch');

    // Initialize AI related services
    initializeSlackClient();

    // NEW: Initialize Ollama (for generation) and Gemini (for embeddings)
    
    logger.info('AI services initialized.');

    await connectIMAPAccounts();
    logger.info('IMAP connections initialized (will attempt to connect/sync now)');

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Access frontend at http://localhost:${PORT}/ (once served)`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();