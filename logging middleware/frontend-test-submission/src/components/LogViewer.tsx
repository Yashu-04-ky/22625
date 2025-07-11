import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider
} from '@mui/material';
import { Visibility, Clear } from '@mui/icons-material';
import { logger } from '../utils/logger';

export function LogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [packageFilter, setPackageFilter] = useState<string>('all');

  useEffect(() => {
    logger.info('component', 'LogViewer component mounted');
    
    const interval = setInterval(() => {
      setLogs(logger.getLogs());
    }, 1000);

    return () => {
      clearInterval(interval);
      logger.info('component', 'LogViewer component unmounted');
    };
  }, []);

  const filteredLogs = logs.filter(log => {
    const levelMatch = levelFilter === 'all' || log.level === levelFilter;
    const packageMatch = packageFilter === 'all' || log.package === packageFilter;
    return levelMatch && packageMatch;
  });

  const handleClearLogs = () => {
    logger.clearLogs();
    setLogs([]);
    logger.info('component', 'Logs cleared from viewer');
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
      case 'fatal':
        return 'error';
      case 'warn':
        return 'warning';
      case 'info':
        return 'info';
      case 'debug':
        return 'default';
      default:
        return 'default';
    }
  };

  const uniquePackages = [...new Set(logs.map(log => log.package))];

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Application Logs
        </Typography>
        <Chip 
          label={`${filteredLogs.length} logs`} 
          color="primary" 
          icon={<Visibility />}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Level</InputLabel>
          <Select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            label="Level"
          >
            <MenuItem value="all">All Levels</MenuItem>
            <MenuItem value="debug">Debug</MenuItem>
            <MenuItem value="info">Info</MenuItem>
            <MenuItem value="warn">Warning</MenuItem>
            <MenuItem value="error">Error</MenuItem>
            <MenuItem value="fatal">Fatal</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Package</InputLabel>
          <Select
            value={packageFilter}
            onChange={(e) => setPackageFilter(e.target.value)}
            label="Package"
          >
            <MenuItem value="all">All Packages</MenuItem>
            {uniquePackages.map(pkg => (
              <MenuItem key={pkg} value={pkg}>{pkg}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="outlined"
          onClick={handleClearLogs}
          startIcon={<Clear />}
          size="small"
        >
          Clear Logs
        </Button>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
        {filteredLogs.length === 0 ? (
          <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
            No logs to display
          </Typography>
        ) : (
          <List dense>
            {filteredLogs.reverse().map((log, index) => (
              <ListItem key={index} sx={{ py: 1 }}>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={log.level}
                        color={getLevelColor(log.level) as any}
                        size="small"
                      />
                      <Chip
                        label={log.package}
                        variant="outlined"
                        size="small"
                      />
                      <Typography variant="body2" sx={{ flexGrow: 1 }}>
                        {log.message}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.timestamp).toLocaleString()}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Paper>
  );
}