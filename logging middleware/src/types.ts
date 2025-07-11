/**
 * Type definitions for the logging middleware
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogStack = 'backend' | 'frontend';

export type BackendPackage = 
  | 'cache' 
  | 'controller' 
  | 'cron job' 
  | 'db' 
  | 'domain' 
  | 'handler' 
  | 'repository' 
  | 'route' 
  | 'service';

export type FrontendPackage = 
  | 'api' 
  | 'component' 
  | 'hook' 
  | 'page' 
  | 'state' 
  | 'style';

export type SharedPackage = 
  | 'auth' 
  | 'config' 
  | 'middleware' 
  | 'utils';

export type LogPackage = BackendPackage | FrontendPackage | SharedPackage;

export interface LogRequest {
  stack: LogStack;
  level: LogLevel;
  package: LogPackage;
  message: string;
}

export interface LogResponse {
  logID: string;
  message: string;
}

export interface LoggerConfig {
  baseURL?: string;
  accessToken?: string;
  enableConsoleLog?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface AuthConfig {
  email: string;
  name: string;
  rollNo: string;
  accessCode: string;
  clientID: string;
  clientSecret: string;
}

export interface AuthResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
}