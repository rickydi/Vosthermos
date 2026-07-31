-- Recherche admin (clients + suivi) insensible aux accents et tolerante aux
-- formats de telephone.
--
-- Constate sur la base de prod avant correction :
--   * « seguin » ne trouvait pas « Marilou Seguin » (accent) : ILIKE gere la
--     casse mais pas les diacritiques, et 66 clients sur 519 ont un accent dans
--     leur nom.
--   * « (514)224-2692 » n'etait trouvable qu'en tapant la ponctuation exacte :
--     9 formats de telephone coexistent en base, et taper les 10 chiffres colles
--     ne donnait que 8 fiches sur 519.
--
-- Ces deux fonctions sont utilisees par src/lib/search.js.

DO $mig$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'unaccent') THEN
    CREATE EXTENSION unaccent;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    CREATE EXTENSION pg_trgm;
  END IF;
EXCEPTION WHEN insufficient_privilege THEN
  RAISE EXCEPTION
    'Extensions manquantes. A lancer une fois en superutilisateur : sudo -u postgres psql -d % -c "CREATE EXTENSION unaccent; CREATE EXTENSION pg_trgm;"',
    current_database();
END
$mig$;

-- unaccent(text) n'est pas IMMUTABLE (son dictionnaire est rechargeable a
-- chaud), donc impossible a indexer. La forme a deux arguments l'est : on la
-- fige dans un wrapper pour pouvoir creer des index d'expression par-dessus.
-- CREATE seulement si absente : sur un serveur ou la fonction appartient deja a
-- postgres, un CREATE OR REPLACE lance par l'utilisateur applicatif echouerait.
DO $mig$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'vt_unaccent' AND n.nspname = 'public'
  ) THEN
    EXECUTE $fn$
      CREATE FUNCTION public.vt_unaccent(text) RETURNS text
        LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
        AS 'SELECT public.unaccent(''public.unaccent''::regdictionary, $1)'
    $fn$;
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.vt_unaccent(text) TO PUBLIC';
  END IF;
END
$mig$;

-- Chiffres seuls : « (514) 224-2692 », « 514-224-2692 » et « 5142242692 »
-- deviennent la meme chaine, quel que soit le format saisi ou stocke.
DO $mig$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'vt_digits' AND n.nspname = 'public'
  ) THEN
    EXECUTE $fn$
      CREATE FUNCTION public.vt_digits(text) RETURNS text
        LANGUAGE sql IMMUTABLE STRICT PARALLEL SAFE
        AS 'SELECT regexp_replace($1, ''[^0-9]'', '''', ''g'')'
    $fn$;
    EXECUTE 'GRANT EXECUTE ON FUNCTION public.vt_digits(text) TO PUBLIC';
  END IF;
END
$mig$;

-- Index trigram : les ILIKE '%...%' restent rapides quand la base grossit.
CREATE INDEX IF NOT EXISTS clients_name_unaccent_trgm
  ON clients USING gin (vt_unaccent(name) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS clients_phone_digits_trgm
  ON clients USING gin (vt_digits(coalesce(phone, '')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS clients_secondary_phone_digits_trgm
  ON clients USING gin (vt_digits(coalesce(secondary_phone, '')) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS client_follow_ups_title_unaccent_trgm
  ON client_follow_ups USING gin (vt_unaccent(title) gin_trgm_ops);
CREATE INDEX IF NOT EXISTS client_follow_ups_phone_digits_trgm
  ON client_follow_ups USING gin (vt_digits(coalesce(phone, '')) gin_trgm_ops);
