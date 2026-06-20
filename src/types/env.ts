export type AppEnv = {
  Bindings: {
    DB: D1Database;
    CATAPI_API_KEY?: string;
    CATAPI_BASE_URL: string;
    ALLOWED_ORIGIN: string;
    CATAPI_FETCH?: typeof fetch;
  };
  Variables: {
    deviceId: string;
    secureHeadersNonce: string | undefined;
  };
};
