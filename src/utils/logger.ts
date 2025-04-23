/**
 * Logger utility for debugging
 * Provides consistent logging with environment-aware behavior
 */

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3
}

// Current log level - can be adjusted based on environment
const currentLogLevel = process.env.NODE_ENV === 'production' 
  ? LogLevel.ERROR  // Only show errors in production
  : LogLevel.DEBUG; // Show all logs in development

// Logger interface
interface Logger {
  debug: (message: string, ...args: any[]) => void;
  info: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
}

// Create logger
const createLogger = (namespace: string): Logger => {
  return {
    debug: (message: string, ...args: any[]) => {
      if (currentLogLevel <= LogLevel.DEBUG) {
        console.debug(`[${namespace}] 🔍 ${message}`, ...args);
      }
    },
    
    info: (message: string, ...args: any[]) => {
      if (currentLogLevel <= LogLevel.INFO) {
        console.info(`[${namespace}] ℹ️ ${message}`, ...args);
      }
    },
    
    warn: (message: string, ...args: any[]) => {
      if (currentLogLevel <= LogLevel.WARN) {
        console.warn(`[${namespace}] ⚠️ ${message}`, ...args);
      }
    },
    
    error: (message: string, ...args: any[]) => {
      if (currentLogLevel <= LogLevel.ERROR) {
        console.error(`[${namespace}] 🔴 ${message}`, ...args);
      }
    }
  };
};

export default createLogger;
