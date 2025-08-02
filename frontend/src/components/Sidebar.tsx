import React from 'react';
import { Box, List, ListItem, ListItemAvatar, Avatar, ListItemText, IconButton, Chip, Typography, Badge } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MailIcon from '@mui/icons-material/Mail';
import CategoryIcon from '@mui/icons-material/Category';

const accounts = [
  { id: '1', name: 'Demo Account', email: 'demo@reachinbox.com', unread: 5 },
  { id: '2', name: 'Work', email: 'work@company.com', unread: 2 },
];

const categories = [
  { label: 'Interested', color: 'primary', icon: <CategoryIcon /> },
  { label: 'Meeting Booked', color: 'secondary', icon: <MailIcon /> },
  { label: 'Spam', color: 'error', icon: <MailIcon /> },
];

const Sidebar: React.FC = () => {
  return (
    <Box sx={{ width: 260, bgcolor: 'background.paper', height: '100vh', boxShadow: 2, display: 'flex', flexDirection: 'column', p: 2 }}>
      <Typography variant="h6" color="primary" fontWeight={700} mb={2}>
        Accounts
      </Typography>
      <List>
        {accounts.map(acc => (
          <ListItem key={acc.id} sx={{ mb: 1 }}>
            <ListItemAvatar>
              <Badge badgeContent={acc.unread} color="error">
                <Avatar>{acc.name[0]}</Avatar>
              </Badge>
            </ListItemAvatar>
            <ListItemText primary={acc.name} secondary={acc.email} />
            <IconButton edge="end" aria-label="add-account" size="small">
              <AddIcon />
            </IconButton>
          </ListItem>
        ))}
      </List>
      <Typography variant="subtitle1" color="text.secondary" mt={3} mb={1}>
        Categories
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <Chip
            key={cat.label}
            label={cat.label}
            color={cat.color as any}
            icon={cat.icon}
            sx={{ fontWeight: 600 }}
          />
        ))}
      </Box>
    </Box>
  );
};

export default Sidebar;
