import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Box } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleBackToDashboard = () => {
    navigate('/');
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <ErrorOutlineIcon sx={{ fontSize: 64, color: 'error.main' }} />
        <Typography variant="h4" component="h1" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Sorry, you don't have permission to access this page.
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleBackToDashboard}
        >
          Back to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Unauthorized;
