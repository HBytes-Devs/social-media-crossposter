export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    const prefix = `[INFO] ${new Date().toISOString()}`;
    if (meta) {
      console.log(prefix, message, meta);
    } else {
      console.log(prefix, message);
    }
  },

  warn: (message: string, meta?: Record<string, unknown>) => {
    const prefix = `[WARN] ${new Date().toISOString()}`;
    if (meta) {
      console.warn(prefix, message, meta);
    } else {
      console.warn(prefix, message);
    }
  },

  error: (message: string, error?: unknown) => {
    const prefix = `[ERROR] ${new Date().toISOString()}`;
    if (error instanceof Error) {
      console.error(prefix, message, error.message);
    } else if (error) {
      console.error(prefix, message, error);
    } else {
      console.error(prefix, message);
    }
  },
};
