import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App.jsx';

const LETTER = 'Your claim was denied because the MRI was not medically necessary. Appeal by 2099-12-31.';
const analysis = {
  isDenialLetter: true,
  summary: 'Your insurer refused to pay for your MRI.',
  denialReason: { text: 'They say it was not needed.', quote: 'the MRI was not medically necessary' },
  amount: null,
  sender: null,
  deadline: { text: 'Appeal by 2099-12-31', quote: 'Appeal by 2099-12-31', isoDate: '2099-12-31' },
  documentsRequested: [],
  questions: ['Can I get my claim file?'],
};
const mockFetch = (ok, body) => vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok, json: async () => body }));
const fill = (v) => fireEvent.change(screen.getByLabelText('Letter text'), { target: { value: v } });
const submit = () => fireEvent.click(screen.getByRole('button', { name: /explain my letter/i }));

afterEach(() => vi.unstubAllGlobals());

describe('App', () => {
  it('shows an error for empty input without calling the API', () => {
    const f = vi.fn();
    vi.stubGlobal('fetch', f);
    render(<App />);
    submit();
    expect(screen.getByRole('alert')).toHaveTextContent('Paste the text of your letter first.');
    expect(f).not.toHaveBeenCalled();
  });

  it('shows results and a checklist for a valid letter', async () => {
    mockFetch(true, analysis);
    render(<App />);
    fill(LETTER);
    submit();
    expect(await screen.findByText('What your letter says')).toBeInTheDocument();
    expect(screen.getByText(/refused to pay for your MRI/)).toBeInTheDocument();
    const boxes = screen.getAllByRole('checkbox');
    expect(boxes).toHaveLength(4);
    fireEvent.click(boxes[0]);
    expect(boxes[0]).toBeChecked();
  });

  it('flags quotes that are not in the letter', async () => {
    mockFetch(true, { ...analysis, denialReason: { text: 'x', quote: 'invented sentence' } });
    render(<App />);
    fill(LETTER);
    submit();
    expect(await screen.findByText(/Could not find this wording/)).toBeInTheDocument();
  });

  it('keeps the text and explains when the service is down', async () => {
    mockFetch(false, { error: 'upstream_unavailable' });
    render(<App />);
    fill(LETTER);
    submit();
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/busy or down/));
    expect(screen.getByLabelText('Letter text')).toHaveValue(LETTER);
  });

  it('handles text that is not a denial letter', async () => {
    mockFetch(true, { isDenialLetter: false });
    render(<App />);
    fill('hello world');
    submit();
    expect(await screen.findByRole('alert')).toHaveTextContent(/does not look like a denial letter/);
  });

  it('rejects over-long input', () => {
    render(<App />);
    fill('a'.repeat(8001));
    submit();
    expect(screen.getByRole('alert')).toHaveTextContent(/longer than 8000/);
  });

  it('fills the box with a sample letter', () => {
    render(<App />);
    fireEvent.click(screen.getByRole('button', { name: /use a sample letter/i }));
    expect(screen.getByLabelText('Letter text').value).toMatch(/Blue Harbor Health Plan/);
  });
});
