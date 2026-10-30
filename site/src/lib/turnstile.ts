// Checks a Cloudflare Turnstile token with Cloudflare's siteverify API. Returns whether the token passed;
// throws when Cloudflare cannot be reached or answers with an error, so the route never lets a request through unchecked.
const SITEVERIFY = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(secret: string, token: string, ip: string): Promise<boolean> {
  const form = new URLSearchParams({ secret, response: token });
  if (ip !== 'unknown') form.set('remoteip', ip);
  const res = await fetch(SITEVERIFY, { method: 'POST', body: form, signal: AbortSignal.timeout(5000) });
  if (!res.ok) throw new Error(`siteverify answered ${res.status}`);
  const result = (await res.json()) as { success?: unknown };
  return result.success === true;
}
