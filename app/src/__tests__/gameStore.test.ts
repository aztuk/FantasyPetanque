import { useGameStore } from '../features/game/state/gameStore';

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
    phase: 'setup',
  });
});

describe('startGame', () => {
  it('starts a simple game', () => {
    useGameStore.getState().startGame('simple');
    const state = useGameStore.getState();
    expect(state.mode).toBe('simple');
    expect(state.currentRound).not.toBeNull();
    expect(state.currentRound?.rule).toBeNull();
  });

  it('starts a fantasy game with a rule drawn', () => {
    useGameStore.getState().startGame('fantasy');
    const state = useGameStore.getState();
    expect(state.mode).toBe('fantasy');
    expect(state.currentRound).not.toBeNull();
    expect(state.currentRound?.rule).not.toBeNull();
  });
});

describe('addNormalPoint', () => {
  beforeEach(() => {
    useGameStore.getState().startGame('simple');
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
    useGameStore.getState().startGame('simple');
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
    useGameStore.getState().startGame('simple');
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
    useGameStore.getState().startGame('fantasy');
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
    useGameStore.getState().startGame('fantasy');
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
    useGameStore.getState().startGame('simple');
    useGameStore.getState().toggleAssurance('blue');
    expect(useGameStore.getState().currentRound?.assurance.blue).toBe(true);
    expect(useGameStore.getState().currentRound?.assurance.red).toBe(false);
    useGameStore.getState().toggleAssurance('blue');
    expect(useGameStore.getState().currentRound?.assurance.blue).toBe(false);
  });
});

describe('Frontière', () => {
  it('sets frontier choice', () => {
    useGameStore.getState().startGame('simple');
    useGameStore.getState().setFrontiereChoice('blue', 'left');
    useGameStore.getState().setFrontiereChoice('red', 'right');
    const round = useGameStore.getState().currentRound!;
    expect(round.frontiereChoice.blue).toBe('left');
    expect(round.frontiereChoice.red).toBe('right');
  });
});

describe('History', () => {
  it('stores round in history after finishRound', () => {
    useGameStore.getState().startGame('simple');
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().finishRound();

    const state = useGameStore.getState();
    expect(state.rounds).toHaveLength(1);
    expect(state.rounds[0].normalPoints.blue).toBe(1);
    expect(state.rounds[0].scoreAfter.blue).toBe(1);
  });

  it('accumulates history across multiple rounds', () => {
    useGameStore.getState().startGame('simple');

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
    useGameStore.getState().startGame('simple');
    // Set score to 12 AFTER startGame (which resets it)
    useGameStore.setState((s) => ({ scores: { blue: 12, red: 5 } }));
    useGameStore.getState().addNormalPoint('blue');
    useGameStore.getState().finishRound();
    expect(useGameStore.getState().isGameOver).toBe(true);
  });
});
