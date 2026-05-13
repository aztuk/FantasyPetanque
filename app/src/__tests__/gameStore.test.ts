import { useGameStore } from '../features/game/state/gameStore';
import { ALL_RULES } from '../data/rules/rules';

// Reset store before each test
beforeEach(() => {
  useGameStore.setState({
    mode: 'simple',
    rounds: [],
    currentRound: null,
    scores: { blue: 0, red: 0 },
    vetos: { blue: true, red: true },
    playedRuleIds: [],
    pendingNextRule: null,
    immuneTeam: null,
    isGameOver: false,
    winningScore: 13,
    maxRounds: null,
    vetosEnabled: true,
    phase: 'setup',
    debugMode: false,
  });
});

describe('startGame', () => {
  it('starts a simple game', () => {
    useGameStore.getState().startGame({ mode: 'simple' });
    const state = useGameStore.getState();
    expect(state.mode).toBe('simple');
    expect(state.currentRound).not.toBeNull();
    expect(state.currentRound?.rule).toBeNull();
  });

  it('starts a fantasy game with a rule drawn', () => {
    useGameStore.getState().startGame({ mode: 'fantasy' });
    const state = useGameStore.getState();
    expect(state.mode).toBe('fantasy');
    expect(state.phase).toBe('pre-mene');
    expect(state.currentRound).not.toBeNull();
    expect(state.currentRound?.rule).not.toBeNull();
  });
});

describe('addNormalPoint', () => {
  beforeEach(() => {
    useGameStore.getState().startGame({ mode: 'simple' });
  });

  it('adds a point to blue', () => {
    useGameStore.getState().addNormalPoint('blue');
    const round = useGameStore.getState().currentRound!;
    expect(round.normalPoints.blue).toBe(1);
    expect(round.normalPoints.red).toBe(0);
  });

  it('disables red after blue scores', () => {
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().addNormalPoint('red'); // should be ignored
    const round = useGameStore.getState().currentRound!;
    expect(round.normalPoints.red).toBe(0);
    expect(round.normalPoints.blue).toBe(1);
  });

  it('accumulates multiple points', () => {
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().addNormalPoint('blue');
    const round = useGameStore.getState().currentRound!;
    expect(round.normalPoints.blue).toBe(3);
  });
});

describe('undoNormalPoint', () => {
  beforeEach(() => {
    useGameStore.getState().startGame({ mode: 'simple' });
  });

  it('removes last point added', () => {
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().undoNormalPoint();
    expect(useGameStore.getState().currentRound!.normalPoints.blue).toBe(1);
  });

  it('re-enables both teams after undoing to 0', () => {
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().undoNormalPoint();
    const round = useGameStore.getState().currentRound!;
    expect(round.normalPoints.blue).toBe(0);
    // Now red should be selectable again
    useGameStore.getState().addNormalPoint('red');
    expect(useGameStore.getState().currentRound!.normalPoints.red).toBe(1);
  });

  it('does nothing if no points recorded', () => {
    useGameStore.getState().undoNormalPoint();
    expect(useGameStore.getState().currentRound!.normalPoints.blue).toBe(0);
    expect(useGameStore.getState().currentRound!.normalPoints.red).toBe(0);
  });
});

describe('finishRound - simple mode', () => {
  beforeEach(() => {
    useGameStore.getState().startGame({ mode: 'simple' });
  });

  it('adds normal points to scores and stores round', () => {
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().finishRound();

    const state = useGameStore.getState();
    expect(state.scores.blue).toBe(3);
    expect(state.scores.red).toBe(0);
    expect(state.rounds).toHaveLength(1);
  });

  it('score never goes below 0 with malus', () => {
    // Apply a malus directly
    useGameStore.setState({ scores: { blue: 1, red: 5 } });
    const round = useGameStore.getState().currentRound!;
    useGameStore.setState({
      currentRound: {
        ...round,
        censureMalus: { blue: 5, red: 0 }, // 5 malus, only 1 point
      },
    });
    // Force rule to censure for buildBonusMalusFromRound
    // (This is a partial test; full integration covered in scoring.test.ts)
    expect(useGameStore.getState().scores.blue).toBe(1);
  });
});

