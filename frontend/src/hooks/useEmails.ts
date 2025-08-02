// Custom hook for fetching emails from ReachInbox backend
import { useState, useEffect } from 'react';
import { fetchEmails } from '../utils/api';

export interface Email {
  id: string;
  sender: string;
  subject: string;
  snippet: string;
  date: string;
  category: string;
  account: string;
  folder: string;
  to?: string;
  cc?: string;
  content?: string;
}

export function useEmails(filters: {
  folder?: string;
  account?: string;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}) {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchEmails({
      ...filters,
      q: filters.search
    })
      .then(data => {
        // Support both array and object response
        if (Array.isArray(data)) {
          setEmails(data);
          setHasMore(false);
        } else if (data && Array.isArray(data.emails)) {
          setEmails(data.emails);
          setHasMore(!!data.hasMore);
        } else {
          setEmails([]);
          setHasMore(false);
        }
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch emails');
      })
      .finally(() => setLoading(false));
  }, [filters.folder, filters.account, filters.category, filters.search, filters.page, filters.pageSize]);

  return { emails, loading, error, hasMore };
}
