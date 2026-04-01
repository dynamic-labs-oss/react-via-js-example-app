const STORAGE_KEY = 'phantom_debug_logs';
const MAX_ENTRIES = 500;

export type PhantomLogEntry = {
  data: unknown;
  message: string;
  timestamp: number;
};

/**
 * Reads the stored phantom debug log entries from localStorage.
 */
export const getPhantomDebugLogs = (): PhantomLogEntry[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? (JSON.parse(raw) as PhantomLogEntry[]) : [];
  } catch {
    return [];
  }
};

/**
 * Clears all stored phantom debug log entries from localStorage.
 */
export const clearPhantomDebugLogs = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

const appendEntry = (entry: PhantomLogEntry): void => {
  try {
    const logs = getPhantomDebugLogs();

    logs.push(entry);

    if (logs.length > MAX_ENTRIES) {
      logs.splice(0, logs.length - MAX_ENTRIES);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  } catch {
    // ignore storage errors (e.g. private mode quota)
  }
};

/**
 * Regex that matches the logger's timestamp prefix:
 * "[2026-01-01T00:00:00.000Z] DEBUG: "
 */
const LOGGER_PREFIX_REGEX = /^\[\d{4}-\d{2}-\d{2}T[\d:.]+Z\] \w+: /;

const captureIfPhantom = (args: unknown[]): void => {
  const first = args[0];

  if (typeof first !== 'string') return;

  const message = first.replace(LOGGER_PREFIX_REGEX, '');

  if (!message.startsWith('[PHANTOM]')) return;

  appendEntry({
    data: args.length > 1 ? args.slice(1) : undefined,
    message,
    timestamp: Date.now(),
  });
};

/**
 * Installs console.debug and console.log interceptors that capture any log
 * message containing "[PHANTOM]" into localStorage so that logs survive page
 * navigations and can be inspected across tabs.
 *
 * Call this once at app startup, before any phantom redirect code runs.
 */
export const installPhantomLogInterceptor = (): void => {
  // eslint-disable-next-line no-console
  const originalDebug = console.debug.bind(console);
  // eslint-disable-next-line no-console
  const originalLog = console.log.bind(console);

  // eslint-disable-next-line no-console
  console.debug = (...args: unknown[]) => {
    originalDebug(...args);
    captureIfPhantom(args);
  };

  // eslint-disable-next-line no-console
  console.log = (...args: unknown[]) => {
    originalLog(...args);
    captureIfPhantom(args);
  };
};
