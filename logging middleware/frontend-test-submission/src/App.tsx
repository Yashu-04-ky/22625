import React, { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Container, Typography, Box, Paper } from '@mui/material';
import { CalculatorForm } from './components/CalculatorForm';
import { LogViewer } from './components/LogViewer';
import { logger } from './utils/logger';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

function App() {
  useEffect(() => {
    logger.info('page', 'Application started');
    logger.debug('page', `User agent: ${navigator.userAgent}`);
    logger.debug('page', `Window size: ${window.innerWidth}x${window.innerHeight}`);

    const handleResize = () => {
      logger.debug('page', `Window resized to: ${window.innerWidth}x${window.innerHeight}`);
    };

    const handleBeforeUnload = () => {
      logger.info('page', 'Application closing');
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Paper elevation={1} sx={{ p: 3, mb: 4, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Frontend Test Submission
          </Typography>
          <Typography variant="body1" color="text.secondary">
            A React application demonstrating logging middleware integration with Material-UI
          </Typography>
        </Paper>

        <CalculatorForm />
        <LogViewer />

        <Box sx={{ mt: 4, p: 2, textAlign: 'center' }}>
          <Typography variant="caption" color="text.secondary">
            Built with React, TypeScript, and Material-UI
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;