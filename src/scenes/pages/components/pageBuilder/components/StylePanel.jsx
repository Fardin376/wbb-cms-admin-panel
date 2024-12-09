import React from 'react';
import { Box } from '@mui/material';

const StylePanel = () => {
  return (
    <Box
      id="styles-container"
      sx={{
        width: '200px',
        backgroundColor: 'background.default',
        borderLeft: 1,
        borderColor: 'divider',
        overflowY: 'auto',
      }}
    />
  );
};

export default StylePanel;
