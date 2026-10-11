# Deployment checklist

Fill this in and sign off before submitting. Replace `[ ]` with `[x]`.

## Before deploy
- [ ] `npm test` passes; `npm run build` succeeds
- [ ] `.env` is NOT committed (`git status` shows no secrets)
- [ ] `GEMINI_API_KEY` added in Vercel: Project Settings, Environment Variables (Production)
- [ ] Spend limit set on the Google AI Studio key

## After deploy (on the live URL)
- [ ] Paste a real-looking letter: summary, facts, and checklist appear
- [ ] Empty input, 8001+ characters, and non-letter text each show a clear error
- [ ] Temporarily break the key: user sees the "not set up" message, not a crash
- [ ] Keyboard only: tab through form, results and checklist; focus is visible
- [ ] Lighthouse mobile score 90+ (Performance, Accessibility, Best Practices)
- [ ] axe DevTools or WAVE: zero violations (screenshot saved)
- [ ] Vercel function logs show structured errors (`event` field)

## Failure and rollback
- Fails safely: errors are shown in the UI and the pasted text is kept.
- Monitoring: Vercel function logs and Google AI Studio usage page.
- Rollback: promote previous deployment in Vercel, or revert and redeploy from `main`.

Signed off by: __________  Date: __________
