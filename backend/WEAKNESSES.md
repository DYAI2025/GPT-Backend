# Schwachstellen-Analyse

Die wichtigsten Funktionspfade (Health, Memory, ZIP-Bundle, Canva-Renderer, Template-Renderer) wurden manuell geprüft und per `npm test` (Vitest-Sanity) ausgeführt.

## Behobene Hauptschwachstelle
- **Lokale Speicherpfade nicht auslieferbar:** In Umgebungen ohne Supabase fielen Uploads auf lokale Pfade (z. B. `./uploads/zips/...`), die der Server jedoch nicht als statische Dateien bereitstellte. Dadurch zeigten generierte Download-URLs nur 404. Jetzt werden lokale Dateien automatisch unter `/files` ausgespielt, sobald der Dienst im Local-Storage-Modus läuft.

## Weitere Schwachstellen, die die Zuverlässigkeit einschränken
- **PDF-Render-Fallback gibt nur HTML zurück:** Das Template-Rendering nutzt bewusst keinen PDF-Renderer und liefert bei `output="pdf"` denselben HTML-Buffer zurück. API-Konsumenten erhalten somit keine echten PDFs.
- **ZIP-Downloads ohne Timeouts/Größenlimits:** Beim Herunterladen externer Dateien (`sourceUrl`) fehlen Timeouts und Größenbegrenzungen. Große oder hängende Downloads könnten Ressourcen blockieren und Requests verzögern.
- **Memory-Endpunkte hart an Supabase gekoppelt:** Ohne gültige `SUPABASE_URL`/`SUPABASE_SERVICE_KEY` schlagen `/memory/*`-Aufrufe mit 500 fehl. Eine dezentere Degradierung oder lokaler Fallback fehlt.
- **Fehlende automatisierte E2E-Checks:** Bis auf einen Sanity-Test existieren keine automatisierten Integrations- oder Contract-Tests für die Endpunkte, wodurch Regressionen leicht unentdeckt bleiben.

## Vorschlag für den nächsten Schritt
- **Echten PDF-Renderpfad integrieren (z. B. Playwright/Puppeteer) und mit Contract-Tests absichern.** Damit ließen sich die Template- und Canva-Outputs verlässlich als PDF bereitstellen und gleichzeitig per Testlauf gegen Beispiel-Specs validieren.
- **Für Version 4 ergänzen:** Echte PDF-Generierung implementieren (z. B. svg-to-pdfkit oder Headless-Browser mit Timeout- und Size-Limits), damit Canva- und Template-PDFs pixelgetreu sowie stabil ausgeliefert werden können.
