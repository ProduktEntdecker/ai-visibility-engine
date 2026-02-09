# Technical Specification: AI Visibility Engine MVP

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    CLI Interface                      │
│              node src/index.js scan                   │
│              --domain example.com                     │
│              --industry "manufacturing"               │
│              --competitors "a.com,b.com"              │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Scanner Engine                           │
│                                                       │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │ AI Engine   │  │ Schema       │  │ Technical  │ │
│  │ Prober      │  │ Auditor      │  │ Auditor    │ │
│  └──────┬──────┘  └──────┬───────┘  └─────┬──────┘ │
│         │                │                  │        │
│    Playwright       Cheerio/Fetch      Lighthouse    │
│    + API calls      + JSON-LD parse    + Fetch       │
└─────────┬────────────────┬──────────────────┬───────┘
          │                │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────┐
│              Results Aggregator                       │
│  • AI Visibility Score (0-100)                       │
│  • Schema Health Score (0-100)                       │
│  • Technical Score (0-100)                           │
│  • Competitor Matrix                                 │
│  • Recommendations                                   │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│              Report Generator                        │
│  • HTML Report (chilli mind branded)                │
│  • JSON Data Export                                  │
│  • PDF (via Puppeteer print)                        │
└─────────────────────────────────────────────────────┘
```

## Component Details

### 1. AI Engine Prober (`src/scanner/ai-prober.js`)

Queries AI search engines with industry-relevant prompts and checks for brand mentions.

**Input:**
- `domain` - Target domain
- `brand` - Brand name to search for
- `industry` - Industry category
- `competitors` - Array of competitor domains/brands
- `prompts` - Array of industry-specific questions

**Process:**
1. Generate 50 industry-relevant prompts (via Claude/templates)
2. For each prompt, query:
   - Perplexity API (structured, reliable)
   - Google Search (via SERP API for AI Overviews detection)
   - Simulated ChatGPT/Gemini queries (template-based for MVP)
3. Parse responses for brand/domain mentions
4. Calculate mention frequency, position, sentiment

**Output:**
```json
{
  "aiVisibilityScore": 23,
  "engineBreakdown": {
    "perplexity": { "mentions": 3, "totalQueries": 50, "score": 6 },
    "googleAIO": { "mentions": 8, "totalQueries": 50, "score": 16 },
    "chatgpt": { "mentions": 5, "totalQueries": 50, "score": 10 },
    "gemini": { "mentions": 2, "totalQueries": 50, "score": 4 }
  },
  "competitorComparison": [...],
  "topMissingQueries": [...],
  "citationContext": [...]
}
```

### 2. Schema Auditor (`src/scanner/schema-auditor.js`)

Crawls the target domain and analyzes JSON-LD structured data.

**Process:**
1. Fetch homepage + up to 20 key pages (sitemap.xml or crawl)
2. Extract all `<script type="application/ld+json">` blocks
3. Validate against schema.org
4. Check for required types: Organization, WebSite, Article, Product, FAQ, LocalBusiness, BreadcrumbList
5. Verify sameAs links (Wikipedia, social profiles)
6. Check for Knowledge Panel indicators

**Output:**
```json
{
  "schemaScore": 35,
  "pagesScanned": 20,
  "schemasFound": [
    { "type": "Organization", "valid": true, "completeness": 60 }
  ],
  "missingSchemas": ["FAQ", "Product", "BreadcrumbList"],
  "recommendations": [...]
}
```

### 3. Technical Auditor (`src/scanner/technical-auditor.js`)

Checks technical AI-readiness signals.

**Checks:**
- robots.txt allows AI crawlers (GPTBot, Google-Extended, etc.)
- sitemap.xml exists and is valid
- Page load speed (basic fetch timing)
- Heading hierarchy (H1-H6 structure)
- Meta descriptions present
- Open Graph / social meta tags
- Canonical URLs
- HTTPS enabled

**Output:**
```json
{
  "technicalScore": 72,
  "checks": {
    "robotsTxt": { "status": "warning", "detail": "GPTBot blocked" },
    "sitemap": { "status": "pass", "pages": 150 },
    "https": { "status": "pass" },
    "headings": { "status": "fail", "detail": "Multiple H1 on 5 pages" }
  }
}
```

### 4. Report Generator (`src/report/generator.js`)

Generates branded HTML report from scan results.

**Branding (chilli mind):**
- Primary: `#E82A34`
- Accent: `#FF3000`
- Background: `#F9E6E9`, `#F3F2EC`
- Font: System sans-serif (fallback for SuisseWorksSans)
- Logo: chilli mind signet

**Report Sections:**
1. Executive Summary (AI Visibility Score, key findings)
2. AI Engine Breakdown (per-engine analysis)
3. Competitor Benchmark Matrix
4. Schema Audit Results
5. Technical Audit Results
6. Top 20 Missing AI Questions
7. Recommendations & Action Plan
8. Pricing / Next Steps

### 5. Pitch Deck (`src/pitch/deck.html`)

Single-page HTML presentation (reveal.js style) for Oliver/Philipp meeting.

**Slides:**
1. Title: "AI Visibility Engine"
2. The Problem: "55% of Google = AI. Your clients are invisible."
3. The Solution: What we offer
4. Live Demo: Show scan results
5. The Offer: €20k/year breakdown
6. Unit Economics: Why this works for chilli mind
7. Revenue Split: Proposed partnership model
8. Next Steps: Pilot client, timeline

### 6. Sales Email (`src/pitch/email.html`)

HTML email template for chilli mind to send to clients.

## File Structure

```
ai-visibility-engine/
├── PRD.md
├── spec.md
├── package.json
├── src/
│   ├── index.js                    # CLI entry point
│   ├── scanner/
│   │   ├── ai-prober.js            # AI engine querying
│   │   ├── schema-auditor.js       # JSON-LD analysis
│   │   ├── technical-auditor.js    # Technical checks
│   │   └── prompt-templates.js     # Industry prompt generation
│   ├── report/
│   │   ├── generator.js            # HTML report builder
│   │   └── template.html           # Report HTML template
│   └── pitch/
│       ├── deck.html               # Pitch presentation
│       └── email.html              # Sales email template
├── data/
│   └── sample/                     # Sample scan results
├── public/
│   └── assets/                     # Images, logos
├── scripts/
│   ├── scan.sh                     # Quick scan wrapper
│   └── demo.sh                     # Demo runner
└── tests/
    └── scanner.test.js
```

## CLI Interface

```bash
# Full scan
node src/index.js scan \
  --domain chilli-mind.com \
  --brand "chilli mind" \
  --industry "digital consultancy" \
  --competitors "ustwo.com,frog.com,ideo.com"

# Quick scan (schema + technical only, no AI probing)
node src/index.js quick-scan --domain example.com

# Generate report from existing data
node src/index.js report --input data/sample/scan-result.json

# Generate pitch deck
node src/index.js pitch --company "ACME GmbH" --industry "manufacturing"
```

## MVP Constraints

- **No live ChatGPT scraping** in MVP (use simulated results + Perplexity API where available)
- **No Supabase persistence** in MVP (JSON files)
- **No N8N workflows** in MVP (manual execution)
- **Max 20 pages** crawled per domain
- **50 prompts** per AI engine probe
- **Schema validation** is structural, not semantic

## Security

- No API keys in code (use environment variables)
- SERP API key from 1Password: `op://Development Keys/SERPAPI_KEY`
- No client data stored in git
