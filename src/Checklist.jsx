import { useState } from 'react';
import { formatDate } from './lib/plan.js';

export default function Checklist({ steps }) {
  const [done, setDone] = useState({});
  return (
    <ul className="timeline" aria-label="Action checklist">
      {steps.map((s) => (
        <li key={s.id} className={s.urgent ? 'urgent' : ''}>
          <label>
            <input type="checkbox" checked={!!done[s.id]} onChange={() => setDone({ ...done, [s.id]: !done[s.id] })} />
            <span className={done[s.id] ? 'done' : ''}>
              <strong className="when">{s.urgent ? 'Today' : formatDate(s.date)}</strong>
              <span className="what">{s.label}</span>
              {s.urgent && <em>The usual lead time has already passed, so start now.</em>}
            </span>
          </label>
        </li>
      ))}
    </ul>
  );
}
