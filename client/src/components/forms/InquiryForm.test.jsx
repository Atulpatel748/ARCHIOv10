import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { inquiryService } from '../../services/inquiry.service.js';
import { renderWithProviders } from '../../test/render.jsx';
import InquiryForm from './InquiryForm.jsx';

vi.mock('../../services/inquiry.service.js', () => ({ inquiryService: { create: vi.fn() } }));

const MESSAGE = 'We would like to renovate a two bedroom apartment, including the kitchen and both bathrooms.';

async function fillStepOne(user) {
  await user.type(screen.getByLabelText(/full name/i), 'Ada Lovelace');
  await user.type(screen.getByLabelText(/^email/i), 'ada@example.com');
}

async function fillStepTwo(user) {
  await user.selectOptions(screen.getByLabelText(/what do you need/i), 'residential');
  await user.selectOptions(screen.getByLabelText(/property type/i), 'apartment');
  await user.selectOptions(screen.getByLabelText(/budget range/i), '100k_250k');
  await user.selectOptions(screen.getByLabelText(/when would you like/i), '1_3_months');
}

async function reachLastStep(user) {
  await fillStepOne(user);
  await user.click(screen.getByRole('button', { name: /next/i }));
  await fillStepTwo(user);
  await user.click(screen.getByRole('button', { name: /next/i }));
}

describe('InquiryForm', () => {
  it('blocks the first step with accessible errors until it is valid', async () => {
    const user = userEvent.setup();
    renderWithProviders(<InquiryForm />);
    await user.click(screen.getByRole('button', { name: /next/i }));
    const name = screen.getByLabelText(/full name/i);
    expect(name).toHaveAttribute('aria-invalid', 'true');
    expect(name).toHaveAccessibleDescription(/enter your name/i);
    expect(screen.getByLabelText(/^email/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.queryByLabelText(/what do you need/i)).not.toBeInTheDocument();

    await fillStepOne(user);
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.getByLabelText(/what do you need/i)).toBeInTheDocument();
    expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('Your space');
  });

  it('sends a cleaned payload once, then thanks the visitor', async () => {
    const user = userEvent.setup();
    let resolve;
    inquiryService.create.mockReturnValue(new Promise((done) => { resolve = done; }));
    renderWithProviders(<InquiryForm />);
    expect(screen.getByLabelText(/full name/i)).toHaveValue('');

    await fillStepOne(user);
    await user.click(screen.getByRole('button', { name: /next/i }));
    await fillStepTwo(user);
    await user.type(screen.getByLabelText(/approximate area/i), '84');
    await user.click(screen.getByRole('button', { name: /next/i }));
    await user.type(screen.getByLabelText(/tell us about your space/i), MESSAGE);
    await user.click(screen.getByLabelText(/privacy notice/i));

    const send = screen.getByRole('button', { name: /send me a quote/i });
    await user.dblClick(send);
    expect(inquiryService.create).toHaveBeenCalledTimes(1);
    expect(inquiryService.create).toHaveBeenCalledWith(expect.objectContaining({
      name: 'Ada Lovelace', email: 'ada@example.com', projectType: 'residential', areaSqm: 84, consent: true, message: MESSAGE,
    }));
    resolve({ ok: true });
    expect(await screen.findByText(/thank you/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /browse projects/i })).toHaveAttribute('href', '/projects');
    expect(screen.queryByRole('link', { name: /track your inquiries/i })).not.toBeInTheDocument();
  });

  it('requires consent and a meaningful message before sending', async () => {
    const user = userEvent.setup();
    renderWithProviders(<InquiryForm />);
    await reachLastStep(user);
    await user.click(screen.getByRole('button', { name: /send me a quote/i }));
    expect(screen.getByLabelText(/tell us about your space/i)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-invalid', 'true');
    expect(inquiryService.create).not.toHaveBeenCalled();
  });

  it('shows a failure message and keeps the entered data when the server is unreachable', async () => {
    const user = userEvent.setup();
    inquiryService.create.mockResolvedValue({ ok: false, message: 'We could not reach the server.' });
    renderWithProviders(<InquiryForm />);
    await reachLastStep(user);
    await user.type(screen.getByLabelText(/tell us about your space/i), MESSAGE);
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /send me a quote/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
    expect(screen.getByLabelText(/tell us about your space/i)).toHaveValue(MESSAGE);
    expect(screen.getByRole('button', { name: /send me a quote/i })).toBeEnabled();
  });

  it('shows the generic message, and keeps the entered data, when sending fails in a way nobody expected', async () => {
    const user = userEvent.setup();
    inquiryService.create.mockRejectedValue(new Error('boom'));
    renderWithProviders(<InquiryForm />);
    await reachLastStep(user);
    await user.type(screen.getByLabelText(/tell us about your space/i), MESSAGE);
    await user.click(screen.getByRole('checkbox'));
    await user.click(screen.getByRole('button', { name: /send me a quote/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Something went wrong. Please try again.');
    expect(screen.getByLabelText(/tell us about your space/i)).toHaveValue(MESSAGE);
    expect(screen.getByRole('button', { name: /send me a quote/i })).toBeEnabled();
  });
});
