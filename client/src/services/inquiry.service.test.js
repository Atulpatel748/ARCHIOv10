import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

  it('sends nothing when the honeypot is filled', async () => {
    await inquiryService.create({ ...INQUIRY, website: 'spam.example' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
