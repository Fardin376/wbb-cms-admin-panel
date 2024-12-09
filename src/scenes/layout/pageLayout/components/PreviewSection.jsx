import React from 'react';
import { Box, IconButton, Paper } from '@mui/material';
import { Close } from '@mui/icons-material';

const PreviewSection = ({ previewContent, onClose }) => {
  return (
    <Box sx={{ position: 'relative', height: '100vh', p: 2 }}>
      <IconButton
        onClick={onClose}
        sx={{
          position: 'absolute',
          right: 16,
          top: 16,
          zIndex: 1000,
          bgcolor: 'background.paper',
          '&:hover': { bgcolor: 'error.main' },
        }}
      >
        <Close />
      </IconButton>
      <Paper
        elevation={3}
        sx={{
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <iframe
          srcDoc={previewContent}
          title="Layout Preview"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            backgroundColor: '#fff',
          }}
        />
      </Paper>
    </Box>
  );
};

export default PreviewSection;
