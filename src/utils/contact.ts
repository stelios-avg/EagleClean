export const EMAIL_RE = /^\S+@\S+\.\S+$/;
export const PHONE_RE = /^[+\d][\d\s-]{6,}$/;

export type ContactDetails = {
  name: string;
  email: string;
  phone: string;
  address: string;
  latitude?: number | null;
  longitude?: number | null;
};

function validEmailOrEmpty(email: string): boolean {
  return email.length === 0 || EMAIL_RE.test(email);
}

/**
 * Returns a normalized contact object when name, phone, and address are
 * present. Email is optional. Used to skip the contact-details step for
 * returning customers.
 */
export function completeContactFrom(
  name: string | null | undefined,
  email: string | null | undefined,
  phone: string | null | undefined,
  address: string | null | undefined,
  latitude?: number | null,
  longitude?: number | null
): ContactDetails | null {
  const n = (name ?? '').trim();
  const e = (email ?? '').trim();
  const p = (phone ?? '').trim();
  const a = (address ?? '').trim();

  if (n.length >= 2 && PHONE_RE.test(p) && a.length >= 5 && validEmailOrEmpty(e)) {
    return { name: n, email: e, phone: p, address: a, latitude, longitude };
  }
  return null;
}
