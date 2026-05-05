-- =====================================================================
--  DeineFenster.de — Erweiterung: Zustand (neu/gebraucht)
--  Stand: 27.04.2026
--
--  ANLEITUNG:
--    SQL Editor → New query → reinkopieren → Run.
--    Fügt deinen Produkten ein Feld "zustand" hinzu mit Werten 'neu' oder
--    'gebraucht'. Bestehende Produkte bekommen automatisch 'neu'.
-- =====================================================================

-- Neues Feld einfügen, falls noch nicht da
alter table public.produkte
  add column if not exists zustand text default 'neu' check (zustand in ('neu', 'gebraucht'));

-- Index für schnelles Filtern
create index if not exists idx_produkte_zustand on public.produkte(zustand);

-- Bestehende Produkte: alle als "neu" kennzeichnen (ist Default, sicherheitshalber explizit)
update public.produkte set zustand = 'neu' where zustand is null;

-- =====================================================================
--  Standnummer (Lager-Position) für Schilderdruck
-- =====================================================================
alter table public.produkte
  add column if not exists standnummer text;

create index if not exists idx_produkte_standnummer on public.produkte(standnummer);

-- =====================================================================
--  Sonderpreis + Export-Modell + Größen-Klasse — Sarah-Wunsch 27.04.
-- =====================================================================
alter table public.produkte
  add column if not exists sonderpreis_eur int,
  add column if not exists groesse_klasse text check (groesse_klasse in ('klein','normal','hoch','gross') or groesse_klasse is null),
  add column if not exists export_modell boolean default false;

create index if not exists idx_produkte_sonderpreis on public.produkte(sonderpreis_eur);
create index if not exists idx_produkte_groesse on public.produkte(groesse_klasse);
create index if not exists idx_produkte_export on public.produkte(export_modell);
