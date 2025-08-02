import React, { useState } from 'react';
import { Box, Typography, Paper, Chip, Avatar, IconButton, Stack, Divider, Snackbar, Alert, Button, Tooltip } from '@mui/material';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import DeleteIcon from '@mui/icons-material/Delete';
import ReplyIcon from '@mui/icons-material/Reply';
import CategoryIcon from '@mui/icons-material/Category';
import type { Email } from '../hooks/useEmails';

// Placeholder for AI suggested reply
const SuggestedReply: React.FC<{ reply: string }> = ({ reply }) => (
  <Paper sx={{ p: 2, mt: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: 2 }}>
    <Typography variant="subtitle1" color="secondary" gutterBottom>
      AI Suggested Reply
    </Typography>
    <Typography variant="body2">{reply || 'No suggestion available.'}</Typography>
    <Stack direction="row" spacing={2} mt={2}>
      <Button variant="contained" color="primary">Accept & Send</Button>
      <Button variant="outlined">Edit</Button>
      <Button variant="text">Dismiss</Button>
    </Stack>
  </Paper>
);

// Custom ReachInbox email detail view
const EmailDetail: React.FC<{ email: Email }> = ({ email }) => {
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const handleAction = (action: string) => {
    // Optimistic UI: show feedback immediately
    setSnackbar({ open: true, message: `${action} action successful!`, severity: 'success' });
    // TODO: Call backend API for real action
  };

  return (
    <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 4, maxWidth: 720, mx: 'auto', mt: 2 }}>
      <Stack direction="row" alignItems="center" spacing={2} mb={2}>
        <Avatar>{email.sender[0]}</Avatar>
        <Box>
          <Typography variant="h6" fontWeight={700}>{email.subject}</Typography>
          <Typography variant="body2" color="text.secondary">From: {email.sender}</Typography>
        </Box>
        <Tooltip title={`Category: ${email.category} - AI classified`} arrow>
          <Chip
            label={email.category}
            color={email.category === 'Interested' ? 'success' : email.category === 'Meeting Booked' ? 'secondary' : 'default'}
            icon={<CategoryIcon />}
            sx={{ fontWeight: 600, ml: 'auto', outline: 'none', '&:focus': { boxShadow: '0 0 0 2px #6C63FF' } }}
            tabIndex={0}
            aria-label={`Category: ${email.category}`}
          />
        </Tooltip>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      <Typography variant="body2" color="text.secondary" mb={2}>
        To: {email.to || 'N/A'} | CC: {email.cc || 'N/A'} | Date: {new Date(email.date).toLocaleString()} | Folder: {email.folder} | Account: {email.account}
      </Typography>
      <Box sx={{ mb: 3 }}>
        <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>{email.snippet || email.content || 'No content.'}</Typography>
      </Box>
      <Stack direction="row" spacing={2}>
        <Tooltip title="Mark as Read" arrow>
          <IconButton color="primary" onClick={() => handleAction('Mark as Read')} aria-label="Mark as Read" tabIndex={0}>
            <MarkEmailReadIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete Email" arrow>
          <IconButton color="error" onClick={() => handleAction('Delete')} aria-label="Delete" tabIndex={0}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Reply" arrow>
          <IconButton color="secondary" onClick={() => handleAction('Reply')} aria-label="Reply" tabIndex={0}>
            <ReplyIcon />
          </IconButton>
        </Tooltip>
      </Stack>
      {/* AI Suggested Reply Placeholder */}
      <SuggestedReply reply={''} />
      {/* Snackbar for action feedback */}
      <Snackbar open={snackbar.open} autoHideDuration={2500} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Paper>
  );
};

export default EmailDetail;
