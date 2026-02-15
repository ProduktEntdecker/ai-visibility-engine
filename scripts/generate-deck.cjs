const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const { FaTimes, FaCheck, FaGoogle, FaRobot, FaSearch, FaBolt, FaChartLine, FaHandshake, FaRocket, FaEnvelope } = require("react-icons/fa");

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

// --- Color Palette: chilli mind branding ---
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
  textLight: "CCCCCC",
  textMuted: "888888",
};

const makeShadow = () => ({ type: "outer", color: "000000", blur: 8, offset: 2, angle: 135, opacity: 0.2 });

async function generate() {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9";
  pres.author = "chilli mind x AI Visibility Engine";
  pres.title = "AI Visibility Engine — Partnership Pitch";

  // Pre-render icons
  const iconX = await iconToBase64Png(FaTimes, "#E82A34");
  const iconCheck = await iconToBase64Png(FaCheck, "#22C55E");
  const iconGoogle = await iconToBase64Png(FaGoogle, "#FFFFFF");
  const iconRobot = await iconToBase64Png(FaRobot, "#FFFFFF");
  const iconSearch = await iconToBase64Png(FaSearch, "#FFFFFF");
  const iconBolt = await iconToBase64Png(FaBolt, "#E82A34");
  const iconChart = await iconToBase64Png(FaChartLine, "#FFFFFF");
  const iconHandshake = await iconToBase64Png(FaHandshake, "#FFFFFF");
  const iconRocket = await iconToBase64Png(FaRocket, "#E82A34");

  // ============================================================
  // SLIDE 1: Title
  // ============================================================
  let s1 = pres.addSlide();
  s1.background = { color: C.black };
  // Red dot
  s1.addShape(pres.shapes.OVAL, { x: 3.6, y: 1.0, w: 0.4, h: 0.4, fill: { color: C.red } });
  s1.addText("chilli mind", { x: 4.05, y: 1.0, w: 3, h: 0.4, fontSize: 18, fontFace: "Arial", color: C.white, bold: true, margin: 0 });
  s1.addText("AI Visibility", { x: 1.5, y: 1.8, w: 7, h: 1.0, fontSize: 52, fontFace: "Georgia", color: C.white, bold: true, align: "center", margin: 0 });
  s1.addText("Engine", { x: 1.5, y: 2.7, w: 7, h: 1.0, fontSize: 52, fontFace: "Georgia", color: C.red, bold: true, align: "center", margin: 0 });
  s1.addText("Machen Sie Ihre Kunden zur #1 Empfehlung\nvon ChatGPT, Google AI & Perplexity.", {
    x: 1.5, y: 3.8, w: 7, h: 0.8, fontSize: 16, fontFace: "Calibri", color: C.textLight, align: "center"
  });
  s1.addText("Oliver & Philipp  \u00B7  Februar 2026", {
    x: 1.5, y: 5.0, w: 7, h: 0.4, fontSize: 12, fontFace: "Calibri", color: C.textMuted, align: "center"
  });

  // ============================================================
  // SLIDE 2: Das Problem
  // ============================================================
  let s2 = pres.addSlide();
  s2.background = { color: C.black };
  s2.addText("DAS PROBLEM", { x: 0.8, y: 0.4, w: 3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s2.addText([
    { text: "55%", options: { color: C.red, bold: true } },
    { text: " aller Google-Suchen\nzeigen jetzt AI-Antworten.", options: { color: C.white } }
  ], { x: 0.8, y: 0.9, w: 8.5, h: 1.2, fontSize: 36, fontFace: "Georgia", bold: true, margin: 0 });

  // Stat cards
  const stats = [
    { num: "400M", label: "Wöchentliche\nChatGPT-Nutzer" },
    { num: "55%", label: "Google-Suchen\nmit AI Overviews" },
    { num: "31%", label: "Websites mit\nSchema Markup" },
  ];
  stats.forEach((st, i) => {
    const xPos = 0.8 + i * 3.0;
    s2.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 2.5, w: 2.6, h: 1.8, fill: { color: C.medGray }, shadow: makeShadow() });
    s2.addText(st.num, { x: xPos, y: 2.7, w: 2.6, h: 0.7, fontSize: 40, fontFace: "Georgia", color: C.red, bold: true, align: "center", margin: 0 });
    s2.addText(st.label, { x: xPos, y: 3.4, w: 2.6, h: 0.7, fontSize: 13, fontFace: "Calibri", color: C.textMuted, align: "center" });
  });

  s2.addText("Eure Kunden investieren in SEO \u2014 aber sind unsichtbar für die AI-Engines,\ndie zunehmend Kaufentscheidungen beeinflussen.", {
    x: 0.8, y: 4.6, w: 8.5, h: 0.7, fontSize: 14, fontFace: "Calibri", color: C.textLight, align: "center"
  });

  // ============================================================
  // SLIDE 3: Der Markt
  // ============================================================
  let s3 = pres.addSlide();
  s3.background = { color: C.black };
  s3.addText("DER MARKT", { x: 0.8, y: 0.4, w: 3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s3.addText("Was Unternehmen heute zahlen", { x: 0.8, y: 0.9, w: 8.5, h: 0.7, fontSize: 34, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });

  const prices = [
    { num: "$5-30k", label: "pro Monat für\nEnterprise GEO-Agenturen", col: C.red },
    { num: "\u20AC50-450", label: "pro Monat für\nTools (nur Schema)", col: C.amber },
    { num: "\u20AC1.667", label: "pro Monat\nunser Preis (Full Service)", col: C.green },
  ];
  prices.forEach((p, i) => {
    const xPos = 0.8 + i * 3.0;
    s3.addShape(pres.shapes.RECTANGLE, { x: xPos, y: 2.0, w: 2.6, h: 2.0, fill: { color: C.medGray }, shadow: makeShadow() });
    s3.addText(p.num, { x: xPos, y: 2.2, w: 2.6, h: 0.8, fontSize: 36, fontFace: "Georgia", color: p.col, bold: true, align: "center", margin: 0 });
    s3.addText(p.label, { x: xPos, y: 3.1, w: 2.6, h: 0.7, fontSize: 13, fontFace: "Calibri", color: C.textMuted, align: "center" });
  });

  s3.addText("Wir positionieren uns zwischen teurem Enterprise-Consulting\nund limitierten Self-Service-Tools. Der Sweet Spot für den Mittelstand.", {
    x: 0.8, y: 4.4, w: 8.5, h: 0.7, fontSize: 14, fontFace: "Calibri", color: C.textLight, align: "center"
  });

  // ============================================================
  // SLIDE 4: Die Lösung
  // ============================================================
  let s4 = pres.addSlide();
  s4.background = { color: C.black };
  s4.addText("DIE LÖSUNG", { x: 0.8, y: 0.4, w: 3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s4.addText("Was der Kunde bekommt", { x: 0.8, y: 0.9, w: 8.5, h: 0.7, fontSize: 34, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });

  const items = [
    { text: "AI Visibility Audit (60+ Seiten Report)", price: "\u20AC5.000" },
    { text: "Schema & Entity Implementierung", price: "\u20AC8.000" },
    { text: "Content Optimization Playbook (50 FAQs)", price: "\u20AC4.000" },
    { text: "12 Monate AI Visibility Monitoring", price: "\u20AC12.000" },
    { text: "4x Quarterly Strategy Calls", price: "\u20AC4.000" },
    { text: "Garantie: Messbare Verbesserung oder 6 Monate gratis", price: "\u2713" },
  ];
  items.forEach((item, i) => {
    const yPos = 1.8 + i * 0.45;
    s4.addShape(pres.shapes.LINE, { x: 0.8, y: yPos + 0.42, w: 8.4, h: 0, line: { color: C.medGray, width: 0.5 } });
    s4.addText(item.text, { x: 0.8, y: yPos, w: 6.5, h: 0.4, fontSize: 14, fontFace: "Calibri", color: C.white, margin: 0 });
    s4.addText(item.price, { x: 7.5, y: yPos, w: 1.7, h: 0.4, fontSize: 14, fontFace: "Calibri", color: item.price === "\u2713" ? C.green : C.textMuted, align: "right",
      strikethrough: item.price !== "\u2713", margin: 0 });
  });

  // Total line
  s4.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 4.6, w: 8.4, h: 0.6, fill: { color: "3D1518" } });
  s4.addText([
    { text: "Gesamtwert: ", options: { color: C.white } },
    { text: "\u20AC33.000", options: { color: C.textMuted, strikethrough: true } },
  ], { x: 1.0, y: 4.6, w: 5, h: 0.6, fontSize: 16, fontFace: "Calibri", bold: true, margin: 0, valign: "middle" });
  s4.addText("\u20AC20.000/Jahr", { x: 6.0, y: 4.6, w: 3, h: 0.6, fontSize: 22, fontFace: "Georgia", color: C.red, bold: true, align: "right", margin: 0, valign: "middle" });

  // ============================================================
  // SLIDE 5: Live Demo - Scan Results
  // ============================================================
  let s5 = pres.addSlide();
  s5.background = { color: C.black };
  s5.addText("LIVE DEMO", { x: 0.8, y: 0.4, w: 3, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s5.addText("Scan: chilli-mind.com", { x: 0.8, y: 0.9, w: 8.5, h: 0.7, fontSize: 34, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });

  // Overall score circle (simulated with oval + text)
  s5.addShape(pres.shapes.OVAL, { x: 1.2, y: 2.0, w: 2.2, h: 2.2, fill: { color: C.medGray }, line: { color: C.amber, width: 6 } });
  s5.addText("47", { x: 1.2, y: 2.2, w: 2.2, h: 1.4, fontSize: 52, fontFace: "Georgia", color: C.amber, bold: true, align: "center", margin: 0 });
  s5.addText("Overall", { x: 1.2, y: 3.4, w: 2.2, h: 0.5, fontSize: 12, fontFace: "Calibri", color: C.textMuted, align: "center", margin: 0 });

  // Score bars
  const scores = [
    { label: "AI Visibility", val: 21, col: C.red },
    { label: "Schema Health", val: 45, col: C.amber },
    { label: "Technical", val: 85, col: C.green },
  ];
  scores.forEach((sc, i) => {
    const yPos = 2.2 + i * 0.7;
    s5.addText(sc.label, { x: 4.2, y: yPos, w: 1.8, h: 0.3, fontSize: 13, fontFace: "Calibri", color: C.textLight, margin: 0 });
    s5.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: yPos + 0.05, w: 2.5, h: 0.22, fill: { color: C.medGray } });
    s5.addShape(pres.shapes.RECTANGLE, { x: 6.2, y: yPos + 0.05, w: 2.5 * (sc.val / 100), h: 0.22, fill: { color: sc.col } });
    s5.addText(String(sc.val), { x: 8.8, y: yPos, w: 0.7, h: 0.3, fontSize: 14, fontFace: "Georgia", color: sc.col, bold: true, margin: 0 });
  });

  s5.addText("Technisch stark, aber für AI-Engines fast unsichtbar.\nDas ist typisch \u2014 und genau die Lücke, die wir schließen.", {
    x: 0.8, y: 4.6, w: 8.5, h: 0.7, fontSize: 14, fontFace: "Calibri", color: C.textLight, align: "center"
  });

  // ============================================================
  // SLIDE 6: Google AI Overviews - LIVE Daten
  // ============================================================
  let s6 = pres.addSlide();
  s6.background = { color: C.black };
  s6.addText("GOOGLE AI OVERVIEWS \u2014 LIVE DATEN", { x: 0.8, y: 0.4, w: 6, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s6.addText([
    { text: "0", options: { color: C.red, bold: true } },
    { text: " von 10 Google-Anfragen\nempfehlen chilli mind", options: { color: C.white } },
  ], { x: 0.8, y: 0.9, w: 8.5, h: 1.0, fontSize: 32, fontFace: "Georgia", bold: true, margin: 0 });

  const queries = [
    "Best digital consultancies in Germany",
    "Top HMI design companies",
    "UX design agencies enterprise Europe",
    "Human-centered design agencies DACH",
    "Digital transformation consultancies manufacturing",
  ];
  queries.forEach((q, i) => {
    const yPos = 2.2 + i * 0.5;
    s6.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: yPos, w: 8.4, h: 0.42, fill: { color: "1A0508" } });
    s6.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: yPos, w: 0.06, h: 0.42, fill: { color: C.red } });
    s6.addImage({ data: iconX, x: 1.05, y: yPos + 0.08, w: 0.26, h: 0.26 });
    s6.addText("\u201E" + q + "\u201C", { x: 1.5, y: yPos, w: 7.5, h: 0.42, fontSize: 13, fontFace: "Calibri", color: C.textLight, valign: "middle", margin: 0 });
  });

  s6.addText("\u2026 und 5 weitere Queries \u2014 bei keiner einzigen wird chilli mind genannt.", {
    x: 0.8, y: 4.8, w: 8.5, h: 0.35, fontSize: 13, fontFace: "Calibri", color: C.red, align: "center", bold: true
  });
  s6.addText("Quelle: Google SERP API, Live-Abfrage vom 15. Februar 2026", {
    x: 0.8, y: 5.15, w: 8.5, h: 0.3, fontSize: 10, fontFace: "Calibri", color: C.textMuted, align: "center"
  });

  // ============================================================
  // SLIDE 7: Partnership Model
  // ============================================================
  let s7 = pres.addSlide();
  s7.background = { color: C.black };
  s7.addText("PARTNERSHIP MODEL", { x: 0.8, y: 0.4, w: 4, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s7.addText("Warum das für chilli mind funktioniert", { x: 0.8, y: 0.9, w: 8.5, h: 0.7, fontSize: 32, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });

  // Left card - chilli mind
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.9, w: 4.1, h: 3.2, fill: { color: C.medGray }, shadow: makeShadow() });
  s7.addShape(pres.shapes.RECTANGLE, { x: 0.8, y: 1.9, w: 4.1, h: 0.06, fill: { color: C.red } });
  s7.addText("chilli mind", { x: 1.1, y: 2.1, w: 3.5, h: 0.4, fontSize: 20, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });
  s7.addText("Vertrieb & Branding", { x: 1.1, y: 2.5, w: 3.5, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  s7.addText([
    { text: "+ 850+ bestehende Kundenprojekte", options: { breakLine: true, color: C.textLight } },
    { text: "+ Vertrauensvorschuss bei Enterprise-Kunden", options: { breakLine: true, color: C.textLight } },
    { text: "+ Kein Delivery-Aufwand", options: { breakLine: true, color: C.textLight } },
    { text: "+ 25% Provision = \u20AC5.000 pro Kunde/Jahr", options: { breakLine: true, color: C.white, bold: true } },
    { text: "+ Bei 10 Kunden: \u20AC50.000/Jahr zusätzlich", options: { color: C.green, bold: true } },
  ], { x: 1.1, y: 3.0, w: 3.6, h: 2.0, fontSize: 12, fontFace: "Calibri", paraSpaceAfter: 6 });

  // Right card - Delivery Partner
  s7.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.9, w: 4.1, h: 3.2, fill: { color: C.medGray }, shadow: makeShadow() });
  s7.addShape(pres.shapes.RECTANGLE, { x: 5.1, y: 1.9, w: 4.1, h: 0.06, fill: { color: C.red } });
  s7.addText("Delivery Partner", { x: 5.4, y: 2.1, w: 3.5, h: 0.4, fontSize: 20, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });
  s7.addText("AI-automatisierte Umsetzung", { x: 5.4, y: 2.5, w: 3.5, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  s7.addText([
    { text: "+ 80%+ automatisiert (Claude, Codex, Gemini)", options: { breakLine: true, color: C.textLight } },
    { text: "+ ~38h Aufwand pro Kunde/Jahr", options: { breakLine: true, color: C.textLight } },
    { text: "+ Skaliert auf 30+ Kunden", options: { breakLine: true, color: C.textLight } },
    { text: "+ 75% = \u20AC15.000 pro Kunde/Jahr", options: { breakLine: true, color: C.white, bold: true } },
    { text: "+ Effektiv: ~\u20AC400/Stunde", options: { color: C.green, bold: true } },
  ], { x: 5.4, y: 3.0, w: 3.6, h: 2.0, fontSize: 12, fontFace: "Calibri", paraSpaceAfter: 6 });

  // ============================================================
  // SLIDE 8: Roadmap
  // ============================================================
  let s8 = pres.addSlide();
  s8.background = { color: C.black };
  s8.addText("NÄCHSTE SCHRITTE", { x: 0.8, y: 0.4, w: 4, h: 0.3, fontSize: 11, fontFace: "Calibri", color: C.textMuted, charSpacing: 4, margin: 0 });
  s8.addText("4-Wochen Roadmap", { x: 0.8, y: 0.9, w: 8.5, h: 0.7, fontSize: 34, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });

  const roadmap = [
    { week: "Woche 1", title: "Scanner MVP finalisieren", desc: "Live-Scraping aller AI-Engines, Dashboard Setup" },
    { week: "Woche 2", title: "Pilot-Kunde scannen", desc: "Ersten chilli mind Kunden scannen, Case Study erstellen" },
    { week: "Woche 3", title: "Monitoring & Reporting", desc: "Automatisches monatliches Reporting aufsetzen" },
    { week: "Woche 4", title: "Go-to-Market", desc: "Sales Email an Top 20 chilli mind Kunden, erstes Closing" },
  ];

  // Timeline line
  s8.addShape(pres.shapes.LINE, { x: 1.5, y: 2.0, w: 0, h: 3.2, line: { color: C.medGray, width: 2 } });

  roadmap.forEach((r, i) => {
    const yPos = 2.0 + i * 0.82;
    s8.addShape(pres.shapes.OVAL, { x: 1.37, y: yPos + 0.08, w: 0.26, h: 0.26, fill: { color: C.red } });
    s8.addText(r.week, { x: 2.0, y: yPos, w: 1.2, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.red, bold: true, margin: 0 });
    s8.addText(r.title, { x: 3.3, y: yPos, w: 5.5, h: 0.3, fontSize: 15, fontFace: "Georgia", color: C.white, bold: true, margin: 0 });
    s8.addText(r.desc, { x: 3.3, y: yPos + 0.32, w: 5.5, h: 0.3, fontSize: 12, fontFace: "Calibri", color: C.textMuted, margin: 0 });
  });

  // ============================================================
  // SLIDE 9: CTA
  // ============================================================
  let s9 = pres.addSlide();
  s9.background = { color: C.black };

  // Logo
  s9.addShape(pres.shapes.OVAL, { x: 3.0, y: 1.2, w: 0.35, h: 0.35, fill: { color: C.red } });
  s9.addText("chilli mind  \u00D7  AI Visibility Engine", {
    x: 3.45, y: 1.2, w: 4.5, h: 0.35, fontSize: 16, fontFace: "Calibri", color: C.white, bold: true, margin: 0
  });

  // CTA box
  s9.addShape(pres.shapes.RECTANGLE, { x: 1.5, y: 2.2, w: 7, h: 2.0, fill: { color: C.red }, shadow: makeShadow() });
  s9.addText("Nächster Schritt", { x: 1.5, y: 2.4, w: 7, h: 0.6, fontSize: 28, fontFace: "Georgia", color: C.white, bold: true, align: "center", margin: 0 });
  s9.addText("Einen Pilot-Kunden wählen. Wir scannen kostenlos.\nErgebnis in 48 Stunden. Kein Risiko.", {
    x: 2.0, y: 3.0, w: 6, h: 0.9, fontSize: 16, fontFace: "Calibri", color: C.white, align: "center"
  });

  s9.addText("Der kostenlose Scan ist der beste Eisbrecher \u2014\njeder schlechte Score ist ein warmer Lead für \u20AC20k.", {
    x: 1.5, y: 4.6, w: 7, h: 0.7, fontSize: 13, fontFace: "Calibri", color: C.textMuted, align: "center"
  });

  // --- Write file ---
  const outPath = "output/AI-Visibility-Engine-Pitch.pptx";
  await pres.writeFile({ fileName: outPath });
  console.log("PowerPoint saved:", outPath);
}

generate().catch(console.error);
