import { GENERIC_ERROR_MESSAGE } from '../constants/messages.js';
const BASE = (import.meta.env.VITE_API_URL ?? '/api/v1').replace(/\/$/, ''); // relative paths only; the form uses an absolute URL
const TIMEOUT_MS = 15_000;

export class ApiError extends Error {
  constructor({ status = 0, code = 'UNKNOWN', message = GENERIC_ERROR_MESSAGE, details } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// The site's only request is the contact form; there are no accounts, cookies or tokens to manage.
async function send(method, path, { body, signal } = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new DOMException('Request timed out', 'TimeoutError')), TIMEOUT_MS);
  const forwardAbort = () => controller.abort(signal.reason);
  if (signal?.aborted) forwardAbort();
  signal?.addEventListener('abort', forwardAbort, { once: true });

  try {
    const response = await fetch(/^https:/.test(path) ? path : `${BASE}${path}`, {
      method,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const payload = response.status === 204 ? null : await response.json().catch(() => null);
    if (!response.ok) {
      throw new ApiError({
        status: response.status,
        code: payload?.error?.code ?? 'HTTP_ERROR',
        message: payload?.error?.message ?? GENERIC_ERROR_MESSAGE,
        details: payload?.error?.details,
      });
    }
    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.reason?.name === 'TimeoutError') {
      throw new ApiError({ code: 'TIMEOUT', message: 'The request took too long. Check your connection and try again.' });
    }
    if (error?.name === 'AbortError') throw error;
    throw new ApiError({ code: 'NETWORK_ERROR', message: 'We could not reach the server. Check your connection and try again.' });
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', forwardAbort);
  }
}

export const api = {
  post: (path, body, options) => send('POST', path, { ...options, body }),
};
