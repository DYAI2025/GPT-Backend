Diese Datei beschreibt alle verfügbaren Sprachbefehle, die der GPT mit dem Skill „Canva TSV Bulk Automation Agent“ versteht und ausführen kann.

---

## 🧱 1️⃣ Grundbefehle für den Einstieg

| Befehl | Beschreibung | Beispiel |
|--------|---------------|----------|
| 🟢 `zeige befehle` | Listet alle verfügbaren Funktionen und Workflows auf | „Zeige mir alle Canva-Befehle.“ |
| 🟢 `hilfe` | Kurze Erklärung der Arbeitsweise des Skills | „Wie funktioniert dieser Skill?“ |
| 🟢 `status` | Zeigt an, ob Branding, Schema und TSV-Module geladen sind | „Zeige aktuellen Status.“ |

---

## 🎨 2️⃣ Brand Setup & Speicherbefehle

| Befehl | Beschreibung | Beispiel |
|--------|---------------|----------|
| 🎨 `setze marke` | Setzt Branding-Infos (Farben, Fonts, Name) und speichert sie persistent | „Meine Marke heißt GreenForest, Farben #006633 und Weiß.“ |
| 🧠 `zeige marke` | Zeigt aktuell gespeicherte Brand-Daten (aus Memory / Backend) | „Welche Markenfarben habe ich gespeichert?“ |
| 🧹 `lösche marke` | Entfernt alle gespeicherten Brand-Infos | „Markeninformationen löschen.“ |

---

## 📄 3️⃣ Content & Struktur

| Befehl | Beschreibung | Beispiel |
|--------|---------------|----------|
| 🧩 `analysiere inhalte` | Liest gemischte Eingaben (Text, Bilder, Tabellen) und klassifiziert sie | „Analysiere meine 10 Produkttexte und 10 Bilder.“ |
| 🧱 `erzeuge slots` | Erstellt automatisch Slot-Modell (Text- und Bildfelder) | „Erzeuge Slots für ein Social-Media-Post-Karussell.“ |
| 🧩 `zeige slots` | Zeigt aktuelle Slot-Struktur | „Welche Slots habe ich im Modell?“ |
| 🧩 `ändere slot` | Bearbeitet oder entfernt einen Slot | „Ändere headline_1 auf max 60 Zeichen.“ |

---

## 🧮 4️⃣ Canva Spec & TSV-Erstellung

| Befehl | Beschreibung | Beispiel |
|--------|---------------|----------|
| 🧾 `erzeuge canva_spec` | Generiert das Layout-Schema (`canva_spec.json`) | „Erzeuge canva_spec für ein Instagram-Karussell.“ |
| 📊 `erzeuge tsv` | Baut automatisch TSV-Datei auf Basis der Spec | „Erstelle TSV aus meinen Zitaten und Bildern.“ |
| 🧩 `validiere spec` | Prüft canva_spec gegen Schema | „Validiere meine canva_spec.json.“ |
| 🧩 `validiere tsv` | Prüft TSV gegen Spec | „Validiere example.tsv gegen canva_spec.json.“ |

---

## 💾 5️⃣ Export & Integration in Canva

| Befehl | Beschreibung | Beispiel |
|--------|---------------|----------|
| 📦 `exportiere nach canva` | Erstellt Exportpaket (`canva_spec.json` + `tsv.txt`) für Upload in Canva Bulk Create | „Exportiere das Canva-Paket für meinen Post.“ |
| 🔗 `zeige canva schritte` | Erklärt dem User, wie der Export in Canva funktioniert | „Wie lade ich das TSV in Canva hoch?“ |
| 📂 `exportiere zip` | Erstellt ZIP-Archiv für komplettes Paket | „Packe alles in ein ZIP zum Herunterladen.“ |
| 🧭 `zeige exportanleitung` | Gibt Schritt-für-Schritt Canva-Import-Guide | „Wie nutze ich das TSV in Canva?“ |

---

## 📌 6️⃣ Pinterest-Pin-Erstellung (Templates & Variationen)

