import os
# Force HF Offline Mode
os.environ["TRANSFORMERS_OFFLINE"] = "1"
os.environ["HF_HUB_OFFLINE"] = "1"
os.environ["HF_OCR_ENABLE_TROCR"] = "false"

import sys
import json
import time
from pathlib import Path

# Add backend directory to path
sys.path.append(str(Path(__file__).parent))

from app.services.ocr_service import extract_text_from_image, clean_extracted_text
from app.services.ipc_extractor import extract_ipc_sections

demo_dir = Path("../demo_firs")
output_json = demo_dir / "analysis_results.json"
output_md = demo_dir / "analysis_results.md"

print(f"Demo directory: {demo_dir.resolve()}")
print(f"Output files: {output_json.name}, {output_md.name}")

image_files = sorted(list(demo_dir.glob("*.jpg")) + list(demo_dir.glob("*.png")) + list(demo_dir.glob("*.jpeg")))

# Filter out our results and intermediate files
image_files = [f for f in image_files if "crop" not in f.name]

print(f"Found {len(image_files)} images to process.")

results = {}

# Start generating Markdown Report early
md_content = """# Nyaya AI — Demo FIR Batch Analysis Report

This report contains the OCR text extraction and detected IPC section mappings for the 10 demo FIR images.
Use this to review the outputs and let us know if there are any corrections.

| Image Name | Detected IPC Sections | Confidence | Status |
| :--- | :--- | :--- | :--- |
"""

for idx, img_path in enumerate(image_files, 1):
    print(f"\n[{idx}/{len(image_files)}] Processing: {img_path.name}")
    start_time = time.time()
    
    try:
        with open(img_path, "rb") as f:
            img_bytes = f.read()
            
        raw_text, conf, method = extract_text_from_image(img_bytes, preprocess=True)
        cleaned = clean_extracted_text(raw_text)
        
        ipc_results = extract_ipc_sections(cleaned)
        
        elapsed = time.time() - start_time
        print(f"  Completed in {elapsed:.2f} seconds.")
        
        detected_secs = [r["section"] for r in ipc_results]
        print(f"  Detected IPCs: {detected_secs}")
        
        results[img_path.name] = {
            "raw_text": raw_text,
            "cleaned_text": cleaned,
            "detected_ipc_sections": ipc_results,
            "ocr_confidence": conf,
            "processing_time_seconds": round(elapsed, 2)
        }
        
        # Append to summary table
        sec_str = ", ".join(detected_secs) if detected_secs else "None Detected"
        conf_str = f"{conf*100:.1f}%" if conf <= 1.0 else f"{conf:.1f}%"
        md_content += f"| `{img_path.name}` | **{sec_str}** | {conf_str} | ✅ Success |\n"
        
    except Exception as e:
        print(f"  Error processing: {e}")
        results[img_path.name] = {
            "error": str(e)
        }
        md_content += f"| `{img_path.name}` | *N/A* | *N/A* | ❌ Failed ({str(e)}) |\n"

# Add detailed breakdown section to MD
md_content += "\n## Detailed Mappings per FIR\n\n"

for img_name, data in results.items():
    md_content += f"### 📄 `{img_name}`\n"
    if "error" in data:
        md_content += f"**Status:** Failed\n**Error:** {data['error']}\n\n"
        continue
        
    md_content += f"**OCR Confidence:** {data['ocr_confidence']:.2f}%\n"
    md_content += f"**Processing Time:** {data['processing_time_seconds']} seconds\n\n"
    
    md_content += "**Detected IPC Sections:**\n"
    if not data["detected_ipc_sections"]:
        md_content += "- None Detected\n"
    else:
        for r in data["detected_ipc_sections"]:
            md_content += f"- **IPC Section {r['section']}:** {r['title']}\n"
            md_content += f"  - *Punishment:* {r['punishment']}\n"
            md_content += f"  - *Category:* {r['category']}\n"
            md_content += f"  - *Details:* {r['description']}\n"
            
    md_content += "\n**Cleaned OCR Text Snippet:**\n"
    snippet = data["cleaned_text"][:400] + "..." if len(data["cleaned_text"]) > 400 else data["cleaned_text"]
    md_content += f"```text\n{snippet}\n```\n\n---\n\n"

# Save JSON and MD
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(results, f, indent=2, ensure_ascii=False)
    
with open(output_md, "w", encoding="utf-8") as f:
    f.write(md_content)

print(f"\nAll files processed successfully! Report generated at: {output_md.resolve()}")
