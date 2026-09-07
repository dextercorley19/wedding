/**
 * Our Venmo account, used for the honeymoon and house funds in the registry
 * section of the home page. Both funds point here — the payment note is what
 * tells the two apart.
 */
export const VENMO_HANDLE = "@dexter-corley";

/** The handle without the leading "@", which is what Venmo's URLs expect. */
const VENMO_USERNAME = VENMO_HANDLE.replace(/^@/, "");

/**
 * Build a Venmo payment link with the note pre-filled.
 *
 * On a phone this hands off to the Venmo app with the payment sheet already
 * open; on desktop it lands on our profile page instead, which is why the
 * registry section also prints the handle as plain text.
 */
export const venmoPaymentUrl = (note: string) =>
  `https://venmo.com/${VENMO_USERNAME}?txn=pay&note=${encodeURIComponent(note)}`;
