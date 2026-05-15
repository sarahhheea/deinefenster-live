#!/usr/bin/env python3
"""
Blender Render-Pipeline: Montana 3 L/R Inox — Alle 41 Farben × 2 Seiten
Ausführen: Blender öffnen → montana-3-lr-inox.blend laden → dieses Script ausführen
Oder: blender --background montana-3-lr-inox.blend --python render_all_colors.py
"""
import bpy
import math
import os
import time

# =================================================================
# KONFIGURATION
# =================================================================
H = 2.1
T = 0.07
MODEL = "montana-3-lr-inox"
OUT_DIR = "/Users/buissnesaccount/deinefenster Website/img/farben"
SAMPLES = 96
OVERWRITE = True  # True = Google Flow Bilder ersetzen

# =================================================================
# FARBEN
# =================================================================
def hex_to_linear(hex_color):
    h = hex_color.lstrip('#')
    r, g, b = int(h[0:2], 16)/255, int(h[2:4], 16)/255, int(h[4:6], 16)/255
    def to_lin(c):
        return c/12.92 if c <= 0.04045 else ((c + 0.055)/1.055)**2.4
    return (to_lin(r), to_lin(g), to_lin(b), 1.0)

FARBEN = {
    'anthraz-gl':'#373d3f','anthraz-um':'#2e3235','anthrazit':'#373d3f',
    'basaltgr-gl':'#4f5458','basaltgr-sa':'#4f5458','betongrau':'#7c7f79',
    'braun-mar':'#6b4226','brillblau':'#1c5080','cremeweiss':'#fdf6e3',
    'crown-plat':'#dddbd6','deep-bronze':'#6b6040','douglasie':'#906238',
    'dunkelgr':'#1e3828','dunkelrot':'#6c1c1c','dunkleiche':'#3c2c20',
    'eiche-hell':'#c8b89a','eiche-nat':'#b89660','eisengl':'#3c3e42',
    'golden-oak':'#9b6840','grafitgr':'#4a4c46','jet-black':'#101214',
    'lichtgrau':'#c5c6be','macore':'#7a4030','mahagoni':'#6b3a2a',
    'mooreiche':'#4e3828','moosgruen':'#2d4a30','nussbaum':'#6e4828',
    'oregon':'#a07040','piryt':'#6a5a30','quarzgr-gl':'#6c6f66',
    'quarzgr-sa':'#6c6f66','schiefgr-gl':'#3e454c','schiefgr-sa':'#3e454c',
    'schoko-br':'#4a2820','schwarz-um':'#1a1c1e','schwarzbr':'#26211e',
    'sheffield':'#c8b89a','stahlblau':'#1c4c6c','weiss-fx':'#f4f4f0',
    'weiss':'#ffffff','winchester':'#8c6440',
}

# =================================================================
# SCENE SETUP FUNCTIONS
# =================================================================
def setup_aussen():
    cam = bpy.data.objects.get("RenderCam")
    cam.location = (0, -4.0, H/2)
    cam.rotation_euler = (math.pi/2, 0, 0)
    for n in ["MainLight","FillLight","RimLight"]:
        o = bpy.data.objects.get(n)
        if o: o.hide_render = False
    for n in ["InnenLight","InnenFill"]:
        o = bpy.data.objects.get(n)
        if o: o.hide_render = True
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            obj.hide_render = obj.name.startswith("I_") or obj.name.startswith("Innen_")

def setup_innen():
    cam = bpy.data.objects.get("RenderCam")
    cam.location = (0, 4.0, H/2)
    cam.rotation_euler = (-math.pi/2, math.pi, 0)
    for n in ["InnenLight","InnenFill"]:
        o = bpy.data.objects.get(n)
        if o: o.hide_render = False
    for n in ["MainLight","FillLight","RimLight"]:
        o = bpy.data.objects.get(n)
        if o: o.hide_render = True
    aussen_only = {"Stossgriff","Griff_Halter","Griff_Halter.001",
                   "Schlossplatte","Zylinderloch","Glasfenster","Glas_Rahmen",
                   "Profil_Aussen","Profil_Innen"}
    for obj in bpy.data.objects:
        if obj.type == 'MESH':
            if obj.name.startswith("I_"):
                obj.hide_render = False
            elif obj.name in aussen_only or obj.name.startswith("Inox_El_"):
                obj.hide_render = True
            elif obj.name == "Tuerblatt_Basis":
                obj.hide_render = False

# =================================================================
# MAIN RENDER LOOP
# =================================================================
def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    mat_tuer = bpy.data.materials.get("Tuerfarbe")
    bsdf = mat_tuer.node_tree.nodes['Principled BSDF']
    scene = bpy.context.scene
    scene.cycles.samples = SAMPLES
    scene.render.engine = 'CYCLES'

    start = time.time()
    total = 0
    skipped = 0

    # --- AUSSEN ---
    print(f"\n{'='*60}")
    print(f"AUSSEN — {MODEL} — {len(FARBEN)} Farben")
    print(f"{'='*60}")
    setup_aussen()

    for i, (farbe_key, hex_val) in enumerate(FARBEN.items()):
        out_path = os.path.join(OUT_DIR, f"haustuer_aussen_{MODEL}_{farbe_key}.png")
        if not OVERWRITE and os.path.exists(out_path):
            skipped += 1
            continue
        bsdf.inputs['Base Color'].default_value = hex_to_linear(hex_val)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        total += 1
        elapsed = time.time() - start
        per_img = elapsed / total
        remaining = per_img * (2 * len(FARBEN) - total)
        print(f"  [{total}/{2*len(FARBEN)}] {farbe_key} — {elapsed:.0f}s ({per_img:.1f}s/Bild, ~{remaining/60:.0f}min rest)")

    # --- INNEN ---
    print(f"\n{'='*60}")
    print(f"INNEN — {MODEL} — {len(FARBEN)} Farben")
    print(f"{'='*60}")
    setup_innen()

    for i, (farbe_key, hex_val) in enumerate(FARBEN.items()):
        out_path = os.path.join(OUT_DIR, f"haustuer_innen_{MODEL}_{farbe_key}.png")
        if not OVERWRITE and os.path.exists(out_path):
            skipped += 1
            continue
        bsdf.inputs['Base Color'].default_value = hex_to_linear(hex_val)
        scene.render.filepath = out_path
        bpy.ops.render.render(write_still=True)
        total += 1
        elapsed = time.time() - start
        per_img = elapsed / total
        remaining = per_img * (2 * len(FARBEN) - total)
        print(f"  [{total}/{2*len(FARBEN)}] {farbe_key} — {elapsed:.0f}s ({per_img:.1f}s/Bild, ~{remaining/60:.0f}min rest)")

    elapsed = time.time() - start
    print(f"\n{'='*60}")
    print(f"FERTIG: {total} gerendert, {skipped} übersprungen")
    print(f"Zeit: {elapsed/60:.1f} Minuten")
    print(f"Output: {OUT_DIR}")
    print(f"{'='*60}")

if __name__ == "__main__":
    main()
