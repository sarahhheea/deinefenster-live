#!/usr/bin/env python3
"""
Generate 1-Flügel Innen PNG for each color variant.
Recolors the white PVC frame pixels while preserving glass (pure white)
and rubber seal (dark pixels).

Handle rule:
  - weiss, cremeweiss, weiss-fx  → white handle (same as frame)
  - anthrazit, anthraz-gl, anthraz-um → dark/standard handle (keep)
  - ALL OTHER colors → silver handle (#c9ccd1)
"""

import os
import sys
import numpy as np
from PIL import Image

# Colors from konfigurator.html (fo = Außenfarbe, same hex values for fi/Innenfarbe)
COLORS = {
    'weiss':       {'name': 'Weiß (RAL 9016)',                    'hex': '#f4f4f0', 'border': '#d0d0c8'},
    'cremeweiss':  {'name': 'Cremeweiß (RAL 9001)',               'hex': '#fdf6e3', 'border': '#e0d6b8'},
    'weiss-fx':    {'name': 'Weiß FX (RAL 9016)',                 'hex': '#ededea', 'border': '#c4c4bc'},
    'achatgrau':   {'name': 'Achatgrau (RAL 7038)',               'hex': '#b4b6a8', 'border': '#909284'},
    'lichtgrau':   {'name': 'Lichtgrau (RAL 7035)',               'hex': '#c5c6be', 'border': '#9ea09a'},
    'signalgrau':  {'name': 'Signalgrau (RAL 7004)',              'hex': '#9c9c9c', 'border': '#7a7a7a'},
    'betongrau':   {'name': 'Betongrau (RAL 7023)',               'hex': '#7c7f79', 'border': '#5e615c'},
    'quarzgr-gl':  {'name': 'Quarzgrau Glatt (RAL 7039)',         'hex': '#6c6f66', 'border': '#505349'},
    'quarzgr-sa':  {'name': 'Quarzgrau Sandstruktur (RAL 7039)',  'hex': '#6c6f66', 'border': '#505349'},
    'basaltgr-gl': {'name': 'Basaltgrau Glatt (RAL 7012)',        'hex': '#4f5458', 'border': '#3a3e42'},
    'basaltgr-sa': {'name': 'Basaltgrau Sandstruktur (RAL 7012)', 'hex': '#4f5458', 'border': '#3a3e42'},
    'schiefgr-gl': {'name': 'Schiefergrau Glatt (RAL 7015)',      'hex': '#3e454c', 'border': '#2c3238'},
    'schiefgr-sa': {'name': 'Schiefergrau Sandstruktur (RAL 7015)','hex': '#3e454c', 'border': '#2c3238'},
    'anthrazit':   {'name': 'Anthrazitgrau (RAL 7016)',           'hex': '#373d3f', 'border': '#2a2e30'},
    'anthraz-gl':  {'name': 'Anthrazitgrau Glatt (RAL 7016)',     'hex': '#373d3f', 'border': '#252a2c'},
    'anthraz-um':  {'name': 'Anthrazitgrau Ulti-Matt (RAL 7016)', 'hex': '#373d3f', 'border': '#1e2224'},
    'schwarz-um':  {'name': 'Schwarz Ulti-Matt (RAL 9005)',       'hex': '#0e0e10', 'border': '#000000'},
    'schwarzbr':   {'name': 'Schwarzbraun (RAL 8022)',            'hex': '#26211e', 'border': '#181410'},
    'alux-db':     {'name': 'Alux DB (RAL 7048)',                 'hex': '#8a8880', 'border': '#6c6a62'},
    'alu-gebr':    {'name': 'Aluminium gebürstet (436-1001)',     'hex': '#b0b3b8', 'border': '#888c92'},
    'eisengl':     {'name': 'Eisenglimmer Schiefer (DB 703)',     'hex': '#4a4a4a', 'border': '#333333'},
    'crown-plat':  {'name': 'Crown Platin (9.1293001-168)',       'hex': '#d0ccc6', 'border': '#a8a49e'},
    'sheffield':   {'name': 'Sheffield Oak Light (436-3081)',     'hex': '#c8b090', 'border': '#a08c6c'},
    'winchester':  {'name': 'Winchester (436-2067)',              'hex': '#8c6440', 'border': '#6a4c2e'},
    'eiche-hell':  {'name': 'Eiche Hell (2052089)',               'hex': '#d4bc98', 'border': '#a89870'},
    'eiche-nat':   {'name': 'Eiche Natur (3118076)',              'hex': '#b89660', 'border': '#907248'},
    'golden-oak':  {'name': 'Golden Oak (2178001)',               'hex': '#9b6840', 'border': '#7a5030'},
    'nussbaum':    {'name': 'Nussbaum (2178007)',                 'hex': '#6e4828', 'border': '#503418'},
    'mooreiche':   {'name': 'Mooreiche (2052089)',                'hex': '#4e3828', 'border': '#362818'},
    'dunkleiche':  {'name': 'Dunkleiche (2052089)',               'hex': '#3c2c20', 'border': '#281c14'},
    'siena-noce':  {'name': 'Siena Noce (436-3048)',              'hex': '#7c5c38', 'border': '#5a4026'},
    'siena-ross':  {'name': 'Siena Rosso (436-3047)',             'hex': '#8c3c2c', 'border': '#6a2c20'},
    'mahagoni':    {'name': 'Mahagoni (2097013)',                 'hex': '#6b3a2a', 'border': '#522c1e'},
    'macore':      {'name': 'Macoré (3158002)',                   'hex': '#8c4030', 'border': '#6a3022'},
    'oregon':      {'name': 'Oregon (1192001)',                   'hex': '#c8a870', 'border': '#a08450'},
    'douglasie':   {'name': 'Streifen-Douglasie (3152009)',       'hex': '#c0986c', 'border': '#987450'},
    'bergkiefer':  {'name': 'Bergkiefer (3069041)',               'hex': '#d4b884', 'border': '#a88e60'},
    'teak':        {'name': 'Teak (3167004)',                     'hex': '#8c6838', 'border': '#6a4e28'},
    'schoko-br':   {'name': 'Schokoladenbraun (RAL 8017)',        'hex': '#5c3218', 'border': '#3e2010'},
    'braun-mar':   {'name': 'Braun Maron (809905)',               'hex': '#6a4828', 'border': '#4e3218'},
    'moosgruen':   {'name': 'Moosgrün (RAL 6005)',                'hex': '#1e3e2c', 'border': '#122818'},
    'dunkelgr':    {'name': 'Dunkelgrün (RAL 6125)',              'hex': '#2e4e28', 'border': '#1c3218'},
    'stahlblau':   {'name': 'Stahlblau (RAL 5150)',               'hex': '#1c4c6c', 'border': '#103050'},
    'brillblau':   {'name': 'Brilliantblau (RAL 5007)',           'hex': '#2a5c8c', 'border': '#184070'},
    'dunkelrot':   {'name': 'Dunkelrot (RAL 3081)',               'hex': '#6c1c1c', 'border': '#4e1010'},
}

