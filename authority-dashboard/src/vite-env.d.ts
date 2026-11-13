/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_ENABLE_MOCK_FALLBACK?: string;
  readonly VITE_POLL_INTERVAL_CASES_SEC?: string;
  readonly VITE_POLL_INTERVAL_STATS_SEC?: string;
  readonly VITE_POLL_INTERVAL_ALERTS_SEC?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
