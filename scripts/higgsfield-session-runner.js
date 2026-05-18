/**
 * Higgsfield Session Runner
 * =========================
 * Liest generation-plan.json und generiert alle Bilder eines Batches automatisch.
 *
 * Verwendung (AI Code Playwright-Session):
 *   1. Inhaberin loggt sich in Higgsfield ein, Toggle ist GRÜN
 *   2. AI ruft dieses Script als Referenz für den Ablauf auf
 *   3. AI führt die Schritte unten für jeden Eintrag durch
 *
 * PFLICHT-REGELN (Projektdoku):
 *   - Modell: Nano Banana 2
 *   - Toggle muss GRÜN sein vor jedem Generate
 *   - Balance VOR und NACH jedem Batch prüfen
 *   - Max 8 Bilder pro Mini-Batch, dann Pause + Balance-Check
 *   - Bei 1 Credit Unterschied: SOFORT STOP
 */

const plan = require('./generation-plan.json');

// ─────────────────────────────────────────────
// ALLE PROMPTS EXPANDIERT (für AI zum Ablesen)
// ─────────────────────────────────────────────
function expandPrompts(batchKey) {
  const batch = plan.batches[batchKey];
  const colorMap = plan._color_prompt_map;

  return batch.colors.map((key, i) => {
    const colorDesc = colorMap[key];
    const prompt = batch.prompt_template.replace('{COLOR_DESC}', colorDesc);
    const filename = batch.filename_pattern.replace('{key}', key);
    return {
      index: i + 1,
      total: batch.colors.length,
      key,
      filename,
      outputPath: `img/farben/${filename}`,
      prompt
    };
  });
}

// Alle Batches ausgeben
const allBatches = Object.keys(plan.batches);
console.log(`\n=== GENERATION PLAN ===`);
console.log(`Total batches: ${allBatches.length}`);
console.log(`Total images: ${plan._meta.total_images}\n`);

allBatches.forEach(batchKey => {
  const batch = plan.batches[batchKey];
  const prompts = expandPrompts(batchKey);

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`BATCH: ${batch.label} (${batch.count} Bilder)`);
  console.log(`${'═'.repeat(60)}`);

  prompts.forEach(p => {
    console.log(`\n[${p.index}/${p.total}] Datei: ${p.filename}`);
    console.log(`Output: ${p.outputPath}`);
    console.log(`─── PROMPT ───────────────────────────────────`);
    console.log(p.prompt);
    console.log(`──────────────────────────────────────────────`);
  });
});
