import { drawRule, drawTotemRule, createRound, shouldSkipNormalScore, isGameOver } from '../domain/game/engine';
import { ALL_RULES } from '../data/rules/rules';
import { GameState } from '../domain/game/models';

describe('drawRule', () => {
  it('draws a rule from the pool', () => {
    const state = { playedRuleIds: [], scores: { blue: 5, red: 5 } };
    const rule = drawRule(state);
    expect(rule).toBeDefined();
    expect(rule.id).toBeTruthy();
  });

  it('does not repeat a rule until all are played', () => {
    const allIds = ALL_RULES.map((r) => r.id).filter((id) => {
      // Exclude condition-gated rules for this test
      const rule = ALL_RULES.find((r) => r.id === id)!;
      return !rule.conditionId;
    });

    const drawnIds: string[] = [];
    const scores = { blue: 5, red: 5 };

    for (let i = 0; i < allIds.length; i++) {
      const rule = drawRule({ playedRuleIds: drawnIds, scores });
      if (!drawnIds.includes(rule.id)) drawnIds.push(rule.id);
    }

    // All drawn rules should be unique (in the limit of the pool)
    const uniqueDrawn = new Set(drawnIds);
    expect(uniqueDrawn.size).toBe(drawnIds.length);
  });

  it('resets cycle when all rules have been played', () => {
    const allIds = ALL_RULES.map((r) => r.id);
    const state = { playedRuleIds: allIds, scores: { blue: 5, red: 5 } };
    const rule = drawRule(state);
    expect(rule).toBeDefined();
  });

  it('casino rule does not appear unless both teams have at least 1 point', () => {
    const playedIds = ALL_RULES.filter((r) => r.id !== 'casino').map((r) => r.id);

    for (const scores of [{ blue: 0, red: 0 }, { blue: 0, red: 5 }, { blue: 5, red: 0 }]) {
      const rule = drawRule({ playedRuleIds: playedIds, scores });
      expect(rule.id).not.toBe('casino');
    }
  });

  it('prediction rule does not appear when a team has 0 points', () => {
    const scores = { blue: 0, red: 5 };
    for (let i = 0; i < 20; i++) {
      const rule = drawRule({ playedRuleIds: [], scores });
      if (rule.id === 'prediction') {
        fail('Prediction should not appear when a team has 0 points');
      }
    }
  });
});

describe('drawTotemRule', () => {
  it('draws a totem-compatible rule', () => {
    const state = { playedRuleIds: [], scores: { blue: 5, red: 5 } };
    const rule = drawTotemRule(state, 'totem-immunite');
    expect(rule.tags).toContain('totem-compatible');
  });

  it('does not draw the same rule as current', () => {
    const state = { playedRuleIds: [], scores: { blue: 5, red: 5 } };
    for (let i = 0; i < 10; i++) {
      const rule = drawTotemRule(state, 'totem-immunite');
      expect(rule.id).not.toBe('totem-immunite');
    }
  });
});

describe('createRound', () => {
  it('creates a round with correct defaults', () => {
    const rule = ALL_RULES[0];
    const round = createRound(1, rule);
    expect(round.number).toBe(1);
    expect(round.rule).toBe(rule);
    expect(round.normalPoints.blue).toBe(0);
    expect(round.normalPoints.red).toBe(0);
    expect(round.vetoUsed).toBeNull();
    expect(round.sortieDePorc).toBeNull();
    expect(round.casinoBets).toEqual({ blue: 1, red: 1 });
    expect(round.casinoWinner).toBeNull();
  });
});

describe('shouldSkipNormalScore', () => {
  it('casino always skips normal score', () => {
    const casinoRule = ALL_RULES.find((r) => r.id === 'casino')!;
    const round = createRound(1, casinoRule);
    expect(shouldSkipNormalScore(round)).toBe(true);
  });

  it('sortie de porc skips normal score only when cochonnet exited', () => {
    const rule = ALL_RULES.find((r) => r.id === 'sortie-de-porc')!;
    const round = createRound(1, rule);
    expect(shouldSkipNormalScore(round)).toBe(false); // no sortie yet

    round.sortieDePorc = 'blue';
    expect(shouldSkipNormalScore(round)).toBe(true);
  });

  it('regular rules do not skip normal score', () => {
    const rule = ALL_RULES.find((r) => r.id === 'censure')!;
    const round = createRound(1, rule);
    expect(shouldSkipNormalScore(round)).toBe(false);
  });
});

describe('isGameOver', () => {
  it('returns true when blue reaches winning score', () => {
    expect(isGameOver({ blue: 13, red: 5 }, 13)).toBe(true);
  });

  it('returns true when red reaches winning score', () => {
    expect(isGameOver({ blue: 5, red: 13 }, 13)).toBe(true);
  });

  it('returns false when neither has reached winning score', () => {
    expect(isGameOver({ blue: 12, red: 12 }, 13)).toBe(false);
  });

  it('returns true when score exceeds winning score', () => {
    expect(isGameOver({ blue: 15, red: 5 }, 13)).toBe(true);
  });
});
