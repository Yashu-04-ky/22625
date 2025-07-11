import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import { 
  Analytics, 
  Link as LinkIcon, 
  Schedule, 
  Mouse, 
  ContentCopy,
  Launch,
  TrendingUp,
  AccessTime,
  LocationOn
} from '@mui/icons-material';
import { urlService } from '../services/URLService';
import { logger } from '../services/LoggingService';
import { ShortenedURL } from '../types';

const StatisticsPage: React.FC = () => {
  const MODULE_NAME = 'StatisticsPage';
  const [urls, setUrls] = useState<ShortenedURL[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedUrl, setSelectedUrl] = useState<ShortenedURL | null>(null);

  useEffect(() => {
    logger.info('StatisticsPage mounted', {}, MODULE_NAME);
    loadUrls();
  }, []);

  const loadUrls = () => {
    try {
      const allUrls = urlService.getAllUrls();
      setUrls(allUrls);
      logger.info('URLs loaded for statistics', { count: allUrls.length }, MODULE_NAME);
    } catch (error) {
      logger.error('Failed to load URLs for statistics', { error }, MODULE_NAME);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      logger.info('URL copied to clipboard', { url }, MODULE_NAME);
    } catch (error) {
      logger.error('Failed to copy URL to clipboard', { error }, MODULE_NAME);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString();
  };

  const getStatusChip = (url: ShortenedURL) => {
    const now = new Date();
    const isExpired = now > url.expiresAt;
    
    if (isExpired) {
      return <Chip label="Expired" color="error" size="small" />;
    }
    
    return <Chip label="Active" color="success" size="small" />;
  };

  const getTotalClicks = () => {
    return urls.reduce((total, url) => total + url.clickCount, 0);
  };

  const getActiveUrls = () => {
    const now = new Date();
    return urls.filter(url => now <= url.expiresAt);
  };

  const getTopClickedUrls = () => {
    return [...urls].sort((a, b) => b.clickCount - a.clickCount).slice(0, 5);
  };

  if (urls.length === 0) {
    return (
      <Box>
        <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
          Statistics
        </Typography>
        <Alert severity="info">
          No URLs have been shortened yet. Visit the URL Shortener page to create some links!
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Statistics Dashboard
      </Typography>

      {/* Overview Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <LinkIcon sx={{ mr: 1 }} color="primary" />
                <Typography variant="h6">Total URLs</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {urls.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Schedule sx={{ mr: 1 }} color="success" />
                <Typography variant="h6">Active URLs</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {getActiveUrls().length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Mouse sx={{ mr: 1 }} color="info" />
                <Typography variant="h6">Total Clicks</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {getTotalClicks()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ mr: 1 }} color="secondary" />
                <Typography variant="h6">Avg. Clicks</Typography>
              </Box>
              <Typography variant="h4" color="secondary.main">
                {urls.length > 0 ? (getTotalClicks() / urls.length).toFixed(1) : '0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Card>
        <CardContent>
          <Tabs value={selectedTab} onChange={(_, value) => setSelectedTab(value)} sx={{ mb: 3 }}>
            <Tab label="All URLs" />
            <Tab label="Top Performing" />
            <Tab label="Click Details" />
          </Tabs>

          {selectedTab === 0 && (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Original URL</TableCell>
                    <TableCell>Short URL</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Clicks</TableCell>
                    <TableCell>Created</TableCell>
                    <TableCell>Expires</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {urls.map((url) => (
                    <TableRow key={url.id}>
                      <TableCell>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {url.originalUrl}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="primary">
                          {url.shortUrl}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(url)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                          <Mouse sx={{ mr: 0.5, fontSize: 16 }} />
                          {url.clickCount}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(url.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(url.expiresAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Tooltip title="Copy Short URL">
                            <IconButton
                              onClick={() => copyToClipboard(url.shortUrl)}
                              size="small"
                            >
                              <ContentCopy />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Open Original URL">
                            <IconButton
                              onClick={() => window.open(url.originalUrl, '_blank')}
                              size="small"
                            >
                              <Launch />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {selectedTab === 1 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Top Performing URLs
              </Typography>
              <List>
                {getTopClickedUrls().map((url, index) => (
                  <React.Fragment key={url.id}>
                    <ListItem>
                      <ListItemIcon>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          fontWeight: 'bold'
                        }}>
                          #{index + 1}
                        </Box>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1" sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {url.originalUrl}
                            </Typography>
                            {getStatusChip(url)}
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Typography variant="body2" color="primary">
                              {url.shortUrl}
                            </Typography>
                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center' }}>
                              <Mouse sx={{ mr: 0.5, fontSize: 16 }} />
                              {url.clickCount} clicks
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < getTopClickedUrls().length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </Box>
          )}

          {selectedTab === 2 && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Click Details
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Select a URL to view detailed click information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    URLs with Clicks
                  </Typography>
                  <List>
                    {urls.filter(url => url.clickCount > 0).map((url) => (
                      <ListItem 
                        key={url.id}
                        button
                        onClick={() => setSelectedUrl(url)}
                        selected={selectedUrl?.id === url.id}
                      >
                        <ListItemIcon>
                          <LinkIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {url.originalUrl}
                            </Typography>
                          }
                          secondary={`${url.clickCount} clicks`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  {selectedUrl && (
                    <Box>
                      <Typography variant="subtitle1" gutterBottom>
                        Click History for {selectedUrl.shortCode}
                      </Typography>
                      {selectedUrl.clicks.length > 0 ? (
                        <List>
                          {selectedUrl.clicks.map((click) => (
                            <ListItem key={click.id}>
                              <ListItemIcon>
                                <AccessTime />
                              </ListItemIcon>
                              <ListItemText
                                primary={formatDate(click.timestamp)}
                                secondary={
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                      <LocationOn sx={{ mr: 0.5, fontSize: 16 }} />
                                      <Typography variant="body2">
                                        {click.location}
                                      </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary">
                                      Source: {click.source}
                                    </Typography>
                                  </Box>
                                }
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No clicks recorded yet
                        </Typography>
                      )}
                    </Box>
                  )}
                </Grid>
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default StatisticsPage;