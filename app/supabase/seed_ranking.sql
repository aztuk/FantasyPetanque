-- ============================================================
-- Fantasy Pétanque — Seed: 9 joueurs, 30 matchs pétanque 3v3
-- ============================================================
-- Joueurs : Quentin, Adri, Milo, Clément, Kevin, Costy,
--           Selma, Julie, Guillaume
--
-- Chaque match met à jour l'ELO Elo (K=32, moyenne d'équipe).
-- Les eloDeltas stockés dans matches.result reflètent le gain/
-- perte réel de chaque joueur pour ce match.
--
-- IDEMPOTENCE joueurs : ON CONFLICT (id) DO NOTHING
-- ATTENTION matchs  : insert sans garde-fou — à lancer UNE FOIS.
-- Pour recommencer : TRUNCATE public.matches;
--   puis UPDATE public.players SET elo_petanque = 1000
--        WHERE id IN (les 9 UUIDs ci-dessous);
-- ============================================================

DO $$
DECLARE
  -- UUIDs fixes (reproductibles)
  id_q  uuid := '00000000-0000-0000-0000-000000000001';
  id_a  uuid := '00000000-0000-0000-0000-000000000002';
  id_m  uuid := '00000000-0000-0000-0000-000000000003';
  id_cl uuid := '00000000-0000-0000-0000-000000000004';
  id_k  uuid := '00000000-0000-0000-0000-000000000005';
  id_co uuid := '00000000-0000-0000-0000-000000000006';
  id_s  uuid := '00000000-0000-0000-0000-000000000007';
  id_j  uuid := '00000000-0000-0000-0000-000000000008';
  id_g  uuid := '00000000-0000-0000-0000-000000000009';

  -- Calcul ELO
  avg_a      float;
  avg_b      float;
  expected_a float;
  delta      integer;
  a_wins     bool;

  -- Horodatage : 1 match / jour sur les 30 derniers jours
  t timestamptz := now() - interval '29 days';

