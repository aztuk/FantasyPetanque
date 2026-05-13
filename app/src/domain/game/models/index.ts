export type Team = 'blue' | 'red';
export type GameMode = 'simple' | 'fantasy';

export type RuleTag =
  | 'fast'
  | 'setup'
  | 'specific'
  | 'bonus'
  | 'malus'
  | 'skip-normal-score'
  | 'requires-next-rule'
  | 'totem-compatible'
  | 'needs-manual-resolution'
  | 'score-modifier'
  | 'auto-resolution'
  | 'specific-ui'
  | 'gesture'
  | 'auto-arbitrage'
  | 'scoring-constraint'
  | 'instant-resolution'
  | 'bet'
  | 'not-available-at-zero'
  | 'future-rule'
  | 'skip-random-draw-next-turn'
  | 'mission'
  | 'reroll';

export type RuleUIType =
  | 'none'
  | 'bonus-buttons'
  | 'malus-buttons'
  | 'bonus-malus-buttons'
  | 'cochonnet-sorti'
  | 'contrat'
  | 'assurance-vie'
  | 'frontiere'
  | 'casino'
  | 'prediction'
  | 'totem'
  | 'impair';

export interface Rule {
  id: string;
  name: string;
  description: string;
  shortDescription: string;
  tags: RuleTag[];
  uiType: RuleUIType;
  skipNormalScore?: boolean;
  maxBonusPerTeam?: number;
  maxMalusPerTeam?: number;
  conditionId?: string;
  isAvailable?: (scores: Record<Team, number>) => boolean;
}

export interface BonusMalus {
  team: Team;
  value: number;
  rule: string;
  reason: string;
}

export interface SpecialEffect {
  type: string;
  team?: Team;
  value?: number;
  description: string;
}

export interface RoundState {
  number: number;
  rule: Rule | null;
  normalPoints: Record<Team, number>;
  bonuses: BonusMalus[];
  scoreAfter: Record<Team, number>;
  vetoUsed: Team | null;
  // Rule-specific state
  sortieDePorc: Team | null;         // Sortie de porc: team that exited cochonnet
  assurance: Record<Team, boolean>;  // Assurance vie: which teams have insurance
  frontiereChoice: Record<Team, 'left' | 'right' | null>; // Frontière choices
  contratMission: Record<Team, number | null>; // Contrat: mission index (0-4)
  contratSuccess: Record<Team, boolean>;        // Contrat: mission succeeded
  boucleMauditeHit: Record<Team, boolean>;      // Boule maudite
  kingBonus: Record<Team, number>;              // King of the Hill
  gaucheBonus: Record<Team, boolean>;           // Gauche caviar
  extremesBonus: Record<Team, boolean>;         // Les extrêmes
  censureMalus: Record<Team, number>;           // Censure count
  casinoBets: Record<Team, number>;             // Casino bets
  casinoWinner: Team | null;                    // Casino winner
  predictionValues: Record<Team, number | null>; // Prédiction
  totemNextRule: Rule | null;                   // Totem next rule revealed
  totemImmuneTeam: Team | null;                 // Totem immune team for next round
  impairResult: { winner: Team; points: number; isOdd: boolean } | null;
}

export interface GameState {
  mode: GameMode;
  rounds: RoundState[];
  currentRound: RoundState | null;
  scores: Record<Team, number>;
  vetos: Record<Team, boolean>; // true = veto still available
  playedRuleIds: string[];       // ids played in current cycle
  pendingNextRule: Rule | null;  // pre-drawn by Totem
  immuneTeam: Team | null;       // immune next round (from Totem)
  isGameOver: boolean;
  winningScore: number;
  maxRounds: number | null;      // null = score-based win condition
  vetosEnabled: boolean;
  phase: GamePhase;
}

export type GamePhase =
  | 'setup'         // before game starts
  | 'rule-display'  // showing current rule
  | 'pre-mene'      // pre-mene setup (assurance, frontière, casino, prédiction)
  | 'rule-setup'    // pre-round rule choices before the first boule
  | 'playing'       // during the round
  | 'scoring'       // normal scoring phase
  | 'round-summary' // after round, showing delta
  | 'game-over';    // game ended
