#!/usr/bin/env python3
"""
DeineFenster.de – KI-Bildgenerator
Erstellt fotorealistische Produktbilder mit Google Gemini / Imagen 4.

Verwendung:
  python3 scripts/generate-image.py --prompt "Deine Beschreibung" --output dateiname
  python3 scripts/generate-image.py --prompt "Deine Beschreibung" --output dateiname --reference img/masters/sarah/1-fenster.png

Beispiele stehen in scripts/HOW-TO-GENERATE-IMAGES.md
"""

import argparse
import os
import sys
from pathlib import Path

# .env aus dem Projekt-Root laden
project_root = Path(__file__).parent.parent
env_path = project_root / ".env"

try:
    from dotenv import load_dotenv
    load_dotenv(env_path, override=True)  # .env hat Vorrang vor Shell-Umgebungsvariablen
except ImportError:
    print("FEHLER: python-dotenv nicht installiert. Bitte: pip3 install python-dotenv")
    sys.exit(1)

try:
    from google import genai
    from google.genai import types
except ImportError:
    print("FEHLER: google-genai nicht installiert. Bitte: pip3 install google-genai")
    sys.exit(1)

try:
    from PIL import Image
    import io
except ImportError:
    print("FEHLER: Pillow nicht installiert. Bitte: pip3 install Pillow")
    sys.exit(1)


# Verfügbare Modelle (in Priorität-Reihenfolge)
IMAGE_MODELS = [
    "gemini-2.5-flash-image",           # Gemini 2.5 Flash mit Bildgenerierung
    "gemini-3.1-flash-image-preview",   # Neuere Preview-Version
    "gemini-3-pro-image-preview",       # Pro-Version (höhere Qualität)
]

IMAGEN_MODELS = [
    "imagen-4.0-fast-generate-001",     # Schnell (für Tests)
    "imagen-4.0-generate-001",          # Standard
    "imagen-4.0-ultra-generate-001",    # Höchste Qualität
]


def parse_args():
    parser = argparse.ArgumentParser(
        description="DeineFenster.de Bildgenerator mit Google Imagen 4 / Gemini"
    )
    parser.add_argument(
        "--prompt", "-p",
        required=True,
        help='Beschreibung des Bildes, z.B. "modernes weißes Kunststofffenster"'
    )
    parser.add_argument(
        "--output", "-o",
        default=None,
        help='Dateiname (ohne .png), z.B. "2-balkontur". Wird in /img/masters/sarah/ gespeichert.'
    )
    parser.add_argument(
        "--reference", "-r",
        default=None,
        help='(Optional) Pfad zu einem Referenzbild für den Stil'
    )
    parser.add_argument(
        "--model",
        default="auto",
        help='Modell-Name oder "auto" für automatische Auswahl'
    )
    parser.add_argument(
        "--engine",
        default="gemini",
        choices=["gemini", "imagen"],
        help='Engine: gemini (Standard, unterstützt Referenzbilder) oder imagen (Imagen 4)'
    )
    return parser.parse_args()


def build_deinefenster_prompt(user_prompt: str) -> str:
    """Ergänzt den User-Prompt mit dem DeineFenster-Stil."""
    style_suffix = (
        ", product catalog photography, clean minimal neutral background, "
        "architectural product rendering, professional studio lighting, "
        "Drutex manufacturer catalog style, commercial photography, "
        "photorealistic, high resolution, white or neutral gray background, "
        "no people, no text"
    )
    return user_prompt + style_suffix


def try_gemini_image(client, prompt: str, output_path: Path, reference_path: str = None, model: str = None) -> bool:
    """Generiert ein Bild mit Gemini Image-Modellen."""
    models_to_try = [model] if model and model != "auto" else IMAGE_MODELS

    for model_name in models_to_try:
        print(f"Versuche Modell: {model_name}")
        try:
            contents = []

            if reference_path and Path(reference_path).exists():
                print(f"  Referenzbild geladen: {reference_path}")
                with open(reference_path, "rb") as f:
                    ref_bytes = f.read()
                contents.append(types.Part.from_bytes(data=ref_bytes, mime_type="image/png"))
                contents.append(f"Erstelle ein ähnliches Produktfoto im gleichen Stil: {prompt}")
            else:
                contents = [prompt]

            response = client.models.generate_content(
                model=model_name,
                contents=contents,
                config=types.GenerateContentConfig(
                    response_modalities=["TEXT", "IMAGE"],
                ),
            )

            for part in response.candidates[0].content.parts:
                if part.inline_data and part.inline_data.mime_type.startswith("image/"):
                    img = Image.open(io.BytesIO(part.inline_data.data))
                    img.save(output_path, "PNG")
                    print(f"  Modell {model_name} hat funktioniert!")
                    return True

            print(f"  {model_name}: Kein Bild in Antwort")

        except Exception as e:
            err = str(e)[:120]
            if "quota" in err.lower() or "429" in err:
                print(f"  {model_name}: Quota-Limit. Versuche nächstes Modell...")
            elif "not found" in err.lower() or "404" in err:
                print(f"  {model_name}: Modell nicht verfügbar")
            else:
                print(f"  {model_name}: Fehler – {err}")

    return False


