const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");

// --- Color Palette (Consulting Aesthetic) ---
const C = {
  navy: "1B2A4A",
  navySecondary: "2D4A7A",
  teal: "00838F",
  amber: "F5A623",
  red: "C0392B",
  green: "27AE60",
  body: "333333",
  lightGray: "F4F6F8",
  medGray: "E0E4E8",
  darkGray: "666666",
  sourceGray: "999999",
  white: "FFFFFF",
};

// --- Layout Constants ---
const L = {
  headerBarH: 0.35,
  exhibitY: 0.5,
  titleY: 0.65,
  titleH: 0.6,
  contentTop: 1.4,
  contentBottom: 4.8,
  sourceY: 5.1,
  pageNumX: 9.1,
  marginLeft: 0.7,
  marginRight: 0.5,
  contentW: 8.6,
};

// --- Reusable Slide Components ---
function addHeaderBar(slide, pres) {
  slide.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: L.headerBarH,
    fill: { color: C.navy },
  });
  slide.addText("CONFIDENTIAL", {
    x: 0.3, y: 0, w: 2, h: L.headerBarH,
    fontSize: 7, fontFace: "Arial", color: C.white,
    bold: true, charSpacing: 2, valign: "middle",
  });
  slide.addText("chilli mind  |  AI Visibility Engine", {
    x: 5.5, y: 0, w: 4.2, h: L.headerBarH,
    fontSize: 7, fontFace: "Arial", color: C.white,
    align: "right", valign: "middle",
  });
}

function addExhibitLabel(slide, num) {
  slide.addText(`Exhibit ${num}`, {
    x: L.marginLeft, y: L.exhibitY, w: 2, h: 0.2,
    fontSize: 9, fontFace: "Arial", color: C.navy,
    bold: true, charSpacing: 3,
  });
}

function addActionTitle(slide, text) {
  slide.addText(text, {
    x: L.marginLeft, y: L.titleY, w: L.contentW, h: L.titleH,
    fontSize: 22, fontFace: "Arial", color: C.navy,
    bold: true, valign: "top",
  });
}

function addSourceLine(slide, text) {
  slide.addText(text, {
    x: L.marginLeft, y: L.sourceY, w: 7.5, h: 0.25,
    fontSize: 8, fontFace: "Arial", color: C.sourceGray,
    italic: true, valign: "middle",
  });
}

function addPageNumber(slide, num) {
  slide.addText(String(num), {
    x: L.pageNumX, y: L.sourceY, w: 0.5, h: 0.25,
    fontSize: 9, fontFace: "Arial", color: C.sourceGray,
    align: "right", valign: "middle",
  });
}

function makeContentSlide(pres, { exhibitNum, actionTitle, source, pageNum }) {
  const slide = pres.addSlide();
  slide.background = { color: C.white };
  addHeaderBar(slide, pres);
  if (exhibitNum) addExhibitLabel(slide, exhibitNum);
  addActionTitle(slide, actionTitle);
  if (source) addSourceLine(slide, source);
  addPageNumber(slide, pageNum);
  return slide;
}

// --- Helper: Table Row ---
function tableRow(cells, opts = {}) {
  return cells.map((cell) => {
    const base = {
      fontSize: 10, fontFace: "Arial", color: C.body,
      valign: "middle", margin: [2, 4, 2, 4],
    };
    if (typeof cell === "string") return { text: cell, options: { ...base, ...opts } };
    return { text: cell.text, options: { ...base, ...opts, ...cell.options } };
  });
}

function tableHeaderRow(cells) {
  return cells.map((text) => ({
    text,
    options: {
      fontSize: 9, fontFace: "Arial", color: C.white, bold: true,
      fill: { color: C.navy }, valign: "middle", margin: [3, 4, 3, 4],
    },
  }));
}

