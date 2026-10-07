// A lazy page's file failed to download. Almost always because a new version
// was deployed while the tab was open: the old file names (hashed, e.g.
// Dashboard-a1b2c3.js) no longer exist on the server. Reloading fetches the
// new version. Each browser words this differently.
const CHUNK_ERROR_PATTERNS = [
  /Failed to fetch dynamically imported module/i, // Chrome, Edge
  /error loading dynamically imported module/i, // Firefox
  /Importing a module script failed/i, // Safari
  /Unable to preload CSS/i, // Vite CSS preload
];

export const isChunkLoadError = (error: unknown): boolean =>
  error instanceof Error && CHUNK_ERROR_PATTERNS.some((pattern) => pattern.test(error.message));
