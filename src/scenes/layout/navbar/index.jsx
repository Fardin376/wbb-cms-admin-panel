import {
  Box,
  IconButton,
  InputBase,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material';
import { tokens, ColorModeContext } from '../../../theme';
import { useContext, useState } from 'react';
import {
  DarkModeOutlined,
  LightModeOutlined,
  MenuOutlined,
  NotificationsOutlined,
  PersonOutlined,
  SearchOutlined,
  SettingsOutlined,
  LogoutOutlined,
} from '@mui/icons-material';
import { ToggledContext } from '../../../App';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import React from 'react';

const Navbar = () => {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const { toggled, setToggled } = useContext(ToggledContext);
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const isMdDevices = useMediaQuery('(max-width:768px)');
  const isXsDevices = useMediaQuery('(max-width:466px)');
  const colors = tokens(theme.palette.mode);

  const auth = useAuth();
  
  if (!auth || auth.loading) {
    return null; // Or a loading indicator
  }

  const { logout, user } = auth;

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
    handleMenuClose();
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      p={2}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <IconButton
          sx={{ display: `${isMdDevices ? 'flex' : 'none'}` }}
          onClick={() => setToggled(!toggled)}
        >
          <MenuOutlined />
        </IconButton>
      </Box>

      <Box>
        <IconButton onClick={colorMode.toggleColorMode}>
          {theme.palette.mode === 'dark' ? (
            <LightModeOutlined />
          ) : (
            <DarkModeOutlined />
          )}
        </IconButton>
        <IconButton>
          <NotificationsOutlined />
        </IconButton>
        <IconButton>
          <SettingsOutlined />
        </IconButton>
        <IconButton onClick={handleMenuOpen}>
          <PersonOutlined />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
        >
          <MenuItem sx={{ ':hover': { backgroundColor: 'transparent' } }}>
            User: {user?.role}
          </MenuItem>
          <MenuItem
            onClick={handleLogout}
            sx={{ ':hover': { backgroundColor: colors.primary[500] } }}
          >
            Logout
            <LogoutOutlined sx={{ mx: 1 }} />
          </MenuItem>
        </Menu>
      </Box>
    </Box>
  );
};

export default Navbar;
