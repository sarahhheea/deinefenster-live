-- ════════════════════════════════════════════════════════════
-- DeineFenster.de — Migration: Größen-Klasse "schmal" erlauben
-- Sarah-Wunsch 28.04.2026
-- ════════════════════════════════════════════════════════════
-- Bestehender Constraint erlaubt nur klein/normal/hoch/gross.
-- Hier wird er erweitert um 'schmal' für schmale Fenster/Türen.
--
-- AUSFÜHRUNG: In Supabase → SQL Editor → diesen Block einfügen → Run.
-- ════════════════════════════════════════════════════════════

begin;

-- Alten Constraint droppen
alter table public.produkte
  drop constraint if exists produkte_groesse_klasse_check;

-- Neuen Constraint mit 'schmal' anlegen
alter table public.produkte
  add constraint produkte_groesse_klasse_check
  check (groesse_klasse in ('klein','schmal','normal','hoch','gross') or groesse_klasse is null);

-- Index existiert schon (idx_produkte_groesse) — keine Änderung nötig

commit;

-- Verifikation: sollte 'klein','schmal','normal','hoch','gross' zurückgeben
-- select unnest(string_to_array(
--   regexp_replace(
--     pg_get_constraintdef((select oid from pg_constraint where conname = 'produkte_groesse_klasse_check')),
--     '.*ARRAY\[(.*?)\].*', '\1'),
--   ', '
-- ));
