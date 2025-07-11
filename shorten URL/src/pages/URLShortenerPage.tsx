import React, { useState } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import URLForm from '../components/URLShortener/URLForm';
import URLResults from '../components/URLShortener/URLResults';
import { urlService } from '../services/URLService';
import { logger } from '../services/LoggingService';
import { ShortenedURL, URLFormData } from '../types';

const URLShortenerPage: React.FC = () => {
  const MODULE_NAME = 'URLShortenerPage';
  const [shortenedUrls, setShortenedUrls] = useState<ShortenedURL[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    logger.info('URLShortenerPage mounted', {}, MODULE_NAME);
  }, []);

  const handleSubmit = async (urlsData: URLFormData[]) => {
    setIsLoading(true);
    setError(null);
    
    logger.info('Processing URL shortening request', { 
      urlCount: urlsData.length 
    }, MODULE_NAME);

    try {
      const results: ShortenedURL[] = [];
      
      for (const urlData of urlsData) {
        try {
          const shortened = urlService.shortenUrl(urlData);
          results.push(shortened);
          logger.info('URL shortened successfully', { 
            originalUrl: urlData.originalUrl,
            shortCode: shortened.shortCode 
          }, MODULE_NAME);
        } catch (error) {
          logger.error('Failed to shorten URL', { 
            error: error instanceof Error ? error.message : 'Unknown error',
            originalUrl: urlData.originalUrl 
          }, MODULE_NAME);
          
          setError(`Failed to shorten URL: ${urlData.originalUrl}. ${error instanceof Error ? error.message : 'Unknown error'}`);
          break;
        }
      }
      
      if (results.length > 0) {
        setShortenedUrls(results);
        logger.info('URL shortening completed successfully', { 
          successCount: results.length,
          totalRequested: urlsData.length
        }, MODULE_NAME);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      logger.error('URL shortening process failed', { error: errorMessage }, MODULE_NAME);
      setError(`Failed to process URLs: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearResults = () => {
    setShortenedUrls([]);
    setError(null);
    logger.info('URL results cleared', {}, MODULE_NAME);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        URL Shortener
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Enter up to 5 URLs to shorten them. You can specify custom short codes and validity periods.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <URLForm onSubmit={handleSubmit} isLoading={isLoading} />
      
      <URLResults 
        urls={shortenedUrls} 
        onClear={handleClearResults}
      />
    </Box>
  );
};

export default URLShortenerPage;