import { Rule, RuleUIType, Team, GameState, RoundState } from '../models';
import { ALL_RULES } from '../../../data/rules/rules';

const PRE_MENE_SETUP_UI_TYPES: RuleUIType[] = [
  'contrat',
  'assurance-vie',
  'frontiere',
];

// Check if a rule can appear given current game state
export function ruleIsAvailable(rule: Rule, state: GameState): boolean {
  if (!rule.conditionId) return true;

  switch (rule.conditionId) {
    case 'casino-condition':
      // Casino: at least one team has at least 1 point
      return state.scores.blue >= 1 || state.scores.red >= 1;

    case 'prediction-condition':
      // Prédiction: neither team has 0 points (both must have >= 1)
      return state.scores.blue >= 1 && state.scores.red >= 1;

    default:
      return true;
  }
}

// Draw a random rule from the pool, respecting the no-repeat policy
export function drawRule(
  state: Pick<GameState, 'playedRuleIds' | 'scores'>,
  overridePool?: Rule[],
): Rule {
  const pool = overridePool ?? ALL_RULES;

  // Build the filtered state for availability check
  const fakeState: GameState = {
    mode: 'fantasy',
    rounds: [],
    currentRound: null,
    scores: state.scores,
    vetos: { blue: true, red: true },
    playedRuleIds: state.playedRuleIds,
    pendingNextRule: null,
    immuneTeam: null,
    isGameOver: false,
    winningScore: 13,
    maxRounds: null,
    vetosEnabled: true,
    phase: 'rule-display',
  };

  // Available = not yet played in this cycle AND condition satisfied
  let available = pool.filter(
    (r) => !state.playedRuleIds.includes(r.id) && ruleIsAvailable(r, fakeState),
  );

  // If all rules played (or none available), reset cycle and try again
  if (available.length === 0) {
    available = pool.filter((r) => ruleIsAvailable(r, fakeState));
  }

  // If still none (e.g., all conditions fail), fall back to all rules
  if (available.length === 0) {
    available = pool;
  }

  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

// Draw the next totem-compatible rule (for Totem d'immunité)
export function drawTotemRule(
  state: Pick<GameState, 'playedRuleIds' | 'scores'>,
  currentRuleId: string,
): Rule {
  const totemPool = ALL_RULES.filter(
    (r) => r.tags.includes('totem-compatible') && r.id !== currentRuleId,
  );

  const fakeState: GameState = {
    mode: 'fantasy',
    rounds: [],
    currentRound: null,
    scores: state.scores,
    vetos: { blue: true, red: true },
    playedRuleIds: state.playedRuleIds,
    pendingNextRule: null,
    immuneTeam: null,
    isGameOver: false,
    winningScore: 13,
    maxRounds: null,
    vetosEnabled: true,
    phase: 'rule-display',
  };

  // Not yet played totem-compatible rules
  let available = totemPool.filter(
    (r) => !state.playedRuleIds.includes(r.id) && ruleIsAvailable(r, fakeState),
  );

  // Decision: if none available, recycle all totem-compatible rules (see CLAUDE.md)
  if (available.length === 0) {
    available = totemPool.filter((r) => ruleIsAvailable(r, fakeState));
  }

  if (available.length === 0) {
    available = totemPool;
  }

  const idx = Math.floor(Math.random() * available.length);
  return available[idx];
}

// Create a fresh round state
export function createRound(
  number: number,
  rule: Rule | null,
): RoundState {
  return {
    number,
    rule,
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
  };
}

// Determine if normal score phase should be skipped
export function shouldSkipNormalScore(round: RoundState): boolean {
  if (!round.rule) return false;

  // Casino always skips normal score
  if (round.rule.id === 'casino') return true;

  // Sortie de porc: only if cochonnet was actually exited
  if (round.rule.id === 'sortie-de-porc' && round.sortieDePorc !== null) return true;

  return false;
}

export function requiresPreMeneSetup(rule: Rule | null): boolean {
  return !!rule && rule.tags.includes('setup') && PRE_MENE_SETUP_UI_TYPES.includes(rule.uiType);
}

export function isPreMeneSetupComplete(round: RoundState): boolean {
  switch (round.rule?.uiType) {
    case 'contrat':
      return round.contratMission.blue !== null && round.contratMission.red !== null;
    case 'frontiere':
      return round.frontiereChoice.blue !== null && round.frontiereChoice.red !== null;
    case 'assurance-vie':
      return true;
    default:
      return true;
  }
}

// Determine if game is over
export function isGameOver(scores: Record<Team, number>, winningScore: number): boolean {
  return scores.blue >= winningScore || scores.red >= winningScore;
}

export function getWinner(scores: Record<Team, number>): Team | null {
  if (scores.blue > scores.red) return 'blue';
  if (scores.red > scores.blue) return 'red';
  return null;
}
