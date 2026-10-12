import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError, api } from './api.js';

const reply = (status, body = null) => ({ ok: status < 400, status, json: async () => body });
const ok = (data) => reply(200, { success: true, data });
const fail = (status, code, message = 'Nope.', details) => reply(status, { success: false, error: { code, message, details } });

let fetchMock;

beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.useRealTimers());

describe('api client', () => {
  it('posts JSON in a single request, with no cookies, tokens or extra round trips', async () => {
    fetchMock.mockResolvedValueOnce(ok({ received: true }));
    const payload = await api.post('/inquiries', { a: 1 });
    expect(payload.data).toEqual({ received: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('/api/v1/inquiries');
    expect(init).toMatchObject({ method: 'POST', body: '{"a":1}' });
    expect(init.headers).toMatchObject({ Accept: 'application/json', 'Content-Type': 'application/json' });
    expect(init).not.toHaveProperty('credentials');
    expect(init.headers).not.toHaveProperty('X-CSRF-Token');
  });

  it('maps API error envelopes to ApiError with details', async () => {
    fetchMock.mockResolvedValueOnce(fail(422, 'VALIDATION_ERROR', 'Fix it.', [{ field: 'email', message: 'Bad' }]));
    const error = await api.post('/inquiries', {}).catch((e) => e);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 422, code: 'VALIDATION_ERROR', message: 'Fix it.', details: [{ field: 'email', message: 'Bad' }] });
  });

  it('falls back to a generic message when the error body is not the usual envelope', async () => {
    fetchMock.mockResolvedValueOnce({ ok: false, status: 502, json: async () => { throw new SyntaxError('not json'); } });
    await expect(api.post('/inquiries', {})).rejects.toMatchObject({ status: 502, code: 'HTTP_ERROR', message: 'Something went wrong. Please try again.' });
  });

  it('turns transport failures into friendly errors', async () => {
    fetchMock.mockRejectedValueOnce(new TypeError('Failed to fetch'));
    await expect(api.post('/inquiries', {})).rejects.toMatchObject({ code: 'NETWORK_ERROR' });
  });

  it('times out slow requests', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason));
    }));
    const outcome = expect(api.post('/inquiries', {})).rejects.toMatchObject({ code: 'TIMEOUT' });
    await vi.advanceTimersByTimeAsync(15_100);
    await outcome;
  });

  it('lets callers abort without reporting a network error', async () => {
    fetchMock.mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason));
    }));
    const controller = new AbortController();
    const pending = api.post('/inquiries', {}, { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});
