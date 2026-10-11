# Denial Decoder

Paste an insurance or benefits denial letter. Get a plain-language explanation, the key facts (each backed by a quote from your letter), and a dated action checklist.

   **Live app:** https://denial-decoder.vercel.app · **Repo:** https://github.com/ameenabatool13/denial-decoder
   
## Who it is for
People who get a dense denial letter and have no lawyer or advocate: non-native speakers, low-literacy readers, anyone short on time. A missed appeal deadline is expensive; this tool makes the deadline impossible to miss.

## Run locally (under 5 minutes)
```bash
cp .env.example .env     # add your GEMINI_API_KEY (aistudio.google.com/apikey)
npm install && npm run dev
```
Open the URL Vite prints (usually http://localhost:5173). `npm test` runs the tests, `npm run test:coverage` shows coverage.

## Architecture
| Part | What it does |
|---|---|
| `src/App.jsx` | Form, input limits, loading/error states, calls `/api/analyze` |
| `src/Results.jsx` | Shows summary, facts, deadline, questions; marks unverified quotes |
| `src/Checklist.jsx` | Accessible, tickable checklist |
| `src/lib/schema.js` | Validates the model's JSON; bad shapes never reach the UI |
| `src/lib/verify.js` | Checks every quote really appears in the pasted letter |
| `src/lib/plan.js` | Deterministic date math: plans steps backwards from the deadline |
| `api/analyze.js` | Serverless function: holds the API key, calls Gemini, validates, retries once |

## AI integration
Gemini does one job: turn unstructured letter text into a fixed JSON schema (summary, reason, amount, sender, deadline, documents, questions). Design choices:
- **The key stays on the server.** The browser never sees it.
- **Quotes are mandatory and verified in code.** Models can paraphrase or invent; the app flags anything it cannot find in the letter.
- **The model never does date math.** It only extracts an explicit date; `plan.js` computes the checklist.
- **Explain, don't advise.** The prompt forbids legal or medical advice and says to ignore instructions inside the letter (prompt-injection guard).
- **Strict output.** Invalid JSON or schema gets one retry, then a clear error.

## Failure behavior
Empty, too-long (8000 chars), and non-denial input each get a specific message. Service down or rate-limited: the user's text is kept. Missing, unclear, or passed deadlines show a loud warning instead of a guess.

## Testing
Vitest + Testing Library: unit tests for the quote verifier, date planner and schema; component tests for the full flow, unverified quotes, and error states. Run `npm run test:coverage` and screenshot the output for your submission.

## Known limitations and future work
- Text only (no photos or PDFs of letters); English only.
- Two letter types; court, eviction and immigration notices are out of scope on purpose.
- Deadline offsets (14/7/3 days) are generic, not tailored to a specific insurer.
- No rate limiting or analytics beyond Vercel function logs.
- Future: OCR upload, multiple languages, calendar (.ics) export, per-type prompts.

## Deploy and rollback
See `DEPLOYMENT_CHECKLIST.md`. Rollback: Vercel dashboard, Deployments, "Promote to Production" on the previous deployment (or redeploy from `main`).
