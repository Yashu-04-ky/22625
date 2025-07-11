import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import AppLayout from './components/Layout/AppLayout';
import URLShortenerPage from './pages/URLShortenerPage';
import StatisticsPage from './pages/StatisticsPage';
import RedirectPage from './pages/RedirectPage';
import { logger } from './services/LoggingService';

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
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

function App() {
  React.useEffect(() => {
    logger.info('Application started', { 
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent 
    }, 'App');
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<URLShortenerPage />} />
            <Route path="statistics" element={<StatisticsPage />} />
          </Route>
          <Route path="/:shortCode" element={<RedirectPage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;