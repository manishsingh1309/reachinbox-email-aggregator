import React from 'react';
import { Box, Chip, Stack } from '@mui/material';
import MailIcon from '@mui/icons-material/Mail';
import CategoryIcon from '@mui/icons-material/Category';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Custom ReachInbox filters placeholder
const FiltersPlaceholder: React.FC = () => (
  <Box mb={3}>
    <Stack direction="row" spacing={2}>
      <Chip icon={<MailIcon />} label="INBOX" color="primary" sx={{ fontWeight: 600 }} />
      <Chip icon={<CategoryIcon />} label="INTERESTED" color="success" sx={{ fontWeight: 600 }} />
      <Chip icon={<CategoryIcon />} label="Meeting Booked" color="secondary" sx={{ fontWeight: 600 }} />
      <Chip icon={<AccountCircleIcon />} label="Work" color="info" sx={{ fontWeight: 600 }} />
    </Stack>
  </Box>
);

export default FiltersPlaceholder;
