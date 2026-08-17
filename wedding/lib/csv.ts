/** Characters Excel and Sheets treat as the start of a formula. */
const FORMULA_PREFIXES = ["=", "+", "-", "@", "\t", "\r"];

/**
 * Quote a single field.
 *
 * Guest-supplied text lands in a file people open in Excel, so a leading `=`
 * (or `+`, `-`, `@`) is prefixed with an apostrophe to keep it inert text
 * rather than a formula.
 */
const escapeField = (value: string) => {
  const safe = FORMULA_PREFIXES.some((prefix) => value.startsWith(prefix)) ? `'${value}` : value;
  return /[",\r\n]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

/** Serialize rows to RFC 4180 CSV (CRLF line endings). */
export const toCsv = (headers: readonly string[], rows: readonly (readonly string[])[]) =>
  [headers, ...rows].map((row) => row.map(escapeField).join(",")).join("\r\n");

/**
 * Excel assumes the system codepage unless a file starts with a byte-order
 * mark, which mangles accented names. Every CSV we hand out gets one.
 */
export const withBom = (csv: string) => `\uFEFF${csv}`;
