const apiBaseUrlOrigin = 'https://app.dynamic.xyz/';
const apiBaseUrlPath = 'api/v0/';

/**
 * Set `VITE_DYNAMIC_ENVIRONMENT_ID` in `.env` (see `.env.example`).
 */
export const demoConfig = {
  apiBaseUrlOrigin,
  apiBaseUrlPath,
  environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID ?? '',
} as const;
