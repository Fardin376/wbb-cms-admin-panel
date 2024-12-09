import React, { useState } from 'react';
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  InputAdornment,
  IconButton,
  useTheme,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Visibility, VisibilityOff, Email, Lock } from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin1234');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const theme = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };
  const background =
    'https://trial-project-beta.vercel.app/assets/articleBg-yQ_fMx21.png';

  return (
    <Box
      sx={{
        height: '100vh',

        display: 'flex',
        flexShrink: 0,
        alignItems: 'center',
        justifyContent: 'center',
        background: `url(${background}) repeat`,
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: 'auto',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            width: '100%',
            p: 3,
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography
              color="success"
              sx={{
                fontWeight: 600,
                fontSize: '3rem',
                letterSpacing: '1.2px',
                lineHeight: 1.2,
                textAlign: 'center',
                textShadow: '2px 2px 4px rgba(0, 0, 0, 0.2)',
              }}
            >
              WBB
              <br />
              Admin Panel
            </Typography>

            {error && (
              <Alert severity="error" sx={{ width: '100%' }}>
                {error}
              </Alert>
            )}

            <Box
              component="form"
              onSubmit={handleLogin}
              noValidate
              sx={{
                width: '100%',
              }}
            >
              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Email Address"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />

              <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                color="success"
                sx={{
                  py: 1.5,
                  mt: 2,
                  borderRadius: 2,
                  fontSize: '1.1rem',
                  textTransform: 'none',
                  boxShadow: theme.shadows[3],
                  '&:hover': {
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                {loading ? 'Logging in...' : 'Login'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
