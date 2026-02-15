import { generatePrompts } from './prompt-templates.js';
import { auditSchema } from './schema-auditor.js';
import { auditTechnical } from './technical-auditor.js';

/**
 * AI Engine Prober - MVP version.
 *
 * For the MVP, we use:
 * 1. SERP API for Google AI Overviews detection
 * 2. Simulated scoring for ChatGPT/Perplexity/Gemini based on heuristics
 *
 * Post-MVP will add live Playwright scraping of AI engines.
 */

const SERP_API_KEY = process.env.SERPAPI_KEY || '';

async function querySerpApi(query) {
  if (!SERP_API_KEY) return null;

  try {
    const params = new URLSearchParams({
      q: query,
      engine: 'google',
      api_key: SERP_API_KEY,
      gl: 'de',
      hl: 'de',
    });

    const res = await fetch(`https://serpapi.com/search.json?${params}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function checkMentionInSerpResult(serpResult, brand, domain) {
  if (!serpResult) return { mentioned: false, inAIOverview: false, position: null };

  const result = { mentioned: false, inAIOverview: false, position: null, context: '' };

  // Check AI Overview (if present)
  if (serpResult.ai_overview) {
    const aiText = JSON.stringify(serpResult.ai_overview).toLowerCase();
    if (aiText.includes(brand.toLowerCase()) || aiText.includes(domain.toLowerCase())) {
      result.mentioned = true;
      result.inAIOverview = true;
      result.context = 'Found in Google AI Overview';
    }
  }

  // Check organic results
  if (serpResult.organic_results) {
    for (let i = 0; i < serpResult.organic_results.length; i++) {
      const item = serpResult.organic_results[i];
      const text = `${item.title || ''} ${item.snippet || ''} ${item.link || ''}`.toLowerCase();
      if (text.includes(brand.toLowerCase()) || text.includes(domain.toLowerCase())) {
        if (!result.mentioned) {
          result.mentioned = true;
          result.position = i + 1;
          result.context = `Organic position #${i + 1}`;
        }
        break;
      }
    }
  }

  return result;
}

/**
 * Heuristic-based AI visibility estimation (MVP).
 *
 * Methodology:
 * - Base score derived from schema markup quality (30% weight) and
 *   technical AI-readiness (20% weight), normalized to 0-1 range.
 * - Small bonuses for common TLDs (+0.05) and distinctive brand names (+0.03).
 * - Hard cap at 0.6 (60%) to reflect inherent uncertainty of heuristic estimation.
 *
 * Limitations:
 * - Does NOT query ChatGPT, Perplexity, or Gemini directly.
 * - Scores are derived from on-site signals, not actual AI engine responses.
 * - Post-MVP will replace this with live Playwright scraping of each AI engine.
 */
function estimateAIVisibility(domain, brand, schemaScore, technicalScore) {
  // Base score from technical signals
  let baseScore = (schemaScore * 0.3 + technicalScore * 0.2) / 100;

  // Domain age/authority heuristic (simplified)
  const domainParts = domain.split('.');
  const isCommon = ['com', 'de', 'io', 'ai'].includes(domainParts[domainParts.length - 1]);
  if (isCommon) baseScore += 0.05;

  // Brand name quality (longer, more unique names are easier to detect)
  if (brand.length > 3 && !brand.includes(' ')) baseScore += 0.03;

  return Math.min(baseScore, 0.6); // Cap at 60% for heuristic estimation
}

