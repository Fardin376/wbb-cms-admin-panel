import React, { createContext, useState } from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { ColorModeContext, useMode } from './theme';
import { SideBar, Navbar, Footer } from './scenes';
import { Outlet } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';

export const ToggledContext = createContext(null);

function App() {
  const [theme, colorMode] = useMode();
  const [toggled, setToggled] = useState(false);
  const values = { toggled, setToggled };

  return (
    <SnackbarProvider maxSnack={3}>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <ToggledContext.Provider value={values}>
            <Box 
              sx={{ 
                display: 'flex',
                minHeight: '100vh',
                width: '100%',
                bgcolor: 'background.default'
              }}
            >
              <Box 
                component="nav"
                sx={{ 
                  width: 'auto',
                  flexShrink: 0,
                  height: '100vh',
                  position: 'sticky',
                  top: 0,
                  left: 0,
                  zIndex: 1000
                }}
              >
                <SideBar />
              </Box>

              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '100vh',
                  overflow: 'hidden'
                }}
              >
                <Navbar />
                <Box 
                  sx={{ 
                    flexGrow: 1,
                    p: 3,
                    overflow: 'auto'
                  }}
                >
                  <Outlet />
                </Box>
                <Footer />
              </Box>
            </Box>
          </ToggledContext.Provider>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </SnackbarProvider>
  );
}

export default App;