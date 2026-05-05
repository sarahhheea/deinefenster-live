-- =====================================================================
--  DeineFenster.de — Supabase Datenbank-Schema
--  Stand: 27.04.2026
--  ANLEITUNG: Diese Datei einmal in Supabase ausführen.
--    Supabase Dashboard → links "SQL Editor" → "+ New query"
--    → kompletten Inhalt dieser Datei reinkopieren → "Run" klicken.
--    Du solltest "Success. No rows returned" sehen, dann ist alles fertig.
-- =====================================================================

-- ───────────────────────────────────────────────────────────────────────
--  TABELLE 1: KATEGORIEN
--  Sarah kann diese später in der Admin-UI hinzufügen, umbenennen, löschen.
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.kategorien (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,           -- maschinen-lesbar, z.B. "fenster-1fluegel"
  label text not null,                -- menschen-lesbar, z.B. "Einflügelig"
  icon text default 'window',         -- Material-Symbol-Name
  reihenfolge int default 0,          -- Sortierung im Filter
  aktiv boolean default true,         -- weich-löschen statt hart-löschen
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_kategorien_reihenfolge on public.kategorien(reihenfolge);
create index if not exists idx_kategorien_aktiv on public.kategorien(aktiv);

-- ───────────────────────────────────────────────────────────────────────
--  TABELLE 2: PRODUKTE (Inserate im Shop)
-- ───────────────────────────────────────────────────────────────────────
create table if not exists public.produkte (
  id uuid primary key default gen_random_uuid(),
  titel text not null,
  kategorie_key text references public.kategorien(key) on update cascade,
  system text,
  breite_mm int not null,
  hoehe_mm int not null,
  preis_eur int not null,
  farbe text default 'weiss',
  verglasung text default '2-fach',
  u_wert numeric(4,2),
  oeffnungsart text default 'dreh-kipp',
  rc_klasse text,
  eigenschaften jsonb default '[]'::jsonb,    -- Array von Strings
  lagerbestand int default 1,
  bilder jsonb default '[]'::jsonb,           -- Array von Bild-URLs
  beschreibung text,
  aktiv boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_produkte_kategorie on public.produkte(kategorie_key);
create index if not exists idx_produkte_preis on public.produkte(preis_eur);
create index if not exists idx_produkte_breite on public.produkte(breite_mm);
create index if not exists idx_produkte_hoehe on public.produkte(hoehe_mm);
create index if not exists idx_produkte_aktiv on public.produkte(aktiv);

-- ───────────────────────────────────────────────────────────────────────
--  TRIGGER: updated_at automatisch setzen
-- ───────────────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists kategorien_updated_at on public.kategorien;
create trigger kategorien_updated_at
  before update on public.kategorien
  for each row execute function public.set_updated_at();

drop trigger if exists produkte_updated_at on public.produkte;
create trigger produkte_updated_at
  before update on public.produkte
  for each row execute function public.set_updated_at();

-- ───────────────────────────────────────────────────────────────────────
--  ROW-LEVEL SECURITY (RLS) — wichtigste Sicherheits-Schicht
--  Ohne RLS könnte JEDER mit dem publishable Key alles ändern!
-- ───────────────────────────────────────────────────────────────────────
alter table public.kategorien enable row level security;
alter table public.produkte enable row level security;

-- Lese-Policies: Jeder Besucher darf aktive Daten lesen (Shop-Seite)
drop policy if exists "Kategorien aktiv lesbar" on public.kategorien;
create policy "Kategorien aktiv lesbar"
  on public.kategorien for select
  using (aktiv = true);

drop policy if exists "Produkte aktiv lesbar" on public.produkte;
create policy "Produkte aktiv lesbar"
  on public.produkte for select
  using (aktiv = true);

-- Schreib-Policies: NUR eingeloggte User (= Sarah) dürfen ändern
drop policy if exists "Authentifiziert: Kategorien einfügen" on public.kategorien;
create policy "Authentifiziert: Kategorien einfügen"
  on public.kategorien for insert to authenticated
  with check (true);

drop policy if exists "Authentifiziert: Kategorien ändern" on public.kategorien;
create policy "Authentifiziert: Kategorien ändern"
  on public.kategorien for update to authenticated
  using (true);

drop policy if exists "Authentifiziert: Kategorien löschen" on public.kategorien;
create policy "Authentifiziert: Kategorien löschen"
  on public.kategorien for delete to authenticated
  using (true);

drop policy if exists "Authentifiziert: Produkte einfügen" on public.produkte;
create policy "Authentifiziert: Produkte einfügen"
  on public.produkte for insert to authenticated
  with check (true);

drop policy if exists "Authentifiziert: Produkte ändern" on public.produkte;
create policy "Authentifiziert: Produkte ändern"
  on public.produkte for update to authenticated
  using (true);

drop policy if exists "Authentifiziert: Produkte löschen" on public.produkte;
create policy "Authentifiziert: Produkte löschen"
  on public.produkte for delete to authenticated
  using (true);

-- ───────────────────────────────────────────────────────────────────────
--  STARTWERTE: 14 Kategorien (Sarah-Wunsch 27.04.2026)
--  Können später in der Admin-UI bearbeitet werden.
-- ───────────────────────────────────────────────────────────────────────
insert into public.kategorien (key, label, icon, reihenfolge) values
  ('fenster-1fluegel',     'Einflügelig',           'window',          1),
  ('fenster-2fluegel',     'Zweiflügelig',          'border_outer',    2),
  ('fenster-3fluegel',     'Dreiflügelig',          'view_column',     3),
  ('fenster-4fluegel',     'Vierflügelig',          'grid_view',       4),
  ('festelement',          'Festverglasung',        'crop_free',       5),
  ('kellerfenster',        'Kellerfenster',         'crop_landscape',  6),
  ('haustuer',             'Haustür',               'door_front',      7),
  ('balkontuer-1fluegel',  'Balkontür einflüglig',  'deck',            8),
  ('balkontuer-2fluegel',  'Balkontür zweiflüglig', 'fence',           9),
  ('balkontuer-rollo',     'Balkontür mit Rollo',   'roller_shades',   10),
  ('schiebetuer-psk',      'Schiebetür PSK',        'meeting_room',    11),
  ('schiebetuer-hst',      'Hebe-Schiebetür',       'door_sliding',    12),
  ('fenster-oberlicht',    'Fenster mit Oberlicht', 'space_dashboard', 13),
  ('fenster-sprossen',     'Fenster mit Sprossen',  'window_open',     14)
on conflict (key) do nothing;

-- ───────────────────────────────────────────────────────────────────────
--  FERTIG. Die Datenbank ist jetzt einsatzbereit.
--  Nächste Schritte:
--    1. Storage-Bucket "produkt-bilder" anlegen (Supabase → Storage)
--    2. Einen Login-User für Sarah anlegen (Supabase → Authentication)
--    3. Frontend (shop.html, shop-einstellen.html) ans Backend anbinden
-- ───────────────────────────────────────────────────────────────────────