| Befehl | Beschreibung | Beispiel |
|--------|---------------|----------|
| 📌 `erstelle pin` | Erstellt Pinterest-Post (Pin) anhand eines Themas oder Textes | „Erstelle mir einen Pin über gesundes Frühstück.“ |
| 🌓 `erstelle zwei varianten` | Baut automatisch helle & dunkle Designvarianten | „Erstelle zwei Varianten meines Produkt-Pins.“ |
| ✨ `nutze template` | Wählt automatisch passendes Template (`pinterest-quote`, `pinterest-tips`, `pinterest-story`) | „Nutze das Zitat-Template für meinen Pin.“ |
| 🧠 `zeige canva details` | Gibt genaue Canva-Nachbauanweisungen (Farben, Fonts, Textfelder) | „Wie kann ich das Design in Canva manuell nachbauen?“ |

---

## 🧰 7️⃣ Tools & Validierung

| Befehl | Beschreibung | Beispiel |
|--------|---------------|----------|
| 🧮 `zeige tools` | Listet verfügbare Tool-Funktionen auf | „Welche Tools stehen mir zur Verfügung?“ |
| 🧪 `prüfe konsistenz` | Führt vollständige Prüfung (Spec + TSV) durch | „Prüfe mein Projekt auf Fehler.“ |
| 🧠 `bias check` | Führt Bias-/Overclaim-Prüfung aus | „Führe Bias-Check aus.“ |
| 🧾 `zeige bericht` | Zeigt Validierungsbericht | „Zeige mir das Validation Summary.“ |

---

## ⚙️ 8️⃣ Administration & Debug

| Befehl | Beschreibung | Beispiel |
|--------|---------------|----------|
| 🧩 `zeige schema` | Zeigt aktuelle Schema-Version | „Welches canva_spec-Schema wird genutzt?“ |
| 🔄 `aktualisiere schema` | Lädt neue Schema-Version | „Aktualisiere canva_spec auf v1.1.“ |
| 📦 `zeige ordnerstruktur` | Zeigt aktuelle Skill-Struktur | „Zeig mir alle Dateien des Skills.“ |
| 🧹 `reset` | Löscht temporäre Daten, Slots, Variablen | „Skill zurücksetzen.“ |

---

## 🖼️ 9️⃣ Visualisierung & Vorschau (Backend Features)

| Befehl | Beschreibung | Beispiel |
|--------|---------------|----------|
| 👁️ `vorschau` / `preview` | Rendert eine HTML-Vorschau des Designs direkt im Browser | „Zeig mir eine Vorschau meines Designs.“ |
| 📄 `pdf` / `download pdf` | Generiert das Design als PDF-Datei zum Download | „Gib mir das als PDF aus.“ |
| 🎨 `switch mode` | Wechselt die Vorschau zwischen Light/Dark Mode (im Preview Fenster) | (Interaktiv im Preview-Fenster) |
| 🔄 `live render` | Rendert das Design neu mit aktuellen Daten | „Render das Design bitte nochmal neu.“ |

---

## 🧭 Bonus: Schnellhilfe

Wenn der Nutzer fragt:

> „Was kann ich hier machen?“
> „Wie exportiere ich nach Canva?“
> „Wie erstelle ich einen Pin?“

→ GPT antwortet mit einer Kurzübersicht der 12 wichtigsten Befehle:

1️⃣ erstelle pin – Pinterest-Post generieren
2️⃣ vorschau – Live HTML-Vorschau anzeigen
3️⃣ exportiere nach canva – TSV & Spec fürs Bulk Create
4️⃣ pdf – PDF-Datei herunterladen
5️⃣ exportiere zip – Alle Assets gebündelt laden
6️⃣ validiere spec – Schema prüfen
7️⃣ setze marke – Branding definieren
8️⃣ zeige canva schritte – Canva-Upload erklären
9️⃣ erstelle zwei varianten – helle & dunkle Version
10️⃣ bias check – übertriebene Aussagen prüfen
11️⃣ zeige tools – Tools & Validatoren
12️⃣ zeige slots – aktuelle Text-/Bildslots