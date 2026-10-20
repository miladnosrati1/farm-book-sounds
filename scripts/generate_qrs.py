#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Farm Animal Sounds - QR Code & Audio Asset Generator
Author: miladnosrati1
Project: farm-book-sounds
Description: Generates 300DPI PNG & SVG QR codes for 9 farm animals and creates manifest.csv
"""

import os
import sys
import json
import csv
import math
import struct
import wave
import argparse
from pathlib import Path

# Fix Windows console UTF-8 output encoding
if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except AttributeError:
        pass

try:
    import qrcode
    import qrcode.image.svg
    from PIL import Image, ImageDraw, ImageFont
except ImportError as e:
    print(f"Missing required package: {e}")
    print("Please install requirements: pip install qrcode[pil] pillow arabic-reshaper python-bidi")
    sys.exit(1)

try:
    import arabic_reshaper
    from bidi.algorithm import get_display
    HAS_BIDI = True
except ImportError:
    HAS_BIDI = False
    print("Warning: arabic_reshaper or python-bidi not found. Persian text in PNG might not be properly shaped.")

# Base URL for GitHub Pages
DEFAULT_BASE_URL = "https://miladnosrati1.github.io/farm-book-sounds/"

PROJECT_ROOT = Path(__file__).resolve().parent.parent
DATA_FILE = PROJECT_ROOT / "data" / "animals.json"
AUDIO_DIR = PROJECT_ROOT / "audio"
OUTPUT_DIR = PROJECT_ROOT / "qr_output"
SVG_DIR = OUTPUT_DIR / "svg"
PNG_DIR = OUTPUT_DIR / "png_300dpi"
FONTS_DIR = PROJECT_ROOT / "scripts" / "fonts"

def format_persian_text(text: str) -> str:
    """Reshape and reorder Persian text for proper RTL display in Pillow."""
    if not HAS_BIDI:
        return text
    try:
        configuration = {
            'delete_harakat': False,
            'support_ligatures': True,
        }
        reshaper = arabic_reshaper.ArabicReshaper(configuration=configuration)
        reshaped = reshaper.reshape(text)
        return get_display(reshaped)
    except Exception:
        return text

def get_persian_font(size: int = 36):
    """Find and return an appropriate Persian font."""
    # 1. Bundled Vazirmatn font
    vazir_path = FONTS_DIR / "Vazirmatn-Bold.ttf"
    if vazir_path.exists():
        try:
            return ImageFont.truetype(str(vazir_path), size)
        except Exception:
            pass

    # 2. Windows system fonts with Persian support
    system_font_candidates = [
        r"C:\Windows\Fonts\tahomabd.ttf",
        r"C:\Windows\Fonts\tahoma.ttf",
        r"C:\Windows\Fonts\arialbd.ttf",
        r"C:\Windows\Fonts\arial.ttf",
        r"C:\Windows\Fonts\segoeuib.ttf",
        "/System/Library/Fonts/Supplemental/Tahoma.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    ]
    for font_path in system_font_candidates:
        if os.path.exists(font_path):
            try:
                return ImageFont.truetype(font_path, size)
            except Exception:
                continue

    return ImageFont.load_default()

def ensure_sample_audio_exists(animal: dict):
    """Check if audio exists; if not, generate a pleasant harmonic tone sample."""
    audio_path = PROJECT_ROOT / animal.get("audio", f"audio/{animal['id']}.mp3")
    if audio_path.exists() and audio_path.stat().st_size > 100:
        return

    audio_path.parent.mkdir(parents=True, exist_ok=True)
    print(f"Generating synthetic sample audio for {animal['name']} ({animal['id']})...")

    # Generate harmonic sound wave
    sample_rate = 44100
    duration = 2.5
    total_samples = int(sample_rate * duration)
    
    # Specific base frequency per animal for recognizable pitch
    freq_map = {
        "hen": 650.0,
        "cow": 130.0,
        "sheep": 220.0,
        "goose": 480.0,
        "duck": 380.0,
        "donkey": 290.0,
        "dog": 320.0,
        "horse": 350.0,
        "goat": 260.0
    }
    base_freq = freq_map.get(animal["id"], 440.0)

    raw_pcm = bytearray()
    for i in range(total_samples):
        t = i / sample_rate
        # Envelope: Attack, Decay, Sustain, Release
        env = math.sin(math.pi * (i / total_samples)) ** 0.5
        # Modulated wave (animal-like cadence)
        mod = 1.0 + 0.15 * math.sin(2 * math.pi * 5 * t)
        val = (
            0.6 * math.sin(2 * math.pi * base_freq * mod * t) +
            0.25 * math.sin(2 * math.pi * base_freq * 2 * mod * t) +
            0.15 * math.sin(2 * math.pi * base_freq * 3 * mod * t)
        )
        sample = int(val * env * 24000)
        raw_pcm.extend(struct.pack("<h", max(-32768, min(32767, sample))))

    # Try encoding to MP3 with lameenc if available, or write valid mp3 / wav fallback
    try:
        import lameenc
        encoder = lameenc.Encoder()
        encoder.set_bit_rate(128)
        encoder.set_in_sample_rate(sample_rate)
        encoder.set_channels(1)
        encoder.set_quality(2)
        mp3_bytes = encoder.encode(bytes(raw_pcm)) + encoder.flush()
        with open(audio_path, "wb") as f:
            f.write(mp3_bytes)
        print(f"  Created MP3 sample: {audio_path.name}")
    except Exception:
        # Fallback to WAV format named mp3 or standard wave
        wav_path = audio_path.with_suffix(".wav")
        with wave.open(str(wav_path), "wb") as w:
            w.setnchannels(1)
            w.setsampwidth(2)
            w.setframerate(sample_rate)
            w.writeframes(raw_pcm)
        print(f"  Created WAV sample: {wav_path.name}")

def generate_svg_qr(url: str, output_path: Path):
    """Generate clean vector SVG QR code (ideal for InDesign and Illustrator vector imports)."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=2,
        image_factory=qrcode.image.svg.SvgPathImage
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image()
    img.save(str(output_path))

