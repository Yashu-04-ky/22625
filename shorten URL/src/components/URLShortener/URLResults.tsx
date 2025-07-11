import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Snackbar,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Tooltip
} from '@mui/material';
import { 
  ContentCopy, 
  Launch, 
  CheckCircle, 
  Schedule,
  Link as LinkIcon
} from '@mui/icons-material';
import { ShortenedURL } from '../../types';
import { logger } from '../../services/LoggingService';

interface URLResultsProps {
  urls: ShortenedURL[];
  onClear: () => void;
}

const URLResults: React.FC<URLResultsProps> = ({ urls, onClear }) => {
  const MODULE_NAME = 'URLResults';
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setSnackbarOpen(true);
      logger.info('URL copied to clipboard', { url }, MODULE_NAME);
    } catch (error) {
      logger.error('Failed to copy URL to clipboard', { error, url }, MODULE_NAME);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const getTimeUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const isExpired = (expiresAt: Date) => {
    return new Date() > expiresAt;
  };

  if (urls.length === 0) {
    return null;
  }

  return (
    <>
      <Card elevation={3} sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ mr: 1, color: 'success.main' }} />
              Shortened URLs
            </Typography>
            <Button variant="outlined" onClick={onClear} size="small">
              Clear Results
            </Button>
          </Box>

          <List>
            {urls.map((url, index) => (
              <React.Fragment key={url.id}>
                <ListItem 
                  sx={{ 
                    flexDirection: 'column', 
                    alignItems: 'stretch',
                    py: 2,
                    bgcolor: isExpired(url.expiresAt) ? 'grey.50' : 'transparent'
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', mb: 1 }}>
                    <ListItemIcon>
                      <LinkIcon color={isExpired(url.expiresAt) ? 'disabled' : 'primary'} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography 
                            variant="body1" 
                            sx={{ 
                              wordBreak: 'break-all',
                              color: isExpired(url.expiresAt) ? 'text.disabled' : 'text.primary'
                            }}
                          >
                            {url.originalUrl}
                          </Typography>
                          {url.customShortCode && (
                            <Chip label="Custom" size="small" color="secondary" />
                          )}
                          <Chip 
                            label={getTimeUntilExpiry(url.expiresAt)} 
                            size="small" 
                            color={isExpired(url.expiresAt) ? 'error' : 'success'}
                            icon={<Schedule />}
                          />
                        </Box>
                      }
                    />
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: 1, 
                    mt: 1,
                    pl: 7,
                    flexWrap: 'wrap'
                  }}>
                    <Typography 
                      variant="h6" 
                      color="primary" 
                      sx={{ 
                        wordBreak: 'break-all',
                        opacity: isExpired(url.expiresAt) ? 0.5 : 1
                      }}
                    >
                      {url.shortUrl}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="Copy Short URL">
                        <IconButton
                          onClick={() => copyToClipboard(url.shortUrl)}
                          size="small"
                          color="primary"
                          disabled={isExpired(url.expiresAt)}
                        >
                          <ContentCopy />
                        </IconButton>
                      </Tooltip>
                      
                      <Tooltip title="Open Original URL">
                        <IconButton
                          onClick={() => window.open(url.originalUrl, '_blank')}
                          size="small"
                          color="primary"
                          disabled={isExpired(url.expiresAt)}
                        >
                          <Launch />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    mt: 1,
                    pl: 7,
                    flexWrap: 'wrap',
                    gap: 1
                  }}>
                    <Typography variant="body2" color="text.secondary">
                      Created: {formatDate(url.createdAt)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Expires: {formatDate(url.expiresAt)}
                    </Typography>
                  </Box>
                </ListItem>
                {index < urls.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setSnackbarOpen(false)} 
          severity="success" 
          sx={{ width: '100%' }}
        >
          URL copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default URLResults;