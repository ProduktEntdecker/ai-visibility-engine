import * as cheerio from 'cheerio';

const REQUIRED_SCHEMAS = [
  { type: 'Organization', weight: 20, description: 'Company information for AI knowledge graphs' },
  { type: 'WebSite', weight: 10, description: 'Site-level search and navigation info' },
  { type: 'BreadcrumbList', weight: 5, description: 'Navigation structure for AI understanding' },
  { type: 'Article', weight: 15, description: 'Content markup for AI citation' },
  { type: 'FAQPage', weight: 15, description: 'Direct answers for AI engines' },
  { type: 'Product', weight: 15, description: 'Product data for AI recommendations' },
  { type: 'LocalBusiness', weight: 10, description: 'Location data for local AI queries' },
  { type: 'HowTo', weight: 5, description: 'Instructional content for AI answers' },
  { type: 'Review', weight: 5, description: 'Social proof for AI trust signals' },
];

const ORG_REQUIRED_FIELDS = ['name', 'url', 'logo', 'description', 'sameAs', 'contactPoint'];

async function fetchPage(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'AIVisibilityEngine/1.0 (Schema Auditor)',
        'Accept': 'text/html',
      },
    });
    clearTimeout(timeout);
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

function extractJsonLd(html) {
  const $ = cheerio.load(html);
  const schemas = [];

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const data = JSON.parse($(el).html());
      if (Array.isArray(data)) {
        schemas.push(...data);
      } else if (data['@graph']) {
        schemas.push(...data['@graph']);
      } else {
        schemas.push(data);
      }
    } catch {
      // Invalid JSON-LD, skip
    }
  });

  return schemas;
}

function getSchemaType(schema) {
  const type = schema['@type'];
  if (Array.isArray(type)) return type[0];
  return type || 'Unknown';
}

function scoreOrganizationSchema(schema) {
  let completeness = 0;
  const missing = [];

  for (const field of ORG_REQUIRED_FIELDS) {
    if (schema[field]) {
      completeness += 100 / ORG_REQUIRED_FIELDS.length;
    } else {
      missing.push(field);
    }
  }

  const hasSameAs = Array.isArray(schema.sameAs) && schema.sameAs.length > 0;
  const hasWikipedia = hasSameAs && schema.sameAs.some(url =>
    url.includes('wikipedia.org') || url.includes('wikidata.org')
  );

  return {
    completeness: Math.round(completeness),
    missing,
    hasSameAs,
    hasWikipedia,
    sameAsCount: hasSameAs ? schema.sameAs.length : 0,
  };
}

async function discoverPages(domain) {
  const pages = [`https://${domain}`];

  // Try sitemap.xml
  const sitemapUrl = `https://${domain}/sitemap.xml`;
  const sitemapHtml = await fetchPage(sitemapUrl);

  if (sitemapHtml) {
    const $ = cheerio.load(sitemapHtml, { xmlMode: true });
    $('url > loc').each((i, el) => {
      if (pages.length < 20) {
        pages.push($(el).text());
      }
    });
  }

  // If no sitemap, try crawling links from homepage
  if (pages.length <= 1) {
    const homeHtml = await fetchPage(`https://${domain}`);
    if (homeHtml) {
      const $ = cheerio.load(homeHtml);
      $('a[href]').each((_, el) => {
        if (pages.length >= 20) return;
        const href = $(el).attr('href');
        if (href && href.startsWith('/') && !href.includes('#') && !href.includes('?')) {
          const fullUrl = `https://${domain}${href}`;
          if (!pages.includes(fullUrl)) {
            pages.push(fullUrl);
          }
        }
      });
    }
  }

  return pages;
}

export async function auditSchema(domain, onProgress) {
  const result = {
    domain,
    schemaScore: 0,
    pagesScanned: 0,
    totalSchemas: 0,
    schemasFound: [],
    schemasByPage: [],
    missingSchemas: [],
    recommendations: [],
    organizationDetails: null,
  };

  onProgress?.('Discovering pages...');
  const pages = await discoverPages(domain);
  result.pagesScanned = pages.length;

  const allSchemas = [];
  const schemaTypesFound = new Set();

  for (let i = 0; i < pages.length; i++) {
    const url = pages[i];
    onProgress?.(`Scanning page ${i + 1}/${pages.length}: ${url}`);

    const html = await fetchPage(url);
    if (!html) continue;

    const pageSchemas = extractJsonLd(html);
    const pageTypes = pageSchemas.map(s => getSchemaType(s));

    result.schemasByPage.push({
      url,
      schemas: pageTypes,
      count: pageSchemas.length,
    });

    for (const schema of pageSchemas) {
      const type = getSchemaType(schema);
      schemaTypesFound.add(type);
      allSchemas.push(schema);

      if (type === 'Organization') {
        result.organizationDetails = scoreOrganizationSchema(schema);
      }
    }
  }

  result.totalSchemas = allSchemas.length;

  // Score against required schemas
  let totalWeight = 0;
  let earnedWeight = 0;

  for (const req of REQUIRED_SCHEMAS) {
    totalWeight += req.weight;
    const found = schemaTypesFound.has(req.type);

    result.schemasFound.push({
      type: req.type,
      found,
      weight: req.weight,
      description: req.description,
    });

    if (found) {
      earnedWeight += req.weight;
    } else {
      result.missingSchemas.push(req.type);
      result.recommendations.push({
        priority: req.weight >= 15 ? 'high' : req.weight >= 10 ? 'medium' : 'low',
        action: `Add ${req.type} schema markup`,
        reason: req.description,
        impact: `+${req.weight} points to schema score`,
      });
    }
  }

  result.schemaScore = Math.round((earnedWeight / totalWeight) * 100);

  // Organization-specific recommendations
  if (result.organizationDetails) {
    if (!result.organizationDetails.hasWikipedia) {
      result.recommendations.push({
        priority: 'high',
        action: 'Add Wikipedia/Wikidata sameAs link to Organization schema',
        reason: 'Wikipedia entities are 2.5x more likely to be cited by AI engines',
        impact: 'Major AI visibility boost',
      });
    }
    if (result.organizationDetails.sameAsCount < 3) {
      result.recommendations.push({
        priority: 'medium',
        action: 'Add more sameAs links (LinkedIn, Xing, industry directories)',
        reason: 'Entity linking strengthens AI knowledge graph presence',
        impact: 'Improved entity recognition',
      });
    }
  } else {
    result.recommendations.unshift({
      priority: 'critical',
      action: 'Add Organization schema to homepage',
      reason: 'No Organization schema found - AI engines cannot identify your company',
      impact: 'Foundation for all AI visibility',
    });
  }

  return result;
}
