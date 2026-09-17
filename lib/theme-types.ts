/** Split from lib/theme.ts so server modules can reference the type without
 *  pulling in a "use client" module. */
export type Theme = "light" | "dark" | "system";
