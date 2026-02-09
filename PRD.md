# Product Requirements Document: AI Visibility Engine

## Product Overview

**Product Name:** AI Visibility Engine
**Partnership:** chilli mind x [Florian Steiner]
**Version:** MVP 1.0
**Date:** 2026-02-10

## Problem Statement

55% of all Google searches now show AI Overviews. ChatGPT has 400M weekly users. Perplexity is the fastest-growing search engine. Yet only 31% of websites have any structured data, and almost none are optimized for AI citation.

**The gap:** Companies invest heavily in traditional SEO but are invisible to the AI engines that increasingly mediate user decisions. There is no accessible, automated, full-service solution for the German Mittelstand.

## Target Audience

- B2B companies in the DACH region (€5-50M revenue)
- Marketing managers and digital leads
- Companies already working with chilli mind (850+ projects since 2001)

## Value Proposition

> "We make your company the #1 recommendation by ChatGPT, Google AI, and Perplexity. €20,000/year flat. Measurable results or money back."

## Core Product: 4 Pillars

### Pillar 1: AI Visibility Audit (Month 1)
- **AI Visibility Score** (0-100) across ChatGPT, Perplexity, Google AI Overviews, Gemini
- **Competitor Benchmark** against 3-5 competitors
- **Schema Markup Audit** of all pages
- **Content Gap Analysis** for AI-relevant questions
- **Technical AI-Readiness Score**

### Pillar 2: AI Visibility Implementation (Month 2-3)
- JSON-LD Schema Markup for all relevant pages
- Entity Optimization (Wikipedia, Wikidata, sameAs)
- FAQ Engine with 50 industry-specific AI-optimized Q&As
- AI Answer Playbook with 10 capture strategies
- Google Knowledge Panel setup

### Pillar 3: Continuous Monitoring (Month 4-12)
- Monthly AI Visibility Score tracking
- Competitor movement alerts
- Schema health checks
- Trend reports with recommendations
- 4x quarterly strategy calls

### Pillar 4: Guarantee
- Measurable improvement in 6 months or next 6 months free

## MVP Scope (for 2026-02-10 Demo)

### Must Have (Demo-Ready)
1. **AI Visibility Scanner** - CLI that takes a domain + industry and produces visibility metrics
2. **HTML Report** - Branded chilli mind report showing scan results
3. **Pitch Deck** - HTML presentation for Oliver/Philipp meeting
4. **Sales Email** - Template for outreach to chilli mind clients

### Nice to Have (Post-Demo)
- Live Playwright scraping of ChatGPT/Perplexity
- Supabase persistence
- N8N monitoring automation
- Vercel-hosted dashboard

## Pricing

| Tier | Price | Includes |
|------|-------|----------|
| Full Service | €20,000/year | All 4 pillars |
| Quick Scan | Free | Lead generation tool |

## Revenue Split (Proposed)

- chilli mind: 25% commission (€5,000/client/year) for intro + branding
- Delivery: 75% (€15,000/client/year)

## Success Metrics

- AI Visibility Score improvement of 30%+ within 6 months
- Client acquisition: 5 clients within Q1 2026
- Revenue target: €100,000 in first year

## Technical Stack

- Node.js + Playwright (scanner)
- Claude Code + Codex + Gemini (AI analysis)
- Supabase (data persistence)
- Vercel (dashboard hosting)
- N8N (monitoring automation)
- Resend (report delivery)
- Gamma (presentation generation)

## Competitive Landscape

| Competitor | Price | What They Offer | Our Advantage |
|---|---|---|---|
| enhancely.ai | €49-449/mo | Schema markup only | We offer full-service GEO |
| Enterprise GEO agencies | €5-30k/mo | Full service | We're 3-18x cheaper |
| WordLift | ~€59/mo | Schema + Knowledge Graph | We include strategy + monitoring |
| DIY (Yoast/RankMath) | €0-99/yr | Schema plugin | We do everything for them |
