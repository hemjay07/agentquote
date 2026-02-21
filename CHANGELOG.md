# Changelog

All notable fixes and improvements to AgentQuote, documented in reverse chronological order.

---

## 2026-02-21 — Targeted Fix Round (11 fixes)

### Calculator (4 fixes)

**Fix 1 (CRITICAL): Context duplication scoped to multi_agent pattern** (`lib/calculator.ts`)
- Changed `if (agents.length > 1)` to `if (pattern === "multi_agent" && agents.length > 1)`.
- Day 4 experiment measured 1.2x duplication per extra agent specifically in orchestrator-worker systems. Pipeline patterns hand off sequentially — different duplication characteristics. A react_agent with multiple agents listed shouldn't get exponential duplication.

**Fix 2 (CRITICAL): Caching savings can no longer make inputCost negative** (`lib/calculator.ts`)
- Added `Math.max(0, inputCost - cachingSavingsPerConvo)` floor.
- Without this, large system prompts with many tool definitions and high call counts could produce negative input costs — resulting in impossible "your system makes money" estimates.

**Fix 3 (CRITICAL): Unknown pattern/memory keys no longer crash** (`lib/calculator.ts`)
- Added fallbacks: `PATTERN_PROFILES[pattern] || PATTERN_PROFILES["react_agent"]` and `MEMORY_MULTIPLIERS[memory_strategy] || MEMORY_MULTIPLIERS["buffer"]`.
- Claude's parser can return unexpected strings despite prompt constraints. Without fallbacks, accessing `.base_calls_low` on `undefined` throws a runtime crash.

**Fix 4 (CRITICAL): CSV analyzer division by zero guard** (`lib/csv-analyzer.ts`)
- Changed `diffPct = (estimate - actual) / actual * 100` to check `actualMonthly > 0` first.
- CSV with all-zero costs (test data, empty period) produced NaN/Infinity that cascaded to "NaN%" in the UI.

### API Routes (4 fixes)

**Fix 5 (CRITICAL): API request timeouts** (`app/estimate/page.tsx`)
- Parse fetch: 30-second AbortController timeout.
- Calculate + recommend fetches: shared 45-second timeout.
- Abort errors show user-friendly "Request timed out. Please try again."
- Previously, a hung Claude API call left users staring at a spinner forever.

**Fix 6 (MEDIUM): Email validation** (`app/api/subscribe/route.ts`)
- Added regex validation `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` after the existing string check.
- Previously accepted any string as an email.

**Fix 7 (MEDIUM): Payload size limits** (`app/api/parse/route.ts`, `app/api/feedback/route.ts`, `app/api/analyze-csv/route.ts`)
- Parse: max 10,000 characters.
- Feedback: max 5,000 characters.
- CSV: max 500KB.
- Prevents DoS via oversized payloads.

**Fix 8 (MEDIUM): Non-LLM service negative values** (`components/review/assumption-review.tsx`)
- Added `min={0}` to unit_price and daily_volume inputs.
- Added `Math.max(0, ...)` clamping in updateService handler.
- Previously accepted negative prices/volumes → nonsensical cost calculations.

### UI Components (3 fixes)

**Fix 9 (CRITICAL): Array index as React key → stable keys** (`components/input/guided-form.tsx`, `components/review/assumption-review.tsx`)
- Guided form: added `_id: number` field with `useRef` counter. Keys use `agent._id` instead of array index. IDs stripped before submitting ParsedSystem.
- Assumption review: composite key `${agent.name}-${agent.model}-${i}` instead of bare index.
- Previously, removing Agent 1 from a list of [Agent 1, Agent 2] caused React to reuse DOM nodes with stale state.

**Fix 11 (MEDIUM): Savings total restored with $50K sanity cap** (`components/results/recommendation-card.tsx`)
- Re-added `totalSavings` calculation from parsed recommendation savings.
- Shows "Save up to $X/mo" only if total is > 0 and <= $50,000.
- Falls back to "N optimizations found" for unreasonable totals.
- Previously removed entirely after showing "$66K savings on $18K cost" — now capped instead.

