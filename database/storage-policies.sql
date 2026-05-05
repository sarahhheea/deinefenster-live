-- =====================================================================
--  DeineFenster.de — Storage-Policies für Bucket "produkt-bilder"
--  Stand: 27.04.2026
--
--  ANLEITUNG:
--    Wie schon das Schema-Skript: SQL Editor → New query → reinkopieren → Run.
--
--  Was das macht:
--    Öffentlicher Public-Bucket erlaubt von Haus aus nur Lesen für alle.
--    Damit du (eingeloggt) Bilder hochladen kannst, brauchen wir Policies
--    die "authenticated" User schreiben/ändern/löschen lassen.
-- =====================================================================

-- Hochladen erlaubt für eingeloggte User
drop policy if exists "Authenticated upload to produkt-bilder" on storage.objects;
create policy "Authenticated upload to produkt-bilder"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'produkt-bilder');

-- Aktualisieren erlaubt für eingeloggte User
drop policy if exists "Authenticated update to produkt-bilder" on storage.objects;
create policy "Authenticated update to produkt-bilder"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'produkt-bilder');

-- Löschen erlaubt für eingeloggte User
drop policy if exists "Authenticated delete from produkt-bilder" on storage.objects;
create policy "Authenticated delete from produkt-bilder"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'produkt-bilder');

-- Lesen ist beim Public Bucket automatisch für alle erlaubt — keine Policy nötig.
