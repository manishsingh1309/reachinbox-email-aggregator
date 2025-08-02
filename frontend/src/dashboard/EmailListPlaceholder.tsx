import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import SkeletonLoader from '../components/SkeletonLoader';

// Custom ReachInbox email list placeholder
const EmailListPlaceholder: React.FC = () => (
  <Box>
    <Typography variant="h6" color="primary" fontWeight={700} mb={2}>
      Inbox
    </Typography>
    <Paper sx={{ p: 2, borderRadius: 3, boxShadow: 2 }}>
      <SkeletonLoader height={40} />
      <SkeletonLoader height={40} />
      <SkeletonLoader height={40} />
      <SkeletonLoader height={40} />
      <Typography variant="body2" color="text.secondary" mt={2}>
        Email list will appear here.
      </Typography>
    </Paper>
  </Box>
);

export default EmailListPlaceholder;