**Fix 13 (LOW): Cost driver scoring accounts for API calls** (`components/results/results-dashboard.tsx`)
- Old formula: `modelCost + toolCount * 2` — didn't account for how many API calls each agent makes.
- New formula: `modelCost * estimatedCalls + toolDefOverhead * pricing * estimatedCalls` — weights by actual call volume.
- Imported `API_CALLS_PER_TOOL_USE` and `TOOL_DEF_OVERHEAD_TOKENS` from knowledge-base.
- Cost driver `reason` field now shows model label + tool count for context.

### Skipped

- **Fix 10 (pipe table rendering)**: User confirmed tables look fine as-is.
- **Fix 12 (Python calculator.py)**: No Python file exists in the project.

---

## 2026-02-21 — Guardrail-Aware Failure Overhead

**Calculator: failure cap now depends on guardrails** (`lib/calculator.ts`)
- Previously the failure overhead was capped at 100% unconditionally.
- Problem: if the user's system has no loop detection or retry limits, failures genuinely can compound — the high scenario *should* reflect that risk.
- Now the cap is conditional on `optimizations.loop_detection`:
  - **With loop detection (100% cap):** Guardrails stop runaway loops, so failures can at most double input tokens.
  - **Without loop detection (300% cap):** Reflects the real risk of unguarded tool spirals where failed calls retry with growing context and no circuit breaker.
- This makes the estimator more honest: systems without guardrails see higher worst-case costs, which motivates implementing loop detection.

---

## 2026-02-21 — Audit Fixes & Calculator Accuracy

**Commit:** `17952b7` fix: audit fixes — form validation, calculator accuracy, UX polish

### Critical Fixes

**Guided form submit button logic inverted** (`components/input/guided-form.tsx`)
- `agents.every(a => !a.name)` → `agents.some(a => !a.name)`
- The old condition only disabled the button when *all* agents had no name. Now it correctly disables when *any* agent has no name.

**Calculator: tool definition tokens double-counted** (`lib/calculator.ts`)
- Old code calculated `toolDefTokens` (sum across all agents) then multiplied by `toolAgentCalls` (sum across all agents), creating **quadratic growth** — O(agents² × tools²).
- Fixed: tool def tokens are now calculated **per-agent** inside the agent loop. Each agent's tool definitions only multiply by that agent's own API calls.

**Calculator: failure overhead uncapped** (`lib/calculator.ts`)
- Formula: `expectedFailures × 0.18` (18% context growth per failure).
- In the high scenario with many tools, this could reach **302–540%** token inflation, which was the main cause of the 12.8× spread between low and high estimates ($6.6K vs $84.7K).
- Capped at 100% max (failures can at most double input tokens). Rationale: real systems have retry limits, loop detection, and conversation termination — failures don't compound indefinitely.

### UX Fixes

**Assumption review: no minimum on inputs** (`components/review/assumption-review.tsx`)
- Added `min={1}` to daily conversations and avg turns inputs.
- Added `Math.max(1, ...)` clamping on change handlers so values can't go to 0 or negative.

**Usage counter: blank on load** (`components/shared/usage-counter.tsx`)
- Was returning `null` during fetch, causing layout shift.
- Now shows a pulsing "Loading..." placeholder.

**Email capture / Feedback box** (`components/shared/email-capture.tsx`, `components/shared/feedback-box.tsx`)
- Improved error handling comments for clarity.

---

## 2026-02-21 — Calculator Accuracy, Prompt Consistency, Parser Robustness

**Commit:** `f9f91fd` fix: calculator accuracy, prompt consistency, parser robustness

### Critical Fixes

**Cost driver showing 147%** (`components/results/results-dashboard.tsx`)
- `parseCostDriver()` used regex to extract percentages from Claude's recommendation text, grabbing phrases like "147% more expensive" instead of actual cost shares.
- Replaced with `calculateCostDriver()` — a **deterministic** function that computes each agent's cost share from `MODEL_PRICING` data. No text parsing, no Claude dependency.

