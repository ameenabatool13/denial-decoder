import { annotate } from './lib/verify.js';
import { buildChecklist, formatDate } from './lib/plan.js';
import Checklist from './Checklist.jsx';

function Fact({ label, fact }) {
  return (
    <div className="fact">
      <dt>{label}</dt>
      <dd>
        {fact ? fact.text : 'Not stated in the letter.'}
        {fact && (
          <blockquote className={fact.verified ? 'quote' : 'quote unverified'}>
            <span className="quote-label">{fact.verified ? 'Highlighted from your letter' : 'Could not find this wording in your letter, so check it yourself'}</span>
            <mark>&ldquo;{fact.quote}&rdquo;</mark>
          </blockquote>
        )}
      </dd>
    </div>
  );
}

function DeadlineBlock({ deadline, today }) {
  if (!deadline) {
    return <p className="alert" role="alert">No deadline found. Look for one in the letter or call the sender and ask. Do not assume you have unlimited time.</p>;
  }
  if (!deadline.isoDate) {
    return <p className="alert" role="alert">The letter mentions a deadline (&ldquo;{deadline.text}&rdquo;) but not as a clear calendar date. Confirm the exact date with the sender.</p>;
  }
  const plan = buildChecklist(deadline.isoDate, today);
  if (plan.error) return <p className="alert" role="alert">We could not read the deadline date. Check the letter.</p>;
  if (plan.passed) {
    return <p className="alert" role="alert">The deadline in this letter ({deadline.isoDate}) passed {plan.daysLate} day(s) ago. Contact the sender right away to ask whether you can still respond.</p>;
  }
  return (
    <>
      <div className="hero" role="group" aria-label="Deadline">
        <span className="hero-num">{plan.daysLeft === 0 ? 'Today' : plan.daysLeft}</span>
        <p>
          <strong>{plan.daysLeft === 0 ? 'is the deadline' : plan.daysLeft === 1 ? 'day left' : 'days left'}</strong>
          <span>until {formatDate(deadline.isoDate)}. Confirm this date with the sender.</span>
        </p>
      </div>
      {!deadline.verified && <p className="alert" role="alert">We could not verify this deadline against your letter. Double-check it.</p>}
      <Checklist steps={plan.steps} />
    </>
  );
}

export default function Results({ analysis, source, today }) {
  const a = annotate(analysis, source);
  return (
    <section aria-labelledby="results-h" className="results">
      <h2 id="results-h" tabIndex={-1}>What your letter says</h2>
      <p className="summary">{a.summary}</p>

      <h3>Your deadline and checklist</h3>
      <DeadlineBlock deadline={a.deadline} today={today} />

      <h3>Key facts</h3>
      <dl className="facts">
        <Fact label="Why it was denied" fact={a.denialReason} />
        <Fact label="Amount" fact={a.amount} />
        <Fact label="Sent by" fact={a.sender} />
      </dl>

      {a.documentsRequested.length > 0 && (
        <>
          <h3>Documents they ask for</h3>
          <ul className="plain">{a.documentsRequested.map((d, i) => <li key={i}>{d.text}{!d.verified && ' (not verified in your letter)'}</li>)}</ul>
        </>
      )}
      {a.questions.length > 0 && (
        <>
          <h3>Questions to ask</h3>
          <ul className="plain">{a.questions.map((q, i) => <li key={i}>{q}</li>)}</ul>
        </>
      )}
    </section>
  );
}
