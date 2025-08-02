import React from 'react';
import { Skeleton, Box } from '@mui/material';

const SkeletonLoader: React.FC<{ height?: number }> = ({ height = 40 }) => (
  <Box sx={{ width: '100%', mb: 2 }}>
    <Skeleton variant="rectangular" width="100%" height={height} />
  </Box>
);

export default SkeletonLoader;
