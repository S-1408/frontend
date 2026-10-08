// Remembers which SectionErrorBoundary caught an error, so reportError can tag it
// in Sentry ("section: application-list") without the boundary reporting
// the error a second time.
//
// Why not the boundary's onError? React calls the root onCaughtError (our
// single reporter) BEFORE the boundary's componentDidCatch/onError, so a tag
// set there arrives too late. The fallback renders before both, so the
// boundary tags the error while rendering its fallback.
//
// WeakMap: entries are dropped automatically once the error is garbage
// collected, and setting the same key twice (StrictMode double render) is harmless.
const sections = new WeakMap<object, string>();

export const tagErrorSection = (error: unknown, section: string) => {
  if (typeof error === "object" && error !== null) sections.set(error, section);
};

export const getErrorSection = (error: unknown): string | undefined =>
  typeof error === "object" && error !== null ? sections.get(error) : undefined;
