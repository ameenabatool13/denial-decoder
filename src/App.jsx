import { useState, useRef } from 'react';
import Results from './Results.jsx';

export const MAX_CHARS = 8000;
const SAMPLE = `Blue Harbor Health Plan
Date: October 1, 2026

Dear Ms. Khan,

We have reviewed your claim for an MRI of the lumbar spine performed on September 3, 2026, billed at $1,240.00. Your claim has been denied because the service was not medically necessary under your plan.

If you disagree with this decision, you may file an appeal. Your appeal must be received by December 15, 2026. Please include a letter from your doctor explaining why the MRI was needed, and a copy of the original bill.

You may request a copy of your claim file and the criteria used in this decision by calling Member Services.

Sincerely,
Claims Department`;
const MESSAGES = {
  empty: 'Paste the text of your letter first.',
  too_long: `That is longer than ${MAX_CHARS} characters. Paste only the parts that mention the decision, amounts, and deadlines.`,
  not_denial: 'This does not look like a denial letter. Check that you pasted the right text.',
  upstream_unavailable: 'The analysis service is busy or down. Your text is still here. Try again in a minute.',
  bad_model_output: 'We could not read the analysis result. Your text is still here. Try again.',
  not_configured: 'The service is not set up correctly. Please tell the site owner.',
  network: 'Could not reach the server. Check your connection and try again.',
};

export default function App() {
  const [text, setText] = useState('');
  const [letterType, setLetterType] = useState('health insurance');
  const [state, setState] = useState({ status: 'idle' });
  const topRef = useRef(null);

  async function submit(e) {
    e.preventDefault();
    if (!text.trim()) return setState({ status: 'error', code: 'empty' });
    if (text.length > MAX_CHARS) return setState({ status: 'error', code: 'too_long' });
    setState({ status: 'loading' });
    try {
      const r = await fetch('/api/analyze', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ text, letterType }) });
      const body = await r.json().catch(() => ({}));
      if (!r.ok) return setState({ status: 'error', code: body.error || 'bad_model_output' });
      if (!body.isDenialLetter) return setState({ status: 'error', code: 'not_denial' });
      setState({ status: 'done', analysis: body, source: text });
      setTimeout(() => document.getElementById('results-h')?.focus(), 0);
    } catch {
      setState({ status: 'error', code: 'network' });
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <a className="skip" href="#main">Skip to main content</a>
      <header className="band">
        <div className="band-inner">
          <div className="intro">
            <p className="brand">Denial Decoder</p>
            <h1>Find out what your denial letter says and when you have to act.</h1>
            <p className="lead">Paste the letter. Get a plain-language explanation, the key facts quoted from your letter, and a checklist with real dates.</p>
            <ol className="steps">
              <li><span>1</span>Paste your letter</li>
              <li><span>2</span>Read it in plain words</li>
              <li><span>3</span>Follow your dated checklist</li>
            </ol>
          </div>
          <div className="art" aria-hidden="true">
            <div className="sheet">
              <i /><i className="hl" /><i /><i className="short" /><i className="hl" /><i /><i className="short" />
            </div>
            <div className="chev" />
            <div className="sheet clear">
              <p><b /><em>Dec 1</em></p><p><b /><em>Dec 8</em></p><p><b /><em>Dec 12</em></p><p className="last"><b /><em>Dec 15</em></p>
            </div>
          </div>
        </div>
      </header>
      <main id="main" ref={topRef}>
        <form onSubmit={submit} noValidate className="card">
          <label htmlFor="type">Type of letter</label>
          <select id="type" value={letterType} onChange={(e) => setLetterType(e.target.value)}>
            <option value="health insurance">Health insurance claim denial</option>
            <option value="benefits">Benefits denial</option>
          </select>
          <label htmlFor="letter">Letter text</label>
          <textarea id="letter" rows={10} value={text} onChange={(e) => setText(e.target.value)} aria-describedby="count hint" />
          <p id="hint" className="muted">Nothing you paste is saved. Remove your name or ID numbers if you prefer.</p>
          <p id="count" className={text.length > MAX_CHARS ? 'over' : 'muted'}>{text.length} / {MAX_CHARS} characters</p>
          <div className="actions">
            <button type="submit" disabled={state.status === 'loading'}>
              {state.status === 'loading' && <span className="spinner" aria-hidden="true" />}
              {state.status === 'loading' ? 'Reading your letter...' : 'Explain my letter'}
            </button>
            <button type="button" className="ghost" onClick={() => { setText(SAMPLE); setState({ status: 'idle' }); }}>Use a sample letter</button>
          </div>
        </form>
        <div role="status" aria-live="polite">{state.status === 'loading' && 'Reading your letter. This takes a few seconds.'}</div>
        {state.status === 'error' && <p className="alert" role="alert">{MESSAGES[state.code] || MESSAGES.bad_model_output}</p>}
        {state.status === 'done' && <Results analysis={state.analysis} source={state.source} today={today} />}
        <p className="note">This tool explains what a letter says. It is not legal, medical, or financial advice, and it can make mistakes. Always confirm deadlines with the sender, and ask a professional if the stakes are high.</p>
      </main>
    </>
  );
}
