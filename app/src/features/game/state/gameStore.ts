import { create } from 'zustand';
import { Team, GameState, GameMode, RoundState, Rule } from '../../../domain/game/models';
import { drawRule, drawTotemRule, createRound, shouldSkipNormalScore, isGameOver } from '../../../domain/game/engine';
import {
  clampScore,
  resolveImpair,
  resolveAssuranceVie,
  resolveCasino,
  resolvePrediction,
  buildBonusMalusFromRound,
} from '../../../domain/game/scoring';
import { CONTRAT_MISSIONS } from '../../../data/rules/rules';

const WINNING_SCORE = 13;

function makeInitialState(): GameState {
  return {
    mode: 'simple',
    rounds: [],
    currentRound: null,
    scores: { blue: 0, red: 0 },
    vetos: { blue: true, red: true },
    playedRuleIds: [],
    pendingNextRule: null,
    immuneTeam: null,
    isGameOver: false,
    winningScore: WINNING_SCORE,
    phase: 'setup',
  };
}

interface GameStore extends GameState {
  debugMode: boolean;
  toggleDebugMode: () => void;
  forceRule: (rule: Rule) => void;

  // Setup actions
  startGame: (mode: GameMode) => void;
  resetGame: () => void;

  // Round lifecycle
  startNewRound: () => void;
  useVeto: (team: Team) => void;
  finishRound: () => void;

  // Normal scoring
  addNormalPoint: (team: Team) => void;
  undoNormalPoint: () => void;

  // Rule-specific actions
  // Gauche caviar / Les extrêmes / King of the Hill
  addBonus: (team: Team, ruleId: 'gauche-caviar' | 'les-extremes' | 'king-of-the-hill') => void;
  removeBonus: (team: Team, ruleId: 'gauche-caviar' | 'les-extremes' | 'king-of-the-hill') => void;

  // Censure
  addCensureMalus: (team: Team) => void;
  removeCensureMalus: (team: Team) => void;

  // Sortie de porc
  setSortieDePorc: (team: Team | null) => void;

  // Boule maudite
  setBouleMauditeHit: (team: Team, hit: boolean) => void;

  // Contrat
  selectContratMission: (team: Team, missionIdx: number) => void;
  clearContratMission: (team: Team) => void;
  setContratSuccess: (team: Team, success: boolean) => void;

  // Assurance vie
  toggleAssurance: (team: Team) => void;

  // Frontière
  setFrontiereChoice: (team: Team, side: 'left' | 'right') => void;

  // Casino
  setCasinoBet: (team: Team, amount: number) => void;
  setCasinoWinner: (team: Team) => void;

  // Prédiction
  setPrediction: (team: Team, value: number | null) => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...makeInitialState(),
  debugMode: false,

  toggleDebugMode: () => set((s) => ({ debugMode: !s.debugMode })),

  forceRule: (rule) => {
    const state = get();
    if (!state.currentRound) return;
    let newPlayedRuleIds = [...state.playedRuleIds];
    if (!newPlayedRuleIds.includes(rule.id)) {
      newPlayedRuleIds = [...newPlayedRuleIds, rule.id];
    }
    let newPendingNextRule = state.pendingNextRule;
    const newRound = createRound(state.currentRound.number, rule);
    if (rule.id === 'totem-immunite') {
      const nextRule = drawTotemRule({ playedRuleIds: newPlayedRuleIds, scores: state.scores }, rule.id);
      newRound.totemNextRule = nextRule;
      newPendingNextRule = nextRule;
    }
    set({ currentRound: newRound, playedRuleIds: newPlayedRuleIds, pendingNextRule: newPendingNextRule });
  },

  startGame: (mode) => {
    const state = get();
    const initial = makeInitialState();
    initial.mode = mode;
    initial.phase = 'rule-display';

    if (mode === 'fantasy') {
      const rule = drawRule({ playedRuleIds: [], scores: initial.scores });
      const round = createRound(1, rule);

      // Handle Totem immediately
      if (rule.id === 'totem-immunite') {
        const nextRule = drawTotemRule({ playedRuleIds: [rule.id], scores: initial.scores }, rule.id);
        round.totemNextRule = nextRule;
        initial.pendingNextRule = nextRule;
      }

      initial.currentRound = round;
      initial.playedRuleIds = [rule.id];
    } else {
      initial.currentRound = createRound(1, null);
    }

    set(initial);
  },

  resetGame: () => {
    set(makeInitialState());
  },

