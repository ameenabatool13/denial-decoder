// Trust feature: a quote only counts if it really appears in the pasted letter.
const norm = (s) => s.toLowerCase().replace(/[\u2018\u2019]/g, "'").replace(/[\u201c\u201d]/g, '"').replace(/\s+/g, ' ').trim();

export const verifyQuote = (source, quote) => typeof quote === 'string' && quote.trim() !== '' && norm(source).includes(norm(quote));

export function annotate(analysis, source) {
  const mark = (f) => (f ? { ...f, verified: verifyQuote(source, f.quote) } : null);
  return {
    ...analysis,
    denialReason: mark(analysis.denialReason),
    amount: mark(analysis.amount),
    sender: mark(analysis.sender),
    deadline: mark(analysis.deadline),
    documentsRequested: analysis.documentsRequested.map(mark),
  };
}
