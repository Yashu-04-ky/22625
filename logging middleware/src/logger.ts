import axios, { AxiosError } from 'axios';
import { LogRequest, LogResponse, LoggerConfig, LogStack, LogLevel, LogPackage } from './types';
import { LogValidator } from './validator';

/**
 * Core logging functionality that integrates with the test server
 */
export class Logger {
  private static readonly DEFAULT_BASE_URL = 'http://20.244.56.144/evaluation-service';
  private static readonly LOG_ENDPOINT = '/logs';
  
  private config: Required<LoggerConfig>;
  
  constructor(config: LoggerConfig = {}) {
    this.config = {
      baseURL: config.baseURL || Logger.DEFAULT_BASE_URL,
      accessToken: config.accessToken || '',
      enableConsoleLog: config.enableConsoleLog ?? true,
      retryAttempts: config.retryAttempts || 3,
      retryDelay: config.retryDelay || 1000
    };
  }

  /**
   * Updates the logger configuration
   */
  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Sets the access token for API authentication
   */
  setAccessToken(token: string): void {
    this.config.accessToken = token;
  }

  /**
   * Main logging function that sends logs to the test server
   */
  async log(stack: LogStack, level: LogLevel, packageName: LogPackage, message: string): Promise<LogResponse | null> {
    // Validate input parameters
    const validation = LogValidator.validateLogRequest(stack, level, packageName, message);
    if (!validation.isValid) {
      const errorMessage = `Log validation failed: ${validation.errors.join(', ')}`;
      this.logToConsole('error', errorMessage);
      throw new Error(errorMessage);
    }

    const logData: LogRequest = {
      stack,
      level,
      package: packageName,
      message
    };

    // Log to console if enabled
    if (this.config.enableConsoleLog) {
      this.logToConsole(level, `[${stack}:${packageName}] ${message}`);
    }

    // Send to test server with retry logic
    return this.sendLogWithRetry(logData);
  }

  /**
   * Sends log data to the test server with retry mechanism
   */
  private async sendLogWithRetry(logData: LogRequest, attempt = 1): Promise<LogResponse | null> {
    try {
      if (!this.config.accessToken) {
        throw new Error('Access token not configured. Please set access token before logging.');
      }

      const response = await axios.post<LogResponse>(
        `${this.config.baseURL}${Logger.LOG_ENDPOINT}`,
        logData,
        {
          headers: {
            'Authorization': `Bearer ${this.config.accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      return response.data;
    } catch (error) {
      const errorMessage = this.getErrorMessage(error);
      
      if (attempt < this.config.retryAttempts) {
        this.logToConsole('warn', `Log attempt ${attempt} failed: ${errorMessage}. Retrying...`);
        await this.delay(this.config.retryDelay * attempt);
        return this.sendLogWithRetry(logData, attempt + 1);
      } else {
        this.logToConsole('error', `Failed to send log after ${this.config.retryAttempts} attempts: ${errorMessage}`);
        return null;
      }
    }
  }

  /**
   * Extracts error message from various error types
   */
  private getErrorMessage(error: unknown): string {
    if (error instanceof AxiosError) {
      return error.response?.data?.message || error.message || 'Network error';
    }
    return error instanceof Error ? error.message : 'Unknown error';
  }

  /**
   * Logs messages to console with timestamp
   */
  private logToConsole(level: LogLevel | 'error' | 'warn', message: string): void {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
    
    switch (level) {
      case 'error':
      case 'fatal':
        console.error(logMessage);
        break;
      case 'warn':
        console.warn(logMessage);
        break;
      case 'info':
        console.info(logMessage);
        break;
      case 'debug':
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }
  }

  /**
   * Utility function to add delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Convenience methods for different log levels
   */
  async debug(stack: LogStack, packageName: LogPackage, message: string): Promise<LogResponse | null> {
    return this.log(stack, 'debug', packageName, message);
  }

  async info(stack: LogStack, packageName: LogPackage, message: string): Promise<LogResponse | null> {
    return this.log(stack, 'info', packageName, message);
  }

  async warn(stack: LogStack, packageName: LogPackage, message: string): Promise<LogResponse | null> {
    return this.log(stack, 'warn', packageName, message);
  }

  async error(stack: LogStack, packageName: LogPackage, message: string): Promise<LogResponse | null> {
    return this.log(stack, 'error', packageName, message);
  }

  async fatal(stack: LogStack, packageName: LogPackage, message: string): Promise<LogResponse | null> {
    return this.log(stack, 'fatal', packageName, message);
  }
}