  startNewRound: () => {
    const state = get();
    const roundNumber = state.rounds.length + 1;
    let rule: Rule | null = null;
    let newPlayedRuleIds = [...state.playedRuleIds];
    let newPendingNextRule: Rule | null = null;
    let newImmuneTeam: Team | null = null;

    if (state.mode === 'fantasy') {
      if (state.pendingNextRule) {
        // Totem pre-drew the next rule
        rule = state.pendingNextRule;
        newImmuneTeam = state.immuneTeam; // carry forward immune team set when Totem resolved
        newPendingNextRule = null;
      } else {
        rule = drawRule({ playedRuleIds: newPlayedRuleIds, scores: state.scores });
      }

      if (!newPlayedRuleIds.includes(rule.id)) {
        newPlayedRuleIds = [...newPlayedRuleIds, rule.id];
      }

      // Handle Totem
      if (rule.id === 'totem-immunite') {
        const nextRule = drawTotemRule({ playedRuleIds: newPlayedRuleIds, scores: state.scores }, rule.id);
        newPendingNextRule = nextRule;
      }
    }

    const newRound = createRound(roundNumber, rule);

    // Pre-apply totem immune team to the new round if it exists
    if (state.immuneTeam && rule?.id === state.pendingNextRule?.id) {
      newRound.totemImmuneTeam = state.immuneTeam;
    }

    set({
      currentRound: newRound,
      playedRuleIds: newPlayedRuleIds,
      pendingNextRule: newPendingNextRule,
      immuneTeam: null, // consumed
      phase: 'rule-display',
    });
  },

  useVeto: (team) => {
    const state = get();
    if (!state.vetos[team] || !state.currentRound) return;
    if (state.phase !== 'rule-display') return;

    // Draw a new rule (veto'd rule can reappear later, so we don't add it to playedRuleIds)
    const newRule = drawRule({ playedRuleIds: state.playedRuleIds, scores: state.scores });
    const newRound: RoundState = {
      ...createRound(state.currentRound.number, newRule),
      vetoUsed: team,
    };

    let newPendingNextRule = state.pendingNextRule;
    let newPlayedRuleIds = [...state.playedRuleIds];
    if (!newPlayedRuleIds.includes(newRule.id)) {
      newPlayedRuleIds = [...newPlayedRuleIds, newRule.id];
    }

    // Handle Totem on new rule
    if (newRule.id === 'totem-immunite') {
      const nextRule = drawTotemRule({ playedRuleIds: newPlayedRuleIds, scores: state.scores }, newRule.id);
      newRound.totemNextRule = nextRule;
      newPendingNextRule = nextRule;
    }

    set({
      vetos: { ...state.vetos, [team]: false },
      currentRound: newRound,
      playedRuleIds: newPlayedRuleIds,
      pendingNextRule: newPendingNextRule,
    });
  },

  finishRound: () => {
    const state = get();
    if (!state.currentRound) return;

    const round = state.currentRound;
    let newScores = { ...state.scores };
    let newImmuneTeam: Team | null = state.immuneTeam;

    const ruleId = round.rule?.id;
    const skip = shouldSkipNormalScore(round);

    if (skip) {
      // Casino
      if (ruleId === 'casino' && round.casinoWinner) {
        newScores = resolveCasino(round.casinoWinner, round.casinoBets, newScores);
      }
      // Sortie de porc
      if (ruleId === 'sortie-de-porc' && round.sortieDePorc) {
        newScores[round.sortieDePorc] = clampScore(newScores[round.sortieDePorc] + 6);
      }
    } else {
      // Normal scoring
      const winner: Team | null =
        round.normalPoints.blue > 0 ? 'blue' :
        round.normalPoints.red > 0 ? 'red' : null;

      if (ruleId === 'impair-contre-attaque' && winner) {
        const points = round.normalPoints[winner];
        const result = resolveImpair(winner, points, newScores);
        newScores = result.newScores;
      } else if (ruleId === 'assurance-vie') {
        newScores = resolveAssuranceVie(
          winner ?? 'blue',
          round.normalPoints,
          round.assurance,
          newScores,
        );
      } else {
        // Standard: add normal points to winner
        if (winner) {
          newScores[winner] = clampScore(newScores[winner] + round.normalPoints[winner]);
        }
      }

      // Apply Prédiction after normal score
      if (ruleId === 'prediction') {
        newScores = resolvePrediction(round.predictionValues, round.normalPoints, newScores);
      }
    }

    // Apply bonuses/maluses from rule-specific actions
    const bonusMalusList = buildBonusMalusFromRound(round);
    for (const bm of bonusMalusList) {
      if (bm.value > 0) {
        newScores[bm.team] = clampScore(newScores[bm.team] + bm.value);
      } else {
        newScores[bm.team] = clampScore(newScores[bm.team] + bm.value); // value is negative
      }
    }

    // Totem: set immune team for next round (loser of totem mene)
    if (ruleId === 'totem-immunite') {
      const winner: Team | null =
        round.normalPoints.blue > 0 ? 'blue' :
        round.normalPoints.red > 0 ? 'red' : null;
      // Loser gets immunity (decision: no immunity if tie)
      if (winner) {
        newImmuneTeam = winner === 'blue' ? 'red' : 'blue';
      }
    }

    const finishedRound: RoundState = {
      ...round,
      bonuses: bonusMalusList.filter((b) => b.value > 0),
      scoreAfter: newScores,
    };

    const gameOver = isGameOver(newScores, state.winningScore);

    set({
      scores: newScores,
      rounds: [...state.rounds, finishedRound],
      currentRound: null,
      immuneTeam: newImmuneTeam,
      isGameOver: gameOver,
      phase: gameOver ? 'game-over' : 'round-summary',
    });
  },

