# Logging Middleware

A reusable logging middleware package that integrates with the test server for comprehensive application logging.

## Features

- **Type-safe logging** with TypeScript support
- **Validation** of log parameters against API constraints
- **Retry mechanism** for failed log submissions
- **Authentication management** with the test server
- **Console logging** with timestamps
- **Convenience methods** for different log levels
- **Production-ready** error handling

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Usage

```typescript
import { Logger, AuthManager } from './dist';

// Setup authentication
const authManager = new AuthManager();
const token = await authManager.authenticate({
  email: 'your-email@university.edu',
  name: 'Your Name',
  rollNo: 'your-roll-number',
  accessCode: 'your-access-code',
  clientID: 'your-client-id',
  clientSecret: 'your-client-secret'
});

// Create logger instance
const logger = new Logger({ accessToken: token });

// Log messages
await logger.log('backend', 'error', 'handler', 'Database connection failed');
await logger.info('backend', 'service', 'User registration successful');
await logger.warn('frontend', 'component', 'Deprecated component usage detected');
```

### Using the Global Log Function

```typescript
import { Log } from './dist';

// Use the global Log function as specified in requirements
Log('backend', 'error', 'handler', 'received string, expected bool');
Log('backend', 'fatal', 'db', 'Critical database connection failure');
```

## API Reference

### Logger Class

#### Constructor
- `new Logger(config?: LoggerConfig)`

#### Methods
- `log(stack, level, package, message)` - Main logging method
- `debug(stack, package, message)` - Debug level logging
- `info(stack, package, message)` - Info level logging
- `warn(stack, package, message)` - Warning level logging
- `error(stack, package, message)` - Error level logging
- `fatal(stack, package, message)` - Fatal level logging

### Valid Parameters

#### Stack Values
- `backend`
- `frontend`

#### Level Values
- `debug`
- `info`
- `warn`
- `error`
- `fatal`

#### Package Values

**Backend Only:**
- `cache`, `controller`, `cron job`, `db`, `domain`, `handler`, `repository`, `route`, `service`

**Frontend Only:**
- `api`, `component`, `hook`, `page`, `state`, `style`

**Shared:**
- `auth`, `config`, `middleware`, `utils`

## Testing

```bash
npm test
```

## License

MIT