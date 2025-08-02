import React from 'react';
import { Box, Typography, Button, Card, CardContent } from '@mui/material';
import Grid from '@mui/material/Grid';
import { useNavigate } from 'react-router-dom';


const LandingPage: React.FC<{ darkMode?: boolean }> = ({ darkMode = false }) => {
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 64px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        background: darkMode
          ? 'linear-gradient(135deg, #232526 0%, #414345 100%)'
          : 'linear-gradient(135deg, #f8fafc 0%, #e3e6f5 100%)',
        transition: 'background 0.4s',
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
        <Grid columns={12} columnSpacing={3} rowSpacing={3} mb={4} justifyContent="center">
          <Grid size={6}>
            <Box sx={{ width: '100%' }}>
              <Card sx={{ minWidth: 260, boxShadow: 6, borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" color="primary">Dashboard Preview</Typography>
                  <Typography variant="body2">Stats, categories, and more</Typography>
                </CardContent>
              </Card>
            </Box>
          </Grid>
          <Grid size={6}>
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
    </Box>
  );
};

export default LandingPage;
