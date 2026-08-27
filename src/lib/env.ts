/**
 * Validated frontend env access — the only place `import.meta.env` should be
 * read directly. Everything else imports `env` from here so a missing or
 * malformed variable fails loudly at startup instead of surfacing as a raw
 * URL typo somewhere deep in a component.
 */
import { z } from "zod";

const schema = z.object({
  VITE_API_URL: z
    .string()
    .trim()
    .min(1, "VITE_API_URL is required")
    .url("VITE_API_URL must be a valid URL"),
});

const parsed = schema.safeParse(import.meta.env);

if (!parsed.success) {
  const issues = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
  throw new Error(`Invalid frontend environment configuration — ${issues}`);
}

export const env = {
  apiUrl: parsed.data.VITE_API_URL,
};
