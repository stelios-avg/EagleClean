export const EMAIL_RE = /^\S+@\S+\.\S+$/;
export const PHONE_RE = /^[+\d][\d\s-]{6,}$/;

export type ContactDetails = {
  email: string;
  phone: string;
  address: string;
};

/**
 * Returns a normalized contact object when every field is present and
 * valid, otherwise null — used to decide whether the booking flow can
 * skip the contact-details step for returning customers.
 */
export function completeContactFrom(
  email: string | null | undefined,
  phone: string | null | undefined,
  address: string | null | undefined
): ContactDetails | null {
  const e = (email ?? '').trim();
  const p = (phone ?? '').trim();
  const a = (address ?? '').trim();

  if (EMAIL_RE.test(e) && PHONE_RE.test(p) && a.length >= 5) {
    return { email: e, phone: p, address: a };
  }
  return null;
}
