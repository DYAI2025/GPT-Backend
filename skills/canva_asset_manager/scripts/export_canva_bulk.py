import csv, json, os, zipfile
from datetime import datetime

def export_canva_bulk(design_path: str, output_dir: str):
    os.makedirs(output_dir, exist_ok=True)
    with open(design_path, encoding='utf-8') as f:
        design = json.load(f)
    slot_names = [el['id'] for p in design.get('pages', []) for el in p.get('elements', [])]
    content_rows = design.get('content_rows', [])
    brand = design.get('metadata', {}).get('brand', 'UnknownBrand')

    tsv_path = os.path.join(output_dir, 'canva_layout.tsv')
    with open(tsv_path, 'w', encoding='utf-8', newline='') as tsv_file:
        writer = csv.writer(tsv_file, delimiter='\t')
        writer.writerow(slot_names)
        writer.writerow([f'[{s.upper()}]' for s in slot_names])

    csv_path = os.path.join(output_dir, 'canva_content.csv')
    with open(csv_path, 'w', encoding='utf-8', newline='') as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=slot_names)
        writer.writeheader()
        for row in content_rows:
            writer.writerow({k: v for k, v in row.items() if k in slot_names})

    manifest_path = os.path.join(output_dir, 'manifest.json')
    manifest = {
        'export_type': 'canva_bulk_dual',
        'brand': brand,
        'layout_file': 'canva_layout.tsv',
        'content_file': 'canva_content.csv',
        'mapping': {s: s for s in slot_names},
        'generated_at': datetime.utcnow().isoformat() + 'Z',
    }
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)

    zip_path = os.path.join(output_dir, 'canva_bulk_export.zip')
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for path in [tsv_path, csv_path, manifest_path]:
            zipf.write(path, os.path.basename(path))

    print('✅ Canva Bulk Export abgeschlossen.')
    print('ZIP gespeichert unter:', zip_path)
    return zip_path

if __name__ == '__main__':
    import sys
    if len(sys.argv) < 3:
        print('Usage: python scripts/export_canva_bulk.py <design.json> <output_dir>')
    else:
        export_canva_bulk(sys.argv[1], sys.argv[2])