def generate_png_300dpi_qr(url: str, animal: dict, output_path: Path):
    """
    Generate high-resolution 300 DPI PNG QR code with a Persian label below.
    Dimensions: 800 x 950 px at 300 DPI (~6.8 cm x 8.0 cm printable size).
    """
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_Q, # High error correction for robust book scanning
        box_size=20,
        border=3,
    )
    qr.add_data(url)
    qr.make(fit=True)
    qr_img = qr.make_image(fill_color="#1E293B", back_color="#FFFFFF").convert("RGB")
    
    qr_w, qr_h = qr_img.size
    
    # Calculate dimensions
    banner_height = 140
    total_w = qr_w
    total_h = qr_h + banner_height
    
    # Canvas
    final_img = Image.new("RGB", (total_w, total_h), "#FFFFFF")
    final_img.paste(qr_img, (0, 0))
    
    draw = ImageDraw.Draw(final_img)
    
    # Subtle separator line
    draw.line([(40, qr_h - 10), (total_w - 40, qr_h - 10)], fill="#E2E8F0", width=2)
    
    # Persian text rendering
    animal_persian_name = animal.get("name", "")
    label_text = f"صدای {animal_persian_name}"
    display_text = format_persian_text(label_text)
    
    font = get_persian_font(size=44)
    subfont = get_persian_font(size=24)
    
    # Compute text position for center alignment
    try:
        # Pillow 8+ textbbox
        bbox = draw.textbbox((0, 0), display_text, font=font)
        text_w = bbox[2] - bbox[0]
        text_h = bbox[3] - bbox[1]
    except AttributeError:
        text_w, text_h = draw.textsize(display_text, font=font)
        
    text_x = (total_w - text_w) // 2
    text_y = qr_h + 15
    
    draw.text((text_x, text_y), display_text, fill="#0F172A", font=font)
    
    # English ID sublabel
    sub_text = f"({animal['id']})"
    try:
        sub_bbox = draw.textbbox((0, 0), sub_text, font=subfont)
        sub_w = sub_bbox[2] - sub_bbox[0]
    except AttributeError:
        sub_w, _ = draw.textsize(sub_text, font=subfont)
    
    sub_x = (total_w - sub_w) // 2
    sub_y = text_y + text_h + 16
    draw.text((sub_x, sub_y), sub_text, fill="#64748B", font=subfont)
    
    # Save with 300 DPI metadata
    final_img.save(str(output_path), dpi=(300, 300), quality=95)

