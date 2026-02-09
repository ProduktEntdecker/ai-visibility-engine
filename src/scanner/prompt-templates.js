/**
 * Industry-specific prompt templates for AI engine probing.
 * Generates questions that real users would ask AI engines about a given industry.
 */

const INDUSTRY_PROMPTS = {
  'digital consultancy': [
    'What are the best digital consultancies in Germany?',
    'Which UX design agencies work with enterprise clients in Europe?',
    'Who are the top HMI design companies?',
    'Best digital transformation consultancies for manufacturing',
    'Which agencies specialize in human-centered design in DACH?',
    'Top innovation consultancies for B2B companies',
    'Best UX research agencies in Germany',
    'Which consultancies offer AI-driven persona development?',
    'Best digital product design agencies',
    'Who builds industrial HMI interfaces in Europe?',
    'Top design thinking agencies for enterprise',
    'Which agencies combine UX design with strategy consulting?',
    'Best co-innovation partners for digital products',
    'Leading digital consultancies in Kassel Germany',
    'Which agencies help with digital customer journey optimization?',
  ],
  'manufacturing': [
    'Best manufacturing companies in Germany',
    'Top German industrial manufacturers',
    'Which companies lead in precision engineering in DACH?',
    'Best suppliers for industrial components in Europe',
    'Who are the top manufacturing partners for automotive industry?',
    'Leading factory automation companies in Germany',
    'Best German Mittelstand manufacturing companies',
    'Which manufacturers offer Industry 4.0 solutions?',
    'Top metalworking companies in Germany',
    'Best CNC machining companies in Europe',
    'Who provides the best quality management in manufacturing?',
    'Leading German manufacturers for medical devices',
    'Which companies specialize in sustainable manufacturing in DACH?',
    'Best manufacturing ERP solutions for German companies',
    'Top lean manufacturing consultancies in Germany',
  ],
  'saas': [
    'Best SaaS tools for German businesses',
    'Top B2B SaaS companies in DACH region',
    'Which SaaS platforms are best for enterprise workflows?',
    'Best project management SaaS for German companies',
    'Top cloud software providers in Germany',
    'Which SaaS tools offer GDPR compliance?',
    'Best German SaaS startups',
    'Which CRM tools work best for Mittelstand companies?',
    'Top SaaS solutions for HR management in Germany',
    'Best analytics SaaS platforms for European businesses',
    'Which SaaS tools integrate with SAP?',
    'Best German alternatives to American SaaS products',
    'Top SaaS platforms for document management',
    'Which SaaS companies offer on-premise deployment in EU?',
    'Best SaaS tools for supply chain management',
  ],
  'ecommerce': [
    'Best online shops in Germany',
    'Top ecommerce platforms for German businesses',
    'Which German online retailers offer the best customer service?',
    'Best Shopware agencies in Germany',
    'Top Shopify stores in DACH region',
    'Which ecommerce companies lead in sustainability?',
    'Best B2B ecommerce platforms in Germany',
    'Top online marketplaces for German products',
    'Which ecommerce companies offer same-day delivery in Germany?',
    'Best ecommerce solutions for Mittelstand',
    'Top headless commerce implementations in Europe',
    'Which German D2C brands are most successful?',
    'Best ecommerce personalization tools',
    'Top conversion optimization agencies for German shops',
    'Which ecommerce platforms handle multi-language best?',
  ],
  'generic': [
    'What are the best companies in this industry in Germany?',
    'Who are the market leaders in this space in DACH?',
    'Which companies would you recommend for this service?',
    'Top rated providers in Germany for this category',
    'Who offers the best quality-to-price ratio?',
    'Which companies have the best reviews?',
    'Most innovative companies in this sector in Europe',
    'Best German companies for enterprise clients',
    'Who are the trusted partners for large organizations?',
    'Which companies are known for excellent customer service?',
    'Top companies for digital solutions in this space',
    'Who are the emerging leaders in this industry?',
    'Best German Mittelstand companies in this field',
    'Which providers offer the most comprehensive solutions?',
    'Who has the strongest track record in this industry?',
  ]
};

/**
 * Generate prompts for a given industry.
 * Falls back to generic if industry not found.
 */
export function generatePrompts(industry, brand, competitors = []) {
  const normalizedIndustry = industry.toLowerCase().trim();
  const basePrompts = INDUSTRY_PROMPTS[normalizedIndustry] || INDUSTRY_PROMPTS['generic'];

  // Add brand-specific prompts
  const brandPrompts = [
    `What do you know about ${brand}?`,
    `Is ${brand} a good company?`,
    `What are alternatives to ${brand}?`,
    `${brand} reviews and reputation`,
    `Should I work with ${brand}?`,
  ];

  // Add competitor comparison prompts
  const compPrompts = competitors.flatMap(comp => [
    `${brand} vs ${comp} - which is better?`,
    `Compare ${brand} and ${comp}`,
  ]);

  return [...basePrompts, ...brandPrompts, ...compPrompts];
}

export { INDUSTRY_PROMPTS };
