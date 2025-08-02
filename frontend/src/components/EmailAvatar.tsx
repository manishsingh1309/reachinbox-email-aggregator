import React from 'react';
import { Avatar } from '@mui/material';

// Custom ReachInbox avatar for email sender/recipient
const EmailAvatar: React.FC<{ name: string }> = ({ name }) => (
  <Avatar>{name ? name[0].toUpperCase() : '?'}</Avatar>
);

export default EmailAvatar;
