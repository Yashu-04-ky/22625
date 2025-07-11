import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Card, CardContent } from '@mui/material';
import { Launch, Error } from '@mui/icons-material';
import { urlService } from '../services/URLService';
import { logger } from '../services/LoggingService';

const RedirectPage: React.FC = () => {
  const MODULE_NAME = 'RedirectPage';
  const { shortCode } = useParams<{ shortCode: string }>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redirectUrl, setRedirectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code');
      setIsLoading(false);
      return;
    }

    logger.info('Redirect page accessed', { shortCode }, MODULE_NAME);
    handleRedirect(shortCode);
  }, [shortCode]);

  const handleRedirect = async (code: string) => {
    try {
      const url = urlService.getUrlByShortCode(code);
      
      if (!url) {
        logger.warn('URL not found for short code', { shortCode: code }, MODULE_NAME);
        setError('URL not found or has expired');
        setIsLoading(false);
        return;
      }

      // Record the click
      urlService.recordClick(code, {
        source: document.referrer || 'direct',
        location: 'Web Browser',
        userAgent: navigator.userAgent,
        ipAddress: 'Unknown'
      });

      logger.info('Click recorded, redirecting', { 
        shortCode: code, 
        originalUrl: url.originalUrl 
      }, MODULE_NAME);

      setRedirectUrl(url.originalUrl);
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = url.originalUrl;
      }, 1000);

    } catch (error) {
      logger.error('Error during redirect', { error, shortCode: code }, MODULE_NAME);
      setError('An error occurred while processing the redirect');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 2
      }}>
        <CircularProgress size={48} />
        <Typography variant="h6">
          Redirecting...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we redirect you to the original URL
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Error sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Redirect Failed
            </Typography>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            <Typography variant="body2" color="text.secondary">
              The short URL you're trying to access is either invalid or has expired.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  if (redirectUrl) {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh'
      }}>
        <Card sx={{ maxWidth: 500, width: '100%' }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Launch sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Redirecting Now
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Taking you to:
            </Typography>
            <Typography 
              variant="body2" 
              color="primary" 
              sx={{ 
                wordBreak: 'break-all',
                bgcolor: 'grey.100',
                p: 1,
                borderRadius: 1,
                mb: 2
              }}
            >
              {redirectUrl}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If the redirect doesn't work, click the URL above.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return <Navigate to="/" replace />;
};

export default RedirectPage;