import { EmailDocument } from '../models';



// To run this code you need to install the following dependencies:
// npm install @google/genai mime
// npm install -D @types/node

import {
  GoogleGenAI,
} from '@google/genai';

const CATAGORIZE_PROMPT = `You are an expert email categorization tool, you will be provided an email in the form of this model:
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
    flags: string[];      // IMAP flags (e.g., '\\Seen', '\\Answered')
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


and you have to just return the  aiCategory as a one word string which will be of type: 'Interested' | 'Meeting Booked' | 'Not Interested' | 'Spam' | 'Out of Office' | 'Unknown';

Remember to return a single string of the given aiCategory type and nothing else`


const useAI = async (email: EmailDocument, prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const config = {
    temperature: 0,
  };
  const model = 'gemini-2.5-pro';
    
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: prompt,
        },
        {
          text: JSON.stringify(email),
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model: model,
    contents: contents,
    config: config,
  });
  
  return response.text ?? '';
};

export const applyAICategorization = async (
  email: EmailDocument,
): Promise<EmailDocument> => {
  try {
    const aiCategory = await useAI(email, CATAGORIZE_PROMPT);
    return { ...email, aiCategory } as EmailDocument;
  } catch (error) {
    console.error('Error during AI categorization:', error);
    return { ...email, aiCategory: 'Unknown' } as EmailDocument;
  }
};



const REPLY_PROMPT = `You are an expert email reply suggestion tool, you will be provided an email in the form of this model:
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
    flags: string[];      // IMAP flags (e.g., '\\Seen', '\\Answered')
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


and you have to just return the suggested reply as a single string based on the email content. The suggested reply should be concise and relevant to the email's subject and content. Its length should not exceed 100 characters as it must be a brief response. Your response should be a single`;


export const getSuggestedReply = async (
  email: EmailDocument,
): Promise<string> => {
  try {
    const suggestedReply = await useAI(email, REPLY_PROMPT);
    return suggestedReply;
  } catch (error) {
    console.error('Error during AI reply suggestion:', error);
    return 'Failed to generate suggested reply';
  }
};