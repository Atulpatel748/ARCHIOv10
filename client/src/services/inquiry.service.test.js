import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GENERIC_ERROR_MESSAGE } from '../constants/messages.js';
import { inquiryService } from './inquiry.service.js';

const INQUIRY = {
  name: 'Ada', email: 'ada@example.com', projectType: 'residential', propertyType: 'apartment', areaSqm: 84,
  budgetRange: '100k_250k', timeline: '1_3_months', message: 'A two bedroom renovation.', consent: true, website: '',
};

const reply = (status, body) => ({ ok: status < 400, status, json: async () => { if (body === undefined) throw new SyntaxError('not json'); return body; } });

let fetchMock;
beforeEach(() => {
  vi.stubEnv('WEB3FORMS_ACCESS_KEY', 'test-key');
  fetchMock = vi.fn().mockResolvedValue(reply(200, { success: true }));
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.useRealTimers(); });

describe('inquiryService.create', () => {
  it('posts readable fields to Web3Forms, without the consent flag or the honeypot, in one plain JSON request', async () => {
    expect(await inquiryService.create(INQUIRY)).toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.web3forms.com/submit');
    expect(init).toMatchObject({ method: 'POST' });
    expect(init.headers).toMatchObject({ 'Content-Type': 'application/json' });
    expect(init).not.toHaveProperty('credentials'); // no cookies, no tokens
    const body = JSON.parse(init.body);
    expect(body).toMatchObject({ name: 'Ada', email: 'ada@example.com', property: 'Apartment, 84 sqm', message: 'A two bedroom renovation.' });
    expect(body.access_key).toBe('test-key');
    expect(body).not.toHaveProperty('website');
    expect(body).not.toHaveProperty('consent');
  });

  it('accepts the key under its VITE_ name too, which is how a .env file may have been written', async () => {
    vi.stubEnv('WEB3FORMS_ACCESS_KEY', '');
    vi.stubEnv('VITE_WEB3FORMS_ACCESS_KEY', 'vite-key');
    await inquiryService.create(INQUIRY);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).access_key).toBe('vite-key');
  });

  it('says the form is unavailable, with another way in, and sends nothing, when the build has no real key', async () => {
    for (const key of ['', 'YOUR_WEB3FORMS_ACCESS_KEY']) {
      vi.stubEnv('WEB3FORMS_ACCESS_KEY', key);
      expect(await inquiryService.create(INQUIRY)).toEqual({ ok: false, message: expect.stringContaining('@') });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends nothing, and looks like a success, when the honeypot is filled', async () => {
    expect(await inquiryService.create({ ...INQUIRY, website: 'spam.example' })).toEqual({ ok: true });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats a refusal from Web3Forms (success: false) as a failure', async () => {
    fetchMock.mockResolvedValue(reply(200, { success: false, message: 'Invalid key' }));
    expect(await inquiryService.create(INQUIRY)).toEqual({ ok: false, message: GENERIC_ERROR_MESSAGE });
  });

  it('treats an HTTP error as a failure, whatever the body is', async () => {
    fetchMock.mockResolvedValue(reply(502));
    expect(await inquiryService.create(INQUIRY)).toEqual({ ok: false, message: GENERIC_ERROR_MESSAGE });
    fetchMock.mockResolvedValue(reply(422, { success: false, message: 'Nope' }));
    expect(await inquiryService.create(INQUIRY)).toEqual({ ok: false, message: GENERIC_ERROR_MESSAGE });
  });

  it('succeeds on an OK reply that is not JSON', async () => {
    fetchMock.mockResolvedValue(reply(200));
    expect(await inquiryService.create(INQUIRY)).toEqual({ ok: true });
  });

  it('turns a dead connection into a friendly message instead of rejecting', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'));
    expect(await inquiryService.create(INQUIRY)).toEqual({ ok: false, message: expect.stringMatching(/could not reach the server/i) });
  });

  it('gives up on a slow connection after 15 seconds, with its own message', async () => {
    vi.useFakeTimers();
    fetchMock.mockImplementation((_url, { signal }) => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(signal.reason));
    }));
    const outcome = inquiryService.create(INQUIRY);
    await vi.advanceTimersByTimeAsync(14_900);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(200);
    expect(await outcome).toEqual({ ok: false, message: expect.stringMatching(/took too long/i) });
  });
});
