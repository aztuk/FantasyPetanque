import { Rule, RuleUIType, Team, GameState, RoundState } from '../models';
import { ALL_RULES } from '../../../data/rules/rules';
export { resolveRound, shouldSkipNormalScore } from './roundResolver';

const PRE_MENE_SETUP_UI_TYPES: RuleUIType[] = [
  'contrat',
  'assurance-vie',
  'frontiere',
  'casino',
  'prediction',
];

// Check if a rule can appear given current scores
export function ruleIsAvailable(rule: Rule, scores: Record<Team, number>): boolean {
  if (rule.isAvailable) return rule.isAvailable(scores);
  if (!rule.conditionId) return true;

  switch (rule.conditionId) {
    case 'casino-condition':
      return scores.blue >= 1 && scores.red >= 1;
    case 'prediction-condition':
      return scores.blue >= 1 && scores.red >= 1;
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
  const { playedRuleIds, scores } = state;

  let available = pool.filter(
    (r) => !playedRuleIds.includes(r.id) && ruleIsAvailable(r, scores),
  );

  if (available.length === 0) {
    available = pool.filter((r) => ruleIsAvailable(r, scores));
  }

  if (available.length === 0) {
    available = pool;
  }

  return available[Math.floor(Math.random() * available.length)];
}

// Draw the next totem-compatible rule (for Totem d'immunité)
export function drawTotemRule(
  state: Pick<GameState, 'playedRuleIds' | 'scores'>,
  currentRuleId: string,
): Rule {
  const totemPool = ALL_RULES.filter(
    (r) => r.tags.includes('totem-compatible') && r.id !== currentRuleId,
  );
  const { playedRuleIds, scores } = state;

  let available = totemPool.filter(
    (r) => !playedRuleIds.includes(r.id) && ruleIsAvailable(r, scores),
  );

  if (available.length === 0) {
    available = totemPool.filter((r) => ruleIsAvailable(r, scores));
  }

  if (available.length === 0) {
    available = totemPool;
  }

  return available[Math.floor(Math.random() * available.length)];
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
    casinoBets: { blue: 1, red: 1 },
    casinoWinner: null,
    predictionValues: { blue: null, red: null },
    totemNextRule: null,
    totemImmuneTeam: null,
    impairResult: null,
  };
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
    case 'prediction':
      return round.predictionValues.blue !== null && round.predictionValues.red !== null;
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
