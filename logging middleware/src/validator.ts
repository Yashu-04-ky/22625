import { LogLevel, LogStack, LogPackage, BackendPackage, FrontendPackage, SharedPackage } from './types';

/**
 * Validates log parameters against API constraints
 */
export class LogValidator {
  private static readonly VALID_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal'];
  private static readonly VALID_STACKS: LogStack[] = ['backend', 'frontend'];
  
  private static readonly BACKEND_PACKAGES: BackendPackage[] = [
    'cache', 'controller', 'cron job', 'db', 'domain', 'handler', 'repository', 'route', 'service'
  ];
  
  private static readonly FRONTEND_PACKAGES: FrontendPackage[] = [
    'api', 'component', 'hook', 'page', 'state', 'style'
  ];
  
  private static readonly SHARED_PACKAGES: SharedPackage[] = [
    'auth', 'config', 'middleware', 'utils'
  ];

  /**
   * Validates the log level
   */
  static validateLevel(level: string): level is LogLevel {
    return this.VALID_LEVELS.includes(level as LogLevel);
  }

  /**
   * Validates the log stack
   */
  static validateStack(stack: string): stack is LogStack {
    return this.VALID_STACKS.includes(stack as LogStack);
  }

  /**
   * Validates the log package based on stack
   */
  static validatePackage(stack: LogStack, packageName: string): packageName is LogPackage {
    const allValidPackages = [
      ...this.BACKEND_PACKAGES,
      ...this.FRONTEND_PACKAGES,
      ...this.SHARED_PACKAGES
    ];

    if (!allValidPackages.includes(packageName as LogPackage)) {
      return false;
    }

    // Check if package is valid for the specific stack
    if (stack === 'backend') {
      return this.BACKEND_PACKAGES.includes(packageName as BackendPackage) ||
             this.SHARED_PACKAGES.includes(packageName as SharedPackage);
    } else if (stack === 'frontend') {
      return this.FRONTEND_PACKAGES.includes(packageName as FrontendPackage) ||
             this.SHARED_PACKAGES.includes(packageName as SharedPackage);
    }

    return false;
  }

  /**
   * Validates the message
   */
  static validateMessage(message: string): boolean {
    return typeof message === 'string' && message.trim().length > 0;
  }

  /**
   * Validates all log parameters
   */
  static validateLogRequest(stack: string, level: string, packageName: string, message: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!this.validateStack(stack)) {
      errors.push(`Invalid stack: ${stack}. Must be one of: ${this.VALID_STACKS.join(', ')}`);
    }

    if (!this.validateLevel(level)) {
      errors.push(`Invalid level: ${level}. Must be one of: ${this.VALID_LEVELS.join(', ')}`);
    }

    if (this.validateStack(stack) && !this.validatePackage(stack as LogStack, packageName)) {
      const validPackages = stack === 'backend' 
        ? [...this.BACKEND_PACKAGES, ...this.SHARED_PACKAGES]
        : [...this.FRONTEND_PACKAGES, ...this.SHARED_PACKAGES];
      errors.push(`Invalid package: ${packageName} for stack: ${stack}. Must be one of: ${validPackages.join(', ')}`);
    }

    if (!this.validateMessage(message)) {
      errors.push('Invalid message: Message must be a non-empty string');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}