import time
from pathlib import Path
from PIL import Image
import numpy as np
import cv2
import easyocr
import sys
import os

# Add backend directory to path
sys.path.append(str(Path(__file__).parent))

from app.services.ocr_service import clean_extracted_text

# Initialize reader
print("Initializing EasyOCR...")
reader = easyocr.Reader(['en', 'hi', 'mr'], gpu=False)

image_path = Path("../datasets/yolo_training/images/val/Airport PSAIRPORT-0025-2017-5144__1.jpg")
image = Image.open(image_path)

# Convert PIL to numpy RGB
img_array = np.array(image.convert("RGB"))

# Resize to max width 800px (preserving aspect ratio) for CPU speed
height, width = img_array.shape[:2]
target_width = 800
if width > target_width:
    ratio = float(target_width) / width
    new_height = int(height * ratio)
    img_array = cv2.resize(img_array, (target_width, new_height), interpolation=cv2.INTER_AREA)

# Run EasyOCR directly on the resized RGB image
start_time = time.time()
print("Running EasyOCR on resized RGB image (no binarization)...")
results = reader.readtext(img_array, detail=1, paragraph=True)
elapsed = time.time() - start_time

print(f"\nOCR Completed in {elapsed:.2f} seconds!")

texts = []
for result in results:
    if len(result) >= 2:
        texts.append(str(result[1]))

raw_text = "\n".join(texts)
cleaned = clean_extracted_text(raw_text)

print("\n--- Extracted Cleaned Text ---")
print(cleaned)

# Check specifically for "323" vs "313"
print("\nIs '323' in text?", "323" in cleaned)
print("Is '313' in text?", "313" in cleaned)