def try_imagen(client, prompt: str, output_path: Path, model: str = None) -> bool:
    """Generiert ein Bild mit Imagen 4 (predict API)."""
    models_to_try = [model] if model and model != "auto" else IMAGEN_MODELS

    for model_name in models_to_try:
        print(f"Versuche Imagen-Modell: {model_name}")
        try:
            response = client.models.generate_images(
                model=model_name,
                prompt=prompt,
                config=types.GenerateImagesConfig(
                    number_of_images=1,
                    aspect_ratio="4:3",
                    safety_filter_level="BLOCK_LOW_AND_ABOVE",
                    person_generation="DONT_ALLOW",
                ),
            )

            if response.generated_images:
                image_bytes = response.generated_images[0].image.image_bytes
                img = Image.open(io.BytesIO(image_bytes))
                img.save(output_path, "PNG")
                print(f"  Imagen {model_name} hat funktioniert!")
                return True

            print(f"  {model_name}: Keine Bilder generiert")

        except Exception as e:
            err = str(e)[:120]
            if "quota" in err.lower() or "429" in err:
                print(f"  {model_name}: Quota-Limit. Versuche nächstes Modell...")
            elif "not found" in err.lower() or "404" in err:
                print(f"  {model_name}: Modell nicht verfügbar")
            else:
                print(f"  {model_name}: Fehler – {err}")

    return False


def main():
    args = parse_args()

    # API Key prüfen
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print(f"FEHLER: GEMINI_API_KEY nicht gefunden in {env_path}")
        print("Stelle sicher dass deine .env Datei GEMINI_API_KEY=... enthält.")
        sys.exit(1)

    # Output-Pfad bestimmen
    output_dir = project_root / "img" / "masters" / "sarah"
    output_dir.mkdir(parents=True, exist_ok=True)

    if args.output:
        filename = args.output if args.output.endswith(".png") else args.output + ".png"
    else:
        safe_name = args.prompt[:30].lower().replace(" ", "-").replace("/", "-")
        safe_name = "".join(c for c in safe_name if c.isalnum() or c == "-")
        filename = f"generated-{safe_name}.png"

    output_path = output_dir / filename

    # Prompt mit Stil anreichern
    full_prompt = build_deinefenster_prompt(args.prompt)

    print(f"\nDeineFenster.de Bildgenerator")
    print(f"{'=' * 40}")
    print(f"Prompt: {args.prompt}")
    print(f"Ausgabe: {output_path}")
    print()

    client = genai.Client(api_key=api_key)

    # Bild generieren — Engine-Reihenfolge
    success = False

    if args.engine == "imagen":
        success = try_imagen(client, full_prompt, output_path, args.model)
        if not success:
            print("\nFallback: Versuche Gemini Image...")
            success = try_gemini_image(client, full_prompt, output_path, args.reference, args.model)
    else:
        # Standard: Gemini zuerst (unterstützt Referenzbilder), dann Imagen
        success = try_gemini_image(client, full_prompt, output_path, args.reference, args.model)
        if not success:
            print("\nFallback: Versuche Imagen 4...")
            success = try_imagen(client, full_prompt, output_path, args.model)

    if success:
        file_size = output_path.stat().st_size // 1024
        print(f"\nFertig! Bild gespeichert:")
        print(f"  {output_path}")
        print(f"  Dateigröße: {file_size} KB")
        print(f"\nJetzt kannst du das Bild im Konfigurator einbauen.")
    else:
        print("\nBild-Generierung fehlgeschlagen.")
        print("Mögliche Ursachen:")
        print("  1. Quota erschöpft — warte bis morgen oder upgrade auf Pay-as-you-go")
        print("  2. API-Key hat keinen Zugriff auf Bildgenerierung")
        print("  3. Netzwerkfehler")
        sys.exit(1)


if __name__ == "__main__":
    main()
