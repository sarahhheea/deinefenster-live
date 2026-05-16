/**
 * Image Schema Builder for DeineFenster.de Configurator
 *
 * Generates consistent Imagen-4 prompts for 800+ window/door variations.
 * All prompts follow KONFIGURATOR-IMAGE-MASTER-SCHEMA.md
 *
 * Usage:
 *   const prompt = ImageSchemaBuilder.buildPrompt({
 *     system: 'IGLO 5 Classic',
 *     ansicht: 'interior',
 *     farbe: 'white',
 *     glas: 'neutral',
 *     griff: 'MACO',
 *     anschlag: 'right',
 *     typ: 'dreh_kipp'
 *   });
 */

const ImageSchemaBuilder = {
  // ============================================================
  // A) GLOBALER STIL-ANKER — steht in JEDEM Prompt
  // ============================================================

  baseAnchor: `Drutex product catalog photography: isolated cutout window or door, frontal centered view, bright studio lighting, pure white background, professional architectural product rendering, no shadows no reflections no context.`,

  // ============================================================
  // B) RESOLUTIONS nach Produkttyp
  // ============================================================

  resolutions: {
    dreh_kipp: { w: 1200, h: 1400, aspect: '6:7' },   // Standard Fenster
    schiebe: { w: 1400, h: 900, aspect: '14:9' },      // Breit & flach
    haustuer: { w: 1000, h: 1600, aspect: '5:8' },     // Hochformat Tür
    hst: { w: 1600, h: 1000, aspect: '8:5' }           // Hebeschiebetür
  },

  // ============================================================
  // C) BELEUCHTUNGS-KEYWORDS (sind Teil des Base-Anchor, aber
  //    können je nach Bedarf verstärkt werden)
  // ============================================================

  lightingKeywords: {
    standard: 'bright daylight studio lighting',
    highKey: 'high key bright daylight studio lighting, luminous white background'
  },

  // ============================================================
  // D) PRODUKT-POSITIONS-KEYWORDS (in jeden Prompt)
  // ============================================================

  positionKeywords: 'large scale product, fills 70-75% of canvas, perfectly centered',

  // ============================================================
  // E) NEGATIV-LISTE (MUSS in JEDEM Prompt stehen)
  // ============================================================

  negativList: `NO shadow, NO ground shadow, NO drop shadow, NO reflection, NO background gradient, NO vignette, NO ambient occlusion, NO floor, NO wall, NO context, NO border, NO frame, NO hinges visible from exterior, NO handles from exterior, NO product mounting hardware, NO glass glare distortion, NO chromatic aberration, NO lens flare, NO depth of field blur, clean cutout isolated product`,

  // ============================================================
  // VARIANTEN-MAPPING (was konkret in Prompts kommt)
  // ============================================================

  systems: {
    'IGLO 5 Classic': { profile: '70mm 5-chamber', uw: '0.81', hardware: 'MACO SKB' },
    'IGLO Energy': { profile: '82mm 7-chamber', uw: '0.65', hardware: 'MACO SKB' },
    'IGLO Slide': { profile: '70mm slim', uw: '1.1', hardware: 'Siegenia' },
    'IGLO-HS': { profile: '80mm 6-chamber', uw: '0.71', hardware: 'G-U' }
  },

  farben: {
    white: 'bright white vinyl',
    grey: 'light grey vinyl',
    darkbrown: 'dark brown vinyl',
    anthracite: 'anthracite grey vinyl'
  },

  glas: {
    neutral: 'clear neutral glass',
    bluegreen: 'blue-green reflective glass',
    green: 'green reflective glass',
    grey: 'grey tinted glass'
  },

  griffe: {
    MACO: 'MACO chrome handle',
    ABUS: 'ABUS titanium handle',
    Roto: 'Roto white handle',
    ein Profil-Hersteller: 'ein Profil-Hersteller aluminium handle'
  },

  // ============================================================
  // HAUPT-FUNKTIONEN
  // ============================================================

  /**
   * Hauptfunktion: Prompt bauen
   * @param {Object} config
   *   - system: 'IGLO 5 Classic' | 'IGLO Energy' | 'IGLO Slide' | 'IGLO-HS'
   *   - typ: 'dreh_kipp' | 'schiebe' | 'haustuer' | 'hst'
   *   - ansicht: 'exterior' | 'interior'
   *   - farbe: 'white' | 'grey' | 'darkbrown' | 'anthracite'
   *   - glas: 'neutral' | 'bluegreen' | 'green' | 'grey'
   *   - griff: 'MACO' | 'ABUS' | 'Roto' | 'ein Profil-Hersteller'
   *   - anschlag: 'right' | 'left'
   *   - flügel: 1 | 2 (optional, default 1)
   * @returns {String} Complete prompt for Imagen-4
   */
  buildPrompt(config) {
    const {
      system = 'IGLO 5 Classic',
      typ = 'dreh_kipp',
      ansicht = 'exterior',
      farbe = 'white',
      glas = 'neutral',
      griff = 'MACO',
      anschlag = 'right',
      flügel = 1
    } = config;

    // Validierung
    if (!this.systems[system]) throw new Error(`Unknown system: ${system}`);
    if (!this.resolutions[typ]) throw new Error(`Unknown type: ${typ}`);
    if (!this.farben[farbe]) throw new Error(`Unknown color: ${farbe}`);
    if (!this.glas[glas]) throw new Error(`Unknown glass: ${glas}`);
    if (!this.griffe[griff]) throw new Error(`Unknown handle: ${griff}`);

    const res = this.resolutions[typ];
    const sysSpec = this.systems[system];
    const farbeText = this.farben[farbe];
    const glasText = this.glas[glas];
    const griffText = this.griffe[griff];

    // Produkt-Beschreibung bauen
    const produktBeschreibung = this._buildProduktBeschreibung(
      typ, flügel, ansicht, farbeText, glasText, griffText, anschlag, sysSpec
    );

    // Kompletten Prompt zusammensetzen
    const prompt = [
      this.baseAnchor,
      produktBeschreibung,
      `${this.positionKeywords}.`,
      `Resolution: ${res.w}×${res.h}px.`,
      this.negativList
    ].join(' ');

    return prompt;
  },

  /**
   * Hilfsfunktion: Produkt-Beschreibung nach Typ
   */
  _buildProduktBeschreibung(typ, flügel, ansicht, farbe, glas, griff, anschlag, sysSpec) {
    const flügelText = flügel === 1 ? '1-leaf' : `${flügel}-leaf`;
    const handleVisibility = ansicht === 'interior'
      ? `${griff} handle visible on ${anschlag} side, hinges visible`
      : `NO handle visible from exterior, NO hinges from exterior`;

    let beschreibung = '';

    if (typ === 'dreh_kipp') {
      beschreibung = `${flügelText} ${farbe} casement window, ${ansicht} view, ${glas}, ${sysSpec.profile} profile, ${handleVisibility}, realistic Drutex finish`;
    } else if (typ === 'schiebe') {
      beschreibung = `${flügelText} ${farbe} sliding window, ${ansicht} view, ${glas}, ${sysSpec.profile} profile, ${handleVisibility}, realistic Drutex finish`;
    } else if (typ === 'haustuer') {
      beschreibung = `${farbe} entrance door system, ${ansicht} view, ${glas}, ${sysSpec.profile} profile, ${handleVisibility}, realistic Drutex finish`;
    } else if (typ === 'hst') {
      beschreibung = `${flügelText} ${farbe} lift-slide door, ${ansicht} view, ${glas}, ${sysSpec.profile} profile, ${handleVisibility}, realistic Drutex finish`;
    }

    return beschreibung;
  },

  /**
   * Hilfsfunktion: Image-Filename generieren (für Caching)
   * Format: system_type_view_color_glass_handle_leaf_anchor.png
   */
  generateFilename(config) {
    const {
      system = 'IGLO5Classic',
      typ = 'dreh_kipp',
      ansicht = 'ext',
      farbe = 'wh',
      glas = 'neut',
      griff = 'maco',
      anschlag = 'r',
      flügel = 1
    } = config;

    // Kurz-Codes für Filename
    const systemCode = system.toLowerCase().replace(/[^a-z0-9]/g, '');
    const typCode = typ.toLowerCase().replace(/_/g, '');
    const ansichtCode = ansicht.substring(0, 3).toLowerCase();
    const farbeCode = farbe.substring(0, 2).toLowerCase();
    const glasCode = glas.substring(0, 4).toLowerCase();
    const griffCode = griff.substring(0, 3).toLowerCase();
    const anschlagCode = anschlag.substring(0, 1).toLowerCase();

    return `${systemCode}_${typCode}_${ansichtCode}_${farbeCode}_${glasCode}_${griffCode}_${flügel}f_${anschlagCode}.png`;
  },

  /**
   * Resolution für Pollinations-URL auslesen
   */
  getResolution(typ) {
    return this.resolutions[typ] || this.resolutions.dreh_kipp;
  },

  /**
   * Komplette URL für Pollinations-API bauen
   * (Mit URL-Encoding)
   */
  buildPollinationsUrl(config) {
    const prompt = this.buildPrompt(config);
    const res = this.getResolution(config.typ);

    // URL-safe Encoding für Prompt
    const encodedPrompt = encodeURIComponent(prompt);

    // Pollinations.ai URL mit Imagen-4
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${res.w}&height=${res.h}&model=imagen&nologo=true`;
  }
};

// ============================================================
// EXPORT für Node/Bundler
// ============================================================
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ImageSchemaBuilder;
}

// ============================================================
// BEISPIEL-VERWENDUNG (in Browser-Konsole oder Node)
// ============================================================
/*

// Beispiel 1: Fenster-Innen (Standard)
const prompt1 = ImageSchemaBuilder.buildPrompt({
  system: 'IGLO 5 Classic',
  typ: 'dreh_kipp',
  ansicht: 'interior',
  farbe: 'white',
  glas: 'neutral',
  griff: 'MACO',
  anschlag: 'right'
});
console.log(prompt1);

// Beispiel 2: Schiebetür außen, grau
const prompt2 = ImageSchemaBuilder.buildPrompt({
  system: 'IGLO Slide',
  typ: 'schiebe',
  ansicht: 'exterior',
  farbe: 'grey',
  glas: 'bluegreen',
  griff: 'ABUS',
  flügel: 2
});
console.log(prompt2);

// Beispiel 3: URL für Pollinations
const url = ImageSchemaBuilder.buildPollinationsUrl({
  system: 'IGLO Energy',
  typ: 'dreh_kipp',
  ansicht: 'interior',
  farbe: 'white',
  glas: 'neutral',
  griff: 'MACO'
});
console.log(url);

// Beispiel 4: Filename für Caching
const filename = ImageSchemaBuilder.generateFilename({
  system: 'IGLO 5 Classic',
  typ: 'dreh_kipp',
  ansicht: 'interior',
  farbe: 'white',
  glas: 'neutral',
  griff: 'MACO'
});
console.log(filename);
// => iglo5classic_drehkipp_int_wh_neut_maco_1f_r.png

*/