export async function probeAIEngines(domain, brand, industry, competitors = [], schemaScore = 0, technicalScore = 0, onProgress) {
  const prompts = generatePrompts(industry, brand, competitors);

  if (!SERP_API_KEY) {
    onProgress?.('WARNING: No SERPAPI_KEY set — Google SERP data will not be measured.');
  }

  const result = {
    domain,
    brand,
    industry,
    aiVisibilityScore: 0,
    totalPrompts: prompts.length,
    hasSerpApiKey: !!SERP_API_KEY,
    engineBreakdown: {
      google: { mentions: 0, aiOverviewMentions: 0, totalQueries: 0, score: 0, method: SERP_API_KEY ? 'measured' : 'not_measured' },
      chatgpt: { mentions: 0, totalQueries: prompts.length, score: 0, method: 'estimated', methodNote: 'Heuristic estimate based on schema/technical scores, not live AI queries' },
      perplexity: { mentions: 0, totalQueries: prompts.length, score: 0, method: 'estimated', methodNote: 'Heuristic estimate based on schema/technical scores, not live AI queries' },
      gemini: { mentions: 0, totalQueries: prompts.length, score: 0, method: 'estimated', methodNote: 'Heuristic estimate based on schema/technical scores, not live AI queries' },
    },
    competitorComparison: [],
    topMissingQueries: [],
    mentionedQueries: [],
    prompts,
  };

  // Phase 1: Google SERP API (if available, limited to save quota)
  const serpQueries = Math.min(prompts.length, SERP_API_KEY ? 10 : 0);
  result.engineBreakdown.google.totalQueries = serpQueries;

  if (serpQueries > 0) {
    onProgress?.(`Querying Google SERP API (${serpQueries} queries)...`);

    for (let i = 0; i < serpQueries; i++) {
      onProgress?.(`  Google query ${i + 1}/${serpQueries}: "${prompts[i].substring(0, 50)}..."`);
      const serpResult = await querySerpApi(prompts[i]);
      const mention = checkMentionInSerpResult(serpResult, brand, domain);

      if (mention.mentioned) {
        result.engineBreakdown.google.mentions++;
        if (mention.inAIOverview) {
          result.engineBreakdown.google.aiOverviewMentions++;
        }
        result.mentionedQueries.push({
          query: prompts[i],
          engine: 'google',
          context: mention.context,
          position: mention.position,
        });
      } else {
        result.topMissingQueries.push({
          query: prompts[i],
          engine: 'google',
          opportunity: 'Not found in Google results',
        });
      }

      // Rate limit
      await new Promise(resolve => setTimeout(resolve, 1500));
    }

    result.engineBreakdown.google.score = serpQueries > 0
      ? Math.round((result.engineBreakdown.google.mentions / serpQueries) * 100)
      : 0;
  }

  // Phase 2: Heuristic estimation for other engines
  onProgress?.('Estimating AI engine visibility...');
  const visibilityFactor = estimateAIVisibility(domain, brand, schemaScore, technicalScore);

  // Estimate per engine (slightly different factors)
  const chatgptFactor = visibilityFactor * 0.8; // ChatGPT favors well-known entities
  const perplexityFactor = visibilityFactor * 1.1; // Perplexity uses web search, more accessible
  const geminiFactor = visibilityFactor * 0.9; // Gemini uses Google's index

  result.engineBreakdown.chatgpt.mentions = Math.round(prompts.length * chatgptFactor);
  result.engineBreakdown.chatgpt.score = Math.round(chatgptFactor * 100);
  result.engineBreakdown.chatgpt.confidence = 'low';

  result.engineBreakdown.perplexity.mentions = Math.round(prompts.length * perplexityFactor);
  result.engineBreakdown.perplexity.score = Math.round(perplexityFactor * 100);
  result.engineBreakdown.perplexity.confidence = 'low';

  result.engineBreakdown.gemini.mentions = Math.round(prompts.length * geminiFactor);
  result.engineBreakdown.gemini.score = Math.round(geminiFactor * 100);
  result.engineBreakdown.gemini.confidence = 'low';

  // All queries not confirmed as mentioned are listed as missing
  for (const prompt of prompts) {
    if (!result.mentionedQueries.find(m => m.query === prompt) &&
        !result.topMissingQueries.find(m => m.query === prompt)) {
      result.topMissingQueries.push({
        query: prompt,
        engine: 'multiple',
        opportunity: 'Brand not confirmed in AI responses',
      });
    }
  }

  // Limit to top 20 missing
  result.topMissingQueries = result.topMissingQueries.slice(0, 20);

  // Calculate overall AI Visibility Score
  const engines = result.engineBreakdown;
  const googleWeight = 0.35;
  const chatgptWeight = 0.25;
  const perplexityWeight = 0.20;
  const geminiWeight = 0.20;

  result.aiVisibilityScore = Math.round(
    engines.google.score * googleWeight +
    engines.chatgpt.score * chatgptWeight +
    engines.perplexity.score * perplexityWeight +
    engines.gemini.score * geminiWeight
  );

  // Competitor comparison — actually scan each competitor
  for (const comp of competitors) {
    onProgress?.(`Scanning competitor: ${comp}...`);
    try {
      const compSchema = await auditSchema(comp);
      const compTech = await auditTechnical(comp);
      const compVisibility = estimateAIVisibility(comp, comp.split('.')[0], compSchema.schemaScore, compTech.technicalScore);

      const compOverall = Math.round(
        (compSchema.schemaScore * 0.3) +
        (compTech.technicalScore * 0.3) +
        (Math.round(compVisibility * 100) * 0.4)
      );

      const yourOverall = Math.round(
        (schemaScore * 0.3) +
        (technicalScore * 0.3) +
        (result.aiVisibilityScore * 0.4)
      );

      result.competitorComparison.push({
        competitor: comp,
        estimatedScore: compOverall,
        schemaScore: compSchema.schemaScore,
        technicalScore: compTech.technicalScore,
        aiEstimate: Math.round(compVisibility * 100),
        vsYou: yourOverall > compOverall ? 'ahead' : yourOverall === compOverall ? 'tied' : 'behind',
      });
    } catch {
      result.competitorComparison.push({
        competitor: comp,
        estimatedScore: 0,
        schemaScore: 0,
        technicalScore: 0,
        aiEstimate: 0,
        vsYou: 'ahead',
        error: 'Could not scan',
      });
    }
  }

  return result;
}
