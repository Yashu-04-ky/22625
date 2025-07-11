export interface LogLevel {
  ERROR: 'ERROR';
  WARN: 'WARN';
  INFO: 'INFO';
  DEBUG: 'DEBUG';
}

export interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  data?: any;
  module?: string;
  userId?: string;
  sessionId: string;
}

class LoggingService {
  private logs: LogEntry[] = [];
  private sessionId: string;
  private maxLogs: number = 1000;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.info('LoggingService initialized', { sessionId: this.sessionId });
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private createLogEntry(level: keyof LogLevel, message: string, data?: any, module?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      module,
      sessionId: this.sessionId
    };
  }

  private addLog(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Keep only the latest logs to prevent memory issues
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Also log to console for development
    const consoleMethod = level => {
      switch (level) {
        case 'ERROR': return console.error;
        case 'WARN': return console.warn;
        case 'INFO': return console.info;
        default: return console.log;
      }
    };

    consoleMethod(entry.level)(`[${entry.timestamp}] ${entry.level} - ${entry.message}`, entry.data || '');
  }

  error(message: string, data?: any, module?: string): void {
    this.addLog(this.createLogEntry('ERROR', message, data, module));
  }

  warn(message: string, data?: any, module?: string): void {
    this.addLog(this.createLogEntry('WARN', message, data, module));
  }

  info(message: string, data?: any, module?: string): void {
    this.addLog(this.createLogEntry('INFO', message, data, module));
  }

  debug(message: string, data?: any, module?: string): void {
    this.addLog(this.createLogEntry('DEBUG', message, data, module));
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getLogsByLevel(level: keyof LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  getLogsByModule(module: string): LogEntry[] {
    return this.logs.filter(log => log.module === module);
  }

  clearLogs(): void {
    this.logs = [];
    this.info('Logs cleared', {}, 'LoggingService');
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

export const logger = new LoggingService();