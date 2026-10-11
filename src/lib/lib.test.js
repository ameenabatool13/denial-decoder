import { describe, it, expect } from 'vitest';
import { verifyQuote, annotate } from './verify.js';
import { buildChecklist, addDays } from './plan.js';
import { validateAnalysis } from './schema.js';

const letter = 'We denied your claim.\n  The MRI was “not medically necessary”. You must appeal by 2030-03-15.';

describe('verifyQuote', () => {
  it('matches ignoring case, whitespace and curly quotes', () => {
    expect(verifyQuote(letter, 'the mri was "not medically necessary"')).toBe(true);
  });
  it('rejects invented or empty quotes', () => {
    expect(verifyQuote(letter, 'Your appeal is due in 90 days')).toBe(false);
    expect(verifyQuote(letter, '')).toBe(false);
  });
  it('flags unverified items in annotate', () => {
    const a = annotate({ denialReason: { text: 'x', quote: 'made up' }, amount: null, sender: null, deadline: null, documentsRequested: [] }, letter);
    expect(a.denialReason.verified).toBe(false);
  });
});

describe('buildChecklist', () => {
  it('plans backwards from the deadline', () => {
    const p = buildChecklist('2030-03-15', '2030-01-01');
    expect(p.steps.map((s) => s.date)).toEqual(['2030-03-01', '2030-03-08', '2030-03-12', '2030-03-15']);
    expect(p.daysLeft).toBe(73);
  });
  it('clamps steps to today and marks them urgent when time is short', () => {
    const p = buildChecklist('2030-03-15', '2030-03-10');
    expect(p.steps[0]).toMatchObject({ date: '2030-03-10', urgent: true });
    expect(p.steps[2]).toMatchObject({ date: '2030-03-12', urgent: false });
  });
  it('reports passed deadlines and invalid dates', () => {
    expect(buildChecklist('2030-03-15', '2030-03-20')).toEqual({ passed: true, daysLate: 5 });
    expect(buildChecklist('2030-02-31', '2030-03-01')).toEqual({ error: 'invalid_date' });
  });
  it('handles month boundaries', () => expect(addDays('2030-03-01', -1)).toBe('2030-02-28'));
});

describe('validateAnalysis', () => {
  const good = { isDenialLetter: true, summary: 's', denialReason: { text: 'a', quote: 'b' }, amount: null, sender: null, deadline: { text: 'a', quote: 'b', isoDate: '2030-03-15' }, documentsRequested: [], questions: ['q'] };
  it('accepts a valid analysis', () => expect(validateAnalysis(good).ok).toBe(true));
  it('accepts "not a denial letter"', () => expect(validateAnalysis({ isDenialLetter: false }).data.isDenialLetter).toBe(false));
  it('rejects bad shapes', () => {
    expect(validateAnalysis(null).ok).toBe(false);
    expect(validateAnalysis({ ...good, summary: '' }).ok).toBe(false);
    expect(validateAnalysis({ ...good, deadline: { text: 'a', quote: 'b', isoDate: '03/15/2030' } }).ok).toBe(false);
    expect(validateAnalysis({ ...good, denialReason: { text: 'a' } }).ok).toBe(false);
  });
});
