import React, { useState } from 'react';
import { Box, Typography, TextField, Button, Tooltip, CircularProgress, Alert } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const DEMO_EMAIL = 'demo@reachinbox.com';
const DEMO_PASSWORD = 'demo123';


const LoginPage: React.FC<{ darkMode?: boolean }> = ({ darkMode = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const payload = { email, password };
    const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/login';
    console.log('Login payload:', payload);
    console.log('Backend URL:', backendUrl);
    try {
      const res = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('reachinbox_token', data.token);
        navigate('/dashboard');
      } else {
        setError(data.message || 'Invalid credentials. Try demo credentials or contact support.');
        console.error('Login error:', data);
      }
    } catch (err: any) {
      setError(err.message || 'Network error.');
      console.error('Login network error:', err);
    } finally {
      setLoading(false);
    }
  };

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
      <Box sx={{ width: '100%', maxWidth: 420, mx: 'auto', textAlign: 'center', p: 4 }}>
        <Typography variant="h4" color="primary" fontWeight={700} gutterBottom>
          Login to ReachInbox
        </Typography>
        <Box
          component="form"
          onSubmit={handleLogin}
          sx={{
            width: '100%',
            bgcolor: 'background.paper',
            p: 4,
            borderRadius: 4,
            boxShadow: 6,
            mt: 2,
            mx: 'auto',
            maxWidth: 380,
          }}
        >
          <Tooltip title={`Demo: ${DEMO_EMAIL} / ${DEMO_PASSWORD}`} arrow placement="top">
            <Typography variant="body2" color="text.secondary" mb={2}>
              Use demo credentials or your account.
            </Typography>
          </Tooltip>
          <TextField
            label="Email"
            type="email"
            fullWidth
            required
            margin="normal"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="username"
          />
        <TextField
          label="Password"
          type={showPassword ? 'text' : 'password'}
          fullWidth
          required
          margin="normal"
          value={password}
          onChange={e => setPassword(e.target.value)}
          autoComplete="current-password"
          InputProps={{
            endAdornment: (
              <Button
                onClick={() => setShowPassword(v => !v)}
                tabIndex={0}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                size="small"
              >
                {showPassword ? 'Hide' : 'Show'}
              </Button>
            ),
          }}
        />
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 3, py: 2, fontWeight: 700, fontSize: '1.1rem', boxShadow: 4, borderRadius: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default LoginPage;
