// Thrown values are `unknown` (anything can be thrown), so narrow safely
export const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
