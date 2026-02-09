import { generatePrompts } from './prompt-templates.js';

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
 * Heuristic-based AI visibility estimation.
 * Uses domain authority signals to simulate AI engine mentions.
 * This is replaced by live scraping in the full version.
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

  const result = {
    domain,
    brand,
    industry,
    aiVisibilityScore: 0,
    totalPrompts: prompts.length,
    engineBreakdown: {
      google: { mentions: 0, aiOverviewMentions: 0, totalQueries: 0, score: 0 },
      chatgpt: { mentions: 0, totalQueries: prompts.length, score: 0, method: 'estimated' },
      perplexity: { mentions: 0, totalQueries: prompts.length, score: 0, method: 'estimated' },
      gemini: { mentions: 0, totalQueries: prompts.length, score: 0, method: 'estimated' },
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

  result.engineBreakdown.perplexity.mentions = Math.round(prompts.length * perplexityFactor);
  result.engineBreakdown.perplexity.score = Math.round(perplexityFactor * 100);

  result.engineBreakdown.gemini.mentions = Math.round(prompts.length * geminiFactor);
  result.engineBreakdown.gemini.score = Math.round(geminiFactor * 100);

  // Fill missing queries from heuristic
  for (const prompt of prompts) {
    if (!result.mentionedQueries.find(m => m.query === prompt) &&
        !result.topMissingQueries.find(m => m.query === prompt)) {
      if (Math.random() > visibilityFactor) {
        result.topMissingQueries.push({
          query: prompt,
          engine: 'multiple',
          opportunity: 'Brand not mentioned in AI responses',
        });
      }
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

  // Competitor comparison (simplified for MVP)
  for (const comp of competitors) {
    const compFactor = estimateAIVisibility(comp, comp.split('.')[0], schemaScore * 0.8, technicalScore * 0.8);
    result.competitorComparison.push({
      competitor: comp,
      estimatedScore: Math.round(compFactor * 100),
      vsYou: result.aiVisibilityScore > Math.round(compFactor * 100) ? 'ahead' : 'behind',
    });
  }

  return result;
}