// ============================================================
// MAIN GENERATION
// ============================================================
async function generate() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "chilli mind x Florian Steiner";
  pres.title = "Managed GEO für den Mittelstand — Strategische Analyse";
  pres.subject = "CXO Strategy Deck";

  const outDir = path.resolve("output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // ============================================================
  // SLIDE 1: Titel
  // ============================================================
  const s1 = pres.addSlide();
  s1.background = { color: C.navy };

  s1.addText("Managed GEO\nfür den Mittelstand", {
    x: 0.8, y: 1.0, w: 8.4, h: 1.8,
    fontSize: 42, fontFace: "Arial", color: C.white,
    bold: true, lineSpacingMultiple: 1.1,
  });
  s1.addShape(pres.shapes.RECTANGLE, {
    x: 0.8, y: 2.9, w: 2.5, h: 0.04, fill: { color: C.teal },
  });
  s1.addText("Strategische Analyse & Empfehlung", {
    x: 0.8, y: 3.15, w: 8.4, h: 0.5,
    fontSize: 18, fontFace: "Arial", color: C.medGray,
  });
  s1.addText("chilli mind  |  AI Visibility Engine", {
    x: 0.8, y: 4.2, w: 8.4, h: 0.3,
    fontSize: 12, fontFace: "Arial", color: C.medGray,
  });
  s1.addText("Februar 2026  |  Vertraulich", {
    x: 0.8, y: 4.6, w: 8.4, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.medGray,
  });

  // ============================================================
  // SLIDE 2: Executive Summary (SCQA)
  // ============================================================
  const s2 = makeContentSlide(pres, {
    exhibitNum: 1,
    actionTitle: "chilli mind sollte jetzt ein Managed-GEO-Geschäft für den Mittelstand aufbauen — der Markt wächst auf $7,3 Mrd., das Segment ist unbesetzt, Break-even bei 3 Kunden",
    source: "Quellen: Grand View Research 2025, Gartner 2025, eigene Analyse",
    pageNum: 2,
  });

  // SCQA boxes
  const scqa = [
    { label: "SITUATION", color: C.navySecondary, text: "55% aller Google-Suchen zeigen AI-Antworten. 400M wöchentliche ChatGPT-Nutzer. Unternehmen werden unsichtbar." },
    { label: "KOMPLIKATION", color: C.red, text: "94% des Mittelstands haben keine AI-Strategie. Kein Anbieter fokussiert sich auf dieses Segment. Bestandskunden verlieren Sichtbarkeit." },
    { label: "FRAGE", color: C.amber, text: "Wie kann chilli mind die bestehenden 850+ Kundenbeziehungen nutzen, um ein neues, skalierbares Geschäftsfeld aufzubauen?" },
    { label: "ANTWORT", color: C.green, text: "Managed GEO als Full-Service für €20.000/Jahr. 60–70% Conversion bei Bestandskunden. Break-even bei nur 3 Kunden. €250K Marge bei 50." },
  ];

  scqa.forEach((item, i) => {
    const yPos = 1.45 + i * 0.85;
    // Label
    s2.addShape(pres.shapes.RECTANGLE, {
      x: L.marginLeft, y: yPos, w: 0.06, h: 0.7,
      fill: { color: item.color },
    });
    s2.addText(item.label, {
      x: L.marginLeft + 0.2, y: yPos, w: 1.6, h: 0.7,
      fontSize: 8, fontFace: "Arial", color: item.color,
      bold: true, charSpacing: 2, valign: "middle",
    });
    // Text
    s2.addText(item.text, {
      x: 2.5, y: yPos, w: 6.8, h: 0.7,
      fontSize: 11, fontFace: "Arial", color: C.body,
      valign: "middle",
    });
  });

  // ============================================================
  // SLIDE 3: Paradigmenwechsel (Pillar A: Warum JETZT?)
  // ============================================================
  const s3 = makeContentSlide(pres, {
    exhibitNum: 2,
    actionTitle: "AI verdrängt traditionelle Suche — 55% aller Google-Ergebnisse enthalten bereits AI-Antworten",
    source: "Quellen: Gartner 2025, OpenAI Earnings Q4 2025, Google I/O 2025",
    pageNum: 3,
  });

  // Section label for Pillar A
  s3.addText("SÄULE A: MARKT-IMPERATIV", {
    x: L.marginLeft, y: 1.3, w: 4, h: 0.2,
    fontSize: 8, fontFace: "Arial", color: C.teal,
    bold: true, charSpacing: 2,
  });

  // Three big stats
  const paradigmStats = [
    { num: "400M", label: "Wöchentliche\nChatGPT-Nutzer", sub: "+4.700% AI-Referral-Traffic YoY" },
    { num: "55%", label: "Google-Suchen mit\nAI Overviews", sub: "Gartner: −25% traditionelles Suchvolumen" },
    { num: "94%", label: "Mittelstand ohne\nAI-Strategie", sub: "Nur 31% haben überhaupt Schema Markup" },
  ];

  paradigmStats.forEach((st, i) => {
    const xPos = L.marginLeft + i * 3.0;
    s3.addShape(pres.shapes.RECTANGLE, {
      x: xPos, y: 1.65, w: 2.7, h: 2.5,
      fill: { color: C.lightGray },
    });
    s3.addText(st.num, {
      x: xPos, y: 1.85, w: 2.7, h: 0.8,
      fontSize: 44, fontFace: "Arial", color: C.navy,
      bold: true, align: "center",
    });
    s3.addText(st.label, {
      x: xPos + 0.2, y: 2.7, w: 2.3, h: 0.6,
      fontSize: 12, fontFace: "Arial", color: C.body,
      align: "center", bold: true,
    });
    s3.addText(st.sub, {
      x: xPos + 0.2, y: 3.35, w: 2.3, h: 0.5,
      fontSize: 9, fontFace: "Arial", color: C.darkGray,
      align: "center",
    });
  });

  // Bottom insight bar
  s3.addShape(pres.shapes.RECTANGLE, {
    x: L.marginLeft, y: 4.35, w: L.contentW, h: 0.5,
    fill: { color: C.navy },
  });
  s3.addText("Wer hier nicht auftaucht, existiert für eine wachsende Zielgruppe nicht.", {
    x: L.marginLeft, y: 4.35, w: L.contentW, h: 0.5,
    fontSize: 12, fontFace: "Arial", color: C.white,
    bold: true, align: "center", valign: "middle",
  });

  // ============================================================
  // SLIDE 4: Marktgröße
  // ============================================================
  const s4 = makeContentSlide(pres, {
    exhibitNum: 3,
    actionTitle: "Der globale GEO-Markt wächst von $848M auf $7,3 Mrd. — DACH erreicht €500M bis 2028",
    source: "Quellen: Grand View Research 2025, eigene DACH-Schätzung",
    pageNum: 4,
  });

  // Bar chart simulation - global market
  s4.addText("Globaler GEO-Markt (USD)", {
    x: L.marginLeft, y: 1.4, w: 4, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.darkGray, bold: true,
  });

  const marketBars = [
    { year: "2025", val: 848, maxW: 0.8, label: "$848M" },
    { year: "2028", val: 2500, maxW: 2.4, label: "~$2,5 Mrd." },
    { year: "2031", val: 7300, maxW: 7.0, label: "$7,3 Mrd." },
  ];

  marketBars.forEach((bar, i) => {
    const yPos = 1.85 + i * 0.65;
    s4.addText(bar.year, {
      x: L.marginLeft, y: yPos, w: 0.6, h: 0.4,
      fontSize: 11, fontFace: "Arial", color: C.body, bold: true, valign: "middle",
    });
    s4.addShape(pres.shapes.RECTANGLE, {
      x: 1.5, y: yPos + 0.05, w: bar.maxW, h: 0.3,
      fill: { color: i === 2 ? C.navy : C.navySecondary },
    });
    s4.addText(bar.label, {
      x: 1.5 + bar.maxW + 0.15, y: yPos, w: 1.5, h: 0.4,
      fontSize: 11, fontFace: "Arial", color: C.navy, bold: true, valign: "middle",
    });
  });

  s4.addText("CAGR 34%", {
    x: 7.5, y: 1.85, w: 1.5, h: 0.4,
    fontSize: 14, fontFace: "Arial", color: C.green, bold: true, align: "center",
  });

  // DACH sizing table
  s4.addText("DACH-Markt (EUR)", {
    x: L.marginLeft, y: 3.55, w: 4, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.darkGray, bold: true,
  });

  const dachData = [
    tableHeaderRow(["Zeitraum", "DACH GEO-Markt", "Unser SOM"]),
    tableRow(["2025", "70–85 Mio.", "—"]),
    tableRow(["2026", "110–140 Mio.", { text: "€250K–1,5M", options: { bold: true, color: C.teal } }]),
    tableRow(["2028", "350–500 Mio.", { text: "Skalierung", options: { bold: true, color: C.teal } }]),
  ];

  s4.addTable(dachData, {
    x: L.marginLeft, y: 3.85, w: 8.6,
    fontSize: 10, fontFace: "Arial",
    border: { type: "solid", pt: 0.5, color: C.medGray },
    rowH: 0.32,
    autoPage: false,
  });

  // ============================================================
  // SLIDE 5: Wettbewerbslandschaft (Pillar B: Warum WIR?)
  // ============================================================
  const s5 = makeContentSlide(pres, {
    exhibitNum: 4,
    actionTitle: "33 Wettbewerber — aber keiner fokussiert den industriellen Mittelstand mit Managed Service",
    source: "Quellen: Crunchbase, G2, Produktrecherche Februar 2026",
    pageNum: 5,
  });

  s5.addText("SÄULE B: STRATEGISCHER VORTEIL", {
    x: L.marginLeft, y: 1.3, w: 4, h: 0.2,
    fontSize: 8, fontFace: "Arial", color: C.teal,
    bold: true, charSpacing: 2,
  });

  // Positioning matrix
  s5.addText("Self-Serve SaaS", {
    x: 3.6, y: 1.5, w: 2.5, h: 0.25,
    fontSize: 8, fontFace: "Arial", color: C.darkGray, align: "center", italic: true,
  });
  s5.addText("Managed Service", {
    x: 3.6, y: 4.35, w: 2.5, h: 0.25,
    fontSize: 8, fontFace: "Arial", color: C.darkGray, align: "center", italic: true,
  });
  s5.addText("Günstig", {
    x: 0.7, y: 2.8, w: 1.0, h: 0.25,
    fontSize: 8, fontFace: "Arial", color: C.darkGray, italic: true,
  });
  s5.addText("Premium", {
    x: 8.1, y: 2.8, w: 1.0, h: 0.25,
    fontSize: 8, fontFace: "Arial", color: C.darkGray, align: "right", italic: true,
  });

  // Axes
  s5.addShape(pres.shapes.LINE, {
    x: 1.8, y: 1.8, w: 6.2, h: 0, line: { color: C.medGray, width: 1 },
  });
  s5.addShape(pres.shapes.LINE, {
    x: 1.8, y: 4.3, w: 6.2, h: 0, line: { color: C.medGray, width: 1 },
  });
  s5.addShape(pres.shapes.LINE, {
    x: 1.8, y: 1.8, w: 0, h: 2.5, line: { color: C.medGray, width: 1 },
  });
  s5.addShape(pres.shapes.LINE, {
    x: 8.0, y: 1.8, w: 0, h: 2.5, line: { color: C.medGray, width: 1 },
  });

  // Competitors as bubbles
  const competitors = [
    { name: "Rankscale\n€20/Mo", x: 2.5, y: 1.9, size: 0.6, color: C.darkGray },
    { name: "Otterly\n$29/Mo", x: 3.8, y: 2.0, size: 0.7, color: C.darkGray },
    { name: "Peec AI\n€89/Mo\n$29M", x: 5.5, y: 1.85, size: 0.9, color: C.red },
    { name: "Profound\n$99/Mo\n$58.5M", x: 7.0, y: 3.0, size: 1.0, color: C.red },
    { name: "Semrush\nAhrefs", x: 3.0, y: 2.7, size: 0.7, color: C.darkGray },
  ];

  competitors.forEach((c) => {
    s5.addShape(pres.shapes.OVAL, {
      x: c.x, y: c.y, w: c.size, h: c.size,
      fill: { color: C.lightGray },
      line: { color: c.color, width: 1.5 },
    });
    s5.addText(c.name, {
      x: c.x - 0.1, y: c.y + c.size + 0.02, w: c.size + 0.2, h: 0.4,
      fontSize: 7, fontFace: "Arial", color: c.color, align: "center",
    });
  });

  // "WIR" bubble - highlighted
  s5.addShape(pres.shapes.OVAL, {
    x: 6.4, y: 3.5, w: 1.0, h: 0.7,
    fill: { color: C.teal },
  });
  s5.addText("WIR", {
    x: 6.4, y: 3.5, w: 1.0, h: 0.7,
    fontSize: 14, fontFace: "Arial", color: C.white,
    bold: true, align: "center", valign: "middle",
  });
  s5.addText("Premium\nManaged\nMittelstand", {
    x: 6.2, y: 4.2, w: 1.4, h: 0.5,
    fontSize: 7, fontFace: "Arial", color: C.teal, align: "center", bold: true,
  });

  // Callout
  s5.addShape(pres.shapes.RECTANGLE, {
    x: L.marginLeft, y: 4.65, w: L.contentW, h: 0.35,
    fill: { color: C.lightGray },
  });
  s5.addText("→  Leere Ecke: Kein Wettbewerber bietet Premium Managed GEO für den industriellen Mittelstand im DACH-Raum", {
    x: L.marginLeft + 0.1, y: 4.65, w: L.contentW - 0.2, h: 0.35,
    fontSize: 10, fontFace: "Arial", color: C.navy,
    bold: true, valign: "middle",
  });

  // ============================================================
  // SLIDE 6: USP Moat
  // ============================================================
  const s6 = makeContentSlide(pres, {
    exhibitNum: 5,
    actionTitle: "Drei schwer kopierbare Assets geben chilli mind einen strukturellen Vorteil gegenüber allen Wettbewerbern",
    source: "",
    pageNum: 6,
  });

  const moats = [
    {
      title: "25 Jahre Kundenvertrauen",
      items: ["850+ Projekte seit 2001", "Siemens, B.Braun, Bosch-Referenzen", "Mittelstand kauft über Beziehung"],
      why: "Kein Startup, kein US-Tool kann das replizieren",
      color: C.navy,
    },
    {
      title: "60–70% Bestandskunden-Conversion",
      items: ["vs. 5–20% bei Neukunden", "Gratis-Scan als Schock-Moment", "Kein Cold Outreach nötig"],
      why: "Jeder ohne Kundenstamm braucht 5–10× mehr CAC",
      color: C.teal,
    },
    {
      title: "DSGVO-Native, German-Built",
      items: ["Kein US CLOUD Act", "Kein Schrems-III-Risiko", "EU AI Act als Feature (Art. 50)"],
      why: "Profound, Relixir — alle US-Tools haben dieses Problem",
      color: C.green,
    },
  ];

  moats.forEach((m, i) => {
    const xPos = L.marginLeft + i * 3.05;
    // Card
    s6.addShape(pres.shapes.RECTANGLE, {
      x: xPos, y: 1.4, w: 2.8, h: 3.2,
      fill: { color: C.white },
      line: { color: C.medGray, width: 1 },
    });
    // Top color bar
    s6.addShape(pres.shapes.RECTANGLE, {
      x: xPos, y: 1.4, w: 2.8, h: 0.06,
      fill: { color: m.color },
    });
    // Number
    s6.addShape(pres.shapes.OVAL, {
      x: xPos + 1.05, y: 1.55, w: 0.7, h: 0.7,
      fill: { color: m.color },
    });
    s6.addText(String(i + 1), {
      x: xPos + 1.05, y: 1.55, w: 0.7, h: 0.7,
      fontSize: 22, fontFace: "Arial", color: C.white,
      bold: true, align: "center", valign: "middle",
    });
    // Title
    s6.addText(m.title, {
      x: xPos + 0.15, y: 2.35, w: 2.5, h: 0.45,
      fontSize: 11, fontFace: "Arial", color: C.navy,
      bold: true, align: "center",
    });
    // Items
    m.items.forEach((item, j) => {
      s6.addText(`•  ${item}`, {
        x: xPos + 0.2, y: 2.85 + j * 0.3, w: 2.4, h: 0.28,
        fontSize: 9.5, fontFace: "Arial", color: C.body,
        valign: "middle",
      });
    });
    // Why box
    s6.addShape(pres.shapes.RECTANGLE, {
      x: xPos + 0.1, y: 3.85, w: 2.6, h: 0.55,
      fill: { color: C.lightGray },
    });
    s6.addText(m.why, {
      x: xPos + 0.2, y: 3.85, w: 2.4, h: 0.55,
      fontSize: 8, fontFace: "Arial", color: C.darkGray,
      italic: true, valign: "middle",
    });
  });

  // ============================================================
  // SLIDE 7: Produkt 4-Säulen
  // ============================================================
  const s7 = makeContentSlide(pres, {
    exhibitNum: 6,
    actionTitle: "Vier Säulen für €20.000/Jahr: Audit, Implementierung, Monitoring und Garantie — alles aus einer Hand",
    source: "",
    pageNum: 7,
  });

  const pillars = [
    { nr: "1", title: "AI Visibility\nAudit", desc: "Vollständige Analyse über alle AI-Suchmaschinen + Competitor Benchmark + 60-Seiten-Report", value: "Wert: €5.000", color: C.navy },
    { nr: "2", title: "Schema &\nEntity Impl.", desc: "JSON-LD für alle Seiten, Entity-Linking (Wikipedia, Wikidata), Knowledge Panel Setup", value: "Wert: €8.000", color: C.teal },
    { nr: "3", title: "Continuous\nMonitoring", desc: "Monatlicher AI Visibility Score, Competitor Tracking, Trend-Reports, 4× Strategy Calls/Jahr", value: "Wert: €12.000", color: C.green },
    { nr: "4", title: "Erfolgs-\nGarantie", desc: "Kein messbarer Fortschritt nach 6 Monaten → nächste 6 Monate kostenlos", value: "Risikofrei", color: C.amber },
  ];

  pillars.forEach((p, i) => {
    const xPos = L.marginLeft + i * 2.25;
    s7.addShape(pres.shapes.RECTANGLE, {
      x: xPos, y: 1.5, w: 2.0, h: 2.8,
      fill: { color: C.lightGray },
    });
    s7.addShape(pres.shapes.RECTANGLE, {
      x: xPos, y: 1.5, w: 2.0, h: 0.06,
      fill: { color: p.color },
    });
    s7.addShape(pres.shapes.OVAL, {
      x: xPos + 0.65, y: 1.65, w: 0.7, h: 0.7,
      fill: { color: p.color },
    });
    s7.addText(p.nr, {
      x: xPos + 0.65, y: 1.65, w: 0.7, h: 0.7,
      fontSize: 20, fontFace: "Arial", color: C.white,
      bold: true, align: "center", valign: "middle",
    });
    s7.addText(p.title, {
      x: xPos + 0.1, y: 2.4, w: 1.8, h: 0.55,
      fontSize: 10, fontFace: "Arial", color: C.navy,
      bold: true, align: "center",
    });
    s7.addText(p.desc, {
      x: xPos + 0.1, y: 3.0, w: 1.8, h: 0.8,
      fontSize: 8, fontFace: "Arial", color: C.body,
      align: "center",
    });
    s7.addText(p.value, {
      x: xPos, y: 3.9, w: 2.0, h: 0.3,
      fontSize: 9, fontFace: "Arial", color: p.color,
      bold: true, align: "center",
    });
  });

  // Pricing bar
  s7.addShape(pres.shapes.RECTANGLE, {
    x: L.marginLeft, y: 4.5, w: L.contentW, h: 0.5,
    fill: { color: C.navy },
  });
  s7.addText([
    { text: "Gesamtwert: €29.000  →  ", options: { color: C.medGray, fontSize: 14 } },
    { text: "€20.000/Jahr", options: { color: C.white, fontSize: 18, bold: true } },
    { text: "   =  €1.667/Monat", options: { color: C.medGray, fontSize: 12 } },
  ], {
    x: L.marginLeft, y: 4.5, w: L.contentW, h: 0.5,
    fontFace: "Arial", align: "center", valign: "middle",
  });

  // ============================================================
  // SLIDE 8: Unit Economics (Pillar C: Warum FUNKTIONIERT?)
  // ============================================================
  const s8 = makeContentSlide(pres, {
    exhibitNum: 7,
    actionTitle: "Break-even bei 3 Kunden — €250K Marge bei 50 Kunden, ohne eigenes Personal",
    source: "Subunternehmer-Modell: chilli mind verkauft, Florian Steiner liefert",
    pageNum: 8,
  });

  s8.addText("SÄULE C: WIRTSCHAFTLICHER CASE", {
    x: L.marginLeft, y: 1.3, w: 4, h: 0.2,
    fontSize: 8, fontFace: "Arial", color: C.teal,
    bold: true, charSpacing: 2,
  });

  // Left: Revenue model
  s8.addText("Revenue-Modell pro Kunde", {
    x: L.marginLeft, y: 1.55, w: 4, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.darkGray, bold: true,
  });

  const unitEcon = [
    tableHeaderRow(["Kennzahl", "Wert"]),
    tableRow(["Retainer-Preis", { text: "€20.000/Jahr", options: { bold: true } }]),
    tableRow(["Marge chilli mind (25%)", { text: "€5.000/Jahr", options: { bold: true, color: C.green } }]),
    tableRow(["Delivery (75%)", "€15.000/Jahr"]),
    tableRow(["Variable Kosten", "~€200/Jahr"]),
    tableRow(["Zeitaufwand Delivery", "~38,5h/Jahr"]),
    tableRow(["Effektiver Stundensatz", { text: "~€508/h", options: { bold: true, color: C.teal } }]),
  ];

  s8.addTable(unitEcon, {
    x: L.marginLeft, y: 1.85, w: 4.2,
    fontSize: 10, fontFace: "Arial",
    border: { type: "solid", pt: 0.5, color: C.medGray },
    rowH: 0.3,
    autoPage: false,
  });

  // Right: Scaling
  s8.addText("Skalierung", {
    x: 5.2, y: 1.55, w: 4, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.darkGray, bold: true,
  });

  const scaling = [
    { customers: "3", margin: "€15K", note: "Break-even", color: C.amber },
    { customers: "10", margin: "€50K", note: "7,4h/Woche", color: C.teal },
    { customers: "20", margin: "€100K", note: "Teilzeit-Delivery", color: C.green },
    { customers: "50", margin: "€250K", note: "Vollauslastung", color: C.green },
  ];

  scaling.forEach((s, i) => {
    const yPos = 1.95 + i * 0.55;
    const barW = (parseInt(s.margin.replace(/[^0-9]/g, "")) / 250) * 3.0;

    s8.addText(s.customers, {
      x: 5.2, y: yPos, w: 0.5, h: 0.4,
      fontSize: 18, fontFace: "Arial", color: C.navy, bold: true, align: "center", valign: "middle",
    });
    s8.addText("Kunden", {
      x: 5.2, y: yPos + 0.28, w: 0.5, h: 0.2,
      fontSize: 7, fontFace: "Arial", color: C.darkGray, align: "center",
    });
    s8.addShape(pres.shapes.RECTANGLE, {
      x: 5.85, y: yPos + 0.05, w: Math.max(barW, 0.4), h: 0.3,
      fill: { color: s.color },
    });
    s8.addText(s.margin, {
      x: 5.85 + Math.max(barW, 0.4) + 0.1, y: yPos, w: 1.0, h: 0.4,
      fontSize: 12, fontFace: "Arial", color: s.color, bold: true, valign: "middle",
    });
    s8.addText(s.note, {
      x: 8.2, y: yPos, w: 1.2, h: 0.4,
      fontSize: 9, fontFace: "Arial", color: C.darkGray, valign: "middle",
    });
  });

  // Bottom callout
  s8.addShape(pres.shapes.RECTANGLE, {
    x: L.marginLeft, y: 4.35, w: L.contentW, h: 0.5,
    fill: { color: C.lightGray },
  });
  s8.addText("→  Kein Personalaufwand für chilli mind — Delivery komplett über Subunternehmer, 80%+ AI-automatisiert", {
    x: L.marginLeft + 0.1, y: 4.35, w: L.contentW - 0.2, h: 0.5,
    fontSize: 11, fontFace: "Arial", color: C.navy, bold: true, valign: "middle",
  });

  // ============================================================
  // SLIDE 9: Conversion-Vorteil
  // ============================================================
  const s9 = makeContentSlide(pres, {
    exhibitNum: 8,
    actionTitle: "60–70% Conversion bei Bestandskunden senkt den CAC auf nahe null — der Scan ist der Türöffner",
    source: "",
    pageNum: 9,
  });

  // Funnel visualization
  const funnel = [
    { label: "850+ Bestandskunden", w: 8.0, color: C.lightGray, textColor: C.navy, detail: "chilli mind Portfolio seit 2001" },
    { label: "Top 30 scannen (Gratis)", w: 6.5, color: C.medGray, textColor: C.navy, detail: "Kostenloser Quick-Scan als Lead Magnet" },
    { label: "60–70% zeigen Interesse", w: 5.0, color: C.navySecondary, textColor: C.white, detail: "Schock-Moment: 'Ihre AI-Sichtbarkeit liegt bei 21/100'" },
    { label: "30–40% buchen Retainer", w: 3.5, color: C.navy, textColor: C.white, detail: "€20.000/Jahr — Audit + Implementierung + Monitoring" },
    { label: "→ 10+ Kunden in 6 Monaten", w: 2.5, color: C.teal, textColor: C.white, detail: "= €50K+ Marge für chilli mind" },
  ];

  funnel.forEach((f, i) => {
    const yPos = 1.5 + i * 0.62;
    const xPos = (10 - f.w) / 2;
    s9.addShape(pres.shapes.RECTANGLE, {
      x: xPos, y: yPos, w: f.w, h: 0.48,
      fill: { color: f.color },
    });
    s9.addText(f.label, {
      x: xPos + 0.2, y: yPos, w: f.w * 0.55, h: 0.48,
      fontSize: 11, fontFace: "Arial", color: f.textColor,
      bold: true, valign: "middle",
    });
    s9.addText(f.detail, {
      x: xPos + f.w * 0.55, y: yPos, w: f.w * 0.43, h: 0.48,
      fontSize: 9, fontFace: "Arial", color: f.textColor,
      valign: "middle", align: "right",
    });
  });

  // Comparison
  s9.addShape(pres.shapes.RECTANGLE, {
    x: L.marginLeft, y: 4.35, w: 4.0, h: 0.5,
    fill: { color: C.lightGray },
  });
  s9.addText([
    { text: "Bestandskunden: ", options: { bold: true, color: C.navy } },
    { text: "60–70% Conversion", options: { bold: true, color: C.green } },
  ], {
    x: L.marginLeft + 0.15, y: 4.35, w: 3.7, h: 0.5,
    fontSize: 11, fontFace: "Arial", valign: "middle",
  });

  s9.addShape(pres.shapes.RECTANGLE, {
    x: 5.0, y: 4.35, w: 4.3, h: 0.5,
    fill: { color: C.lightGray },
  });
  s9.addText([
    { text: "Neukunden-Benchmark: ", options: { bold: true, color: C.navy } },
    { text: "5–20% Conversion", options: { color: C.red } },
  ], {
    x: 5.15, y: 4.35, w: 4.0, h: 0.5,
    fontSize: 11, fontFace: "Arial", valign: "middle",
  });

  // ============================================================
  // SLIDE 10: GTM 3-Phasen
  // ============================================================
  const s10 = makeContentSlide(pres, {
    exhibitNum: 9,
    actionTitle: "Risikoarmer Start bei Bestandskunden — Skalierung auf €250K–1,5M EUR über drei Phasen",
    source: "",
    pageNum: 10,
  });

  const phases = [
    {
      phase: "Phase 1", title: "Bestandskunden\naktivieren", timeline: "Monat 1–3",
      items: ["Gratis Quick-Scan an Top-30 Kunden", "Schock-Moment triggert Interesse", "Audit-to-Retainer: 30–40%"],
      target: "Ziel: 5–10 Kunden", color: C.navy,
    },
    {
      phase: "Phase 2", title: "Netzwerk-\nExpansion", timeline: "Monat 3–6",
      items: ["Speaking: IHK, Mittelstandsverbände", "Case Studies als Referenz", "Referral durch zufriedene Kunden"],
      target: "Ziel: 15–25 Kunden", color: C.teal,
    },
    {
      phase: "Phase 3", title: "Skalierung &\nVertikalen", timeline: "Monat 6–12",
      items: ["Industrial B2B, MedTech, Automotive", "Partner-Agenturen als Reseller", "White-Label-Reports"],
      target: "Ziel: 50+ Kunden", color: C.green,
    },
  ];

  phases.forEach((p, i) => {
    const xPos = L.marginLeft + i * 3.05;
    // Card
    s10.addShape(pres.shapes.RECTANGLE, {
      x: xPos, y: 1.5, w: 2.8, h: 3.2,
      fill: { color: C.white },
      line: { color: C.medGray, width: 1 },
    });
    // Color top bar
    s10.addShape(pres.shapes.RECTANGLE, {
      x: xPos, y: 1.5, w: 2.8, h: 0.06,
      fill: { color: p.color },
    });
    // Phase label
    s10.addText(p.phase, {
      x: xPos + 0.15, y: 1.6, w: 1.2, h: 0.25,
      fontSize: 9, fontFace: "Arial", color: p.color,
      bold: true, charSpacing: 2,
    });
    s10.addText(p.timeline, {
      x: xPos + 1.3, y: 1.6, w: 1.3, h: 0.25,
      fontSize: 8, fontFace: "Arial", color: C.darkGray,
      align: "right",
    });
    // Title
    s10.addText(p.title, {
      x: xPos + 0.15, y: 1.9, w: 2.5, h: 0.55,
      fontSize: 13, fontFace: "Arial", color: C.navy,
      bold: true,
    });
    // Items
    p.items.forEach((item, j) => {
      s10.addText(`•  ${item}`, {
        x: xPos + 0.15, y: 2.55 + j * 0.35, w: 2.5, h: 0.3,
        fontSize: 9, fontFace: "Arial", color: C.body,
        valign: "middle",
      });
    });
    // Target
    s10.addShape(pres.shapes.RECTANGLE, {
      x: xPos + 0.1, y: 3.9, w: 2.6, h: 0.4,
      fill: { color: p.color },
    });
    s10.addText(p.target, {
      x: xPos + 0.1, y: 3.9, w: 2.6, h: 0.4,
      fontSize: 10, fontFace: "Arial", color: C.white,
      bold: true, align: "center", valign: "middle",
    });
  });

  // Arrow connectors
  s10.addText("→", {
    x: 3.55, y: 2.7, w: 0.5, h: 0.3,
    fontSize: 18, fontFace: "Arial", color: C.darkGray, align: "center",
  });
  s10.addText("→", {
    x: 6.6, y: 2.7, w: 0.5, h: 0.3,
    fontSize: 18, fontFace: "Arial", color: C.darkGray, align: "center",
  });

  // ============================================================
  // SLIDE 11: Live Demo
  // ============================================================
  const s11 = makeContentSlide(pres, {
    exhibitNum: 10,
    actionTitle: "Der Scanner liefert in 60 Sekunden einen vollständigen Report — hier das Ergebnis für chilli-mind.com",
    source: "Quelle: AI Visibility Engine Scan, 15. Februar 2026",
    pageNum: 11,
  });

  // Score circle
  s11.addShape(pres.shapes.OVAL, {
    x: L.marginLeft, y: 1.55, w: 1.8, h: 1.8,
    fill: { color: C.lightGray },
    line: { color: C.amber, width: 5 },
  });
  s11.addText("47", {
    x: L.marginLeft, y: 1.65, w: 1.8, h: 1.2,
    fontSize: 44, fontFace: "Arial", color: C.amber,
    bold: true, align: "center",
  });
  s11.addText("von 100", {
    x: L.marginLeft, y: 2.7, w: 1.8, h: 0.3,
    fontSize: 10, fontFace: "Arial", color: C.darkGray,
    align: "center",
  });
  s11.addText("chilli-mind.com", {
    x: L.marginLeft, y: 2.95, w: 1.8, h: 0.25,
    fontSize: 9, fontFace: "Arial", color: C.darkGray,
    align: "center",
  });

  // Score bars
  const scores = [
    { label: "AI Visibility", val: 21, col: C.red, detail: "0/10 Erwähnungen in Google AI" },
    { label: "Schema Health", val: 45, col: C.amber, detail: "6 von 9 Schema-Typen fehlen" },
    { label: "Technical SEO", val: 85, col: C.green, detail: "Technisch gut aufgestellt" },
  ];

  scores.forEach((sc, i) => {
    const yPos = 1.65 + i * 0.7;
    s11.addText(sc.label, {
      x: 2.9, y: yPos, w: 1.5, h: 0.25,
      fontSize: 10, fontFace: "Arial", color: C.navy, bold: true,
    });
    // Bar background
    s11.addShape(pres.shapes.RECTANGLE, {
      x: 4.6, y: yPos + 0.03, w: 3.2, h: 0.2,
      fill: { color: C.lightGray },
    });
    // Bar fill
    s11.addShape(pres.shapes.RECTANGLE, {
      x: 4.6, y: yPos + 0.03, w: 3.2 * (sc.val / 100), h: 0.2,
      fill: { color: sc.col },
    });
    // Value
    s11.addText(String(sc.val), {
      x: 7.9, y: yPos - 0.02, w: 0.6, h: 0.3,
      fontSize: 14, fontFace: "Arial", color: sc.col, bold: true,
    });
    // Detail
    s11.addText(sc.detail, {
      x: 2.9, y: yPos + 0.26, w: 5.5, h: 0.22,
      fontSize: 8, fontFace: "Arial", color: C.darkGray,
    });
  });

  // Missing queries
  s11.addText("Top fehlende AI-Erwähnungen:", {
    x: L.marginLeft, y: 3.55, w: 4, h: 0.25,
    fontSize: 9, fontFace: "Arial", color: C.navy, bold: true,
  });

  const queries = [
    `\u201EBest digital consultancies in Germany\u201C`,
    `\u201ETop HMI design companies\u201C`,
    `\u201EUX design agencies enterprise Europe\u201C`,
    `\u201EIndustrial UI design firms DACH\u201C`,
    `\u201EDigital transformation consultancy Germany\u201C`,
  ];

  queries.forEach((q, i) => {
    const yPos = 3.82 + i * 0.26;
    s11.addText("✗", {
      x: L.marginLeft + 0.1, y: yPos, w: 0.2, h: 0.22,
      fontSize: 10, fontFace: "Arial", color: C.red, bold: true,
    });
    s11.addText(q, {
      x: L.marginLeft + 0.4, y: yPos, w: 4.5, h: 0.22,
      fontSize: 9, fontFace: "Arial", color: C.body,
    });
  });

  // Right side: Quick wins preview
  s11.addText("Quick Wins (sofort umsetzbar):", {
    x: 5.4, y: 3.55, w: 4, h: 0.25,
    fontSize: 9, fontFace: "Arial", color: C.navy, bold: true,
  });

  const quickWins = [
    { fix: "FAQ Schema hinzufügen", impact: "+15 Pkt" },
    { fix: "Service/Product Schema", impact: "+15 Pkt" },
    { fix: "Wikipedia sameAs-Links", impact: "2,5× Sichtbarkeit" },
    { fix: "Organization Schema vervollständigen", impact: "33%→100%" },
    { fix: "H1-Struktur korrigieren", impact: "SEO + AI" },
  ];

  quickWins.forEach((qw, i) => {
    const yPos = 3.82 + i * 0.26;
    s11.addText("✓", {
      x: 5.5, y: yPos, w: 0.2, h: 0.22,
      fontSize: 10, fontFace: "Arial", color: C.green, bold: true,
    });
    s11.addText(qw.fix, {
      x: 5.8, y: yPos, w: 2.2, h: 0.22,
      fontSize: 9, fontFace: "Arial", color: C.body,
    });
    s11.addText(qw.impact, {
      x: 8.1, y: yPos, w: 1.2, h: 0.22,
      fontSize: 9, fontFace: "Arial", color: C.green, bold: true, align: "right",
    });
  });

  // ============================================================
  // SLIDE 12: Risiken
  // ============================================================
  const s12 = makeContentSlide(pres, {
    exhibitNum: 11,
    actionTitle: "Die drei größten Risiken sind beherrschbar — keines bedroht das Geschäftsmodell fundamental",
    source: "",
    pageNum: 12,
  });

  const risks = [
    tableHeaderRow(["Risiko", "Wahrscheinl.", "Impact", "Mitigation"]),
    tableRow([
      { text: "Profound/Peec expandieren nach DACH", options: { bold: true } },
      "Mittel",
      { text: "Hoch", options: { color: C.red, bold: true } },
      "Vorsprung durch bestehende Kundenbeziehungen + DSGVO-Positionierung",
    ]),
    tableRow([
      { text: "Bestandskunden sehen keinen Bedarf", options: { bold: true } },
      "Mittel",
      { text: "Hoch", options: { color: C.red, bold: true } },
      "Gratis-Scan als Schock-Moment, Wettbewerber-Vergleich als Trigger",
    ]),
    tableRow([
      { text: "Google/OpenAI ändern AI-Ranking", options: { bold: true } },
      { text: "Hoch", options: { bold: true } },
      "Mittel",
      "Modulare Scanner-Architektur — neue Signale schnell integrierbar",
    ]),
    tableRow([
      { text: "Semrush/Ahrefs bauen gutes GEO", options: { bold: true } },
      "Mittel",
      { text: "Niedrig", options: { color: C.green } },
      "GEO bleibt Bolt-on bei Incumbents, kein Managed Service",
    ]),
    tableRow([
      { text: "EU AI Act verzögert sich", options: { bold: true } },
      { text: "Niedrig", options: { color: C.green } },
      { text: "Niedrig", options: { color: C.green } },
      "Regulatorisches Narrativ ist Bonus, nicht Kern-Value-Prop",
    ]),
  ];

  s12.addTable(risks, {
    x: L.marginLeft, y: 1.45, w: 8.6,
    fontSize: 9, fontFace: "Arial",
    border: { type: "solid", pt: 0.5, color: C.medGray },
    rowH: 0.45,
    colW: [2.5, 1.0, 0.8, 4.3],
    autoPage: false,
  });

  // Key insight
  s12.addShape(pres.shapes.RECTANGLE, {
    x: L.marginLeft, y: 4.35, w: L.contentW, h: 0.5,
    fill: { color: C.lightGray },
  });
  s12.addText("→  Hauptrisiko ist nicht Wettbewerb, sondern Trägheit — deshalb ist der Gratis-Scan als Katalysator so wichtig", {
    x: L.marginLeft + 0.1, y: 4.35, w: L.contentW - 0.2, h: 0.5,
    fontSize: 11, fontFace: "Arial", color: C.navy,
    bold: true, valign: "middle",
  });

  // ============================================================
  // SLIDE 13: Nächste Schritte
  // ============================================================
  const s13 = makeContentSlide(pres, {
    exhibitNum: 12,
    actionTitle: "Vier Schritte in vier Wochen generieren eine Pipeline von €60K+ EUR",
    source: "",
    pageNum: 13,
  });

  const steps = [
    {
      week: "Woche 1", title: "Quick Wins umsetzen",
      desc: "FAQ Schema, Product Schema und sameAs-Links für chilli-mind.com implementieren",
      result: "Score von 47 → 75+", color: C.navy,
    },
    {
      week: "Woche 2", title: "Ersten Kunden scannen",
      desc: "Pilot-Scan eines chilli mind Bestandskunden, personalisierter 60-Seiten-Report",
      result: "Erster Proof-of-Concept", color: C.teal,
    },
    {
      week: "Woche 3", title: "Pipeline aufbauen",
      desc: "Gratis-Scans an Top-10 Bestandskunden senden, Interesse messen",
      result: "5–7 warme Leads", color: C.green,
    },
    {
      week: "Woche 4", title: "Erstes Closing",
      desc: "Strategy Call mit interessierten Kunden, Audit-to-Retainer Conversion",
      result: "1–3 Retainer à €20K", color: C.green,
    },
  ];

  steps.forEach((step, i) => {
    const yPos = 1.5 + i * 0.78;
    // Timeline dot + line
    s13.addShape(pres.shapes.OVAL, {
      x: L.marginLeft + 0.15, y: yPos + 0.12, w: 0.3, h: 0.3,
      fill: { color: step.color },
    });
    if (i < steps.length - 1) {
      s13.addShape(pres.shapes.LINE, {
        x: L.marginLeft + 0.3, y: yPos + 0.42, w: 0, h: 0.48,
        line: { color: C.medGray, width: 2 },
      });
    }
    // Week label
    s13.addText(step.week, {
      x: L.marginLeft + 0.6, y: yPos, w: 1.2, h: 0.3,
      fontSize: 10, fontFace: "Arial", color: step.color, bold: true,
    });
    // Title
    s13.addText(step.title, {
      x: 2.5, y: yPos, w: 3.5, h: 0.3,
      fontSize: 13, fontFace: "Arial", color: C.navy, bold: true,
    });
    // Description
    s13.addText(step.desc, {
      x: 2.5, y: yPos + 0.3, w: 4.0, h: 0.3,
      fontSize: 9, fontFace: "Arial", color: C.body,
    });
    // Result badge
    s13.addShape(pres.shapes.RECTANGLE, {
      x: 7.3, y: yPos + 0.05, w: 2.0, h: 0.4,
      fill: { color: step.color },
    });
    s13.addText(step.result, {
      x: 7.3, y: yPos + 0.05, w: 2.0, h: 0.4,
      fontSize: 9, fontFace: "Arial", color: C.white,
      bold: true, align: "center", valign: "middle",
    });
  });

  // Bottom CTA
  s13.addShape(pres.shapes.RECTANGLE, {
    x: L.marginLeft, y: 4.55, w: L.contentW, h: 0.45,
    fill: { color: C.navy },
  });
  s13.addText("Nächster Schritt: Einen Pilot-Kunden wählen — wir scannen kostenlos, Ergebnis in 48 Stunden", {
    x: L.marginLeft, y: 4.55, w: L.contentW, h: 0.45,
    fontSize: 12, fontFace: "Arial", color: C.white,
    bold: true, align: "center", valign: "middle",
  });

  // ============================================================
  // SLIDE 14: Appendix — Quellen & Kontakt
  // ============================================================
  const s14 = pres.addSlide();
  s14.background = { color: C.white };
  addHeaderBar(s14, pres);
  addPageNumber(s14, 14);

  s14.addText("Appendix: Quellen & Kontakt", {
    x: L.marginLeft, y: L.titleY, w: L.contentW, h: 0.4,
    fontSize: 20, fontFace: "Arial", color: C.navy, bold: true,
  });

  // Sources
  s14.addText("Quellen", {
    x: L.marginLeft, y: 1.3, w: 4, h: 0.25,
    fontSize: 10, fontFace: "Arial", color: C.navy, bold: true,
  });

  const sources = [
    "Grand View Research — Global GEO Market Report 2025 ($848M → $7,3B CAGR 34%)",
    "Gartner — Predicts 2025: Traditionelles Suchvolumen −25% bis 2026",
    "OpenAI — Q4 2025 Earnings: 400M wöchentliche ChatGPT-Nutzer",
    "Crunchbase — Funding Data: Profound ($58,5M), Peec AI ($29M), Daydream ($22,8M)",
    "Princeton/Georgia Tech (KDD 2024) — GEO: Generative Engine Optimization",
    "AI Visibility Engine Scan — chilli-mind.com, 15. Februar 2026",
    "Eigene Wettbewerbsanalyse — 33 Anbieter identifiziert und kategorisiert",
  ];

  sources.forEach((src, i) => {
    s14.addText(`${i + 1}.  ${src}`, {
      x: L.marginLeft + 0.1, y: 1.6 + i * 0.3, w: 8.4, h: 0.28,
      fontSize: 8.5, fontFace: "Arial", color: C.body,
    });
  });

  // Contact
  s14.addShape(pres.shapes.RECTANGLE, {
    x: L.marginLeft, y: 3.95, w: L.contentW, h: 0.02,
    fill: { color: C.medGray },
  });

  s14.addText("Kontakt", {
    x: L.marginLeft, y: 4.1, w: 4, h: 0.25,
    fontSize: 10, fontFace: "Arial", color: C.navy, bold: true,
  });

  s14.addText([
    { text: "chilli mind GmbH", options: { bold: true, fontSize: 11 } },
    { text: "\nOliver Gerstheimer — Geschäftsführer", options: { fontSize: 10 } },
    { text: "\nchilli-mind.com", options: { fontSize: 10, color: C.teal } },
  ], {
    x: L.marginLeft, y: 4.35, w: 4, h: 0.8,
    fontFace: "Arial", color: C.body,
  });

  s14.addText([
    { text: "Florian Steiner", options: { bold: true, fontSize: 11 } },
    { text: "\nAI Visibility Engine — Subunternehmer", options: { fontSize: 10 } },
    { text: "\nflorian@steiner.dev", options: { fontSize: 10, color: C.teal } },
  ], {
    x: 5.3, y: 4.35, w: 4, h: 0.8,
    fontFace: "Arial", color: C.body,
  });

  // --- Write file ---
  const outPath = path.join(outDir, "AI-Visibility-Strategy-Deck.pptx");
  await pres.writeFile({ fileName: outPath });
  console.log("Strategy Deck saved:", outPath);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
