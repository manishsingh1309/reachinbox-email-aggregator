import React, { useState, useEffect, useCallback } from 'react';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip, Alert, Stack, Select, MenuItem, FormControl, InputLabel, Button, Tooltip, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress } from '@mui/material';
import { Reply as ReplyIcon } from '@mui/icons-material';
import { useEmails } from '../hooks/useEmails';
import type { Email } from '../hooks/useEmails';
import SkeletonLoader from '../components/SkeletonLoader';
import { fetchSuggestedReply } from '../utils/api';

const categories = [
  { label: 'Interested', color: 'success' },
  { label: 'Meeting Booked', color: 'secondary' },
  { label: 'Not Interested', color: 'warning' },
  { label: 'Spam', color: 'error' },
  { label: 'Out of Office', color: 'info' },
];

const folders = ['INBOX', 'Sent', 'Spam', 'Custom'];
const accounts = ['account-1', 'account-2'];

const getMockCategory = (email: Email): string => {
  if (email.category && categories.some(c => c.label === email.category)) {
    return email.category;
  }
  
  const mockCategories = categories.map(c => c.label);
  const hash = email.id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return mockCategories[Math.abs(hash) % mockCategories.length];
};

import { useSearchParams } from 'react-router-dom';

const EmailList: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [folder, setFolder] = useState(searchParams.get('folder') || 'INBOX');
  const [account, setAccount] = useState(searchParams.get('account') || 'account-2');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);
  const pageSize = 20;

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const [suggestedReply, setSuggestedReply] = useState<string>('');
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [loadingReply, setLoadingReply] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  useEffect(() => {
    const params: Record<string, string> = {};
    
    if (folder && folder !== 'INBOX') {
      params.folder = folder;
    }
    
    if (account && account !== 'account-2') {
      params.account = account;
    }
    
    if (category) {
      params.category = category;
    }
    
    if (search) {
      params.search = search;
    }
    
    if (page > 1) {
      params.page = String(page);
    }
    
    setSearchParams(params);
  }, [folder, account, category, search, page, setSearchParams]);

  useEffect(() => {
    setPage(1);
  }, [folder, account, category, debouncedSearch]);

  const { emails, loading, error, hasMore } = useEmails({ folder, account, category, search: debouncedSearch, page, pageSize });

  const handleSuggestReply = async (email: Email) => {
    setSelectedEmail(email);
    setLoadingReply(true);
    setReplyDialogOpen(true);
    setSuggestedReply('');
    
    try {
      const response = await fetchSuggestedReply(email.id);
      setSuggestedReply(response.reply || 'No suggested reply available');
    } catch (error) {
      setSuggestedReply('Failed to generate suggested reply. Please try again.');
    } finally {
      setLoadingReply(false);
    }
  };

  const handleCloseReplyDialog = () => {
    setReplyDialogOpen(false);
    setSelectedEmail(null);
    setSuggestedReply('');
  };

  return (
    <Box>
      {/* Filters */}
      <Stack direction="row" spacing={2} mb={3}>
        <FormControl sx={{ minWidth: 120, '& .MuiInputLabel-root': { color: 'white' }, '& .MuiOutlinedInput-root': { color: 'white' } }} size="small">
          <InputLabel>Folder</InputLabel>
          <Select value={folder} label="Folder" onChange={e => setFolder(e.target.value)}>
            {folders.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
          </Select>
        </FormControl>
            <FormControl sx={{ minWidth: 120, '& .MuiInputLabel-root': { color: 'white' }, '& .MuiOutlinedInput-root': { color: 'white' } }} size="small">
              <InputLabel>Account</InputLabel>
              <Select value={account} label="Account" onChange={e => setAccount(e.target.value)}>
                {accounts.map(a => <MenuItem key={a} value={a}>{a}</MenuItem>)}
              </Select>
            </FormControl>
        <FormControl sx={{ minWidth: 160, '& .MuiInputLabel-root': { color: 'white' }, '& .MuiOutlinedInput-root': { color: 'white' } }} size="small">
          <InputLabel>Category</InputLabel>
          <Select value={category} label="Category" onChange={e => setCategory(e.target.value)}>
            <MenuItem value="">All</MenuItem>
            {categories.map(c => <MenuItem key={c.label} value={c.label}>{c.label}</MenuItem>)}
          </Select>
        </FormControl>
        <TextField
          label="Search"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search emails..."
          size="small"
          sx={{ 
            minWidth: 180, 
            '& .MuiInputLabel-root': { color: 'white' }, 
            '& .MuiOutlinedInput-root': { color: 'white' },
            '& .MuiOutlinedInput-input::placeholder': { color: 'rgba(255, 255, 255, 0.7)' }
          }}
        />
      </Stack>
      {/* Email List Table */}
      <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Sender</TableCell>
              <TableCell>Subject</TableCell>
              <TableCell>Snippet</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell colSpan={6}><SkeletonLoader height={32} /></TableCell>
                </TableRow>
              ))
            ) : error ? (
              <TableRow>
                <TableCell colSpan={6}><Alert severity="error">{error}</Alert></TableCell>
              </TableRow>
            ) : emails.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}><Typography color="text.secondary">No emails found for account <b>{account}</b>.</Typography></TableCell>
              </TableRow>
            ) : (
              emails.map((email: Email) => {
                const displayCategory = getMockCategory(email);
                return (
                <TableRow key={email.id}>
                  <TableCell aria-label={`Sender: ${email.sender}`} tabIndex={0}>{email.sender}</TableCell>
                  <TableCell aria-label={`Subject: ${email.subject}`} tabIndex={0}>{email.subject}</TableCell>
                  <TableCell aria-label={`Snippet: ${email.snippet}`} tabIndex={0}>{email.snippet}</TableCell>
                  <TableCell aria-label={`Date: ${new Date(email.date).toLocaleString()}`} tabIndex={0}>{new Date(email.date).toLocaleString()}</TableCell>
                  <TableCell>
                    <Tooltip title={`Category: ${displayCategory} - AI classified`} arrow>
                      <Chip
                        label={displayCategory}
                        color={categories.find(c => c.label === displayCategory)?.color as any || 'default'}
                        sx={{ fontWeight: 600, outline: 'none', '&:focus': { boxShadow: '0 0 0 2px #6C63FF' } }}
                        tabIndex={0}
                        aria-label={`Category: ${displayCategory}`}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Get AI suggested reply" arrow>
                      <IconButton 
                        onClick={() => handleSuggestReply(email)}
                        color="primary"
                        size="small"
                        aria-label={`Suggest reply for email from ${email.sender}`}
                      >
                        <ReplyIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Pagination/Infinite Scroll Placeholder */}
      {hasMore && !loading && (
        <Box textAlign="center" mt={2}>
          <Button variant="outlined" onClick={() => setPage(p => p + 1)}>
            Load More
          </Button>
        </Box>
      )}

      {/* Suggested Reply Dialog */}
      <Dialog 
        open={replyDialogOpen} 
        onClose={handleCloseReplyDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEmail && `AI Suggested Reply - ${selectedEmail.subject}`}
        </DialogTitle>
        <DialogContent>
          {selectedEmail && (
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">
                Replying to: {selectedEmail.sender}
              </Typography>
            </Box>
          )}
          {loadingReply ? (
            <Box display="flex" justifyContent="center" alignItems="center" py={4}>
              <CircularProgress />
              <Typography ml={2}>Generating AI suggested reply...</Typography>
            </Box>
          ) : (
            <TextField
              multiline
              rows={8}
              fullWidth
              value={suggestedReply}
              onChange={(e) => setSuggestedReply(e.target.value)}
              placeholder="AI suggested reply will appear here..."
              variant="outlined"
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReplyDialog}>Close</Button>
          <Button 
            variant="contained" 
            disabled={!suggestedReply || loadingReply}
            onClick={() => {
              console.log('Send reply:', suggestedReply);
              handleCloseReplyDialog();
            }}
          >
            Use Reply
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailList;
