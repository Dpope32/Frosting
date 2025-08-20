import * as Sentry from '@sentry/react-native';

type LogStatus = 'info' | 'success' | 'error' | 'warning' | 'verbose';

export interface LogEntry {
  id: string;
  message: string;
  timestamp: Date;
  status: LogStatus;
  details?: string;
}

// Private module variables
let logQueue: LogEntry[] = [];
let updateCallback: ((logs: LogEntry[]) => void) | null = null;

// Internal helper
const notifySubscribers = () => {
  if (updateCallback) {
    updateCallback([...logQueue]);
  }
};

/*
  This is a global function that can be used to add logs to the log queue.
  It expects 0 ar
*/
export const addSyncLog = (
  message: string, 
  status: LogStatus, 
  details?: string
): void => {
  const log: LogEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    message,
    timestamp: new Date(),
    status,
    details
  };
  
  logQueue = [...logQueue, log];
  notifySubscribers();
  
  // Sentry integration with proper type conversion
  Sentry.addBreadcrumb({
    category: 'sync',
    message,
    data: details ? { details } : undefined,
    level: status === 'error' ? 'error' : 
           status === 'warning' ? 'warning' : 
           'info' as const,
  });
};

export const setLogUpdateCallback = (
  callback: ((logs: LogEntry[]) => void) | null
): void => {
  updateCallback = callback;
  if (callback) {
    callback([...logQueue]);
  }
};

export const clearLogQueue = (): void => {
  logQueue = [];
  notifySubscribers();
};

export const getLogQueue = (): ReadonlyArray<LogEntry> => [...logQueue];

// Properly typed fetch interceptor
const originalFetch = global.fetch;
global.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const response = await originalFetch(input, init);
  return response;
};

// Replace debug log with always-on verbose logging
export const addVerboseLog = (message: string, details?: string) => {
  addSyncLog(`[VERBOSE] ${message}`, 'verbose', details); 
}; 