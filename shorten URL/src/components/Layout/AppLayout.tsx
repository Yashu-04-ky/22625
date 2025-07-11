import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import { Link as LinkIcon, Analytics } from '@mui/icons-material';
import { logger } from '../../services/LoggingService';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const MODULE_NAME = 'AppLayout';

  React.useEffect(() => {
    logger.info('Navigation occurred', { path: location.pathname }, MODULE_NAME);
  }, [location]);

  const getCurrentTab = () => {
    switch (location.pathname) {
      case '/':
        return 0;
      case '/statistics':
        return 1;
      default:
        return 0;
    }
  };

  return (
    <>
      <AppBar position="static" elevation={2}>
        <Toolbar>
          <LinkIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            URL Shortener
          </Typography>
          
          <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Button
              color="inherit"
              component={Link}
              to="/"
              sx={{ mr: 1 }}
            >
              Shorten URLs
            </Button>
            <Button
              color="inherit"
              component={Link}
              to="/statistics"
            >
              Statistics
            </Button>
          </Box>
        </Toolbar>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'primary.dark' }}>
          <Container maxWidth="lg">
            <Tabs 
              value={getCurrentTab()} 
              textColor="inherit" 
              sx={{ 
                '& .MuiTab-root': { 
                  color: 'rgba(255,255,255,0.7)',
                  '&.Mui-selected': {
                    color: 'white'
                  }
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: 'white'
                }
              }}
            >
              <Tab 
                label="URL Shortener" 
                component={Link} 
                to="/" 
                icon={<LinkIcon />}
                iconPosition="start"
              />
              <Tab 
                label="Statistics" 
                component={Link} 
                to="/statistics" 
                icon={<Analytics />}
                iconPosition="start"
              />
            </Tabs>
          </Container>
        </Box>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Outlet />
      </Container>
    </>
  );
};

export default AppLayout;