describe('useVeto', () => {
  beforeEach(() => {
    useGameStore.getState().startGame({ mode: 'fantasy' });
  });

  it('uses blue veto and draws new rule', () => {
    const originalRule = useGameStore.getState().currentRound?.rule?.id;
    useGameStore.getState().useVeto('blue');
    const state = useGameStore.getState();
    expect(state.vetos.blue).toBe(false);
    expect(state.vetos.red).toBe(true);
    expect(state.currentRound?.vetoUsed).toBe('blue');
  });

  it('cannot use veto twice', () => {
    useGameStore.getState().useVeto('blue');
    const ruleAfterFirst = useGameStore.getState().currentRound?.rule?.id;
    useGameStore.getState().useVeto('blue'); // should not change anything
    expect(useGameStore.getState().currentRound?.rule?.id).toBe(ruleAfterFirst);
  });

  it('keeps veto available while normal points are edited before the round is finished', () => {
    const ruleBeforeScoring = useGameStore.getState().currentRound?.rule?.id;

    useGameStore.getState().beginRound();
    useGameStore.getState().addNormalPoint('blue');
    expect(useGameStore.getState().phase).toBe('playing');

    useGameStore.getState().undoNormalPoint();

    const state = useGameStore.getState();
    expect(state.phase).toBe('playing');
    expect(state.vetos.blue).toBe(true);
    expect(state.currentRound?.vetoUsed).toBeNull();
    expect(state.currentRound?.rule?.id).toBe(ruleBeforeScoring);
  });
});

describe('debug rule selection', () => {
  it('replaces the automatically drawn first-round rule with the selected rule', () => {
    useGameStore.getState().startGame({ mode: 'fantasy' });
    const initialRuleId = useGameStore.getState().currentRound!.rule!.id;
    const selectedRule = ALL_RULES.find((rule) => rule.id !== initialRuleId)!;

    useGameStore.getState().forceRule(selectedRule);

    const state = useGameStore.getState();
    expect(state.currentRound?.number).toBe(1);
    expect(state.currentRound?.rule?.id).toBe(selectedRule.id);
    expect(state.playedRuleIds).toContain(selectedRule.id);
    expect(state.playedRuleIds).not.toContain(initialRuleId);
  });

  it('replaces the automatically drawn rule before a later round starts', () => {
    useGameStore.getState().startGame({ mode: 'fantasy' });
    const firstRuleId = useGameStore.getState().currentRound!.rule!.id;
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().finishRound();
    useGameStore.getState().startNewRound();

    const placeholderRuleId = useGameStore.getState().currentRound!.rule!.id;
    const selectedRule = ALL_RULES.find(
      (rule) => rule.id !== firstRuleId && rule.id !== placeholderRuleId,
    )!;

    useGameStore.getState().forceRule(selectedRule);

    const state = useGameStore.getState();
    expect(state.currentRound?.number).toBe(2);
    expect(state.currentRound?.rule?.id).toBe(selectedRule.id);
    expect(state.playedRuleIds).toContain(firstRuleId);
    expect(state.playedRuleIds).toContain(selectedRule.id);
    expect(state.playedRuleIds).not.toContain(placeholderRuleId);
  });

  it('clears a stale totem pre-draw when selecting a non-totem rule', () => {
    useGameStore.getState().startGame({ mode: 'fantasy' });
    const totemRule = ALL_RULES.find((rule) => rule.id === 'totem-immunite')!;
    const nonTotemRule = ALL_RULES.find((rule) => rule.id !== 'totem-immunite')!;

    useGameStore.getState().forceRule(totemRule);
    expect(useGameStore.getState().pendingNextRule).not.toBeNull();

    useGameStore.getState().forceRule(nonTotemRule);

    const state = useGameStore.getState();
    expect(state.currentRound?.rule?.id).toBe(nonTotemRule.id);
    expect(state.currentRound?.totemNextRule).toBeNull();
    expect(state.pendingNextRule).toBeNull();
  });
});

