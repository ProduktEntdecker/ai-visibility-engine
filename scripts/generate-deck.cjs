const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const path = require("path");
const fs = require("fs");
const { FaTimes, FaCheck, FaExclamationTriangle } = require("react-icons/fa");

// --- Icon helper ---
function renderIconSvg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}
async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

async function svgFileToBase64Png(svgPath, width = 400) {
  const svgBuffer = fs.readFileSync(svgPath);
  const pngBuffer = await sharp(svgBuffer).resize({ width }).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

// --- Color Palette ---
const C = {
  black: "0A0A0A",
  darkGray: "1A1A1A",
  medGray: "2A2A2A",
  lightGray: "F5F5F5",
  white: "FFFFFF",
  red: "E82A34",
  redDark: "C41E28",
  amber: "F59E0B",
  green: "22C55E",
  blue: "3B82F6",
  textLight: "CCCCCC",
  textMuted: "888888",
};

const makeShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.2 });

async function generate() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "AI Visibility Engine";
  pres.title = "AI Visibility Engine \u2014 Partnerschaft mit chilli mind";

  // Ensure output directory exists
  const outDir = path.resolve("output");
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // Pre-render icons
  const iconX = await iconToBase64Png(FaTimes, "#E82A34");
  const iconCheck = await iconToBase64Png(FaCheck, "#22C55E");
  const iconWarn = await iconToBase64Png(FaExclamationTriangle, "#F59E0B");

  // Load chilli mind logo
  const logoPath = path.resolve(__dirname, "..", "assets", "chilli-mind-logo.svg");
  const logoBase64 = await svgFileToBase64Png(logoPath, 500);

  // ============================================================
  // SLIDE 1: Title
  // ============================================================
  let s1 = pres.addSlide();
  s1.background = { color: C.black };
  // chilli mind logo
  s1.addImage({ data: logoBase64, x: 2.6, y: 0.8, w: 4.8, h: 1.15 });
  s1.addText("AI Visibility", { x: 1.5, y: 2.1, w: 7, h: 0.9, fontSize: 48, fontFace: "Georgia", color: C.white, bold: true, align: "center", margin: 0 });
  s1.addText("Engine", { x: 1.5, y: 2.9, w: 7, h: 0.9, fontSize: 48, fontFace: "Georgia", color: C.red, bold: true, align: "center", margin: 0 });
  s1.addText("Neues Umsatzpotenzial f\u00FCr chilli mind:\nKunden sichtbar machen f\u00FCr ChatGPT, Google AI & Perplexity.", {
    x: 1.5, y: 4.0, w: 7, h: 0.8, fontSize: 15, fontFace: "Calibri", color: C.textLight, align: "center"
  });

  // ============================================================
  // SLIDE 2: Der Markt
  // ============================================================
  let s2 = pres.addSlide();
  s2.background = { color: C.black };
  s2.addText("DER MARKT", { x: 0.8, y: 0.4, w: 3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s2.addText([
    { text: "AI ver\u00E4ndert, ", options: { color: C.white } },
    { text: "wie Menschen\nUnternehmen finden.", options: { color: C.red } }
  ], { x: 0.8, y: 0.9, w: 8.5, h: 1.2, fontSize: 36, fontFace: "Georgia", bold: true, margin: 0 });

  const stats = [
    { num: "400M", label: "W\u00F6chentliche\nChatGPT-Nutzer" },
    { num: "55%", label: "Google-Suchen\nmit AI Overviews" },
    { num: "31%", label: "Websites mit\nSchema Markup" },
  ];
  stats.forEach((st, i) => {
    const xPos = 0.8 + i * 3.0;
    s2.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 2.5, w: 2.6, h: 1.8, fill: { color: C.medGray }, shadow: makeShadow() });
    s2.addText(st.num, { x: xPos, y: 2.7, w: 2.6, h: 0.7, fontSize: 40, fontFace: "Georgia", color: C.red, bold: true, align: "center", margin: 0 });
    s2.addText(st.label, { x: xPos, y: 3.4, w: 2.6, h: 0.7, fontSize: 13, fontFace: "Calibri", color: C.textMuted, align: "center" });
  });

  s2.addText("Wer hier nicht auftaucht, existiert f\u00FCr eine wachsende Zielgruppe nicht.\nDas betrifft fast jedes Unternehmen \u2014 auch eure Kunden.", {
    x: 0.8, y: 4.6, w: 8.5, h: 0.7, fontSize: 14, fontFace: "Calibri", color: C.textLight, align: "center"
  });

  // ============================================================
  // SLIDE 3: Demo \u2014 chilli-mind.com gescannt
  // ============================================================
  let s3 = pres.addSlide();
  s3.background = { color: C.black };
  s3.addText("DEMO", { x: 0.8, y: 0.4, w: 3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s3.addText("Wir haben chilli-mind.com gescannt.", { x: 0.8, y: 0.9, w: 8.5, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });

  // Overall score circle
  s3.addShape(pres.shapes.OVAL, { x: 0.8, y: 1.9, w: 2.0, h: 2.0, fill: { color: C.medGray }, line: { color: C.amber, width: 6 } });
  s3.addText("47", { x: 0.8, y: 2.1, w: 2.0, h: 1.2, fontSize: 48, fontFace: "Georgia", color: C.amber, bold: true, align: "center", margin: 0 });
  s3.addText("von 100", { x: 0.8, y: 3.1, w: 2.0, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.textMuted, align: "center", margin: 0 });
  s3.addText("chilli-mind.com", { x: 0.8, y: 3.55, w: 2.0, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.textMuted, align: "center", margin: 0 });

  // Score bars
  const scores = [
    { label: "AI Visibility", val: 21, col: C.red, detail: "Google erw\u00E4hnt euch in 0 von 10 Anfragen" },
    { label: "Schema Health", val: 45, col: C.amber, detail: "6 von 9 wichtigen Schema-Typen fehlen" },
    { label: "Technical SEO", val: 85, col: C.green, detail: "Technisch gut aufgestellt" },
  ];
  scores.forEach((sc, i) => {
    const yPos = 2.0 + i * 0.75;
    s3.addText(sc.label, { x: 3.2, y: yPos, w: 1.8, h: 0.25, fontSize: 12, fontFace: "Calibri", color: C.textLight, bold: true, margin: 0 });
    s3.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: yPos + 0.02, w: 3.0, h: 0.22, fill: { color: C.medGray } });
    s3.addShape(pres.shapes.RECTANGLE, { x: 5.2, y: yPos + 0.02, w: 3.0 * (sc.val / 100), h: 0.22, fill: { color: sc.col } });
    s3.addText(String(sc.val), { x: 8.3, y: yPos - 0.02, w: 0.7, h: 0.3, fontSize: 14, fontFace: "Georgia", color: sc.col, bold: true, margin: 0 });
    s3.addText(sc.detail, { x: 3.2, y: yPos + 0.28, w: 5.5, h: 0.25, fontSize: 10, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  });

  // Google queries mini-list
  s3.addShape(pres.shapes.RECTANGLE, { x: 3.2, y: 4.3, w: 5.8, h: 0.06, fill: { color: C.medGray } });
  const sampleQueries = [
    "\u201EBest digital consultancies in Germany\u201C",
    "\u201ETop HMI design companies\u201C",
    "\u201EUX design agencies enterprise Europe\u201C",
  ];
  sampleQueries.forEach((q, i) => {
    const yPos = 4.5 + i * 0.32;
    s3.addImage({ data: iconX, x: 3.3, y: yPos + 0.03, w: 0.2, h: 0.2 });
    s3.addText(q, { x: 3.65, y: yPos, w: 5.0, h: 0.28, fontSize: 11, fontFace: "Calibri", color: C.textLight, valign: "middle", margin: 0 });
  });

  // Key insight
  s3.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 5.05, w: 9.0, h: 0.4, fill: { color: "1A0508" } });
  s3.addText("Wenn chilli mind nur 47 Punkte hat \u2014 wie sichtbar sind dann eure Kunden?", {
    x: 0.5, y: 5.05, w: 9.0, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.red, bold: true, align: "center", valign: "middle"
  });

  // ============================================================
  // SLIDE 4: Wettbewerber-Vergleich
  // ============================================================
  let s4 = pres.addSlide();
  s4.background = { color: C.black };
  s4.addText("MARKT\u00DCBERBLICK", { x: 0.8, y: 0.4, w: 4, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s4.addText("Wettbewerber & Kunden im Vergleich", { x: 0.8, y: 0.9, w: 8.5, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });

  const competitors = [
    { name: "chilli mind", domain: "chilli-mind.com", score: 47, schema: 45, technical: 85, ai: 21, highlight: true, type: "" },
    { name: "UXMA", domain: "uxma.com", score: 41, schema: 0, technical: 100, ai: 28, highlight: false, type: "Wettbewerber" },
    { name: "Ergosign", domain: "ergosign.de", score: 37, schema: 0, technical: 90, ai: 26, highlight: false, type: "Wettbewerber" },
    { name: "Siemens", domain: "siemens.com", score: 45, schema: 0, technical: 95, ai: 41, highlight: false, type: "Kunde" },
    { name: "B. Braun", domain: "bbraun.com", score: 38, schema: 0, technical: 90, ai: 28, highlight: false, type: "Kunde" },
  ];

  // Table header
  const headerY = 1.7;
  s4.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: headerY, w: 8.4, h: 0.35, fill: { color: C.medGray } });
  const headers = [
    { text: "", x: 0.9, w: 0.5 },
    { text: "Unternehmen", x: 1.4, w: 2.2 },
    { text: "Gesamt", x: 3.6, w: 1.1 },
    { text: "Schema", x: 4.7, w: 1.1 },
    { text: "Technical", x: 5.8, w: 1.1 },
    { text: "AI Visibility", x: 6.9, w: 1.5 },
  ];
  headers.forEach(h => {
    s4.addText(h.text, { x: h.x, y: headerY, w: h.w, h: 0.35, fontSize: 9, fontFace: "Calibri", color: C.textMuted, bold: true, valign: "middle", margin: 0 });
  });

  competitors.forEach((comp, i) => {
    const yPos = 2.1 + i * 0.55;
    const bgColor = comp.highlight ? "3D1518" : (i % 2 === 0 ? C.darkGray : C.medGray);
    s4.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: yPos, w: 8.4, h: 0.50, fill: { color: bgColor } });
    if (comp.highlight) {
      s4.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: yPos, w: 0.06, h: 0.50, fill: { color: C.red } });
    }

    // Type badge
    if (comp.type) {
      const badgeCol = comp.type === "Kunde" ? C.blue : C.textMuted;
      s4.addText(comp.type, { x: 0.9, y: yPos + 0.12, w: 0.85, h: 0.26, fontSize: 7, fontFace: "Calibri", color: badgeCol, bold: true, valign: "middle", margin: 0 });
    }

    // Name + domain
    s4.addText(comp.name, { x: 1.75, y: yPos + 0.02, w: 1.8, h: 0.26, fontSize: 12, fontFace: "Calibri", color: C.white, bold: true, margin: 0 });
    s4.addText(comp.domain, { x: 1.75, y: yPos + 0.26, w: 1.8, h: 0.2, fontSize: 8, fontFace: "Calibri", color: C.textMuted, margin: 0 });

    // Scores
    const getScoreCol = (v) => v >= 70 ? C.green : v >= 40 ? C.amber : C.red;
    const scoreData = [
      { val: comp.score, x: 3.6, w: 1.1 },
      { val: comp.schema, x: 4.7, w: 1.1 },
      { val: comp.technical, x: 5.8, w: 1.1 },
      { val: comp.ai, x: 6.9, w: 1.5 },
    ];
    scoreData.forEach(sd => {
      s4.addText(String(sd.val), { x: sd.x, y: yPos, w: sd.w, h: 0.50, fontSize: 16, fontFace: "Georgia", color: getScoreCol(sd.val), bold: true, valign: "middle", margin: 0 });
    });
  });

  // Separator line
  s4.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.95, w: 8.4, h: 0.01, fill: { color: C.medGray } });

  s4.addText("Quelle: AI Visibility Engine Scan, Februar 2026. Schema & Technical = gemessen. AI Visibility = Google SERP (live) + Heuristik.", {
    x: 0.8, y: 4.98, w: 8.5, h: 0.3, fontSize: 8, fontFace: "Calibri", color: C.textMuted, align: "center"
  });

  s4.addText("Selbst Siemens hat nur 45 Punkte. Schema Markup fehlt \u00FCberall.\nDas ist kein chilli mind Problem \u2014 das ist eine Marktchance.", {
    x: 0.8, y: 5.2, w: 8.5, h: 0.4, fontSize: 12, fontFace: "Calibri", color: C.textLight, align: "center"
  });

  // ============================================================
  // SLIDE 5: Das Produkt
  // ============================================================
  let s5 = pres.addSlide();
  s5.background = { color: C.black };
  s5.addText("DAS PRODUKT", { x: 0.8, y: 0.4, w: 3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s5.addText("AI Visibility Engine", { x: 0.8, y: 0.9, w: 8.5, h: 0.7, fontSize: 34, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });

  const phases = [
    { step: "1", title: "Scan", desc: "60+ Seiten Audit:\nSchema, Technical,\nAI Engine Probing", col: C.red },
    { step: "2", title: "Report", desc: "Verst\u00E4ndlicher Report\nmit konkreten\nHandlungsempfehlungen", col: C.amber },
    { step: "3", title: "Fix", desc: "Schema-Implementierung,\nContent-Optimierung,\nMonitoring", col: C.green },
  ];
  phases.forEach((p, i) => {
    const xPos = 0.8 + i * 3.0;
    s5.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.9, w: 2.6, h: 2.2, fill: { color: C.medGray }, shadow: makeShadow() });
    s5.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 1.9, w: 2.6, h: 0.06, fill: { color: p.col } });
    s5.addShape(pres.shapes.OVAL, { x: xPos + 0.9, y: 2.15, w: 0.8, h: 0.8, fill: { color: C.black }, line: { color: p.col, width: 2 } });
    s5.addText(p.step, { x: xPos + 0.9, y: 2.2, w: 0.8, h: 0.7, fontSize: 24, fontFace: "Georgia", color: p.col, bold: true, align: "center", margin: 0 });
    s5.addText(p.title, { x: xPos, y: 3.1, w: 2.6, h: 0.4, fontSize: 18, fontFace: "Georgia", color: C.white, bold: true, align: "center", margin: 0 });
    s5.addText(p.desc, { x: xPos + 0.2, y: 3.5, w: 2.2, h: 0.6, fontSize: 11, fontFace: "Calibri", color: C.textMuted, align: "center" });
  });

  s5.addText("\u2192", { x: 3.5, y: 2.7, w: 0.5, h: 0.4, fontSize: 24, fontFace: "Calibri", color: C.textMuted, align: "center" });
  s5.addText("\u2192", { x: 6.5, y: 2.7, w: 0.5, h: 0.4, fontSize: 24, fontFace: "Calibri", color: C.textMuted, align: "center" });

  s5.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.5, w: 8.4, h: 0.9, fill: { color: "3D1518" } });
  s5.addText([
    { text: "Jahrespaket: ", options: { color: C.white, fontSize: 16 } },
    { text: "\u20AC33.000 Einzelwert", options: { color: C.textMuted, fontSize: 14, strikethrough: true } },
  ], { x: 1.0, y: 4.5, w: 5, h: 0.9, fontFace: "Calibri", bold: true, margin: 0, valign: "middle" });
  s5.addText("\u20AC20.000/Jahr", { x: 5.0, y: 4.5, w: 4, h: 0.9, fontSize: 28, fontFace: "Georgia", color: C.red, bold: true, align: "right", margin: [0, 20, 0, 0], valign: "middle" });

  // ============================================================
  // SLIDE 6: Der Eisbrecher
  // ============================================================
  let s6 = pres.addSlide();
  s6.background = { color: C.black };
  s6.addText("DER EISBRECHER", { x: 0.8, y: 0.4, w: 3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s6.addText([
    { text: "Jeder schlechte Score ist ein\n", options: { color: C.white } },
    { text: "warmer Lead.", options: { color: C.red } },
  ], { x: 0.8, y: 0.9, w: 8.5, h: 1.2, fontSize: 32, fontFace: "Georgia", bold: true, margin: 0 });

  const flow = [
    { text: "Kostenlosen Scan\nanbieten", sub: "5 Minuten, kein Risiko", col: C.red },
    { text: "Report zeigt\nkonkreten Score", sub: "Daten statt Meinung", col: C.amber },
    { text: "Schlechter Score =\nHandlungsdruck", sub: "Kein Hard-Sell n\u00F6tig", col: C.green },
  ];
  flow.forEach((f, i) => {
    const xPos = 0.8 + i * 3.0;
    s6.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 2.5, w: 2.6, h: 1.6, fill: { color: C.medGray }, shadow: makeShadow() });
    s6.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 2.5, w: 0.06, h: 1.6, fill: { color: f.col } });
    s6.addText(f.text, { x: xPos + 0.2, y: 2.6, w: 2.2, h: 0.8, fontSize: 14, fontFace: "Calibri", color: C.white, bold: true });
    s6.addText(f.sub, { x: xPos + 0.2, y: 3.4, w: 2.2, h: 0.4, fontSize: 11, fontFace: "Calibri", color: C.textMuted });
  });

  s6.addText("\u2192", { x: 3.5, y: 3.0, w: 0.5, h: 0.4, fontSize: 24, fontFace: "Calibri", color: C.textMuted, align: "center" });
  s6.addText("\u2192", { x: 6.5, y: 3.0, w: 0.5, h: 0.4, fontSize: 24, fontFace: "Calibri", color: C.textMuted, align: "center" });

  s6.addText("850+ bestehende Kundenprojekte = 850 potenzielle Scans.\nJeder Scan unter 50 Punkten ist ein nat\u00FCrlicher Gespr\u00E4chseinstieg.", {
    x: 0.8, y: 4.5, w: 8.5, h: 0.7, fontSize: 14, fontFace: "Calibri", color: C.textLight, align: "center"
  });

  // ============================================================
  // SLIDE 7: Partnership \u2014 So funktioniert es
  // ============================================================
  let s7 = pres.addSlide();
  s7.background = { color: C.black };
  s7.addText("PARTNERSHIP", { x: 0.8, y: 0.4, w: 4, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s7.addText("chilli mind verkauft. Ich liefere.", { x: 0.8, y: 0.9, w: 8.5, h: 0.7, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });

  // Left card - chilli mind
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.8, w: 4.1, h: 2.6, fill: { color: C.medGray }, shadow: makeShadow() });
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.8, w: 4.1, h: 0.06, fill: { color: C.red } });
  s7.addImage({ data: logoBase64, x: 1.1, y: 1.95, w: 2.5, h: 0.6 });
  s7.addText([
    { text: "\u2713 Bestehendes Kundenvertrauen nutzen", options: { breakLine: true, color: C.textLight } },
    { text: "\u2713 Kein Delivery-Aufwand", options: { breakLine: true, color: C.textLight } },
    { text: "\u2713 Neues Upselling-Produkt", options: { breakLine: true, color: C.textLight } },
    { text: "\u2713 25% Provision = \u20AC5.000 pro Kunde/Jahr", options: { color: C.white, bold: true } },
  ], { x: 1.1, y: 2.65, w: 3.6, h: 1.6, fontSize: 12, fontFace: "Calibri", paraSpaceAfter: 6 });

  // Right card - AI Visibility Engine (Florian)
  s7.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.8, w: 4.1, h: 2.6, fill: { color: C.medGray }, shadow: makeShadow() });
  s7.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.8, w: 4.1, h: 0.06, fill: { color: C.red } });
  s7.addText("AI Visibility Engine", { x: 5.4, y: 1.95, w: 3.5, h: 0.35, fontSize: 16, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });
  s7.addText("Entwicklung & Delivery", { x: 5.4, y: 2.3, w: 3.5, h: 0.25, fontSize: 11, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  s7.addText([
    { text: "\u2713 80%+ AI-automatisiert", options: { breakLine: true, color: C.textLight } },
    { text: "\u2713 ~38h Aufwand pro Kunde/Jahr", options: { breakLine: true, color: C.textLight } },
    { text: "\u2713 Skaliert auf 30+ Kunden", options: { breakLine: true, color: C.textLight } },
    { text: "\u2713 75% = \u20AC15.000 pro Kunde/Jahr", options: { color: C.white, bold: true } },
  ], { x: 5.4, y: 2.65, w: 3.6, h: 1.6, fontSize: 12, fontFace: "Calibri", paraSpaceAfter: 6 });

  // Bottom economics
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.65, w: 8.4, h: 0.7, fill: { color: "3D1518" } });
  s7.addText([
    { text: "Bei 10 Kunden: ", options: { color: C.white, fontSize: 14 } },
    { text: "\u20AC50.000/Jahr f\u00FCr chilli mind", options: { color: C.green, fontSize: 16, bold: true } },
    { text: "  \u2014  ohne zus\u00E4tzlichen Personalaufwand", options: { color: C.textLight, fontSize: 12 } },
  ], { x: 1.0, y: 4.65, w: 8.0, h: 0.7, fontFace: "Calibri", margin: 0, valign: "middle", align: "center" });

  // ============================================================
  // SLIDE 8: Quick Wins f\u00FCr chilli mind
  // ============================================================
  let s8 = pres.addSlide();
  s8.background = { color: C.black };
  s8.addText("QUICK WINS", { x: 0.8, y: 0.4, w: 3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s8.addText("7 Ma\u00DFnahmen f\u00FCr chilli-mind.com", { x: 0.8, y: 0.85, w: 8.5, h: 0.55, fontSize: 30, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });
  s8.addText("Aus dem echten Scan \u2014 sofort umsetzbar", { x: 0.8, y: 1.35, w: 8.5, h: 0.3, fontSize: 13, fontFace: "Calibri", color: C.textMuted, margin: 0 });

  const quickWins = [
    { nr: "1", title: "FAQ Schema hinzuf\u00FCgen", impact: "+15 Pkt", prio: "HIGH", desc: "Direkte Antworten f\u00FCr AI-Engines" },
    { nr: "2", title: "Service/Product Schema", impact: "+15 Pkt", prio: "HIGH", desc: "Leistungen f\u00FCr AI-Empfehlungen sichtbar machen" },
    { nr: "3", title: "Wikipedia/Wikidata sameAs", impact: "2.5\u00D7 Sichtbarkeit", prio: "HIGH", desc: "Wikipedia-Entit\u00E4ten werden 2.5\u00D7 h\u00E4ufiger zitiert" },
    { nr: "4", title: "Organization Schema vervollst\u00E4ndigen", impact: "33% \u2192 100%", prio: "MED", desc: "URL, Beschreibung, Kontakt, sameAs erg\u00E4nzen" },
    { nr: "5", title: "H1-Struktur fixen", impact: "SEO + AI", prio: "MED", desc: "14 H1-Tags \u2192 1 H1 pro Seite" },
    { nr: "6", title: "LocalBusiness Schema", impact: "+10 Pkt", prio: "MED", desc: "Standort f\u00FCr lokale AI-Anfragen" },
    { nr: "7", title: "sameAs-Links (LinkedIn, Xing)", impact: "Entity Linking", prio: "LOW", desc: "St\u00E4rkt Pr\u00E4senz im AI Knowledge Graph" },
  ];

  quickWins.forEach((qw, i) => {
    const yPos = 1.78 + i * 0.44;
    const rowBg = i % 2 === 0 ? C.medGray : C.darkGray;
    s8.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: yPos, w: 8.4, h: 0.40, fill: { color: rowBg } });
    const priCol = qw.prio === "HIGH" ? C.red : qw.prio === "MED" ? C.amber : C.textMuted;
    s8.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: yPos, w: 0.06, h: 0.40, fill: { color: priCol } });
    s8.addText(qw.nr, { x: 1.0, y: yPos, w: 0.3, h: 0.40, fontSize: 12, fontFace: "Georgia", color: priCol, bold: true, valign: "middle", margin: 0 });
    s8.addText(qw.title, { x: 1.4, y: yPos, w: 2.8, h: 0.40, fontSize: 12, fontFace: "Calibri", color: C.white, bold: true, valign: "middle", margin: 0 });
    s8.addText(qw.desc, { x: 4.3, y: yPos, w: 3.2, h: 0.40, fontSize: 10, fontFace: "Calibri", color: C.textMuted, valign: "middle", margin: 0 });
    s8.addText(qw.impact, { x: 7.7, y: yPos + 0.06, w: 1.4, h: 0.28, fontSize: 10, fontFace: "Calibri", color: priCol, bold: true, align: "center", valign: "middle", margin: 0 });
  });

  s8.addShape(pres.shapes.RECTANGLE, { x: 0.5, y: 4.95, w: 9.0, h: 0.45, fill: { color: "3D1518" } });
  s8.addText("Allein die Top 3 bringen den Score von 47 auf gesch\u00E4tzt 75+ Punkte.", {
    x: 0.5, y: 4.95, w: 9.0, h: 0.45, fontSize: 14, fontFace: "Calibri", color: C.white, bold: true, align: "center", valign: "middle"
  });

  // ============================================================
  // SLIDE 9: Roadmap
  // ============================================================
  let s9 = pres.addSlide();
  s9.background = { color: C.black };
  s9.addText("N\u00C4CHSTE SCHRITTE", { x: 0.8, y: 0.4, w: 4, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s9.addText("4-Wochen Roadmap", { x: 0.8, y: 0.9, w: 8.5, h: 0.7, fontSize: 34, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });

  const roadmap = [
    { week: "Woche 1", title: "Quick Wins umsetzen", desc: "FAQ Schema, Product Schema, sameAs-Links f\u00FCr chilli-mind.com" },
    { week: "Woche 2", title: "Ersten Kunden scannen", desc: "Pilot-Scan eines chilli mind Kunden, Case Study erstellen" },
    { week: "Woche 3", title: "Report & Monitoring", desc: "Automatisiertes Reporting, monatliche Score-Entwicklung" },
    { week: "Woche 4", title: "Go-to-Market", desc: "Sales-Mail an Top 20 Kunden, erstes Closing anvisieren" },
  ];

  s9.addShape(pres.shapes.LINE, { x: 1.5, y: 2.0, w: 0, h: 3.2, line: { color: C.medGray, width: 2 } });

  roadmap.forEach((r, i) => {
    const yPos = 2.0 + i * 0.82;
    s9.addShape(pres.shapes.OVAL, { x: 1.37, y: yPos + 0.08, w: 0.26, h: 0.26, fill: { color: C.red } });
    s9.addText(r.week, { x: 2.0, y: yPos, w: 1.2, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.red, bold: true, margin: 0 });
    s9.addText(r.title, { x: 3.3, y: yPos, w: 5.5, h: 0.3, fontSize: 15, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });
    s9.addText(r.desc, { x: 3.3, y: yPos + 0.32, w: 5.5, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  });

  // ============================================================
  // SLIDE 10: CTA
  // ============================================================
  let s10 = pres.addSlide();
  s10.background = { color: C.black };

  s10.addImage({ data: logoBase64, x: 2.7, y: 1.0, w: 4.5, h: 1.08 });

  s10.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 2.5, w: 7, h: 2.0, fill: { color: C.red }, shadow: makeShadow() });
  s10.addText("N\u00E4chster Schritt", { x: 1.5, y: 2.7, w: 7, h: 0.6, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true, align: "center", margin: 0 });
  s10.addText("Einen Pilot-Kunden w\u00E4hlen. Wir scannen kostenlos.\nErgebnis in 48 Stunden. Kein Risiko.", {
    x: 1.5, y: 3.3, w: 7, h: 0.9, fontSize: 16, fontFace: "Calibri", color: C.white, align: "center"
  });

  s10.addText("Parallel setzen wir die Quick Wins f\u00FCr chilli-mind.com um \u2014\ndamit ihr selbst erlebt, wie der Score steigt.", {
    x: 1.5, y: 4.8, w: 7, h: 0.7, fontSize: 13, fontFace: "Calibri", color: C.textMuted, align: "center"
  });

  // --- Write file ---
  const outPath = path.join(outDir, "AI-Visibility-Engine-Pitch.pptx");
  await pres.writeFile({ fileName: outPath });
  console.log("PowerPoint saved:", outPath);
}

generate().catch((err) => {
  console.error(err);
  process.exit(1);
});