WHITE_COLORS = {'weiss', 'cremeweiss', 'weiss-fx'}
ANTHRACITE_COLORS = {'anthrazit', 'anthraz-gl', 'anthraz-um'}
SILVER_HEX = '#c9ccd1'
SILVER_EDGE = '#7a7e85'


def hex_to_rgb(h):
    h = h.lstrip('#')
    return (int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def recolor_frame(base_arr, target_hex, border_hex, handle_type='silver'):
    """
    Recolor the white PVC frame pixels to target color.

    Strategy:
    - Pure white (255,255,255) = background + glass → keep white
    - Dark pixels (brightness < 80) = rubber seal → keep dark
    - Near-white (180-252) = frame + handle → recolor

    The recoloring maps the frame brightness range (178-252) linearly:
    - Lightest frame pixel (252) → target hex (face color)
    - Darkest frame pixel (178) → border hex (shadow color)
    """
    arr = base_arr.copy().astype(np.float32)

    tr, tg, tb = hex_to_rgb(target_hex)
    br, bg, bb = hex_to_rgb(border_hex)

    r = arr[:, :, 0]
    g = arr[:, :, 1]
    b = arr[:, :, 2]

    # Frame mask: near-white but not pure white
    frame_mask = (
        (r >= 180) & (r <= 252) &
        (g >= 175) & (g <= 252) &
        (b >= 170) & (b <= 252) &
        ~((r == 255) & (g == 255) & (b == 255))
    )

    # Calculate brightness of each frame pixel (0-1 range, normalized from 178-252)
    brightness = (r + g + b) / 3.0
    b_min, b_max = 178.0, 252.0
    t = np.clip((brightness - b_min) / (b_max - b_min), 0.0, 1.0)

    # Interpolate: t=1 (bright) → target color, t=0 (dark) → border color
    new_r = br + t * (tr - br)
    new_g = bg + t * (tg - bg)
    new_b = bb + t * (tb - bb)

    # Apply only to frame pixels
    out = arr.copy()
    out[:, :, 0] = np.where(frame_mask, new_r, arr[:, :, 0])
    out[:, :, 1] = np.where(frame_mask, new_g, arr[:, :, 1])
    out[:, :, 2] = np.where(frame_mask, new_b, arr[:, :, 2])

    # Handle recoloring: handle pixels are in the right portion of the image
    # They are frame-colored pixels in the right 1/3 of the image, vertical center strip
    # (approx x: 60-85% of width, y: 35-65% of height)
    if handle_type == 'silver':
        sr, sg, sb = hex_to_rgb(SILVER_HEX)
        ser, seg, seb = hex_to_rgb(SILVER_EDGE)

        h_img, w_img = arr.shape[:2]
        # Handle region: right quarter of image, middle third vertically
        x0, x1 = int(w_img * 0.60), int(w_img * 0.90)
        y0, y1 = int(h_img * 0.35), int(h_img * 0.65)

        # In the handle region, recolor frame pixels to silver
        handle_region = np.zeros(frame_mask.shape, dtype=bool)
        handle_region[y0:y1, x0:x1] = True
        handle_pixel_mask = frame_mask & handle_region

        # Map brightness to silver range
        silver_r = ser + t * (sr - ser)
        silver_g = seg + t * (sg - seg)
        silver_b = seb + t * (sb - seb)

        out[:, :, 0] = np.where(handle_pixel_mask, silver_r, out[:, :, 0])
        out[:, :, 1] = np.where(handle_pixel_mask, silver_g, out[:, :, 1])
        out[:, :, 2] = np.where(handle_pixel_mask, silver_b, out[:, :, 2])

    return np.clip(out, 0, 255).astype(np.uint8)


def generate_variant(base_arr, color_key, color_data, output_dir):
    target_hex = color_data['hex']
    border_hex = color_data['border']

    if color_key in WHITE_COLORS:
        handle_type = 'white'
    elif color_key in ANTHRACITE_COLORS:
        handle_type = 'dark'
    else:
        handle_type = 'silver'

    result = recolor_frame(base_arr, target_hex, border_hex, handle_type)
    img = Image.fromarray(result, 'RGBA')

    output_path = os.path.join(output_dir, f'fenster_1fl_{color_key}.png')
    img.save(output_path, 'PNG')
    print(f'  ✓ {color_key:15s} {color_data["name"]:45s} → {os.path.basename(output_path)}')
    return output_path


def main():
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    base_image_path = os.path.join(base_dir, 'img', 'fenster_standard_v3.png')
    output_dir = os.path.join(base_dir, 'img', 'farben')

    os.makedirs(output_dir, exist_ok=True)

    print(f'Loading base image: {base_image_path}')
    base_img = Image.open(base_image_path).convert('RGBA')
    base_arr = np.array(base_img)

    print(f'Base image size: {base_img.width}x{base_img.height}')
    print(f'Output dir: {output_dir}')
    print(f'Generating {len(COLORS)} color variants...\n')

    generated = []
    for key, data in COLORS.items():
        path = generate_variant(base_arr, key, data, output_dir)
        generated.append((key, path))

    print(f'\nDone! Generated {len(generated)} variants in {output_dir}/')
    return generated


if __name__ == '__main__':
    main()
