import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from './api.js';
import { inquiryService } from './inquiry.service.js';

const INQUIRY = {
  name: 'Ada', email: 'ada@example.com', projectType: 'residential', propertyType: 'apartment', areaSqm: 84,
  budgetRange: '100k_250k', timeline: '1_3_months', message: 'A two bedroom renovation.', consent: true, website: '',
};

let fetchMock;
beforeEach(() => {
  vi.stubEnv('WEB3FORMS_ACCESS_KEY', 'test-key');
  fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: true }) });
  vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('inquiryService', () => {
  it('posts readable fields to Web3Forms, without the consent flag or the honeypot', async () => {
    await inquiryService.create(INQUIRY);
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe('https://api.web3forms.com/submit');
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

  it('says the form is unavailable, and sends nothing, when the build has no real key', async () => {
    for (const key of ['', 'YOUR_WEB3FORMS_ACCESS_KEY']) {
      vi.stubEnv('WEB3FORMS_ACCESS_KEY', key);
      await expect(inquiryService.create(INQUIRY)).rejects.toMatchObject({ code: 'NOT_CONFIGURED', message: expect.stringContaining('@') });
    }
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('treats a refusal from Web3Forms as a failure', async () => {
    fetchMock.mockResolvedValue({ ok: true, status: 200, json: async () => ({ success: false, message: 'Invalid key' }) });
    await expect(inquiryService.create(INQUIRY)).rejects.toBeInstanceOf(ApiError);
  });

  it('sends nothing when the honeypot is filled', async () => {
    await inquiryService.create({ ...INQUIRY, website: 'spam.example' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
