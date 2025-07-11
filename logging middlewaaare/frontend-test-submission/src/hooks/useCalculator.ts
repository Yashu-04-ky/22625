import { useState, useCallback } from 'react';
import axios from 'axios';
import { logger } from '../utils/logger';

export interface CalculationRequest {
  numbers: number[];
  operation: 'add' | 'subtract' | 'multiply' | 'divide' | 'average';
}

export interface CalculationResult {
  result: number;
  operation: string;
  inputs: number[];
  timestamp: string;
}

export interface CalculationResponse {
  success: boolean;
  data: CalculationResult;
}

export function useCalculator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<CalculationResult | null>(null);

  const calculate = useCallback(async (request: CalculationRequest): Promise<CalculationResult | null> => {
    await logger.info('hook', 'Starting calculation request');
    setLoading(true);
    setError(null);

    try {
      // Validate input
      if (!request.numbers || request.numbers.length === 0) {
        const errorMsg = 'Numbers array is required and cannot be empty';
        await logger.error('hook', errorMsg);
        throw new Error(errorMsg);
      }

      if (!request.numbers.every(num => typeof num === 'number' && !isNaN(num))) {
        const errorMsg = 'All inputs must be valid numbers';
        await logger.error('hook', errorMsg);
        throw new Error(errorMsg);
      }

      await logger.debug('hook', `Sending calculation request: ${request.operation} with ${request.numbers.length} numbers`);

      const response = await axios.post<CalculationResponse>('http://localhost:3000/api/calculate', request, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.data.success) {
        throw new Error('Calculation failed on server');
      }

      const result = response.data.data;
      setLastResult(result);
      
      await logger.info('hook', `Calculation completed successfully: ${request.operation} result = ${result.result}`);
      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      await logger.error('hook', `Calculation failed: ${errorMessage}`);
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
    logger.debug('hook', 'Error cleared');
  }, []);

  const clearResult = useCallback(() => {
    setLastResult(null);
    logger.debug('hook', 'Result cleared');
  }, []);

  return {
    calculate,
    loading,
    error,
    lastResult,
    clearError,
    clearResult
  };
}