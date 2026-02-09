import * as cheerio from 'cheerio';

const AI_CRAWLERS = [
  { name: 'GPTBot', agent: 'GPTBot', owner: 'OpenAI (ChatGPT)' },
  { name: 'Google-Extended', agent: 'Google-Extended', owner: 'Google (Gemini/Bard)' },
  { name: 'ChatGPT-User', agent: 'ChatGPT-User', owner: 'OpenAI (ChatGPT Browse)' },
  { name: 'Anthropic', agent: 'anthropic-ai', owner: 'Anthropic (Claude)' },
  { name: 'PerplexityBot', agent: 'PerplexityBot', owner: 'Perplexity AI' },
  { name: 'Bytespider', agent: 'Bytespider', owner: 'ByteDance (TikTok AI)' },
  { name: 'CCBot', agent: 'CCBot', owner: 'Common Crawl (training data)' },
];

async function fetchWithTimeout(url, timeoutMs = 10000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'AIVisibilityEngine/1.0' },
      redirect: 'follow',
    });
    clearTimeout(timeout);
    return res;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

async function checkRobotsTxt(domain) {
  const result = {
    exists: false,
    allowsAICrawlers: {},
    rawContent: '',
    recommendations: [],
  };

  const res = await fetchWithTimeout(`https://${domain}/robots.txt`);
  if (!res || !res.ok) {
    result.recommendations.push({
      priority: 'medium',
      action: 'Create a robots.txt file',
      reason: 'No robots.txt found - AI crawlers may not index your site optimally',
    });
    return result;
  }

  result.exists = true;
  result.rawContent = await res.text();
  const lines = result.rawContent.toLowerCase();

  for (const crawler of AI_CRAWLERS) {
    const agentLower = crawler.agent.toLowerCase();
    const isBlocked = lines.includes(`user-agent: ${agentLower}`) &&
      lines.includes('disallow: /');
    const isExplicitlyAllowed = lines.includes(`user-agent: ${agentLower}`) &&
      lines.includes('allow: /');

    result.allowsAICrawlers[crawler.name] = {
      allowed: !isBlocked,
      explicitlyConfigured: lines.includes(`user-agent: ${agentLower}`),
      owner: crawler.owner,
    };

    if (isBlocked) {
      result.recommendations.push({
        priority: 'high',
        action: `Unblock ${crawler.name} (${crawler.owner}) in robots.txt`,
        reason: `${crawler.owner} cannot crawl your site, making you invisible in their AI answers`,
      });
    }
  }

  return result;
}

async function checkSitemap(domain) {
  const result = { exists: false, pageCount: 0, url: '' };

  for (const path of ['/sitemap.xml', '/sitemap_index.xml', '/sitemap-index.xml']) {
    const res = await fetchWithTimeout(`https://${domain}${path}`);
    if (res && res.ok) {
      result.exists = true;
      result.url = `https://${domain}${path}`;
      const text = await res.text();
      const $ = cheerio.load(text, { xmlMode: true });
      result.pageCount = $('url').length || $('sitemap').length;
      break;
    }
  }

  return result;
}

async function checkPageQuality(domain) {
  const result = {
    https: false,
    loadTimeMs: 0,
    hasMetaDescription: false,
    hasOgTags: false,
    hasCanonical: false,
    headingStructure: { h1Count: 0, h2Count: 0, h3Count: 0, valid: false },
    languageTag: '',
    pageTitle: '',
    pageTitleLength: 0,
  };

  const start = Date.now();
  const res = await fetchWithTimeout(`https://${domain}`);
  result.loadTimeMs = Date.now() - start;
  result.https = true; // If we got here, HTTPS works

  if (!res || !res.ok) return result;

  const html = await res.text();
  const $ = cheerio.load(html);

  result.pageTitle = $('title').first().text().trim();
  result.pageTitleLength = result.pageTitle.length;
  result.hasMetaDescription = $('meta[name="description"]').length > 0;
  result.hasOgTags = $('meta[property="og:title"]').length > 0;
  result.hasCanonical = $('link[rel="canonical"]').length > 0;
  result.languageTag = $('html').attr('lang') || '';

  result.headingStructure.h1Count = $('h1').length;
  result.headingStructure.h2Count = $('h2').length;
  result.headingStructure.h3Count = $('h3').length;
  result.headingStructure.valid = result.headingStructure.h1Count === 1;

  return result;
}

export async function auditTechnical(domain, onProgress) {
  const result = {
    domain,
    technicalScore: 0,
    checks: {},
    recommendations: [],
  };

  let score = 0;
  let maxScore = 0;

  // 1. Robots.txt (20 points)
  onProgress?.('Checking robots.txt...');
  maxScore += 20;
  const robots = await checkRobotsTxt(domain);
  result.checks.robotsTxt = robots;

  if (robots.exists) {
    score += 5;
    const blockedCount = Object.values(robots.allowsAICrawlers)
      .filter(c => !c.allowed).length;
    score += Math.round(15 * (1 - blockedCount / AI_CRAWLERS.length));
  }
  result.recommendations.push(...robots.recommendations);

  // 2. Sitemap (15 points)
  onProgress?.('Checking sitemap...');
  maxScore += 15;
  const sitemap = await checkSitemap(domain);
  result.checks.sitemap = sitemap;

  if (sitemap.exists) {
    score += 10;
    if (sitemap.pageCount > 10) score += 5;
  } else {
    result.recommendations.push({
      priority: 'high',
      action: 'Create and submit a sitemap.xml',
      reason: 'AI engines use sitemaps to discover and index content',
    });
  }

  // 3. Page Quality (65 points)
  onProgress?.('Analyzing page quality...');
  maxScore += 65;
  const page = await checkPageQuality(domain);
  result.checks.pageQuality = page;

  if (page.https) score += 10;
  if (page.loadTimeMs < 3000) score += 10;
  else if (page.loadTimeMs < 5000) score += 5;

  if (page.hasMetaDescription) score += 10;
  else result.recommendations.push({
    priority: 'high',
    action: 'Add meta description to all pages',
    reason: 'Meta descriptions are used by AI engines for content summarization',
  });

  if (page.hasOgTags) score += 5;
  if (page.hasCanonical) score += 5;
  if (page.languageTag) score += 5;

  if (page.headingStructure.valid) score += 10;
  else result.recommendations.push({
    priority: 'medium',
    action: `Fix heading structure (found ${page.headingStructure.h1Count} H1 tags, should be exactly 1)`,
    reason: 'Clear heading hierarchy helps AI engines understand content structure',
  });

  if (page.pageTitleLength >= 30 && page.pageTitleLength <= 60) score += 10;
  else if (page.pageTitleLength > 0) score += 5;

  result.technicalScore = Math.round((score / maxScore) * 100);

  return result;
}