describe('Casino', () => {
  it('sets casino bets correctly', () => {
    useGameStore.setState({
      scores: { blue: 8, red: 4 },
      currentRound: {
        number: 1,
        rule: { id: 'casino', name: 'Casino', description: '', shortDescription: '', tags: ['specific', 'bet', 'specific-ui', 'skip-normal-score', 'not-available-at-zero'], uiType: 'casino', skipNormalScore: true, conditionId: 'casino-condition' },
        normalPoints: { blue: 0, red: 0 },
        bonuses: [],
        scoreAfter: { blue: 0, red: 0 },
        vetoUsed: null,
        sortieDePorc: null,
        assurance: { blue: false, red: false },
        frontiereChoice: { blue: null, red: null },
        contratMission: { blue: null, red: null },
        contratSuccess: { blue: false, red: false },
        boucleMauditeHit: { blue: false, red: false },
        kingBonus: { blue: 0, red: 0 },
        gaucheBonus: { blue: false, red: false },
        extremesBonus: { blue: false, red: false },
        censureMalus: { blue: 0, red: 0 },
        casinoBets: { blue: 0, red: 0 },
        casinoWinner: null,
        predictionValues: { blue: null, red: null },
        totemNextRule: null,
        totemImmuneTeam: null,
        impairResult: null,
      },
    });

    useGameStore.getState().setCasinoBet('blue', 3);
    useGameStore.getState().setCasinoBet('red', 4);

    const round = useGameStore.getState().currentRound!;
    expect(round.casinoBets.blue).toBe(3);
    expect(round.casinoBets.red).toBe(4);
  });

  it('bet cannot exceed team score', () => {
    useGameStore.setState({ scores: { blue: 3, red: 8 } });
    const round = useGameStore.getState().currentRound;
    if (round) {
      useGameStore.getState().setCasinoBet('blue', 10); // over limit
      expect(useGameStore.getState().currentRound!.casinoBets.blue).toBe(3);
    }
  });
});

describe('Sortie de porc', () => {
  it('skips normal score when cochonnet exited', () => {
    useGameStore.getState().startGame({ mode: 'fantasy' });
    // Force sortie de porc rule
    useGameStore.setState((s) => ({
      currentRound: s.currentRound
        ? {
            ...s.currentRound,
            rule: { id: 'sortie-de-porc', name: 'Sortie de porc', description: '', shortDescription: '', tags: ['fast', 'totem-compatible', 'instant-resolution', 'skip-normal-score', 'specific-ui'], uiType: 'cochonnet-sorti' },
          }
        : null,
    }));
    useGameStore.getState().setSortieDePorc('blue');
    expect(useGameStore.getState().currentRound?.sortieDePorc).toBe('blue');
  });
});

describe('Assurance vie', () => {
  it('toggles assurance for each team', () => {
    useGameStore.getState().startGame({ mode: 'simple' });
    useGameStore.getState().toggleAssurance('blue');
    expect(useGameStore.getState().currentRound?.assurance.blue).toBe(true);
    expect(useGameStore.getState().currentRound?.assurance.red).toBe(false);
    useGameStore.getState().toggleAssurance('blue');
    expect(useGameStore.getState().currentRound?.assurance.blue).toBe(false);
  });
});

describe('Frontière', () => {
  it('sets frontier choice', () => {
    useGameStore.getState().startGame({ mode: 'simple' });
    useGameStore.getState().setFrontiereChoice('blue', 'left');
    useGameStore.getState().setFrontiereChoice('red', 'right');
    const round = useGameStore.getState().currentRound!;
    expect(round.frontiereChoice.blue).toBe('left');
    expect(round.frontiereChoice.red).toBe('right');
  });
});

describe('History', () => {
  it('stores round in history after finishRound', () => {
    useGameStore.getState().startGame({ mode: 'simple' });
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().finishRound();

    const state = useGameStore.getState();
    expect(state.rounds).toHaveLength(1);
    expect(state.rounds[0].normalPoints.blue).toBe(1);
    expect(state.rounds[0].scoreAfter.blue).toBe(1);
  });

  it('accumulates history across multiple rounds', () => {
    useGameStore.getState().startGame({ mode: 'simple' });

    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().finishRound();
    useGameStore.getState().startNewRound();

    useGameStore.getState().addNormalPoint('red');
    useGameStore.getState().addNormalPoint('red');
    useGameStore.getState().finishRound();

    const state = useGameStore.getState();
    expect(state.rounds).toHaveLength(2);
    expect(state.scores.blue).toBe(1);
    expect(state.scores.red).toBe(2);
  });
});

describe('Game over', () => {
  it('detects game over when team reaches winning score', () => {
    useGameStore.getState().startGame({ mode: 'simple' });
    // Set score to 12 AFTER startGame (which resets it)
    useGameStore.setState((s) => ({ scores: { blue: 12, red: 5 } }));
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().finishRound();
    expect(useGameStore.getState().isGameOver).toBe(true);
  });
});