BEGIN

  -- -------------------------------------------------------
  -- 1. Joueurs
  -- -------------------------------------------------------
  INSERT INTO public.players (id, name, elo_petanque, elo_flechettes) VALUES
    (id_q,  'Quentin',   1000, 1000),
    (id_a,  'Adri',      1000, 1000),
    (id_m,  'Milo',      1000, 1000),
    (id_cl, 'Clément',   1000, 1000),
    (id_k,  'Kevin',     1000, 1000),
    (id_co, 'Costy',     1000, 1000),
    (id_s,  'Selma',     1000, 1000),
    (id_j,  'Julie',     1000, 1000),
    (id_g,  'Guillaume', 1000, 1000)
  ON CONFLICT (id) DO NOTHING;

  -- -------------------------------------------------------
  -- 2. Table temporaire de suivi ELO (reset à 1000)
  -- -------------------------------------------------------
  CREATE TEMP TABLE IF NOT EXISTS _seed_elos (
    pid uuid PRIMARY KEY,
    elo float NOT NULL
  );
  DELETE FROM _seed_elos;
  INSERT INTO _seed_elos VALUES
    (id_q,  1000), (id_a,  1000), (id_m,  1000),
    (id_cl, 1000), (id_k,  1000), (id_co, 1000),
    (id_s,  1000), (id_j,  1000), (id_g,  1000);

  -- -------------------------------------------------------
  -- 3. Matchs
  --   Formule ELO :
  --     expected_a = 1 / (1 + 10^((avg_b - avg_a) / 400))
  --     delta      = round(32 * (result - expected_a))
  --                  result = 1 si A gagne, 0 sinon
  --     équipe A : elo += delta   (delta < 0 si A perd en favori)
  --     équipe B : elo -= delta
  -- -------------------------------------------------------

  -- MATCH 1 : [Q,A,M] vs [Cl,K,Co] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_q,  id_a, id_m);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_cl, id_k, id_co);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_q,  id_a, id_m);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_cl, id_k, id_co);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_a::text, id_m::text),
      'eloDeltas',  jsonb_build_object(
        id_q::text,   delta,  id_a::text,  delta,  id_m::text,  delta,
        id_cl::text, -delta,  id_k::text, -delta,  id_co::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 2 : [S,J,G] vs [Q,Cl,K] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_s, id_j,  id_g);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q, id_cl, id_k);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_s, id_j,  id_g);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q, id_cl, id_k);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_cl::text, id_k::text),
      'eloDeltas',  jsonb_build_object(
        id_s::text,   delta,  id_j::text,   delta,  id_g::text,  delta,
        id_q::text,  -delta,  id_cl::text, -delta,  id_k::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 3 : [A,Co,S] vs [M,J,G] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_a,  id_co, id_s);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_m,  id_j,  id_g);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_a,  id_co, id_s);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_m,  id_j,  id_g);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_a::text, id_co::text, id_s::text),
      'eloDeltas',  jsonb_build_object(
        id_a::text,   delta,  id_co::text,  delta,  id_s::text,  delta,
        id_m::text,  -delta,  id_j::text,  -delta,  id_g::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 4 : [Q,M,Co] vs [Cl,S,J] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_q,  id_m,  id_co);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_cl, id_s,  id_j);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_q,  id_m,  id_co);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_cl, id_s,  id_j);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_b'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_m::text, id_co::text),
      'eloDeltas',  jsonb_build_object(
        id_q::text,   delta,  id_m::text,   delta,  id_co::text,  delta,
        id_cl::text, -delta,  id_s::text,  -delta,  id_j::text,  -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 5 : [K,G,J] vs [Q,A,S] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_k,  id_g,  id_j);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_a,  id_s);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_k,  id_g,  id_j);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_a,  id_s);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_a::text, id_s::text),
      'eloDeltas',  jsonb_build_object(
        id_k::text,   delta,  id_g::text,   delta,  id_j::text,  delta,
        id_q::text,  -delta,  id_a::text,  -delta,  id_s::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 6 : [M,Cl,G] vs [Co,K,J] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_m,  id_cl, id_g);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_co, id_k,  id_j);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_m,  id_cl, id_g);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_co, id_k,  id_j);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_m::text, id_cl::text, id_g::text),
      'eloDeltas',  jsonb_build_object(
        id_m::text,   delta,  id_cl::text,  delta,  id_g::text,  delta,
        id_co::text, -delta,  id_k::text,  -delta,  id_j::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 7 : [Q,S,J] vs [A,M,Cl] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_q,  id_s,  id_j);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_a,  id_m,  id_cl);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_q,  id_s,  id_j);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_a,  id_m,  id_cl);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_a::text, id_m::text, id_cl::text),
      'eloDeltas',  jsonb_build_object(
        id_q::text,   delta,  id_s::text,   delta,  id_j::text,   delta,
        id_a::text,  -delta,  id_m::text,  -delta,  id_cl::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 8 : [Co,K,G] vs [Q,M,S] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_co, id_k,  id_g);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_m,  id_s);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_co, id_k,  id_g);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_m,  id_s);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_co::text, id_k::text, id_g::text),
      'eloDeltas',  jsonb_build_object(
        id_co::text,  delta,  id_k::text,   delta,  id_g::text,  delta,
        id_q::text,  -delta,  id_m::text,  -delta,  id_s::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 9 : [A,J,Cl] vs [Q,K,G] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_a,  id_j,  id_cl);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_k,  id_g);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_a,  id_j,  id_cl);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_k,  id_g);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_k::text, id_g::text),
      'eloDeltas',  jsonb_build_object(
        id_a::text,   delta,  id_j::text,   delta,  id_cl::text,  delta,
        id_q::text,  -delta,  id_k::text,  -delta,  id_g::text,  -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 10 : [M,S,Co] vs [A,J,G] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_m,  id_s,  id_co);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_a,  id_j,  id_g);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_m,  id_s,  id_co);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_a,  id_j,  id_g);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_a::text, id_j::text, id_g::text),
      'eloDeltas',  jsonb_build_object(
        id_m::text,   delta,  id_s::text,   delta,  id_co::text,  delta,
        id_a::text,  -delta,  id_j::text,  -delta,  id_g::text,  -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 11 : [Q,Cl,J] vs [M,K,Co] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_q,  id_cl, id_j);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_m,  id_k,  id_co);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_q,  id_cl, id_j);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_m,  id_k,  id_co);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_cl::text, id_j::text),
      'eloDeltas',  jsonb_build_object(
        id_q::text,   delta,  id_cl::text,  delta,  id_j::text,  delta,
        id_m::text,  -delta,  id_k::text,  -delta,  id_co::text,-delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 12 : [A,G,S] vs [Q,K,J] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_a,  id_g,  id_s);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_k,  id_j);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_a,  id_g,  id_s);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_k,  id_j);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_a::text, id_g::text, id_s::text),
      'eloDeltas',  jsonb_build_object(
        id_a::text,   delta,  id_g::text,   delta,  id_s::text,  delta,
        id_q::text,  -delta,  id_k::text,  -delta,  id_j::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 13 : [Co,M,Cl] vs [Q,A,G] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_co, id_m,  id_cl);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_a,  id_g);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_co, id_m,  id_cl);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_a,  id_g);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_co::text, id_m::text, id_cl::text),
      'eloDeltas',  jsonb_build_object(
        id_co::text,  delta,  id_m::text,   delta,  id_cl::text,  delta,
        id_q::text,  -delta,  id_a::text,  -delta,  id_g::text,  -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 14 : [K,J,S] vs [Q,M,Co] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_k,  id_j,  id_s);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_m,  id_co);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_k,  id_j,  id_s);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_m,  id_co);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_m::text, id_co::text),
      'eloDeltas',  jsonb_build_object(
        id_k::text,   delta,  id_j::text,   delta,  id_s::text,   delta,
        id_q::text,  -delta,  id_m::text,  -delta,  id_co::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 15 : [G,A,Cl] vs [S,K,J] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_g,  id_a,  id_cl);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_s,  id_k,  id_j);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_g,  id_a,  id_cl);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_s,  id_k,  id_j);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_s::text, id_k::text, id_j::text),
      'eloDeltas',  jsonb_build_object(
        id_g::text,   delta,  id_a::text,   delta,  id_cl::text,  delta,
        id_s::text,  -delta,  id_k::text,  -delta,  id_j::text,  -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 16 : [Q,Co,K] vs [M,A,S] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_q,  id_co, id_k);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_m,  id_a,  id_s);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_q,  id_co, id_k);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_m,  id_a,  id_s);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_co::text, id_k::text),
      'eloDeltas',  jsonb_build_object(
        id_q::text,   delta,  id_co::text,  delta,  id_k::text,  delta,
        id_m::text,  -delta,  id_a::text,  -delta,  id_s::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 17 : [J,Cl,G] vs [Q,A,M] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_j,  id_cl, id_g);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_a,  id_m);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_j,  id_cl, id_g);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_a,  id_m);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_a::text, id_m::text),
      'eloDeltas',  jsonb_build_object(
        id_j::text,   delta,  id_cl::text,  delta,  id_g::text,  delta,
        id_q::text,  -delta,  id_a::text,  -delta,  id_m::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 18 : [S,Co,K] vs [Cl,G,J] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_s,  id_co, id_k);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_cl, id_g,  id_j);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_s,  id_co, id_k);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_cl, id_g,  id_j);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_b'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_cl::text, id_g::text, id_j::text),
      'eloDeltas',  jsonb_build_object(
        id_s::text,   delta,  id_co::text,  delta,  id_k::text,  delta,
        id_cl::text, -delta,  id_g::text,  -delta,  id_j::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 19 : [Q,M,J] vs [A,Cl,S] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_q,  id_m,  id_j);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_a,  id_cl, id_s);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_q,  id_m,  id_j);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_a,  id_cl, id_s);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_b'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_m::text, id_j::text),
      'eloDeltas',  jsonb_build_object(
        id_q::text,   delta,  id_m::text,   delta,  id_j::text,  delta,
        id_a::text,  -delta,  id_cl::text, -delta,  id_s::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 20 : [Co,G,A] vs [Q,K,M] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_co, id_g,  id_a);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_k,  id_m);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_co, id_g,  id_a);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_k,  id_m);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_k::text, id_m::text),
      'eloDeltas',  jsonb_build_object(
        id_co::text,  delta,  id_g::text,   delta,  id_a::text,  delta,
        id_q::text,  -delta,  id_k::text,  -delta,  id_m::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 21 : [S,J,Cl] vs [Co,M,A] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_s,  id_j,  id_cl);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_co, id_m,  id_a);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_s,  id_j,  id_cl);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_co, id_m,  id_a);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_b'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_s::text, id_j::text, id_cl::text),
      'eloDeltas',  jsonb_build_object(
        id_s::text,   delta,  id_j::text,   delta,  id_cl::text,  delta,
        id_co::text, -delta,  id_m::text,  -delta,  id_a::text,  -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 22 : [Q,K,G] vs [J,S,Co] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_q,  id_k,  id_g);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_j,  id_s,  id_co);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_q,  id_k,  id_g);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_j,  id_s,  id_co);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_j::text, id_s::text, id_co::text),
      'eloDeltas',  jsonb_build_object(
        id_q::text,   delta,  id_k::text,   delta,  id_g::text,  delta,
        id_j::text,  -delta,  id_s::text,  -delta,  id_co::text,-delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 23 : [M,Cl,J] vs [Q,A,K] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_m,  id_cl, id_j);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_a,  id_k);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_m,  id_cl, id_j);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_a,  id_k);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_a::text, id_k::text),
      'eloDeltas',  jsonb_build_object(
        id_m::text,   delta,  id_cl::text,  delta,  id_j::text,  delta,
        id_q::text,  -delta,  id_a::text,  -delta,  id_k::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 24 : [A,S,G] vs [Co,K,Cl] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_a,  id_s,  id_g);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_co, id_k,  id_cl);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_a,  id_s,  id_g);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_co, id_k,  id_cl);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_co::text, id_k::text, id_cl::text),
      'eloDeltas',  jsonb_build_object(
        id_a::text,   delta,  id_s::text,   delta,  id_g::text,  delta,
        id_co::text, -delta,  id_k::text,  -delta,  id_cl::text,-delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 25 : [Q,J,M] vs [G,A,Co] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_q,  id_j,  id_m);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_g,  id_a,  id_co);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_q,  id_j,  id_m);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_g,  id_a,  id_co);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_j::text, id_m::text),
      'eloDeltas',  jsonb_build_object(
        id_q::text,   delta,  id_j::text,   delta,  id_m::text,  delta,
        id_g::text,  -delta,  id_a::text,  -delta,  id_co::text,-delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 26 : [K,Cl,S] vs [Q,J,G] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_k,  id_cl, id_s);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_j,  id_g);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_k,  id_cl, id_s);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_j,  id_g);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_k::text, id_cl::text, id_s::text),
      'eloDeltas',  jsonb_build_object(
        id_k::text,   delta,  id_cl::text,  delta,  id_s::text,  delta,
        id_q::text,  -delta,  id_j::text,  -delta,  id_g::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 27 : [Co,A,M] vs [Q,S,K] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_co, id_a,  id_m);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_s,  id_k);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_co, id_a,  id_m);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_s,  id_k);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_co::text, id_a::text, id_m::text),
      'eloDeltas',  jsonb_build_object(
        id_co::text,  delta,  id_a::text,   delta,  id_m::text,  delta,
        id_q::text,  -delta,  id_s::text,  -delta,  id_k::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 28 : [J,G,Cl] vs [Q,M,A] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_j,  id_g,  id_cl);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_m,  id_a);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_j,  id_g,  id_cl);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_m,  id_a);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_m::text, id_a::text),
      'eloDeltas',  jsonb_build_object(
        id_j::text,   delta,  id_g::text,   delta,  id_cl::text,  delta,
        id_q::text,  -delta,  id_m::text,  -delta,  id_a::text,  -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 29 : [Q,Co,S] vs [K,J,G] — A gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_q,  id_co, id_s);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_k,  id_j,  id_g);
  a_wins := true;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_q,  id_co, id_s);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_k,  id_j,  id_g);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_co::text, 'teamId', 'team_a'),
      jsonb_build_object('playerId', id_s::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_g::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_co::text, id_s::text),
      'eloDeltas',  jsonb_build_object(
        id_q::text,   delta,  id_co::text,  delta,  id_s::text,  delta,
        id_k::text,  -delta,  id_j::text,  -delta,  id_g::text, -delta)
    )
  );
  t := t + interval '1 day';

  -- MATCH 30 : [M,A,J] vs [Q,Cl,K] — B gagne
  SELECT AVG(elo) INTO avg_a FROM _seed_elos WHERE pid IN (id_m,  id_a,  id_j);
  SELECT AVG(elo) INTO avg_b FROM _seed_elos WHERE pid IN (id_q,  id_cl, id_k);
  a_wins := false;
  expected_a := 1.0 / (1.0 + power(10.0, (avg_b - avg_a) / 400.0));
  delta := round(32.0 * (case when a_wins then 1.0 else 0.0 end - expected_a));
  UPDATE _seed_elos SET elo = elo + delta WHERE pid IN (id_m,  id_a,  id_j);
  UPDATE _seed_elos SET elo = elo - delta WHERE pid IN (id_q,  id_cl, id_k);
  INSERT INTO public.matches (sport, date, participants, result) VALUES ('petanque', t,
    jsonb_build_array(
      jsonb_build_object('playerId', id_m::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_a::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_j::text,  'teamId', 'team_a'),
      jsonb_build_object('playerId', id_q::text,  'teamId', 'team_b'),
      jsonb_build_object('playerId', id_cl::text, 'teamId', 'team_b'),
      jsonb_build_object('playerId', id_k::text,  'teamId', 'team_b')
    ),
    jsonb_build_object(
      'winnerIds',  jsonb_build_array(id_q::text, id_cl::text, id_k::text),
      'eloDeltas',  jsonb_build_object(
        id_m::text,   delta,  id_a::text,   delta,  id_j::text,  delta,
        id_q::text,  -delta,  id_cl::text, -delta,  id_k::text, -delta)
    )
  );

  -- -------------------------------------------------------
  -- 4. Mise à jour des ELOs finaux dans public.players
  -- -------------------------------------------------------
  UPDATE public.players SET elo_petanque = e.elo::integer
  FROM _seed_elos e
  WHERE public.players.id = e.pid;

  DROP TABLE _seed_elos;

END;
$$;

-- -------------------------------------------------------
-- Vérification rapide (optionnel, à coller séparément)
-- -------------------------------------------------------
-- SELECT name, elo_petanque,
--   (SELECT count(*) FROM public.matches m
--    WHERE m.sport = 'petanque'
--      AND m.participants @> jsonb_build_array(jsonb_build_object('playerId', p.id::text))
--   ) AS matchs_joués
-- FROM public.players p
-- ORDER BY elo_petanque DESC;
