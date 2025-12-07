import type { Logger } from 'pino';

// Required to extend the express-zod-api module to include Pino logger method overrides
declare module 'express-zod-api' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface LoggerOverrides extends Logger {}
}

// Extend Express Request to include rawBody
declare module 'express-serve-static-core' {
  interface Request {
    rawBody: Buffer;
  }
}

// Extend IncomingMessage to include rawBody property
declare module 'http' {
  interface IncomingMessage {
    rawBody?: Buffer;
  }
}
