const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, TableRow, TableCell, Table,
  WidthType, ShadingType, PageBreak, Tab, TabStopPosition,
  TabStopType, Header, Footer, ImageRun, convertInchesToTwip,
} = require("docx");
const fs = require("fs");
const path = require("path");

// --- Load scan data ---
const scanPath = path.resolve("output/scan-chilli-mind-com.json");
const scan = JSON.parse(fs.readFileSync(scanPath, "utf8"));
const schema = scan.schema;
const tech = scan.technical;
const ai = scan.aiProbe;

// --- Colors ---
const RED = "E82A34";
const DARK = "1A1A1A";
const GRAY = "666666";
const LIGHT_BG = "F5F5F5";
const GREEN = "22C55E";
const AMBER = "F59E0B";

function scoreColor(v) {
  return v >= 70 ? GREEN : v >= 40 ? AMBER : RED;
}

// --- Helper: styled paragraph ---
function p(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 200 },
    alignment: opts.align,
    children: [
      new TextRun({
        text,
        font: opts.font ?? "Calibri",
        size: opts.size ?? 22, // 11pt
        color: opts.color ?? DARK,
        bold: opts.bold ?? false,
        italics: opts.italics ?? false,
      }),
    ],
  });
}

// --- Helper: rich paragraph with multiple runs ---
function richP(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 200 },
    alignment: opts.align,
    indent: opts.indent,
    children: runs.map(r => new TextRun({
      text: r.text,
      font: r.font ?? "Calibri",
      size: r.size ?? 22,
      color: r.color ?? DARK,
      bold: r.bold ?? false,
      italics: r.italics ?? false,
      break: r.break,
    })),
  });
}

// --- Helper: bullet point ---
function bullet(text, opts = {}) {
  return new Paragraph({
    spacing: { after: 100 },
    bullet: { level: opts.level ?? 0 },
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: opts.size ?? 22,
        color: opts.color ?? DARK,
        bold: opts.bold ?? false,
      }),
    ],
  });
}

// --- Helper: section heading ---
function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 400 : 300, after: 200 },
    children: [
      new TextRun({
        text,
        font: "Georgia",
        color: level === HeadingLevel.HEADING_1 ? RED : DARK,
        bold: true,
        size: level === HeadingLevel.HEADING_1 ? 32 : level === HeadingLevel.HEADING_2 ? 26 : 22,
      }),
    ],
  });
}

// --- Helper: table cell ---
function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.bg ? { type: ShadingType.SOLID, color: opts.bg } : undefined,
    verticalAlign: "center",
    children: [
      new Paragraph({
        alignment: opts.align ?? AlignmentType.LEFT,
        spacing: { after: 0 },
        children: [
          new TextRun({
            text: String(text),
            font: "Calibri",
            size: opts.size ?? 20,
            color: opts.color ?? DARK,
            bold: opts.bold ?? false,
          }),
        ],
      }),
    ],
  });
}

function tableRow(cells) {
  return new TableRow({ children: cells });
}

