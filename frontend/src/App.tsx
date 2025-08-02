import React, { useState, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { IconButton, AppBar, Toolbar, Typography } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { CssBaseline, Box, Fade, Slide, Zoom } from '@mui/material';
import LandingPage from './components/LandingPage';
// import LoginPage from './components/LoginPage';

// AuthGuard removed (no authentication required)

// Custom transition wrapper for ReachInbox
const PageTransition: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  // Unique transition per route
  const transition = useMemo(() => {
    if (location.pathname === '/') return Fade;
    if (location.pathname === '/login') return Slide;
    return Zoom;
  }, [location.pathname]);
  const TransitionComponent = transition;
  return (
    <TransitionComponent in appear timeout={500}>
      <Box sx={{ width: '100%' }}>{children}</Box>
    </TransitionComponent>
  );
};

// Custom ReachInbox Dashboard route with shell and placeholders
import DashboardShell from './dashboard/DashboardShell';
import StatsCards from './dashboard/StatsCards';
import FiltersPlaceholder from './dashboard/FiltersPlaceholder';
import EmailList from './emails/EmailList';

const Dashboard: React.FC = () => (
  <DashboardShell>
    <StatsCards />
    <FiltersPlaceholder />
    <EmailList />
  </DashboardShell>
);

// ReachInbox theme system with dark mode toggle
const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const theme = useMemo(() =>
    createTheme({
      palette: {
        mode: darkMode ? 'dark' : 'light',
        primary: { main: '#6C63FF' },
        secondary: { main: '#3F51B5' },
        background: {
          default: darkMode
            ? 'linear-gradient(135deg, #232526 0%, #414345 100%)'
            : 'linear-gradient(135deg, #f8fafc 0%, #e3e6f5 100%)',
          paper: darkMode ? '#232526' : '#fff',
        },
      },
      shape: { borderRadius: 16 },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              fontSize: '1.1rem',
              padding: '12px 32px',
              boxShadow: '0 2px 12px rgba(108,99,255,0.12)',
              borderRadius: 12,
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: '0 4px 24px rgba(63,81,181,0.10)',
              borderRadius: 18,
              margin: '0 auto',
              maxWidth: 340,
            },
          },
        },
      },
    }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppBar position="static" color="transparent" elevation={0} sx={{ mb: 2, boxShadow: 'none', bgcolor: 'transparent' }}>
          <Toolbar sx={{ justifyContent: 'flex-end' }}>
            <Typography variant="h6" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 700 }}>
              ReachInbox
            </Typography>
            <IconButton onClick={() => setDarkMode(v => !v)} color="inherit" aria-label="toggle dark mode">
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Routes>
          <Route
            path="/"
            element={
              <PageTransition>
                <LandingPage darkMode={darkMode} />
              </PageTransition>
            }
          />
          {/* Login route removed */}
          <Route
            path="/dashboard"
            element={
              <PageTransition>
                <Dashboard />
              </PageTransition>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
