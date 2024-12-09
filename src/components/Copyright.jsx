import React from 'react';
import { Link } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { tokens } from '../theme';

const Copyright = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: 'easeOut' },
    },
  };

  return (
    <Box
      sx={{
        bgcolor: colors.primary[400],
        borderTop: `1px solid ${colors.primary[500]}`,
        px: {
          xs: 2,
          '2xl': 0,
        },
      }}
    >
      <Box
        sx={{
          py: { xs: 2 },
          color: colors.gray[100],
          fontSize: '0.75rem',
          lineHeight: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: '0.5rem', sm: 0 },
          px: {
            xs: 2,
            xl: 0,
          },
        }}
      >
        <Box
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link
            to=""
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
            sx={{
              '&:hover': {
                color: colors.greenAccent[400],
                transition: 'colors 300ms',
              },
            }}
          >
            © 2024, Work for a Better Bangladesh (WBB) Trust, All rights
            reserved.
          </Link>
        </Box>
        <Box
          variants={textVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          <Link
            to=""
            style={{
              color: 'inherit',
              textDecoration: 'none',
            }}
            sx={{
              '&:hover': {
                color: colors.greenAccent[400],
                transition: 'colors 300ms',
              },
            }}
          >
            Developed by Infobase Limited
          </Link>
        </Box>
      </Box>
    </Box>
  );
};

export default Copyright;
