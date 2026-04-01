const defaultApiBaseUrlOrigin = 'https://app.dynamic.xyz/';

const defaultApiBaseUrlPath = 'api/v0/';

/**
 * Public reference app: set `VITE_DYNAMIC_ENVIRONMENT_ID` (and optionally API URL parts) in `.env`.
 * See `.env.example`.
 */
export const demoConfig = {
  apiBaseUrlOrigin:
    import.meta.env.VITE_DYNAMIC_API_BASE_URL_ORIGIN ??
    defaultApiBaseUrlOrigin,

  apiBaseUrlPath:
    import.meta.env.VITE_DYNAMIC_API_BASE_URL_PATH ?? defaultApiBaseUrlPath,

  environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID ?? '',
} as const;
