/* eslint-disable react/prop-types */
import { Avatar, Box, IconButton, Typography, useTheme } from '@mui/material';
import { useContext, useState } from 'react';
import { tokens } from '../../../theme';
import { Menu, MenuItem, Sidebar } from 'react-pro-sidebar';
import {
  AnchorOutlined,
  ContentCopy,
  DashboardOutlined,
  FilePresent,
  ImageOutlined,
  LayersOutlined,
  MenuOutlined,
  Pages,
  PagesOutlined,
  PostAdd,
  PostAddOutlined,
} from '@mui/icons-material';
import logo from '../../../assets/images/logo.png';
import Item from './Item';
import { ToggledContext } from '../../../App';
import { Link, useNavigate } from 'react-router-dom';

const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { toggled, setToggled } = useContext(ToggledContext);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const navigate = useNavigate();
  return (
    <Sidebar
      backgroundColor={colors.primary[400]}
      rootStyles={{
        border: 0,
        height: '100%',
        '& .ps-sidebar-container': {
          height: '100vh',
          position: 'sticky',
          top: 0,
        },
        '& .ps-menu-button:hover': {
          backgroundColor: 'transparent !important',
        },
      }}
      collapsed={collapsed}
      onBackdropClick={() => setToggled(false)}
      toggled={toggled}
      breakPoint="md"
    >
      <Menu
        menuItemStyles={{
          button: { ':hover': { background: 'transparent' } },
        }}
      >
        <MenuItem
          rootStyles={{
            margin: '15px 0 20px 0',
            color: colors.gray[100],
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px',
            }}
          >
            {!collapsed && (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
                onClick={() => navigate('/')}
              >
                <img
                  style={{
                    width: '100%',
                    height: '100%',
                  }}
                  src={logo}
                  alt="wbb_logo"
                />
              </Box>
            )}
            <IconButton onClick={() => setCollapsed(!collapsed)}>
              <MenuOutlined />
            </IconButton>
          </Box>
        </MenuItem>
      </Menu>

      <Box mb={5} p={collapsed ? undefined : '2%'}>
        <Menu
          menuItemStyles={{
            button: {
              ':hover': {
                color: colors.greenAccent[300],
                background: 'transparent',
                transition: '.4s ease',
              },
            },
          }}
        >
          <Item
            title="Dashboard"
            path="/"
            colors={colors}
            icon={<DashboardOutlined fontSize="large" />}
          />
        </Menu>
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: '15px 0 5px 20px' }}
        >
          {!collapsed ? 'Manage Menu' : ' '}
        </Typography>{' '}
        <Menu
          menuItemStyles={{
            button: {
              ':hover': {
                color: colors.greenAccent[300],
                background: 'transparent',
                transition: '.4s ease',
              },
            },
          }}
        >
          <Item
            title="Menu"
            path="/menu"
            colors={colors}
            icon={<AnchorOutlined fontSize="large" />}
          />
        </Menu>
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: '15px 0 5px 20px' }}
        >
          {!collapsed ? 'Pages' : ' '}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ':hover': {
                color: colors.greenAccent[300],
                background: 'transparent',
                transition: '.4s ease',
              },
            },
          }}
        >
          <Item
            title="Page Layout"
            path="/layouts"
            colors={colors}
            icon={<LayersOutlined fontSize="large" />}
          />
          <Item
            title="Pages"
            path="/pages"
            colors={colors}
            icon={<PagesOutlined fontSize="large" />}
          />
        </Menu>
        <Typography
          variant="h6"
          color={colors.gray[300]}
          sx={{ m: '15px 0 5px 20px' }}
        >
          {!collapsed ? 'Content' : ' '}
        </Typography>
        <Menu
          menuItemStyles={{
            button: {
              ':hover': {
                color: colors.greenAccent[300],
                background: 'transparent',
                transition: '.4s ease',
              },
            },
          }}
        >
          <Item
            title="Posts"
            path="/posts"
            colors={colors}
            icon={<PostAddOutlined fontSize="large" />}
          />
          <Item
            title="Gallery"
            path="/gallery"
            colors={colors}
            icon={<ImageOutlined fontSize="large" />}
          />
          <Item
            title="Files & Links"
            path="/pdfs"
            colors={colors}
            icon={<FilePresent fontSize="large" />}
          />
        </Menu>
      </Box>
    </Sidebar>
  );
};

export default SideBar;
