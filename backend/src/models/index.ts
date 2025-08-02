// src/models/index.ts

/**
 * Represents the configuration for an IMAP email account.
 */
export interface IMAPAccountConfig {
    id: string; // Unique ID for the account (e.g., hash of email, or user-defined ID)
    email: string;
    password: string; // App password or actual password
    host: string;
    port: number;
    tls: boolean;
    lastSyncDate?: Date; // To track last successful sync, useful for initial fetch range
}

/**
 * Represents a single email document to be stored and indexed in Elasticsearch.
 * This combines IMAP fetched data with additional fields for our system.
 */
export interface EmailDocument {
    accountId: string;    // ID of the IMAP account this email belongs to
    folder: string;       // IMAP folder name (e.g., 'INBOX', 'Sent Items')
    messageId: string;    // Standard Message-ID header (unique identifier across systems)
    uid: number;          // IMAP UID (unique per folder, per IMAP session)
    seqno?: number;       // IMAP sequence number (volatile)
    from: string;
    to: string;
    cc?: string;
    bcc?: string;
    subject: string;
    date: Date;           // Date of the email
    flags: string[];      // IMAP flags (e.g., '\Seen', '\Answered')
    html?: string;        // HTML body of the email
    text?: string;        // Plain text body of the email
    attachments?: { // Minimal attachment info
        filename: string;
        size: number;
        contentType: string;
    }[];
    size: number;         // Total size of the email in bytes
    aiCategory?: 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office' | 'Unknown'; // AI-categorization label
    createdAt: Date;      // When this email was first processed/indexed by our system
    updatedAt: Date;      // When this email was last updated in our system
    // --- CRUCIAL FIX: ADD THE 'id' PROPERTY HERE ---
    id: string; // This will store Elasticsearch's _id (e.g., "account-1-uid-123")
    // --- END CRUCIAL FIX ---
}

// NEW: Define and export the EmailFilters interface (was missing in your previous file)
export interface EmailFilters {
    accountId?: string;
    folder?: string;
    aiCategory?: string;
}