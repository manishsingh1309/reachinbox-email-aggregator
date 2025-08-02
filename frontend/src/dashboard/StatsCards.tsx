import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import MailIcon from '@mui/icons-material/Mail';
import CategoryIcon from '@mui/icons-material/Category';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';


// Custom ReachInbox stats cards for dashboard
export interface Stat {
  label: string;
  value: number;
  icon: React.ReactNode;
}

const defaultStats: Stat[] = [
  { label: 'Total Emails', value: 1200, icon: <MailIcon color="primary" /> },
  { label: 'Unread', value: 87, icon: <MailIcon color="error" /> },
  { label: 'Interested', value: 34, icon: <CategoryIcon color="success" /> },
  { label: 'Meeting Booked', value: 12, icon: <EventAvailableIcon color="secondary" /> },
];

const StatsCards: React.FC<{ stats?: Stat[] }> = ({ stats = defaultStats }) => (
  <Grid columns={12} columnSpacing={3} rowSpacing={3} mb={4}>
    {stats.map(stat => (
      <Grid size={3} key={stat.label}>
        <Box sx={{ width: '100%' }}>
          <Card sx={{ boxShadow: 4, borderRadius: 3 }} aria-label={stat.label} tabIndex={0}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {stat.icon}
                <Typography variant="h5" fontWeight={700} color="primary">
                  {stat.value}
                </Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" mt={1}>
                {stat.label}
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Grid>
    ))}
  </Grid>
);

export default StatsCards;
