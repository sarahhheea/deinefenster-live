/* ─────────────────────────────────────────────────────────────────────
   Supabase-Verbindung für DeineFenster.de
   Diese beiden Werte sind NICHT geheim — sie sind designed um im
   Browser-Code zu landen. Sicherheit kommt durch Row-Level-Security
   in der Datenbank (siehe database/schema.sql).
   Stand: 27.04.2026
   ───────────────────────────────────────────────────────────────────── */

const SUPABASE_URL = 'https://kgklvkainekbiphjdehy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_M8ej2NK7N6ZJtImiA3n6cQ_pVD4brP-';

// Storage-Bucket für Produktbilder (muss in Supabase angelegt werden)
const SUPABASE_STORAGE_BUCKET = 'produkt-bilder';

// Globaler Client — wird in shop.js und shop-einstellen.js verwendet
// Voraussetzung: <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
// muss vor diesem Script geladen werden.
let supabaseClient = null;
if (typeof window !== 'undefined' && window.supabase) {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Helper: prüfen ob Supabase erreichbar
async function supabaseHealthCheck() {
  if (!supabaseClient) return { ok: false, error: 'Client nicht initialisiert' };
  try {
    const { error } = await supabaseClient.from('kategorien').select('id').limit(1);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}
