// Shape the model must return. Anything else is rejected before it reaches the UI.
const str = (v) => typeof v === 'string' && v.trim().length > 0;
const fact = (f) => f === null || (f && str(f.text) && str(f.quote));
const ISO = /^\d{4}-\d{2}-\d{2}$/;

export function validateAnalysis(o) {
  if (!o || typeof o !== 'object') return { ok: false, error: 'not_object' };
  if (typeof o.isDenialLetter !== 'boolean') return { ok: false, error: 'isDenialLetter' };
  if (!o.isDenialLetter) return { ok: true, data: { isDenialLetter: false } };
  if (!str(o.summary)) return { ok: false, error: 'summary' };
  for (const k of ['denialReason', 'amount', 'sender', 'deadline']) {
    if (!fact(o[k] ?? null)) return { ok: false, error: k };
  }
  if (o.deadline && o.deadline.isoDate != null && !ISO.test(o.deadline.isoDate)) {
    return { ok: false, error: 'deadline.isoDate' };
  }
  const docs = o.documentsRequested ?? [];
  if (!Array.isArray(docs) || !docs.every(fact)) return { ok: false, error: 'documentsRequested' };
  const qs = o.questions ?? [];
  if (!Array.isArray(qs) || !qs.every(str)) return { ok: false, error: 'questions' };
  return {
    ok: true,
    data: {
      isDenialLetter: true,
      summary: o.summary,
      denialReason: o.denialReason ?? null,
      amount: o.amount ?? null,
      sender: o.sender ?? null,
      deadline: o.deadline ? { ...o.deadline, isoDate: o.deadline.isoDate ?? null } : null,
      documentsRequested: docs,
      questions: qs.slice(0, 6),
    },
  };
}
