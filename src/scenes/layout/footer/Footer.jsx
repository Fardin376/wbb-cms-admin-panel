import React from 'react';
import { Box, useTheme } from '@mui/material';
import Copyright from '../../../components/Copyright';
import { tokens } from '../../../theme';

const Footer = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  return (
    <Box 
      component="footer"
      sx={{
        mt: 'auto', // Push to bottom
        borderTop: `1px solid ${colors.primary[500]}`,
        backgroundColor: colors.primary[400],
      }}
    >
      <Copyright />
    </Box>
  );
};

export default Footer;
