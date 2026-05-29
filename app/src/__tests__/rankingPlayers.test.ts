import {
  calculateRankingRecords,
  computeEloDeltas,
  computeEloRankedDeltas,
  getPlayerElo,
  getPlayerRecord,
  mapPlayerRow,
  sortPlayersBySport,
  sortPlayersByRecentActivity,
} from '../features/ranking/services/rankingPlayers';

describe('ranking players service', () => {
  it('maps database player rows to domain players', () => {
    expect(
      mapPlayerRow({
        id: 'player-1',
        name: 'Clément',
        elo_petanque: 1204,
        elo_flechettes: 990,
      }),
    ).toEqual({
      id: 'player-1',
      name: 'Clément',
      eloPetanque: 1204,
      eloFlechettes: 990,
    });
  });

  it('sorts players by selected sport ELO descending', () => {
    const players = [
      { id: 'a', name: 'Alice', eloPetanque: 900, eloFlechettes: 1300 },
      { id: 'b', name: 'Bob', eloPetanque: 1200, eloFlechettes: 1000 },
      { id: 'c', name: 'Camille', eloPetanque: 1000, eloFlechettes: 1100 },
    ];

    expect(sortPlayersBySport(players, 'petanque').map((player) => player.id)).toEqual([
      'b',
      'c',
      'a',
    ]);
    expect(sortPlayersBySport(players, 'flechettes').map((player) => player.id)).toEqual([
      'a',
      'c',
      'b',
    ]);
  });

  it('reads the selected sport ELO from a player', () => {
    const player = {
      id: 'player-1',
      name: 'Quentin',
      eloPetanque: 1198,
      eloFlechettes: 1201,
    };

    expect(getPlayerElo(player, 'petanque')).toBe(1198);
    expect(getPlayerElo(player, 'flechettes')).toBe(1201);
  });

  it('calculates wins and losses from ranking matches', () => {
    const records = calculateRankingRecords([
      {
        sport: 'petanque',
        participants: [{ playerId: 'clement' }, { playerId: 'quentin' }],
        result: { winnerIds: ['clement'] },
      },
      {
        sport: 'flechettes',
        participants: [
          { playerId: 'lea' },
          { playerId: 'quentin' },
          { playerId: 'clement' },
        ],
        result: { placements: ['lea', 'quentin', 'clement'] },
      },
    ]);

    expect(getPlayerRecord(records, 'petanque', 'clement')).toEqual({ wins: 1, losses: 0 });
    expect(getPlayerRecord(records, 'petanque', 'quentin')).toEqual({ wins: 0, losses: 1 });
    expect(getPlayerRecord(records, 'flechettes', 'lea')).toEqual({ wins: 1, losses: 0 });
    expect(getPlayerRecord(records, 'flechettes', 'quentin')).toEqual({ wins: 0, losses: 1 });
    expect(getPlayerRecord(records, 'flechettes', 'unknown')).toEqual({ wins: 0, losses: 0 });
  });

  describe('sortPlayersByRecentActivity', () => {
    const players = [
      { id: 'alice', name: 'Alice', eloPetanque: 1000, eloFlechettes: 1000 },
      { id: 'bob', name: 'Bob', eloPetanque: 1000, eloFlechettes: 1000 },
      { id: 'charlie', name: 'Charlie', eloPetanque: 1000, eloFlechettes: 1000 },
    ];

    it('puts most recently active player first', () => {
      const matches = [
        { participants: [{ playerId: 'alice' }], date: '2026-01-10' },
        { participants: [{ playerId: 'bob' }], date: '2026-01-15' },
      ];
      const sorted = sortPlayersByRecentActivity(players, matches).map((p) => p.id);
      expect(sorted[0]).toBe('bob');
      expect(sorted[1]).toBe('alice');
      expect(sorted[2]).toBe('charlie');
    });

    it('puts players with no match last', () => {
      const matches = [
        { participants: [{ playerId: 'charlie' }], date: '2026-01-05' },
      ];
      const sorted = sortPlayersByRecentActivity(players, matches).map((p) => p.id);
      expect(sorted[0]).toBe('charlie');
      expect(sorted.slice(1)).toContain('alice');
      expect(sorted.slice(1)).toContain('bob');
    });

    it('uses the most recent match date for a player who played multiple times', () => {
      const matches = [
        { participants: [{ playerId: 'alice' }], date: '2026-01-01' },
        { participants: [{ playerId: 'alice' }, { playerId: 'bob' }], date: '2026-01-20' },
        { participants: [{ playerId: 'bob' }], date: '2026-01-10' },
      ];
      const sorted = sortPlayersByRecentActivity(players, matches).map((p) => p.id);
      expect(sorted[0]).toBe('alice');
      expect(sorted[1]).toBe('bob');
    });

    it('sorts alphabetically when dates are equal', () => {
      const matches = [
        { participants: [{ playerId: 'charlie' }, { playerId: 'alice' }], date: '2026-01-10' },
      ];
      const sorted = sortPlayersByRecentActivity(players, matches).map((p) => p.id);
      expect(sorted[0]).toBe('alice');
      expect(sorted[1]).toBe('charlie');
    });
  });

  describe('computeEloDeltas', () => {
    const makePlayer = (id: string, elo: number) => ({
      id,
      name: id,
      eloPetanque: elo,
      eloFlechettes: elo,
    });

    it('gives winner positive delta and loser negative delta in 1v1 equal ELOs', () => {
      const winner = makePlayer('alice', 1000);
      const loser = makePlayer('bob', 1000);
      const deltas = computeEloDeltas([winner], [loser], 'petanque');

      expect(deltas['alice']).toBeGreaterThan(0);
      expect(deltas['bob']).toBeLessThan(0);
      expect(deltas['alice']).toBe(25); // K=50 * (1 - 0.5) = 25
      expect(deltas['bob']).toBe(-25);
    });

    it('gives smaller winner gain when winner has higher ELO', () => {
      const winner = makePlayer('strong', 1200);
      const loser = makePlayer('weak', 800);
      const deltas = computeEloDeltas([winner], [loser], 'petanque');

      const equalDeltas = computeEloDeltas(
        [makePlayer('a', 1000)],
        [makePlayer('b', 1000)],
        'petanque',
      );

      expect(deltas['strong']).toBeLessThan(equalDeltas['a']);
      expect(Math.abs(deltas['weak'])).toBeLessThan(Math.abs(equalDeltas['b']));
    });

    it('gives larger winner gain when loser has higher ELO', () => {
      const winner = makePlayer('underdog', 800);
      const loser = makePlayer('favourite', 1200);
      const deltas = computeEloDeltas([winner], [loser], 'petanque');

      const equalDeltas = computeEloDeltas(
        [makePlayer('a', 1000)],
        [makePlayer('b', 1000)],
        'petanque',
      );

      expect(deltas['underdog']).toBeGreaterThan(equalDeltas['a']);
    });

    it('handles multi-player match (2v2)', () => {
      const winners = [makePlayer('w1', 1000), makePlayer('w2', 1000)];
      const losers = [makePlayer('l1', 1000), makePlayer('l2', 1000)];
      const deltas = computeEloDeltas(winners, losers, 'petanque');

      expect(deltas['w1']).toBeGreaterThan(0);
      expect(deltas['w2']).toBeGreaterThan(0);
      expect(deltas['l1']).toBeLessThan(0);
      expect(deltas['l2']).toBeLessThan(0);
      expect(deltas['w1']).toBe(deltas['w2']);
      expect(deltas['l1']).toBe(deltas['l2']);
    });

    it('uses flechettes ELO for flechettes sport', () => {
      const winner = makePlayer('alice', 0);
      const loser = makePlayer('bob', 0);
      winner.eloPetanque = 900;
      winner.eloFlechettes = 1100;
      loser.eloPetanque = 1100;
      loser.eloFlechettes = 900;

      const petanqueDeltas = computeEloDeltas([winner], [loser], 'petanque');
      const flechettesDeltas = computeEloDeltas([winner], [loser], 'flechettes');

      expect(petanqueDeltas['alice']).toBeGreaterThan(25);
      expect(flechettesDeltas['alice']).toBeLessThan(25);
    });
  });

  describe('computeEloRankedDeltas', () => {
    const makePlayer = (id: string, elo: number) => ({
      id,
      name: id,
      eloPetanque: elo,
      eloFlechettes: elo,
    });

    it('gives 1st place positive delta and last place negative delta in 2-player equal ELOs', () => {
      const first = makePlayer('alice', 1000);
      const second = makePlayer('bob', 1000);
      const deltas = computeEloRankedDeltas([first, second], 'flechettes');

      expect(deltas['alice']).toBeGreaterThan(0);
      expect(deltas['bob']).toBeLessThan(0);
    });

    it('gives 1st place more gain than middle players in a 4-player equal-ELO match', () => {
      const players = [
        makePlayer('first', 1000),
        makePlayer('second', 1000),
        makePlayer('third', 1000),
        makePlayer('fourth', 1000),
      ];
      const deltas = computeEloRankedDeltas(players, 'flechettes');

      expect(deltas['first']).toBeGreaterThan(deltas['second']);
      expect(deltas['second']).toBeGreaterThan(deltas['third']);
      expect(deltas['third']).toBeGreaterThan(deltas['fourth']);
      expect(deltas['fourth']).toBeLessThan(0);
    });

    it('sum of all deltas is approximately 0', () => {
      const players = [
        makePlayer('a', 1000),
        makePlayer('b', 1050),
        makePlayer('c', 950),
        makePlayer('d', 1100),
      ];
      const deltas = computeEloRankedDeltas(players, 'flechettes');
      const total = Object.values(deltas).reduce((sum, d) => sum + d, 0);

      expect(Math.abs(total)).toBeLessThanOrEqual(players.length);
    });

    it('1st place gains ~14 pts in a 2-player equal-ELO match', () => {
      const players = [makePlayer('alice', 1000), makePlayer('bob', 1000)];
      const deltas = computeEloRankedDeltas(players, 'flechettes');

      expect(deltas['alice']).toBeGreaterThanOrEqual(12);
      expect(deltas['alice']).toBeLessThanOrEqual(16);
    });

    it('1st place gains ~28 pts in a 3-player equal-ELO match', () => {
      const players = [makePlayer('p1', 1000), makePlayer('p2', 1000), makePlayer('p3', 1000)];
      const deltas = computeEloRankedDeltas(players, 'flechettes');

      expect(deltas['p1']).toBeGreaterThanOrEqual(24);
      expect(deltas['p1']).toBeLessThanOrEqual(32);
    });

    it('1st place gains ~84 pts in a 7-player equal-ELO match', () => {
      const players = Array.from({ length: 7 }, (_, i) => makePlayer(`p${i + 1}`, 1000));
      const deltas = computeEloRankedDeltas(players, 'flechettes');

      expect(deltas['p1']).toBeGreaterThanOrEqual(75);
      expect(deltas['p1']).toBeLessThanOrEqual(90);
    });
  });
});
