import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Divider,
  Grid
} from '@mui/material';
import { Add, Remove, Calculate, Clear } from '@mui/icons-material';
import { useCalculator } from '../hooks/useCalculator';
import { logger } from '../utils/logger';

const operations = [
  { value: 'add', label: 'Addition (+)' },
  { value: 'subtract', label: 'Subtraction (-)' },
  { value: 'multiply', label: 'Multiplication (×)' },
  { value: 'divide', label: 'Division (÷)' },
  { value: 'average', label: 'Average' }
];

export function CalculatorForm() {
  const [numbers, setNumbers] = useState<number[]>([10, 5]);
  const [operation, setOperation] = useState<string>('add');
  const [inputValue, setInputValue] = useState<string>('');
  
  const { calculate, loading, error, lastResult, clearError, clearResult } = useCalculator();

  useEffect(() => {
    logger.info('component', 'CalculatorForm component mounted');
    return () => {
      logger.info('component', 'CalculatorForm component unmounted');
    };
  }, []);

  const handleAddNumber = () => {
    const num = parseFloat(inputValue);
    if (!isNaN(num)) {
      setNumbers([...numbers, num]);
      setInputValue('');
      logger.debug('component', `Added number: ${num}`);
    } else {
      logger.warn('component', `Invalid number input: ${inputValue}`);
    }
  };

  const handleRemoveNumber = (index: number) => {
    const removedNumber = numbers[index];
    setNumbers(numbers.filter((_, i) => i !== index));
    logger.debug('component', `Removed number: ${removedNumber} at index ${index}`);
  };

  const handleCalculate = async () => {
    if (numbers.length === 0) {
      logger.warn('component', 'Attempted calculation with no numbers');
      return;
    }

    await logger.info('component', `Initiating calculation: ${operation} with numbers [${numbers.join(', ')}]`);
    
    await calculate({
      numbers,
      operation: operation as any
    });
  };

  const handleClear = () => {
    setNumbers([]);
    setInputValue('');
    clearResult();
    clearError();
    logger.debug('component', 'Form cleared');
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddNumber();
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom align="center">
        Calculator
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Numbers
        </Typography>
        
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={8}>
            <TextField
              fullWidth
              label="Enter a number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              type="number"
              variant="outlined"
              size="small"
            />
          </Grid>
          <Grid item xs={4}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleAddNumber}
              disabled={!inputValue.trim()}
              startIcon={<Add />}
            >
              Add
            </Button>
          </Grid>
        </Grid>

        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {numbers.map((num, index) => (
            <Chip
              key={index}
              label={num}
              onDelete={() => handleRemoveNumber(index)}
              deleteIcon={<Remove />}
              color="primary"
              variant="outlined"
            />
          ))}
        </Box>
      </Box>

      <FormControl fullWidth sx={{ mb: 3 }}>
        <InputLabel>Operation</InputLabel>
        <Select
          value={operation}
          onChange={(e) => {
            setOperation(e.target.value);
            logger.debug('component', `Operation changed to: ${e.target.value}`);
          }}
          label="Operation"
        >
          {operations.map((op) => (
            <MenuItem key={op.value} value={op.value}>
              {op.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="contained"
          onClick={handleCalculate}
          disabled={loading || numbers.length === 0}
          startIcon={loading ? <CircularProgress size={20} /> : <Calculate />}
          size="large"
          fullWidth
        >
          {loading ? 'Calculating...' : 'Calculate'}
        </Button>
        
        <Button
          variant="outlined"
          onClick={handleClear}
          startIcon={<Clear />}
          size="large"
        >
          Clear
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={clearError}>
          {error}
        </Alert>
      )}

      {lastResult && (
        <Paper elevation={1} sx={{ p: 2, bgcolor: 'success.light', color: 'success.contrastText' }}>
          <Typography variant="h6" gutterBottom>
            Result
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Typography variant="h4" align="center" gutterBottom>
            {lastResult.result}
          </Typography>
          <Typography variant="body2" align="center" gutterBottom>
            {lastResult.operation.toUpperCase()} of [{lastResult.inputs.join(', ')}]
          </Typography>
          <Typography variant="caption" align="center" display="block">
            {new Date(lastResult.timestamp).toLocaleString()}
          </Typography>
        </Paper>
      )}
    </Paper>
  );
}