def main():
    parser = argparse.ArgumentParser(description="Generate QR codes and audio assets for children's farm book.")
    parser.add_argument("--base-url", default=DEFAULT_BASE_URL, help="Base URL of GitHub Pages")
    args = parser.parse_args()
    
    base_url = args.base_url.rstrip("/") + "/"
    print(f"=== Farm Book QR & Asset Generator ===")
    print(f"Base URL: {base_url}")
    
    # Ensure directories
    SVG_DIR.mkdir(parents=True, exist_ok=True)
    PNG_DIR.mkdir(parents=True, exist_ok=True)
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    
    if not DATA_FILE.exists():
        print(f"Error: {DATA_FILE} does not exist.")
        sys.exit(1)
        
    with open(DATA_FILE, "r", encoding="utf-8") as f:
        animals = json.load(f)
        
    manifest_rows = []
    
    for idx, animal in enumerate(animals, start=1):
        a_id = animal["id"]
        a_name = animal["name"]
        a_emoji = animal.get("emoji", "")
        
        # 1. Verify / generate audio
        ensure_sample_audio_exists(animal)
        
        # 2. Build target URLs
        player_url = f"{base_url}?s={a_id}"
        audio_rel_path = animal.get("audio", f"audio/{a_id}.mp3")
        audio_direct_url = f"{base_url}{audio_rel_path}"
        
        # 3. Generate Vector SVG
        svg_filename = f"{a_id}.svg"
        svg_path = SVG_DIR / svg_filename
        generate_svg_qr(player_url, svg_path)
        
        # 4. Generate 300 DPI PNG
        png_filename = f"{a_id}.png"
        png_path = PNG_DIR / png_filename
        generate_png_300dpi_qr(player_url, animal, png_path)
        
        print(f"[{idx}/{len(animals)}] Generated QR for {a_name} ({a_id}):")
        print(f"   -> Player URL: {player_url}")
        print(f"   -> SVG: {svg_path.relative_to(PROJECT_ROOT)}")
        print(f"   -> PNG 300DPI: {png_path.relative_to(PROJECT_ROOT)}")
        
        manifest_rows.append({
            "ردیف": idx,
            "نام حیوان": a_name,
            "شناسه": a_id,
            "ایموجی": a_emoji,
            "لینک پلیر (QR)": player_url,
            "لینک مستقیم صوت": audio_direct_url,
            "فایل وکتور SVG": f"svg/{svg_filename}",
            "فایل چاپی PNG": f"png_300dpi/{png_filename}"
        })
        
    # Write manifest.csv with utf-8-sig for Persian Excel compatibility
    manifest_path = OUTPUT_DIR / "manifest.csv"
    fieldnames = [
        "ردیف", "نام حیوان", "شناسه", "ایموجی",
        "لینک پلیر (QR)", "لینک مستقیم صوت",
        "فایل وکتور SVG", "فایل چاپی PNG"
    ]
    
    with open(manifest_path, "w", encoding="utf-8-sig", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(manifest_rows)
        
    print(f"\nManifest successfully written to: {manifest_path.relative_to(PROJECT_ROOT)}")
    print(f"All assets generated successfully!")

if __name__ == "__main__":
    main()