**Best/worst case 12.8× spread** (`lib/calculator.ts`)
- Traced through the full calculator pipeline with `node -e` to identify two compounding issues (tool def double-counting + uncapped failure overhead, fixed in subsequent commit).

**Recommendation section broken** (`components/results/recommendation-card.tsx`)
- Parser relied on a single regex `(?=RECOMMENDATION\s+\d+)` that caught summary table lines.
- Rewrote with **3 fallback strategies**: RECOMMENDATION headers → numbered lists → bold headers.
- Strips metadata lines (Estimated savings, Quality impact, Implementation difficulty) from body since they're extracted as pills.
- Added fallback: if all parsing fails, renders raw text in a single card.

**Warning section showing as 1 blob** (`components/results/results-dashboard.tsx`)
- Parser only split on numbered items or `**bold**` markers, but Claude sometimes used emoji prefixes or ALL-CAPS headers.
- Rewrote `parseWarnings()` with **4 splitting strategies**: numbered items → emoji prefixes → bold headers → ALL-CAPS lines.

**Summed savings total was nonsensical** (`components/results/recommendation-card.tsx`)
- Showed "$66,200/mo potential savings" when total estimated cost was $18,219/mo.
- Removed the summed total. Now shows recommendation count instead.

### Prompt Engineering

**Recommender returns inconsistent formats** (`lib/recommender.ts`)
- Completely rewrote the prompt to enforce strict output format:
  - Pipe tables for cost summary (not space-aligned)
  - Numbered list with exact field labels for recommendations
  - Numbered list for warnings
  - System message: "Follow the output format EXACTLY... Do NOT use emojis"
- Increased `max_tokens` to 4096 for complete output.

### Rendering Fixes

**Cost summary showing raw text** (`components/results/results-dashboard.tsx`)
- `renderFormattedText()` now strips emojis, renders ALL-CAPS lines as styled section headers, and renders `**bold**` as section headers.

---

## 2026-02-20 — Full-Width Diagram, Two-Tier Recommendations, Markdown Rendering

**Commit:** `8d507c6` fix: full-width diagram with cost encoding, two-tier recommendations, collapsible warnings, markdown table rendering

### Fixes

**Architecture diagram too small** (`components/results/flow-diagram.tsx`)
- Click-to-expand modal used `max-w-[90vw]` → changed to `w-[90vw]` for true full-width.

**Results page layout overhaul** (`components/results/results-dashboard.tsx`)
- Two-tier recommendation layout (top picks vs additional).
- Collapsible warning section.
- Markdown table rendering support.

---

## 2026-02-20 — Progress Bar Animation

**Commit:** `7405ab8` ux: inline progress bar for parse and calculate steps

### Fixes

**Progress bar not filling** (`components/shared/progress-bar.tsx`)
- `transition-all duration-300` CSS class was fighting with `requestAnimationFrame` updates (every ~16ms). The CSS transition would try to animate to a target while RAF was already setting the next value.
- Removed the transition class entirely. RAF handles all animation smoothly.
- Simplified state machine: removed `phase` state, uses single `visible` boolean.

**Progress bar on wrong step** (`app/estimate/page.tsx`)
- Removed progress bar from parse step (step 1→2 is fast, ~1-2s). Kept it only on calculate step (step 2→3) where the wait is noticeable.

---

## 2026-02-20 — Results Page Redesign

**Commit:** `3473db3` major: results page redesign, SVG diagram, landing page roadmap fix, recommender token increase

- New hero cost card with range bar visualization.
- Pure SVG architecture flow diagram (replaced text-based diagram).
- Card-based recommendation accordion.
- Two-column results layout.
- Landing page roadmap section fixes.
- Recommender `max_tokens` increased for complete output.

---

## 2026-02-19 — Initial Release

**Commit:** `e4d4293` v1

- Full estimation flow: text input → assumption review → cost results.
- Guided form alternative to text input.
- Three-scenario cost estimation (low/mid/high).
- Claude-powered parsing and recommendations.
- CSV upload for actual cost comparison.
- Email waitlist capture and feedback collection.
- Usage tracking (830 analyses budget).
