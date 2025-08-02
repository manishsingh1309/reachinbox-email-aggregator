// ReachInbox API helper using Axios
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add interceptor for error logging
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    alert('API Error: ' + (error?.response?.data?.message || error.message));
    return Promise.reject(error);
  }
);

// Fetch emails with filters and pagination
export const fetchEmails = async (params: {
  folder?: string;
  account?: string;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  q?: string;
}) => {
  const queryParams: any = {};
  queryParams.accountId = params.account || 'account-2';
  queryParams.folder = params.folder || 'INBOX';
  if (params.q) queryParams.q = params.q;
  if (params.search) queryParams.q = params.search;
  if (params.category) queryParams.aiCategory = params.category;
  if (params.page) queryParams.page = params.page;
  if (params.pageSize) queryParams.pageSize = params.pageSize;
  const response = await api.get('/emails', { params: queryParams });
  return response.data;
};

// Fetch single email detail
export const fetchEmailDetail = async (id: string) => {
  const response = await api.get(`/emails/${id}`);
  return response.data;
};

// Fetch AI suggested reply for an email
export const fetchSuggestedReply = async (id: string) => {
  const response = await api.get(`/emails/${id}/suggest-reply`);
  return response.data;
};
