// Frontend-specific logger that uses the logging middleware
import axios from 'axios';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';
export type LogPackage = 'api' | 'component' | 'hook' | 'page' | 'state' | 'style' | 'auth' | 'config' | 'middleware' | 'utils';

interface LogEntry {
  stack: 'frontend';
  level: LogLevel;
  package: LogPackage;
  message: string;
  timestamp: string;
  url?: string;
  userAgent?: string;
}

class FrontendLogger {
  private logs: LogEntry[] = [];
  private isEnabled: boolean;

  constructor(enabled: boolean = true) {
    this.isEnabled = enabled;
  }

  private createLogEntry(level: LogLevel, packageName: LogPackage, message: string): LogEntry {
    return {
      stack: 'frontend',
      level,
      package: packageName,
      message,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
  }

  async log(level: LogLevel, packageName: LogPackage, message: string): Promise<void> {
    if (!this.isEnabled) return;

    const logEntry = this.createLogEntry(level, packageName, message);
    this.logs.push(logEntry);

    // Log to console
    const consoleMessage = `[${logEntry.timestamp}] [${level.toUpperCase()}] [${packageName}] ${message}`;
    
    switch (level) {
      case 'error':
      case 'fatal':
        console.error(consoleMessage);
        break;
      case 'warn':
        console.warn(consoleMessage);
        break;
      case 'info':
        console.info(consoleMessage);
        break;
      case 'debug':
        console.debug(consoleMessage);
        break;
      default:
        console.log(consoleMessage);
    }

    // Try to send to test server (if configured)
    try {
      await this.sendToTestServer(logEntry);
    } catch (error) {
      console.warn('Failed to send log to test server:', error);
    }
  }

  private async sendToTestServer(logEntry: LogEntry): Promise<void> {
    // This would normally use the same authentication as the backend
    // For demo purposes, we'll just log locally
    // In production, you'd integrate with the logging middleware
    
    // Example of how it would work:
    // await axios.post('http://20.244.56.144/evaluation-service/logs', {
    //   stack: logEntry.stack,
    //   level: logEntry.level,
    //   package: logEntry.package,
    //   message: logEntry.message
    // }, {
    //   headers: {
    //     'Authorization': `Bearer ${accessToken}`
    //   }
    // });
  }

  // Convenience methods
  async debug(packageName: LogPackage, message: string): Promise<void> {
    return this.log('debug', packageName, message);
  }

  async info(packageName: LogPackage, message: string): Promise<void> {
    return this.log('info', packageName, message);
  }

  async warn(packageName: LogPackage, message: string): Promise<void> {
    return this.log('warn', packageName, message);
  }

  async error(packageName: LogPackage, message: string): Promise<void> {
    return this.log('error', packageName, message);
  }

  async fatal(packageName: LogPackage, message: string): Promise<void> {
    return this.log('fatal', packageName, message);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs(): void {
    this.logs = [];
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

export const logger = new FrontendLogger();

// Export the Log function for compatibility
export function Log(stack: 'frontend', level: LogLevel, packageName: LogPackage, message: string) {
  return logger.log(level, packageName, message);
}

export default logger;