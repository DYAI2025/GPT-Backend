# Canva Spec Overview

Diese Datei beschreibt die Kernstruktur der `canva_spec`-Datei:

```json
{
  "version": "1.0",
  "content_type": "social_post_carousel",
  "metadata": {
    "brand": "BrandName",
    "colors": ["#0000FF", "#FFFFFF"],
    "fonts": ["Playfair Display", "Inter"]
  },
  "pages": [
    {
      "id": "page_1",
      "purpose": "quote",
      "elements": [
        {"id": "quote_text", "kind": "text", "max_characters": 80},
        {"id": "author_name", "kind": "text", "max_characters": 30},
        {"id": "background_image", "kind": "image_placeholder"}
      ]
    }
  ],
  "assumptions": [
    "Annahme: Quadratisches 1:1 Format für Social Posts.",
    "Annahme: Canva Bulk Create nutzt Tab-getrennte TSV-Dateien."
  ]
}
```