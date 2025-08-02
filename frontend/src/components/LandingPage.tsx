import React from 'react';
import { Box, Typography, Button, Card, CardContent, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';


const LandingPage: React.FC<{ darkMode?: boolean }> = ({ darkMode = false }) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 520, mx: 'auto', textAlign: 'center', p: 4 }}>
        <Typography variant="h2" color="primary" fontWeight={700} gutterBottom>
          ReachInbox
        </Typography>
        <Typography variant="h5" color="text.secondary" gutterBottom>
          AI-powered multi-account email aggregation
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={4}>
          Real-time sync, beautiful dashboard, and smart categorization.
        </Typography>
        <Grid container spacing={3} mb={4} justifyContent="center">
          <Grid item xs={6}>
            <Box sx={{ width: '100%' }}>
              <Card sx={{ minWidth: 260, boxShadow: 6, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">Dashboard Preview</Typography>
                  <Typography variant="body2">Stats, categories, and more</Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid item xs={6}>
            <Box sx={{ width: '100%' }}>
              <Card sx={{ minWidth: 260, boxShadow: 6, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="secondary">AI Categorization</Typography>
                  <Typography variant="body2">Interested, Meeting Booked, Spam</Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
        </Grid>
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={() => navigate('/dashboard')}
          sx={{ px: 6, py: 2, fontWeight: 700, fontSize: '1.2rem', boxShadow: 4, borderRadius: 2 }}
        >
          Get Started
        </Button>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'block' },
          minHeight: '100vh',
          bgcolor: 'transparent',
          position: 'relative',
        }}
      >
        {/* Add a gradient or illustration here if desired */}
      </Box>
    </Box>
  );
};

export default LandingPage;
