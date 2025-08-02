// src/services/elasticService
import { Client } from '@elastic/elasticsearch';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';
import { inspect } from 'util'; // For logging detailed objects
import { EmailDocument, EmailFilters } from '../models'; // Import EmailDocument and EmailFilters

dotenv.config();

const ELASTICSEARCH_NODE = process.env.ELASTICSEARCH_NODE || 'http://localhost:9200';

export const elasticClient = new Client({
    node: ELASTICSEARCH_NODE,
auth: {
    apiKey: 'N19vc2E1Z0JnQm5teHdQaV9qalY6dzRtQ2ttYzZBV0Nlc2FTSXF2WW5mUQ=='
  },
    // * CRUCIAL FIX for v7.x client with v8.x server when apiVersion is not accepted *
    // For @elastic/elasticsearch v7.x connecting to Elasticsearch v8.x,
    // use the Connection options to specify compatibility mode.
    Connection: require('@elastic/elasticsearch/lib/Connection'), // Import Connection class
    maxRetries: 3,
    requestTimeout: 60000, // 60 seconds timeout
    // @ts-ignore // Temporarily ignore type checking for this line if strictness persists
    headers: {
        'x-elastic-client-meta': 'es=8.x,js=7.x,t=Node.js,v=7.17.0' // Matches client version and target ES version
    }
});

const INDEX_NAME = 'emails';

/**
 * Connects to Elasticsearch and checks its health.
 */
export async function connectElasticsearch(): Promise<void> {
    try {
        await elasticClient.ping();
        logger.info('Successfully connected to Elasticsearch');

        const indexExistsResponse = await elasticClient.indices.exists({ index: INDEX_NAME });
        // For @elastic/elasticsearch v7.x, the result of .exists() is typically in body
        // and body is a boolean.
        if (!indexExistsResponse.body) {
            logger.info(`Elasticsearch index '${INDEX_NAME}' does not exist. Creating it now...`);

            await elasticClient.indices.create({
                index: INDEX_NAME,
                body: {
                    mappings: {
                        properties: {
                            accountId: { type: 'keyword' },
                            folder: { type: 'keyword' },
                            messageId: { type: 'keyword' },
                            uid: { type: 'long' },
                            from: { type: 'text' },
                            to: { type: 'text' },
                            subject: { type: 'text', analyzer: 'standard' },
                            date: { type: 'date' },
                            flags: { type: 'keyword' },
                            html: { type: 'text', index: false },
                            text: { type: 'text', analyzer: 'standard' },
                            aiCategory: { type: 'keyword' }
                        }
                    }
                }
            });
            logger.info(`Elasticsearch index '${INDEX_NAME}' created successfully.`);
        } else {
            logger.info(`Elasticsearch index '${INDEX_NAME}' already exists.`);
        }

    } catch (error) {
        logger.error('Failed to connect to Elasticsearch or create index:', error);
        throw new Error('Elasticsearch connection failed');
    }
}

/**
 * Indexes a single email document into Elasticsearch.
 * @param email The email object to index.
 */
export async function indexEmail(email: EmailDocument) { // Use EmailDocument type
    try {
        const response = await elasticClient.index({
            index: INDEX_NAME,
            id: `${email.accountId}-${email.uid}`,
            body: email,
            op_type: 'index'
        });
        logger.debug(`Email indexed: ${response.body?.result} (ID: ${response.body?._id})`);
        return response;
    } catch (error) {
        logger.error('Failed to index email:', error);
        throw error;
    }
}

/**
 * Searches for emails in Elasticsearch.
 * @param query The search query string.
 * @param filters Optional filters (e.g., accountId, folder, aiCategory).
 * @returns Search results (EmailDocument[]).
 */
export async function searchEmails(query: string, filters: EmailFilters = {}): Promise<EmailDocument[]> {
    try {
        const must: any[] = [];
        const filter: any[] = [];

        if (query) {
            must.push({
                multi_match: {
                    query: query,
                    fields: ['subject', 'text', 'from', 'to']
                }
            });
        }

        if (filters.accountId) {
            filter.push({ term: { accountId: filters.accountId } });
        }
        if (filters.folder) {
            filter.push({ term: { folder: filters.folder } });
        }
        if (filters.aiCategory) {
            filter.push({ term: { aiCategory: filters.aiCategory } });
        }

        const searchBody = {
            query: {
                bool: {
                    must: must.length > 0 ? must : undefined,
                    filter: filter.length > 0 ? filter : undefined
                }
            }
        };

        logger.debug('Elasticsearch search body:', JSON.stringify(searchBody, null, 2));

        const { body: { hits } } = await elasticClient.search({
            index: INDEX_NAME,
            body: searchBody,
            size: 100 // Fetch up to 100 results
        });

        logger.debug("Raw Elasticsearch hits from searchEmails:", inspect(hits.hits, false, 5)); // Log raw hits

        const emails: EmailDocument[] = hits.hits.map((hit: any) => ({
            id: hit._id, // FIX: Explicitly add the Elasticsearch _id as 'id'
            ...hit._source, // Spread all other original fields
        }));

        const totalHits = typeof hits.total === 'number' ? hits.total : hits.total?.value;
        logger.info(`Elasticsearch search found ${totalHits} hits.`);

        logger.debug("Mapped EmailDocuments before sending to frontend:", inspect(emails, false, 5)); // Log mapped emails

        return emails;
    } catch (error) {
        logger.error('Elasticsearch search failed:', error);
        throw new Error('Elasticsearch search failed.');
    }
}