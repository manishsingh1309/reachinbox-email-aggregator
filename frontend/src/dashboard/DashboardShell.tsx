import React, { useState } from 'react';
import { Box, AppBar, Toolbar, Typography, IconButton, Drawer, Divider, List, ListItemIcon, ListItemText, useTheme, useMediaQuery, ListItemButton } from '@mui/material';
import InboxIcon from '@mui/icons-material/Inbox';
import CategoryIcon from '@mui/icons-material/Category';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import Sidebar from '../components/Sidebar';

// Custom ReachInbox dashboard shell with responsive sidebar
const navLinks = [
  { label: 'Inbox', icon: <InboxIcon /> },
  { label: 'Categories', icon: <CategoryIcon /> },
  { label: 'Accounts', icon: <AccountCircleIcon /> },
  { label: 'Settings', icon: <SettingsIcon /> },
];

const DashboardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top App Bar */}
      <AppBar position="fixed" color="inherit" elevation={1} sx={{ zIndex: theme.zIndex.drawer + 1 }}>
        <Toolbar>
          {isMobile && (
            <IconButton edge="start" color="primary" onClick={() => setSidebarOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" color="primary" fontWeight={700}>
            ReachInbox Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      {/* Sidebar Navigation */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        sx={{
          width: 260,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 260,
            boxSizing: 'border-box',
            bgcolor: 'background.paper',
            borderRight: 'none',
          },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {navLinks.map(link => (
            <ListItemButton key={link.label}>
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        {/* Custom ReachInbox sidebar content */}
        <Sidebar />
      </Drawer>
      {/* Main Content Area */}
      <Box component="main" sx={{ flex: 1, p: { xs: 2, md: 4 }, pt: 10, maxWidth: '100vw', minHeight: '100vh', bgcolor: 'background.default' }}>
        {children}
      </Box>
    </Box>
  );
};

export default DashboardShell;
