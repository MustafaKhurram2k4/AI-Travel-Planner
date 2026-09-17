/**
 * Express 5 exposes route parameters as `string | string[]` in its type
 * definitions. Our routes are single-value parameters, so normalize them at
 * the HTTP boundary before passing them to Prisma.
 */
export function routeParam(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}
