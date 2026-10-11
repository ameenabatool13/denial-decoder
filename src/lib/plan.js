export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
// Deterministic date math. The model extracts the deadline; this code plans backwards from it.
export const addDays = (iso, n) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
const valid = (iso) => typeof iso === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(iso) && !Number.isNaN(Date.parse(iso)) && addDays(iso, 0) === iso;

const STEPS = [
  ['records', 'Ask the sender for your claim file and the criteria they used', 14],
  ['documents', 'Gather supporting documents (doctor letters, bills, records)', 7],
  ['send', 'Send your response and keep proof that you sent it', 3],
];

export function buildChecklist(deadline, today) {
  if (!valid(deadline) || !valid(today)) return { error: 'invalid_date' };
  const daysLeft = Math.round((Date.parse(deadline) - Date.parse(today)) / 864e5);
  if (daysLeft < 0) return { passed: true, daysLate: -daysLeft };
  const steps = STEPS.map(([id, label, offset]) => {
    const target = addDays(deadline, -offset);
    return { id, label, date: target < today ? today : target, urgent: target < today };
  });
  steps.push({ id: 'deadline', label: 'Deadline stated in your letter', date: deadline, urgent: false });
  return { steps, daysLeft };
}