  addNormalPoint: (team) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;

    // If other team already has points, ignore
    const other: Team = team === 'blue' ? 'red' : 'blue';
    if (round.normalPoints[other] > 0) return;

    set({
      currentRound: {
        ...round,
        normalPoints: {
          ...round.normalPoints,
          [team]: round.normalPoints[team] + 1,
        },
      },
    });
  },

  undoNormalPoint: () => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;

    const scoringTeam: Team | null =
      round.normalPoints.blue > 0 ? 'blue' :
      round.normalPoints.red > 0 ? 'red' : null;

    if (!scoringTeam) return;

    const newPoints = round.normalPoints[scoringTeam] - 1;
    set({
      currentRound: {
        ...round,
        normalPoints: {
          ...round.normalPoints,
          [scoringTeam]: Math.max(0, newPoints),
        },
      },
    });
  },

  addBonus: (team, ruleId) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;
    const rule = round.rule;
    if (!rule || rule.id !== ruleId) return;

    switch (ruleId) {
      case 'gauche-caviar':
        if (!round.gaucheBonus[team]) {
          set({ currentRound: { ...round, gaucheBonus: { ...round.gaucheBonus, [team]: true } } });
        }
        break;

      case 'les-extremes':
        if (!round.extremesBonus[team]) {
          set({ currentRound: { ...round, extremesBonus: { ...round.extremesBonus, [team]: true } } });
        }
        break;

      case 'king-of-the-hill': {
        const max = rule.maxBonusPerTeam ?? 6;
        if (round.kingBonus[team] < max) {
          set({ currentRound: { ...round, kingBonus: { ...round.kingBonus, [team]: round.kingBonus[team] + 1 } } });
        }
        break;
      }
    }
  },

  removeBonus: (team, ruleId) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;

    switch (ruleId) {
      case 'gauche-caviar':
        set({ currentRound: { ...round, gaucheBonus: { ...round.gaucheBonus, [team]: false } } });
        break;

      case 'les-extremes':
        set({ currentRound: { ...round, extremesBonus: { ...round.extremesBonus, [team]: false } } });
        break;

      case 'king-of-the-hill':
        if (round.kingBonus[team] > 0) {
          set({ currentRound: { ...round, kingBonus: { ...round.kingBonus, [team]: round.kingBonus[team] - 1 } } });
        }
        break;
    }
  },

  addCensureMalus: (team) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;
    const max = round.rule?.maxMalusPerTeam ?? 3;
    if (round.censureMalus[team] < max) {
      set({ currentRound: { ...round, censureMalus: { ...round.censureMalus, [team]: round.censureMalus[team] + 1 } } });
    }
  },

  removeCensureMalus: (team) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;
    if (round.censureMalus[team] > 0) {
      set({ currentRound: { ...round, censureMalus: { ...round.censureMalus, [team]: round.censureMalus[team] - 1 } } });
    }
  },

  setSortieDePorc: (team) => {
    const state = get();
    if (!state.currentRound) return;
    set({ currentRound: { ...state.currentRound, sortieDePorc: team } });
  },

  setBouleMauditeHit: (team, hit) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;
    const max = round.rule?.maxMalusPerTeam ?? 1;
    if (!hit || round.boucleMauditeHit[team] === false) {
      set({ currentRound: { ...round, boucleMauditeHit: { ...round.boucleMauditeHit, [team]: hit } } });
    }
  },

  selectContratMission: (team, missionIdx) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;
    set({ currentRound: { ...round, contratMission: { ...round.contratMission, [team]: missionIdx } } });
  },

  clearContratMission: (team) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;
    set({ currentRound: { ...round, contratMission: { ...round.contratMission, [team]: null }, contratSuccess: { ...round.contratSuccess, [team]: false } } });
  },

  setContratSuccess: (team, success) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;
    if (round.contratMission[team] === null) return; // must select mission first
    set({ currentRound: { ...round, contratSuccess: { ...round.contratSuccess, [team]: success } } });
  },

  toggleAssurance: (team) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;
    set({ currentRound: { ...round, assurance: { ...round.assurance, [team]: !round.assurance[team] } } });
  },

  setFrontiereChoice: (team, side) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;
    set({ currentRound: { ...round, frontiereChoice: { ...round.frontiereChoice, [team]: side } } });
  },

  setCasinoBet: (team, amount) => {
    const state = get();
    if (!state.currentRound) return;
    const round = state.currentRound;
    const maxBet = state.scores[team];
    const clamped = Math.max(0, Math.min(amount, maxBet));
    set({ currentRound: { ...round, casinoBets: { ...round.casinoBets, [team]: clamped } } });
  },

  setCasinoWinner: (team) => {
    const state = get();
    if (!state.currentRound) return;
    set({ currentRound: { ...state.currentRound, casinoWinner: team } });
  },

  setPrediction: (team, value) => {
    const state = get();
    if (!state.currentRound) return;
    const clamped = value === null ? null : Math.max(1, Math.min(6, value));
    set({ currentRound: { ...state.currentRound, predictionValues: { ...state.currentRound.predictionValues, [team]: clamped } } });
  },
}));
