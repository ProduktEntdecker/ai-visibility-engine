import { readFileSync } from 'fs';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function scoreColor(score) {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#E82A34';
}

function scoreLabel(score) {
  if (score >= 70) return 'Good';
  if (score >= 40) return 'Needs Work';
  return 'Critical';
}

function priorityBadge(priority) {
  const colors = {
    critical: '#E82A34',
    high: '#FF3000',
    medium: '#f59e0b',
    low: '#6b7280',
  };
  return `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;color:white;background:${colors[priority] || '#6b7280'}">${priority.toUpperCase()}</span>`;
}

export function generateReport(scanResult) {
  const { schema, technical, aiProbe, meta } = scanResult;
  const overallScore = Math.round(
    (schema.schemaScore * 0.3) +
    (technical.technicalScore * 0.3) +
    ((aiProbe?.aiVisibilityScore || 0) * 0.4)
  );

  const now = new Date().toLocaleDateString('de-DE', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const html = `<!DOCTYPE html>
<html lang="de">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Visibility Report - ${meta.domain}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1a1a1a;
    background: #ffffff;
    line-height: 1.6;
  }

  .page { max-width: 900px; margin: 0 auto; padding: 40px; }

  /* Header */
  .header {
    display: flex; justify-content: space-between; align-items: center;
    padding: 30px 40px; background: #1a1a1a; color: white;
  }
  .header-logo { display: flex; align-items: center; gap: 12px; }
  .header-logo .dot { width: 24px; height: 24px; background: #E82A34; border-radius: 50%; }
  .header-logo span { font-size: 18px; font-weight: 600; letter-spacing: 0.5px; }
  .header-meta { text-align: right; font-size: 13px; opacity: 0.7; }

  /* Hero Score */
  .hero {
    background: linear-gradient(135deg, #F9E6E9 0%, #F3F2EC 100%);
    padding: 60px 40px; text-align: center;
  }
  .hero h1 { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .hero .subtitle { font-size: 16px; color: #666; margin-bottom: 40px; }
  .score-ring {
    width: 180px; height: 180px; margin: 0 auto 20px;
    position: relative; display: flex; align-items: center; justify-content: center;
  }
  .score-ring svg { position: absolute; transform: rotate(-90deg); }
  .score-ring .number { font-size: 48px; font-weight: 700; }
  .score-ring .label { font-size: 14px; color: #666; }

  .score-grid {
    display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;
    max-width: 600px; margin: 40px auto 0;
  }
  .score-card {
    background: white; border-radius: 12px; padding: 24px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.08);
  }
  .score-card .value { font-size: 32px; font-weight: 700; }
  .score-card .name { font-size: 13px; color: #666; margin-top: 4px; }

  /* Sections */
  .section { padding: 40px; border-bottom: 1px solid #eee; }
  .section h2 {
    font-size: 22px; font-weight: 700; margin-bottom: 24px;
    padding-bottom: 12px; border-bottom: 2px solid #E82A34;
    display: inline-block;
  }

  /* Engine Breakdown */
  .engine-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
  .engine-card {
    border: 1px solid #e5e5e5; border-radius: 12px; padding: 20px;
  }
  .engine-card .engine-name { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
  .engine-card .engine-score { font-size: 28px; font-weight: 700; }
  .engine-card .engine-detail { font-size: 12px; color: #888; margin-top: 4px; }
  .bar { height: 8px; background: #f0f0f0; border-radius: 4px; margin-top: 12px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width 0.5s; }

  /* Table */
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th { text-align: left; padding: 12px; background: #f8f8f8; font-size: 13px; font-weight: 600; border-bottom: 2px solid #e5e5e5; }
  td { padding: 12px; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
  tr:hover { background: #fafafa; }

  /* Schema checklist */
  .check-item {
    display: flex; align-items: center; gap: 10px; padding: 10px 0;
    border-bottom: 1px solid #f0f0f0;
  }
  .check-icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .check-pass { background: #dcfce7; color: #22c55e; }
  .check-fail { background: #fef2f2; color: #E82A34; }
  .check-text { flex: 1; }
  .check-desc { font-size: 12px; color: #888; }

  /* Recommendations */
  .rec-item { display: flex; gap: 12px; padding: 16px; background: #fafafa; border-radius: 8px; margin-bottom: 12px; }
  .rec-content { flex: 1; }
  .rec-action { font-weight: 600; font-size: 14px; }
  .rec-reason { font-size: 13px; color: #666; margin-top: 4px; }

  /* CTA */
  .cta {
    background: #1a1a1a; color: white; padding: 60px 40px; text-align: center;
  }
  .cta h2 { font-size: 26px; margin-bottom: 16px; }
  .cta p { font-size: 16px; opacity: 0.8; max-width: 500px; margin: 0 auto 30px; }
  .cta-button {
    display: inline-block; padding: 16px 40px; background: #E82A34;
    color: white; text-decoration: none; border-radius: 8px;
    font-weight: 600; font-size: 16px;
  }

  /* Print */
  @media print {
    .page { padding: 20px; }
    .section { page-break-inside: avoid; }
    .cta-button { border: 2px solid #E82A34; }
  }
</style>
</head>
<body>

<div class="header">
  <div class="header-logo">
    <div class="dot"></div>
    <span>chilli mind</span>
    <span style="opacity:0.5;margin:0 8px">x</span>
    <span>AI Visibility Engine</span>
  </div>
  <div class="header-meta">
    <div>${now}</div>
    <div>Report for ${meta.domain}</div>
  </div>
</div>

<div class="hero">
  <h1>AI Visibility Report</h1>
  <p class="subtitle">${meta.brand || meta.domain} &mdash; ${meta.industry || 'General'}</p>

  <div class="score-ring">
    <svg width="180" height="180" viewBox="0 0 180 180">
      <circle cx="90" cy="90" r="80" fill="none" stroke="#e5e5e5" stroke-width="12"/>
      <circle cx="90" cy="90" r="80" fill="none" stroke="${scoreColor(overallScore)}"
        stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${overallScore * 5.03} 503"/>
    </svg>
    <div style="text-align:center">
      <div class="number" style="color:${scoreColor(overallScore)}">${overallScore}</div>
      <div class="label">Overall Score</div>
    </div>
  </div>

  <div class="score-grid">
    <div class="score-card">
      <div class="value" style="color:${scoreColor(aiProbe?.aiVisibilityScore || 0)}">${aiProbe?.aiVisibilityScore || 0}</div>
      <div class="name">AI Visibility</div>
    </div>
    <div class="score-card">
      <div class="value" style="color:${scoreColor(schema.schemaScore)}">${schema.schemaScore}</div>
      <div class="name">Schema Health</div>
    </div>
    <div class="score-card">
      <div class="value" style="color:${scoreColor(technical.technicalScore)}">${technical.technicalScore}</div>
      <div class="name">Technical Score</div>
    </div>
  </div>
</div>

<!-- AI Engine Breakdown -->
<div class="section">
  <h2>AI Engine Breakdown</h2>
  <div class="engine-grid">
    ${Object.entries(aiProbe?.engineBreakdown || {}).map(([engine, data]) => `
    <div class="engine-card">
      <div class="engine-name">${engine === 'google' ? 'Google AI Overviews' : engine === 'chatgpt' ? 'ChatGPT' : engine === 'perplexity' ? 'Perplexity' : 'Gemini'}</div>
      <div class="engine-score" style="color:${scoreColor(data.score)}">${data.score}<span style="font-size:14px;color:#888">/100</span></div>
      <div class="engine-detail">${data.mentions} mentions in ${data.totalQueries} queries${data.method === 'estimated' ? ' (estimated)' : ''}</div>
      <div class="bar"><div class="bar-fill" style="width:${data.score}%;background:${scoreColor(data.score)}"></div></div>
    </div>
    `).join('')}
  </div>
</div>

<!-- Competitor Comparison -->
${(aiProbe?.competitorComparison?.length > 0) ? `
<div class="section">
  <h2>Competitor Benchmark</h2>
  <table>
    <tr><th>Brand</th><th>AI Visibility Score</th><th>Status</th></tr>
    <tr style="background:#f8f8f8;font-weight:600">
      <td>${meta.brand || meta.domain}</td>
      <td><span style="color:${scoreColor(aiProbe.aiVisibilityScore)}">${aiProbe.aiVisibilityScore}</span></td>
      <td>You</td>
    </tr>
    ${aiProbe.competitorComparison.map(c => `
    <tr>
      <td>${c.competitor}</td>
      <td><span style="color:${scoreColor(c.estimatedScore)}">${c.estimatedScore}</span></td>
      <td>${c.vsYou === 'ahead' ? '<span style="color:#22c55e">You lead</span>' : '<span style="color:#E82A34">They lead</span>'}</td>
    </tr>
    `).join('')}
  </table>
</div>
` : ''}

<!-- Schema Audit -->
<div class="section">
  <h2>Schema Markup Audit</h2>
  <p style="margin-bottom:16px;color:#666">${schema.pagesScanned} pages scanned, ${schema.totalSchemas} schema blocks found</p>

  ${schema.schemasFound.map(s => `
  <div class="check-item">
    <div class="check-icon ${s.found ? 'check-pass' : 'check-fail'}">${s.found ? '&#10003;' : '&#10007;'}</div>
    <div class="check-text">
      <div>${s.type} <span style="font-size:12px;color:#888">(${s.weight} points)</span></div>
      <div class="check-desc">${s.description}</div>
    </div>
  </div>
  `).join('')}

  ${schema.organizationDetails ? `
  <div style="margin-top:24px;padding:20px;background:#f8f8f8;border-radius:8px">
    <strong>Organization Schema Details</strong>
    <div style="margin-top:8px;font-size:13px">
      Completeness: <strong>${schema.organizationDetails.completeness}%</strong> |
      sameAs links: <strong>${schema.organizationDetails.sameAsCount}</strong> |
      Wikipedia linked: <strong style="color:${schema.organizationDetails.hasWikipedia ? '#22c55e' : '#E82A34'}">${schema.organizationDetails.hasWikipedia ? 'Yes' : 'No'}</strong>
      ${schema.organizationDetails.missing.length > 0 ? `<div style="margin-top:4px;color:#E82A34">Missing fields: ${schema.organizationDetails.missing.join(', ')}</div>` : ''}
    </div>
  </div>
  ` : ''}
</div>

<!-- Technical Audit -->
<div class="section">
  <h2>Technical AI-Readiness</h2>

  <table>
    <tr><th>Check</th><th>Status</th><th>Detail</th></tr>
    <tr>
      <td>HTTPS</td>
      <td style="color:${technical.checks.pageQuality?.https ? '#22c55e' : '#E82A34'}">${technical.checks.pageQuality?.https ? 'Pass' : 'Fail'}</td>
      <td>${technical.checks.pageQuality?.https ? 'Secure connection' : 'No HTTPS detected'}</td>
    </tr>
    <tr>
      <td>Sitemap</td>
      <td style="color:${technical.checks.sitemap?.exists ? '#22c55e' : '#E82A34'}">${technical.checks.sitemap?.exists ? 'Pass' : 'Fail'}</td>
      <td>${technical.checks.sitemap?.exists ? `${technical.checks.sitemap.pageCount} pages indexed` : 'No sitemap found'}</td>
    </tr>
    <tr>
      <td>Load Time</td>
      <td style="color:${(technical.checks.pageQuality?.loadTimeMs || 9999) < 3000 ? '#22c55e' : '#f59e0b'}">${(technical.checks.pageQuality?.loadTimeMs || 9999) < 3000 ? 'Good' : 'Slow'}</td>
      <td>${technical.checks.pageQuality?.loadTimeMs || '?'}ms</td>
    </tr>
    <tr>
      <td>Meta Description</td>
      <td style="color:${technical.checks.pageQuality?.hasMetaDescription ? '#22c55e' : '#E82A34'}">${technical.checks.pageQuality?.hasMetaDescription ? 'Pass' : 'Fail'}</td>
      <td>${technical.checks.pageQuality?.hasMetaDescription ? 'Present' : 'Missing'}</td>
    </tr>
    <tr>
      <td>Heading Structure</td>
      <td style="color:${technical.checks.pageQuality?.headingStructure?.valid ? '#22c55e' : '#f59e0b'}">${technical.checks.pageQuality?.headingStructure?.valid ? 'Pass' : 'Warning'}</td>
      <td>H1: ${technical.checks.pageQuality?.headingStructure?.h1Count || 0}, H2: ${technical.checks.pageQuality?.headingStructure?.h2Count || 0}, H3: ${technical.checks.pageQuality?.headingStructure?.h3Count || 0}</td>
    </tr>
    <tr>
      <td>AI Crawlers (robots.txt)</td>
      <td style="color:${technical.checks.robotsTxt?.exists ? '#22c55e' : '#f59e0b'}">${technical.checks.robotsTxt?.exists ? 'Configured' : 'Missing'}</td>
      <td>${technical.checks.robotsTxt?.exists ? Object.entries(technical.checks.robotsTxt.allowsAICrawlers || {}).filter(([,v]) => !v.allowed).length + ' crawlers blocked' : 'No robots.txt'}</td>
    </tr>
    <tr>
      <td>Open Graph Tags</td>
      <td style="color:${technical.checks.pageQuality?.hasOgTags ? '#22c55e' : '#f59e0b'}">${technical.checks.pageQuality?.hasOgTags ? 'Pass' : 'Missing'}</td>
      <td>${technical.checks.pageQuality?.hasOgTags ? 'Present' : 'No OG tags found'}</td>
    </tr>
  </table>

  ${technical.checks.robotsTxt?.exists ? `
  <div style="margin-top:20px">
    <strong>AI Crawler Access:</strong>
    <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px">
      ${Object.entries(technical.checks.robotsTxt.allowsAICrawlers || {}).map(([name, data]) => `
        <span style="display:inline-flex;align-items:center;gap:4px;padding:4px 12px;border-radius:20px;font-size:12px;
          background:${data.allowed ? '#dcfce7' : '#fef2f2'};color:${data.allowed ? '#22c55e' : '#E82A34'}">
          ${data.allowed ? '&#10003;' : '&#10007;'} ${name}
        </span>
      `).join('')}
    </div>
  </div>
  ` : ''}
</div>

<!-- Missing Queries -->
${(aiProbe?.topMissingQueries?.length > 0) ? `
<div class="section">
  <h2>Top Missing AI Queries</h2>
  <p style="margin-bottom:16px;color:#666">These are questions users ask AI engines where your brand is NOT mentioned:</p>
  <table>
    <tr><th>#</th><th>Query</th><th>Opportunity</th></tr>
    ${aiProbe.topMissingQueries.slice(0, 15).map((q, i) => `
    <tr>
      <td>${i + 1}</td>
      <td>"${q.query}"</td>
      <td>${q.opportunity}</td>
    </tr>
    `).join('')}
  </table>
</div>
` : ''}

<!-- Recommendations -->
<div class="section">
  <h2>Recommendations</h2>
  ${[...schema.recommendations, ...technical.recommendations].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 };
    return (order[a.priority] || 3) - (order[b.priority] || 3);
  }).map(r => `
  <div class="rec-item">
    <div>${priorityBadge(r.priority)}</div>
    <div class="rec-content">
      <div class="rec-action">${r.action}</div>
      <div class="rec-reason">${r.reason}</div>
      ${r.impact ? `<div style="font-size:12px;color:#E82A34;margin-top:4px">Impact: ${r.impact}</div>` : ''}
    </div>
  </div>
  `).join('')}
</div>

<!-- CTA -->
<div class="cta">
  <h2>Ready to become AI-visible?</h2>
  <p>The AI Visibility Engine can implement all recommendations and continuously monitor your AI presence. Starting at &euro;20,000/year.</p>
  <a href="mailto:hello@chilli-mind.com?subject=AI%20Visibility%20Engine%20-%20Interest" class="cta-button">Get Started</a>
  <div style="margin-top:24px;font-size:13px;opacity:0.5">
    chilli mind x AI Visibility Engine &mdash; ${now}
  </div>
</div>

</body>
</html>`;

  return html;
}