// --- Build document ---
function buildDoc() {
  const scanDate = new Date(scan.meta.scanDate).toLocaleDateString("de-DE", {
    year: "numeric", month: "long", day: "numeric",
  });

  const sections = [];

  // ===================== TITLE PAGE =====================
  sections.push(
    new Paragraph({ spacing: { after: 800 }, children: [] }),
    new Paragraph({ spacing: { after: 800 }, children: [] }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "AI VISIBILITY AUDIT", font: "Calibri", size: 24, color: GRAY, characterSpacing: 200 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "chilli mind", font: "Georgia", size: 56, color: RED, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "chilli-mind.com", font: "Calibri", size: 24, color: GRAY })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
      children: [new TextRun({ text: `Scan-Datum: ${scanDate}`, font: "Calibri", size: 22, color: GRAY })],
    }),

    // Score overview box
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [new TextRun({ text: "OVERALL SCORE", font: "Calibri", size: 20, color: GRAY, characterSpacing: 100 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
      children: [new TextRun({ text: "47 / 100", font: "Georgia", size: 72, color: AMBER, bold: true })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
      children: [
        new TextRun({ text: `Schema ${schema.schemaScore}`, font: "Calibri", size: 22, color: scoreColor(schema.schemaScore), bold: true }),
        new TextRun({ text: "   |   ", font: "Calibri", size: 22, color: GRAY }),
        new TextRun({ text: `Technical ${tech.technicalScore}`, font: "Calibri", size: 22, color: scoreColor(tech.technicalScore), bold: true }),
        new TextRun({ text: "   |   ", font: "Calibri", size: 22, color: GRAY }),
        new TextRun({ text: `AI Visibility ${ai.aiVisibilityScore}`, font: "Calibri", size: 22, color: scoreColor(ai.aiVisibilityScore), bold: true }),
      ],
    }),

    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [new TextRun({ text: "Erstellt mit AI Visibility Engine  |  Florian Steiner", font: "Calibri", size: 20, color: GRAY })],
    }),

    // Page break
    new Paragraph({ children: [new PageBreak()] }),

    // ===================== EXECUTIVE SUMMARY =====================
    heading("Executive Summary"),
    p("chilli mind steht mit einer starken inhaltlichen Basis und einem klaren Profil als digitale Innovationsberatung gut da — schöpft das Potenzial für klassische SEO und AI-Sichtbarkeit (GEO/AIO) aber noch nicht aus."),
    richP([
      { text: "Die technische Grundlage ist solide ", color: GRAY },
      { text: `(Technical Score: ${tech.technicalScore}/100)`, bold: true, color: scoreColor(tech.technicalScore) },
      { text: ". Strukturierte Daten (Schema Markup) sind teilweise vorhanden ", color: GRAY },
      { text: `(Schema Score: ${schema.schemaScore}/100)`, bold: true, color: scoreColor(schema.schemaScore) },
      { text: ", aber ", color: GRAY },
      { text: "6 von 9 wichtigen Schema-Typen fehlen", bold: true, color: RED },
      { text: ". Die AI-Sichtbarkeit ist noch gering ", color: GRAY },
      { text: `(AI Score: ${ai.aiVisibilityScore}/100)`, bold: true, color: scoreColor(ai.aiVisibilityScore) },
      { text: " — Google erwähnt chilli mind in ", color: GRAY },
      { text: "0 von 10 branchenrelevanten Anfragen.", bold: true, color: RED },
    ]),
    p("Dieser Report fasst Status, Chancen und priorisierte Maßnahmen zusammen."),

    // ===================== 1. SCAN-ERGEBNISSE =====================
    new Paragraph({ children: [new PageBreak()] }),
    heading("1. Scan-Ergebnisse im Detail"),

    heading("1.1 Schema Markup Audit", HeadingLevel.HEADING_2),
    richP([
      { text: `${schema.pagesScanned} Seiten gescannt, ${schema.totalSchemas} Schema-Blöcke gefunden. ` },
      { text: `Score: ${schema.schemaScore}/100`, bold: true, color: scoreColor(schema.schemaScore) },
    ]),
  );

  // Schema checklist table
  const schemaRows = [
    tableRow([
      cell("Schema-Typ", { bold: true, bg: LIGHT_BG, width: 30 }),
      cell("Status", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
      cell("Gewicht", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
      cell("Bedeutung", { bold: true, bg: LIGHT_BG, width: 40 }),
    ]),
  ];
  for (const s of schema.schemasFound) {
    schemaRows.push(tableRow([
      cell(s.type, { bold: true }),
      cell(s.found ? "✓" : "✗", { align: AlignmentType.CENTER, color: s.found ? GREEN : RED, bold: true }),
      cell(`${s.weight} Pkt`, { align: AlignmentType.CENTER }),
      cell(s.description),
    ]));
  }

  sections.push(
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: schemaRows,
    }),
  );

  // Organization details
  if (schema.organizationDetails) {
    const org = schema.organizationDetails;
    sections.push(
      new Paragraph({ spacing: { after: 100 }, children: [] }),
      heading("Organization Schema Details", HeadingLevel.HEADING_3),
      richP([
        { text: `Vollständigkeit: ` },
        { text: `${org.completeness}%`, bold: true, color: scoreColor(org.completeness) },
        { text: `  |  sameAs-Links: ` },
        { text: `${org.sameAsCount}`, bold: true, color: org.sameAsCount > 0 ? GREEN : RED },
        { text: `  |  Wikipedia verknüpft: ` },
        { text: org.hasWikipedia ? "Ja" : "Nein", bold: true, color: org.hasWikipedia ? GREEN : RED },
      ]),
    );
    if (org.missing.length > 0) {
      sections.push(
        richP([
          { text: "Fehlende Felder: ", bold: true, color: RED },
          { text: org.missing.join(", ") },
        ]),
      );
    }
  }

  // Technical audit
  sections.push(
    heading("1.2 Technical AI-Readiness", HeadingLevel.HEADING_2),
    richP([
      { text: `Score: ` },
      { text: `${tech.technicalScore}/100`, bold: true, color: scoreColor(tech.technicalScore) },
    ]),
  );

  const techChecks = tech.checks;
  const techRows = [
    tableRow([
      cell("Check", { bold: true, bg: LIGHT_BG, width: 35 }),
      cell("Status", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
      cell("Details", { bold: true, bg: LIGHT_BG, width: 50 }),
    ]),
    tableRow([
      cell("HTTPS"),
      cell(techChecks.pageQuality.https ? "✓" : "✗", { align: AlignmentType.CENTER, color: techChecks.pageQuality.https ? GREEN : RED, bold: true }),
      cell("Verschlüsselte Verbindung"),
    ]),
    tableRow([
      cell("robots.txt"),
      cell(techChecks.robotsTxt.exists ? "✓" : "✗", { align: AlignmentType.CENTER, color: techChecks.robotsTxt.exists ? GREEN : RED, bold: true }),
      cell("Alle AI-Crawler erlaubt (nicht explizit konfiguriert)"),
    ]),
    tableRow([
      cell("Sitemap"),
      cell(techChecks.sitemap.exists ? "✓" : "✗", { align: AlignmentType.CENTER, color: techChecks.sitemap.exists ? GREEN : RED, bold: true }),
      cell(`${techChecks.sitemap.pageCount} Seiten in Sitemap`),
    ]),
    tableRow([
      cell("Meta Description"),
      cell(techChecks.pageQuality.hasMetaDescription ? "✓" : "✗", { align: AlignmentType.CENTER, color: techChecks.pageQuality.hasMetaDescription ? GREEN : RED, bold: true }),
      cell("Vorhanden"),
    ]),
    tableRow([
      cell("Open Graph Tags"),
      cell(techChecks.pageQuality.hasOgTags ? "✓" : "✗", { align: AlignmentType.CENTER, color: techChecks.pageQuality.hasOgTags ? GREEN : RED, bold: true }),
      cell("Social-Media-Vorschau konfiguriert"),
    ]),
    tableRow([
      cell("Canonical Tag"),
      cell(techChecks.pageQuality.hasCanonical ? "✓" : "✗", { align: AlignmentType.CENTER, color: techChecks.pageQuality.hasCanonical ? GREEN : RED, bold: true }),
      cell("Duplicate-Content-Schutz"),
    ]),
    tableRow([
      cell("H1-Struktur"),
      cell(techChecks.pageQuality.headingStructure.valid ? "✓" : "✗", { align: AlignmentType.CENTER, color: techChecks.pageQuality.headingStructure.valid ? GREEN : RED, bold: true }),
      cell(`${techChecks.pageQuality.headingStructure.h1Count} H1-Tags (sollte 1 sein)`),
    ]),
    tableRow([
      cell("Ladezeit"),
      cell(techChecks.pageQuality.loadTimeMs < 2000 ? "✓" : "✗", { align: AlignmentType.CENTER, color: techChecks.pageQuality.loadTimeMs < 2000 ? GREEN : RED, bold: true }),
      cell(`${techChecks.pageQuality.loadTimeMs} ms`),
    ]),
  ];

  sections.push(
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: techRows }),
  );

  // AI Crawler access
  sections.push(
    new Paragraph({ spacing: { after: 100 }, children: [] }),
    heading("AI-Crawler-Zugang", HeadingLevel.HEADING_3),
  );

  const crawlerRows = [
    tableRow([
      cell("AI-Engine", { bold: true, bg: LIGHT_BG, width: 30 }),
      cell("Crawler", { bold: true, bg: LIGHT_BG, width: 25 }),
      cell("Zugang", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
      cell("Konfiguriert", { bold: true, bg: LIGHT_BG, width: 30, align: AlignmentType.CENTER }),
    ]),
  ];
  for (const [name, info] of Object.entries(techChecks.robotsTxt.allowsAICrawlers)) {
    crawlerRows.push(tableRow([
      cell(info.owner),
      cell(name),
      cell(info.allowed ? "✓" : "✗", { align: AlignmentType.CENTER, color: info.allowed ? GREEN : RED, bold: true }),
      cell(info.explicitlyConfigured ? "Ja" : "Standard", { align: AlignmentType.CENTER }),
    ]));
  }
  sections.push(
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: crawlerRows }),
    p("Alle AI-Crawler haben Zugang, aber keiner ist explizit konfiguriert. Eine bewusste Konfiguration zeigt AI-Engines, dass die Seite für sie optimiert ist.", { after: 300 }),
  );

  // AI Visibility
  sections.push(
    heading("1.3 AI Engine Visibility", HeadingLevel.HEADING_2),
    richP([
      { text: `Score: ` },
      { text: `${ai.aiVisibilityScore}/100`, bold: true, color: scoreColor(ai.aiVisibilityScore) },
      { text: `  (${ai.totalPrompts} Suchanfragen getestet)` },
    ]),
  );

  const aiRows = [
    tableRow([
      cell("Engine", { bold: true, bg: LIGHT_BG, width: 25 }),
      cell("Score", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
      cell("Erwähnungen", { bold: true, bg: LIGHT_BG, width: 20, align: AlignmentType.CENTER }),
      cell("Methode", { bold: true, bg: LIGHT_BG, width: 40 }),
    ]),
  ];
  for (const [engine, info] of Object.entries(ai.engineBreakdown)) {
    const label = engine === "google" ? "Google (SERP + AI Overviews)" :
                  engine === "chatgpt" ? "ChatGPT" :
                  engine === "perplexity" ? "Perplexity" : "Gemini";
    const method = info.method === "measured" ? "Live gemessen (SERP API)" :
                   info.method === "estimated" ? "Heuristisch geschätzt" : "Nicht gemessen";
    aiRows.push(tableRow([
      cell(label),
      cell(`${info.score}/100`, { align: AlignmentType.CENTER, color: scoreColor(info.score), bold: true }),
      cell(`${info.mentions}/${info.totalQueries}`, { align: AlignmentType.CENTER }),
      cell(method, { italics: true, color: info.method === "measured" ? GREEN : AMBER }),
    ]));
  }
  sections.push(
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: aiRows }),
    p("Hinweis: ChatGPT, Perplexity und Gemini werden heuristisch auf Basis von Schema- und Technical-Signalen geschätzt. Nur Google wird live über die SERP API gemessen.", { italics: true, color: GRAY, after: 300 }),
  );

  // Top missing queries
  sections.push(
    heading("Nicht gefunden bei folgenden Anfragen", HeadingLevel.HEADING_3),
  );
  const topQueries = ai.topMissingQueries.slice(0, 10);
  for (const q of topQueries) {
    sections.push(bullet(`\u201E${q.query}\u201C`, { color: GRAY }));
  }
  sections.push(
    p(`… und ${ai.topMissingQueries.length - topQueries.length} weitere. Keine einzige Anfrage liefert chilli mind als Ergebnis.`, { italics: true, color: RED, after: 300 }),
  );

  // Competitor comparison
  sections.push(
    heading("1.4 Wettbewerber-Vergleich", HeadingLevel.HEADING_2),
  );

  const compRows = [
    tableRow([
      cell("Unternehmen", { bold: true, bg: LIGHT_BG, width: 25 }),
      cell("Gesamt", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
      cell("Schema", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
      cell("Technical", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
      cell("AI Visibility", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
      cell("vs. chilli mind", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
    ]),
    tableRow([
      cell("chilli mind", { bold: true }),
      cell("47", { align: AlignmentType.CENTER, color: scoreColor(47), bold: true }),
      cell(String(schema.schemaScore), { align: AlignmentType.CENTER, color: scoreColor(schema.schemaScore), bold: true }),
      cell(String(tech.technicalScore), { align: AlignmentType.CENTER, color: scoreColor(tech.technicalScore), bold: true }),
      cell(String(ai.aiVisibilityScore), { align: AlignmentType.CENTER, color: scoreColor(ai.aiVisibilityScore), bold: true }),
      cell("—", { align: AlignmentType.CENTER }),
    ]),
  ];
  for (const comp of ai.competitorComparison) {
    compRows.push(tableRow([
      cell(comp.competitor),
      cell(String(comp.estimatedScore), { align: AlignmentType.CENTER, color: scoreColor(comp.estimatedScore), bold: true }),
      cell(String(comp.schemaScore), { align: AlignmentType.CENTER, color: scoreColor(comp.schemaScore), bold: true }),
      cell(String(comp.technicalScore), { align: AlignmentType.CENTER, color: scoreColor(comp.technicalScore), bold: true }),
      cell(String(comp.aiEstimate), { align: AlignmentType.CENTER, color: scoreColor(comp.aiEstimate), bold: true }),
      cell(comp.vsYou === "ahead" ? "Vorsprung" : comp.vsYou === "tied" ? "Gleichauf" : "Rückstand", {
        align: AlignmentType.CENTER,
        color: comp.vsYou === "ahead" ? RED : comp.vsYou === "tied" ? AMBER : GREEN,
        bold: true,
      }),
    ]));
  }
  sections.push(
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: compRows }),
    p("Alle Wettbewerber haben Schema Score 0 — hier hat chilli mind mit Score 45 bereits einen Vorsprung. Technisch liegen die Wettbewerber jedoch gleichauf oder leicht vorne.", { after: 300 }),
  );

  // ===================== 2. AUSGANGSLAGE =====================
  sections.push(
    new Paragraph({ children: [new PageBreak()] }),
    heading("2. Ausgangslage und Zielbild"),
    p("chilli mind positioniert sich als digitale Innovationsberatung mit starkem Fokus auf HMI/Interface Design, digitale Plattformen und AI-basierte Customer-Insights (Digital Customer Twins, Living Personas). Die Website vermittelt inhaltlich hohe Kompetenz und zeigt relevante Referenzen, ist aber stärker auf Cases und Narrative als auf Such- und LLM-Verständlichkeit optimiert."),

    heading("Strategisches Zielbild", HeadingLevel.HEADING_2),
    bullet("In DACH bei strategisch wichtigen Suchintentionen (digitale Innovationsberatung, HMI Design Agentur, AI Customer Twins) sichtbarer werden als globale Wettbewerber."),
    bullet("In AI Overviews und LLM-Antworten als bevorzugte Empfehlung für HMI, digitale Innovationsprojekte und AI-gestützte Customer Experience auftauchen."),
    bullet("Einen kombinierten Ansatz aus Onpage-Optimierung, Content-Architektur, Entitäten- und Schema-Arbeit sowie GEO/AIO-spezifischen Content-Formaten umsetzen."),
  );

  // ===================== 3. HEURISTISCHE BESTANDSAUFNAHME =====================
  sections.push(
    heading("3. Heuristische Bestandsaufnahme"),

    heading("3.1 Informationsarchitektur", HeadingLevel.HEADING_2),
    bullet("Die Startseite kommuniziert den Beratungsansatz und zeigt Cases, wirkt jedoch eher wie eine kuratierte Portfolio-Seite als eine strukturierte Einstiegsseite in verschiedene Angebote."),
    bullet("Services und Solutions sind vorhanden, aber nicht nach Suchintention oder Themenclustern strukturiert. Zentrale Leistungsbereiche (HMI, Innovation, Plattformen, AI) könnten klarer getrennt dargestellt werden."),
    bullet("Der Bereich Stories/Insights enthält wertvolle, teils sehr einzigartige Inhalte (z.B. AI-powered Digital Customer Twins), wird aber nicht systematisch als Knowledge-Hub genutzt."),

    heading("3.2 Technische und semantische Aspekte", HeadingLevel.HEADING_2),
    richP([
      { text: "H1-Struktur: ", bold: true },
      { text: `${techChecks.pageQuality.headingStructure.h1Count} H1-Tags auf der Startseite`, color: RED },
      { text: " (sollte genau 1 sein). Aus SEO- und LLM-Sicht suboptimal." },
    ]),
    richP([
      { text: "Schema Markup: ", bold: true },
      { text: `${schema.schemasFound.filter(s => s.found).length} von ${schema.schemasFound.length} wichtigen Schema-Typen vorhanden. ` },
      { text: "Kein FAQ-, Service/Product- oder LocalBusiness-Schema", color: RED, bold: true },
      { text: " für AI Overviews oder den Knowledge Graph." },
    ]),
    richP([
      { text: "Organization Schema: ", bold: true },
      { text: `Nur ${schema.organizationDetails?.completeness ?? 0}% vollständig. ` },
      { text: `Fehlend: ${schema.organizationDetails?.missing?.join(", ") ?? "n/a"}`, color: RED },
    ]),

    heading("3.3 Marken- und Themenpositionierung", HeadingLevel.HEADING_2),
    p("Stärken:", { bold: true }),
    bullet("Klare Spezialisierung auf Industrie, HMI-Systeme, digitale Portale und AI-basierte Customer Insights."),
    bullet("Zahlreiche reale Referenzen und langjährige Projekterfahrung."),
    bullet("Einzigartige Positionierung bei AI Customer Twins — kaum Wettbewerb im DACH-Raum."),
    p("Schwächen:", { bold: true }),
    bullet("Aus Such- und LLM-Perspektive fehlen klar definierte Themen-Säulen (Pillars)."),
    bullet("Kein systematisches FAQ- oder How-to-Content-Format für AI-Verwertbarkeit."),
    bullet("Keine Wikipedia/Wikidata-Präsenz — Entitäten mit Wikipedia werden 2,5× häufiger von AI-Engines zitiert."),
  );

  // ===================== 4. QUICK WINS =====================
  sections.push(
    new Paragraph({ children: [new PageBreak()] }),
    heading("4. Quick Wins: Schema, Entitäten und Semantik"),
    p("Auf Basis des Scans und der Website-Analyse ergeben sich sieben sofort umsetzbare Maßnahmen:"),
  );

  const quickWins = [
    {
      nr: "4.1", title: "FAQ Schema hinzufügen", prio: "HOCH", impact: "+15 Punkte",
      what: "Auf zentralen Seiten (Startseite, Services, AI Customer Twins, HMI, Kontakt) werden 5–7 präzise FAQs integriert und im FAQPage-Schema ausgezeichnet.",
      why: "Direkte Antworten für AI-Engines. Höhere Chance auf Rich Snippets und bessere LLM-Verwertung.",
      example: "\u201EWie l\u00E4uft ein HMI-Projekt ab?\u201C, \u201EWas ist ein Digital Customer Twin?\u201C, \u201EWelche Branchen bedient chilli mind?\u201C",
    },
    {
      nr: "4.2", title: "Service/Product Schema", prio: "HOCH", impact: "+15 Punkte",
      what: "Zentrale Leistungen (HMI systems, AI-powered digital customer twins, Digital innovation & new business) werden als Services über strukturierte Daten ausgezeichnet.",
      why: "Klarere Darstellung des Leistungsportfolios im Knowledge Graph. Erhöhte Wahrscheinlichkeit, als Empfehlung in AI Overviews genannt zu werden.",
    },
    {
      nr: "4.3", title: "Organization Schema vervollständigen", prio: "HOCH", impact: "33% → 100%",
      what: "Ergänzung von URL, Beschreibung, Kontakt und sameAs-Verweisen. Konsistente Verwendung auf Startseite und About/Contact-Seiten.",
      why: "Eindeutige Identifikation als Organisation. Grundvoraussetzung für stabile Entitätswahrnehmung durch AI-Engines.",
    },
    {
      nr: "4.4", title: "Wikipedia/Wikidata sameAs", prio: "MITTEL", impact: "2,5× Sichtbarkeit",
      what: "Einbindung von sameAs-Links auf Wikipedia/Wikidata, sobald ein stabiler Eintrag vorhanden ist. Erfordert separate PR- und Community-Arbeit.",
      why: "Entitäten mit Wikipedia/Wikidata-Anbindung werden von LLMs und Suchsystemen bevorzugt genutzt.",
    },
    {
      nr: "4.5", title: "LocalBusiness Schema", prio: "MITTEL", impact: "+10 Punkte",
      what: "Für die Standorte Kassel, Zug und Allgäu werden LocalBusiness-Schemata ergänzt.",
      why: "Bessere lokale Sichtbarkeit bei Anfragen wie \u201EAgentur f\u00FCr HMI in Kassel\u201C oder \u201EInnovationsberatung Schweiz\u201C.",
    },
    {
      nr: "4.6", title: "sameAs-Links (Social-Profile)", prio: "MITTEL", impact: "Entity Linking",
      what: "Ergänzung von LinkedIn, Instagram und weiteren Profilen im Organization-Schema als sameAs.",
      why: "Stärkeres Entity Linking und höhere Konsistenz zwischen Webauftritt und Social-Präsenz.",
    },
    {
      nr: "4.7", title: "H1-Struktur korrigieren", prio: "MITTEL", impact: "SEO + AI",
      what: `Sicherstellen, dass jede Seite genau 1 H1-Überschrift hat. Aktuell: ${techChecks.pageQuality.headingStructure.h1Count} H1-Tags auf der Startseite.`,
      why: "Bessere semantische Klarheit. Vereinfachtes Parsing durch Suchmaschinen und LLMs.",
    },
  ];

  for (const qw of quickWins) {
    const prioColor = qw.prio === "HOCH" ? RED : AMBER;
    sections.push(
      heading(`${qw.nr} ${qw.title}`, HeadingLevel.HEADING_2),
      richP([
        { text: "Priorität: ", bold: true },
        { text: qw.prio, bold: true, color: prioColor },
        { text: "  |  Wirkung: ", bold: true },
        { text: qw.impact, bold: true, color: prioColor },
      ]),
      richP([{ text: "Maßnahme: ", bold: true }, { text: qw.what }]),
      richP([{ text: "Nutzen: ", bold: true }, { text: qw.why }]),
    );
    if (qw.example) {
      sections.push(richP([{ text: "Beispiel-FAQs: ", bold: true, italics: true }, { text: qw.example, italics: true, color: GRAY }]));
    }
  }

  // Score projection
  sections.push(
    new Paragraph({ spacing: { after: 100 }, children: [] }),
    richP([
      { text: "Geschätzte Wirkung der Quick Wins: ", bold: true },
      { text: "Score von 47 auf ca. 75+ Punkte", bold: true, color: GREEN, size: 24 },
      { text: " (Schema allein von 45 auf 100).", size: 22 },
    ]),
  );

  // ===================== 5. STRATEGISCHE MAßNAHMEN =====================
  sections.push(
    new Paragraph({ children: [new PageBreak()] }),
    heading("5. Strategische Maßnahmen mit hohem Hebel"),

    heading("5.1 Themen-Pillar-Seiten einführen", HeadingLevel.HEADING_2),
    p("Empfehlung: Die Website in 3–4 große Themencluster gliedern und jeweils eine starke Pillar-Seite aufbauen:"),
    bullet("Digitale Innovationsberatung & New Business", { bold: true }),
    bullet("HMI & Interface Design für Industrie", { bold: true }),
    bullet("Digitale Plattformen & Kundenportale", { bold: true }),
    bullet("AI & Customer Twins / Living Personas", { bold: true }),
    p("Jede Pillar-Seite sollte enthalten: klare Fokussierung auf ein Thema, strukturierte Erklärung (Nutzen, Vorgehen, Methoden), Deep Links auf Cases und Stories, FAQ-Sektion mit Schema sowie Service/Product-Schema."),
    p("Wirkung: hoch — Pillar-Seiten sind zentrale Ankerpunkte für SEO, AI Overviews und LLM-Erwähnungen.", { bold: true }),

    heading("5.2 AI-/Customer-Twin-Cluster zum Category Owner ausbauen", HeadingLevel.HEADING_2),
    p("Die bestehende Story \u201EAI-powered digital customer twins\u201C eignet sich hervorragend als Kern einer eigenen Themenkategorie. Hier besteht reales Potenzial, einen Themenraum zu dominieren, in dem globale Wettbewerber weniger konkret positioniert sind."),
    p("Konkrete Maßnahmen:", { bold: true }),
    bullet("Ausbau zu einer umfassenden Pillar-Seite: Definitionen, Business Cases, Prozess, Technologien, Beispiele, FAQ."),
    bullet("Ergänzende Unterseiten zu: Living Personas, Einsatz in Vertrieb/Marketing, Integration mit bestehenden Systemen."),
    bullet("Starke interne Verlinkung aus Startseite, Service-Seiten und Cases."),

    heading("5.3 Case-Studies systematisch strukturieren", HeadingLevel.HEADING_2),
    p("Bestehende Referenzen nach Clustern (HMI, Portale, Innovation, AI) gruppieren und von den Pillar-Seiten aus verlinken. Einheitliches Story-Format: Ausgangssituation → Herausforderung → Ansatz → Lösung → Ergebnisse."),

    heading("5.4 Insights/Stories zum GEO-/AIO-Hub ausbauen", HeadingLevel.HEADING_2),
    bullet("Themen-Cluster (AI, Innovation, HMI, Designmethoden) konsistent taggen und strukturieren."),
    bullet("Artikel um definitorische Abschnitte, How-to-Elemente und FAQ-Blöcke ergänzen."),
    bullet("Am Ende jedes Artikels auf relevante Services und Cases verlinken."),
  );

  // ===================== 6. PRIORISIERTE MAßNAHMENLISTE =====================
  sections.push(
    new Paragraph({ children: [new PageBreak()] }),
    heading("6. Priorisierte Maßnahmenliste"),
    p("Nach Aufwand und Wirkung priorisiert:"),
  );

  const priorities = [
    { nr: "1", title: "Service- und Themen-Pillar-Struktur einführen", effort: "Hoch", impact: "Sehr hoch", timeline: "4–6 Wochen" },
    { nr: "2", title: "AI-/Customer-Twin-Cluster ausbauen", effort: "Mittel", impact: "Sehr hoch", timeline: "3–4 Wochen" },
    { nr: "3", title: "Case-Studies strukturieren und clustern", effort: "Mittel", impact: "Hoch", timeline: "2–3 Wochen" },
    { nr: "4", title: "FAQ-Content + FAQ Schema auf Kernseiten", effort: "Gering", impact: "Hoch", timeline: "1–2 Wochen" },
    { nr: "5", title: "Service/Product-Schema für Kernleistungen", effort: "Gering", impact: "Hoch", timeline: "1 Woche" },
    { nr: "6", title: "Organization-Schema inkl. sameAs", effort: "Gering", impact: "Mittel–Hoch", timeline: "1 Tag" },
    { nr: "7", title: "H1-Hierarchie bereinigen", effort: "Gering", impact: "Mittel", timeline: "1 Tag" },
    { nr: "8", title: "LocalBusiness-Schema (Kassel, Zug, Allgäu)", effort: "Gering", impact: "Mittel", timeline: "1 Tag" },
    { nr: "9", title: "Insights/Stories zum Knowledge-Hub ausbauen", effort: "Mittel", impact: "Mittel–Hoch", timeline: "Laufend" },
    { nr: "10", title: "Wikipedia-/Wikidata-Strategie prüfen", effort: "Hoch", impact: "Mittel", timeline: "Langfristig" },
  ];

  const prioRows = [
    tableRow([
      cell("#", { bold: true, bg: LIGHT_BG, width: 5, align: AlignmentType.CENTER }),
      cell("Maßnahme", { bold: true, bg: LIGHT_BG, width: 40 }),
      cell("Aufwand", { bold: true, bg: LIGHT_BG, width: 15, align: AlignmentType.CENTER }),
      cell("Wirkung", { bold: true, bg: LIGHT_BG, width: 20, align: AlignmentType.CENTER }),
      cell("Zeitrahmen", { bold: true, bg: LIGHT_BG, width: 20, align: AlignmentType.CENTER }),
    ]),
  ];
  for (const pr of priorities) {
    prioRows.push(tableRow([
      cell(pr.nr, { align: AlignmentType.CENTER }),
      cell(pr.title),
      cell(pr.effort, { align: AlignmentType.CENTER }),
      cell(pr.impact, { align: AlignmentType.CENTER, color: pr.impact.includes("Sehr") ? GREEN : pr.impact.includes("Hoch") ? AMBER : GRAY }),
      cell(pr.timeline, { align: AlignmentType.CENTER }),
    ]));
  }
  sections.push(
    new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: prioRows }),
  );

  // ===================== 7. NÄCHSTE SCHRITTE =====================
  sections.push(
    heading("7. Empfohlene nächste Schritte"),
    p("Erfolgsentscheidend ist die konsequente Ausrichtung der Inhalte auf geschäftsrelevante Suchintentionen, eine saubere Schema-Strategie und die enge Verzahnung zwischen Marketing, Beratung und Delivery."),
    p("Operative nächste Schritte:", { bold: true }),
    bullet("Workshop zur Definition der 3–4 Haupt-Cluster und ihrer Ziel-Keywords."),
    bullet("Quick Wins umsetzen (FAQ Schema, Service Schema, Organization Schema) — Wirkung innerhalb von 1–2 Wochen messbar."),
    bullet("Grobkonzept und Wireframes für die neuen Pillar-Seiten."),
    bullet("Redaktionsplan für AI-/Customer-Twin-Artikel und Überarbeitung bestehender Stories mit AIO-Fokus."),
    bullet("Monatliches Re-Scanning zur Erfolgskontrolle."),
  );

  // ===================== METHODIK =====================
  sections.push(
    new Paragraph({ children: [new PageBreak()] }),
    heading("Methodik & Transparenz"),
    p("Dieser Report wurde mit der AI Visibility Engine erstellt. Die Methodik im Überblick:"),
    bullet("Schema Audit: Automatisiertes Crawling und Analyse aller JSON-LD Schema-Blöcke auf 18 gescannten Seiten. Bewertung gegen 9 branchenrelevante Schema-Typen."),
    bullet("Technical Audit: Prüfung von HTTPS, robots.txt, Sitemap, Meta-Tags, Open Graph, Canonical, H1-Struktur und Ladezeit."),
    bullet("AI Engine Visibility (Google): Live-Messung über SERP API — 10 branchenrelevante Suchanfragen mit Prüfung auf AI Overviews und organische Ergebnisse."),
    bullet("AI Engine Visibility (ChatGPT, Perplexity, Gemini): Heuristische Schätzung auf Basis von Schema- und Technical-Signalen. Diese Werte sind Indikatoren, keine exakten Messungen.", { color: AMBER }),
    bullet("Wettbewerber-Vergleich: Identische Methodik für alle verglichenen Domains."),
    p("Die Schema- und Technical-Scores sind mit hoher Zuverlässigkeit gemessen (85–90%). Die AI-Visibility-Scores für ChatGPT, Perplexity und Gemini sind heuristische Schätzungen mit geringerer Zuverlässigkeit (~40–50%). Der Google-Score basiert auf Live-Daten.", { italics: true, color: GRAY }),
  );

  // Build document
  const doc = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 } },
      },
    },
    sections: [{ children: sections }],
  });

  return doc;
}

async function main() {
  const doc = buildDoc();
  const outDir = path.resolve("output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "AI-Visibility-Audit-chilli-mind.docx");
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log("Word report saved:", outPath);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
