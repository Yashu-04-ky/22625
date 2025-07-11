import { Logger } from './logger';
import { AuthManager } from './auth';
import { LogValidator } from './validator';

// Export types
export * from './types';

// Export classes
export { Logger, AuthManager, LogValidator };

// Export convenience function for quick setup
export function createLogger(accessToken?: string) {
  return new Logger({ accessToken });
}

// Export singleton instance for global use
export const logger = new Logger();

// Export the main Log function as specified in requirements
export function Log(stack: any, level: any, packageName: any, message: any) {
  return logger.log(stack, level, packageName, message);
}

// Default export
export default {
  Logger,
  AuthManager,
  LogValidator,
  createLogger,
  logger,
  Log
};