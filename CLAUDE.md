# AgentQuote — AI Agent Cost Estimator

## What This Is
A web app that estimates how much AI agent systems cost to run. Built as a Week 1 capstone for a 30-day AI mastery curriculum. Every cost formula is based on real experimental data from Days 1-5 of hands-on agent building.

## Architecture
See `agentquote-v1-architecture.md` for the complete design doc.

### Layers (every file does ONE thing)
```
lib/                    ← ENGINE (business logic)
  knowledge-base.ts     ← DATA: pricing, patterns, constants from experiments
  parser.ts             ← Claude parses description → structured JSON (1 API call)
  calculator.ts         ← Deterministic cost math (0 API calls, FREE)
  recommender.ts        ← Claude generates optimizations (1 API call)
  csv-analyzer.ts       ← Parse usage CSVs, compare estimate vs actual

app/api/                ← API ROUTES (thin wrappers, each does one thing)
  parse/route.ts        ← POST: calls parser.ts
  calculate/route.ts    ← POST: calls calculator.ts (free)
  recommend/route.ts    ← POST: calls recommender.ts
  subscribe/route.ts    ← POST: saves email + estimate
  feedback/route.ts     ← POST: saves feedback text
  usage/route.ts        ← GET/POST: tracks remaining analyses
  analyze-csv/route.ts  ← POST: calls csv-analyzer.ts (free)

app/                    ← PAGES
  page.tsx              ← Landing page
  estimate/page.tsx     ← Multi-step flow: input → review → results

components/             ← UI (each does one thing)
  input/                ← Text input, guided form, smart prompt
  review/               ← Assumption review with editable cards
  results/              ← Cost table, recommendations, CSV upload
  shared/               ← Email capture, feedback box, usage counter
```

### Key Rule
Every file does one thing, every function has one job. Keep logic, business, UI, and data layers distinct. You should be able to trace any action from UI to API to calculation and back.

## Tech Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Anthropic API (claude-haiku-4-5 for parse + recommend)

## API Budget
- $5 total ≈ 830 analyses
- Each analysis = 2 API calls (parse + recommend) ≈ $0.006
- Calculate and CSV analysis are FREE (pure math)

## How the Engine Works
1. **Parse** — User describes system → Claude extracts structured JSON (agents, pattern, memory, volume)
2. **Calculate** — Deterministic math using experimental data → low/mid/high cost scenarios
3. **Recommend** — Claude analyzes structure + costs → ranked optimization suggestions

## Experimental Data Sources
- Day 1: Token economics, model pricing, multi-turn cost growth
- Day 2: Tool call overhead (2 API calls per tool use, 500 tokens per definition)
- Day 3: Pattern cost spectrum, failure rates, fuzzy loop detection (49% savings)
- Day 4: Multi-agent context duplication (4.8x overhead measured)
- Day 5: Memory strategies (entity saves 55% tokens vs buffer)

## Known Issues / TODO
- [x] Architecture diagram — replaced with CSS flow diagram
- [x] Recommendations — card-based accordion with parsed pills
- [x] Usage counter — refreshes via refreshKey prop
- [ ] Deploy to Vercel

## Commands
```bash
npm run dev    # local development on :3000
npm run build  # production build
npm start      # production server
```

## Environment
```
ANTHROPIC_API_KEY=your-key-here  # in .env.local
```