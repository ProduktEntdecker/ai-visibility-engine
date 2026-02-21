# CLAUDE.md - AI Visibility Engine

## Code Patterns

### CommonJS Encoding (KRITISCH)
- **Keine typografischen Anführungszeichen** (`„"`, `""`, `''`) in `.js`/`.cjs`-Dateien
- Nur ASCII-Quotes verwenden: `"..."` oder `'...'`
- Deutsche Umlaute in Strings sind OK, aber als Unicode-Escapes wenn im CJS-Kontext Probleme auftreten (`\u00E4` statt `ä`)
- **Hintergrund**: PptxGenJS-Scripts laufen als CommonJS — Unicode-Anführungszeichen erzeugen SyntaxErrors, die schwer zu debuggen sind (KW08: 4x aufgetreten, 1x Wiederholfehler)
