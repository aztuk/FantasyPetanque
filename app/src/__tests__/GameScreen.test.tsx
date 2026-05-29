import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ALL_RULES } from '../data/rules/rules';
import { gameUiColors } from '../features/game/components/gameUiTheme';
import { GameScreen } from '../features/game/screens/GameScreen';
import { useGameStore } from '../features/game/state/gameStore';

const mockNavigate = jest.fn();
const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
    replace: mockReplace,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
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
    rankingMatchSaved: false,
    phase: 'setup',
    debugMode: false,
  });
});
describe('GameScreen cancel top bar', () => {
  it('shows cancel button during active game', () => {
    useGameStore.getState().startGame({ mode: 'simple' });
    render(<GameScreen />);
    expect(screen.getByTestId('cancel-game-button')).toBeTruthy();
  });

  it('shows confirmation sheet when cancel is pressed', () => {
    useGameStore.getState().startGame({ mode: 'simple' });
    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('cancel-game-button'));

    expect(screen.getByText('Etes-vous sûr ?')).toBeTruthy();
  });

  it('resets game and navigates home on sheet confirm', () => {
    useGameStore.getState().startGame({ mode: 'simple' });
    useGameStore.getState().addNormalPoint('blue');
    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('cancel-game-button'));
    fireEvent.press(screen.getByTestId('alert-sheet-confirm'));

    expect(useGameStore.getState().phase).toBe('setup');
    expect(mockReplace).toHaveBeenCalledWith('Home');
    expect(mockNavigate).not.toHaveBeenCalledWith('Home');
  });
});

describe('GameScreen fantasy inter-mene', () => {
  it('shows veto actions and starts the playable round', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    const rule = ALL_RULES.find((item) => item.id === 'gauche-caviar')!;
    useGameStore.getState().forceRule(rule);
    render(<GameScreen />);

    expect(useGameStore.getState().phase).toBe('pre-mene');
    expect(screen.getByTestId('cancel-game-button')).toBeTruthy();
    expect(screen.getByTestId('game-drawer')).toBeTruthy();
    expect(screen.getByTestId('veto-blue-button')).toBeTruthy();
    expect(screen.getByTestId('veto-red-button')).toBeTruthy();
    expect(screen.getByText(/mauvaise main/)).toBeTruthy();
    expect(screen.getByText(/Maximum 1 bonus/)).toBeTruthy();
    expect(screen.getByText('COMMENCER')).toBeTruthy();

    fireEvent.press(screen.getByTestId('begin-round-button'));

    expect(useGameStore.getState().phase).toBe('playing');
    expect(screen.getByTestId('game-drawer')).toBeTruthy();
    expect(screen.getByText(rule.name)).toBeTruthy();
    expect(screen.getByText(/mauvaise main/)).toBeTruthy();
    expect(screen.getByText(/Maximum 1 bonus/)).toBeTruthy();
    expect(screen.queryByText(rule.shortDescription)).toBeNull();
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);
  });

  it('shows VetoSheet when a veto button is pressed', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.getState().forceRule(ALL_RULES.find((r) => r.id === 'gauche-caviar')!);
    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('veto-blue-button'));

    expect(screen.getByText('Utiliser votre véto ?')).toBeTruthy();
    expect(screen.getByTestId('alert-sheet-confirm')).toBeTruthy();
    expect(screen.getByTestId('alert-sheet-cancel')).toBeTruthy();
  });

  it('does not consume the veto when cancelling the VetoSheet', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    const firstRule = useGameStore.getState().currentRound?.rule;
    useGameStore.getState().forceRule(ALL_RULES.find((r) => r.id === 'gauche-caviar')!);
    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('veto-blue-button'));
    fireEvent.press(screen.getByTestId('alert-sheet-cancel'));

    expect(useGameStore.getState().vetos.blue).toBe(true);
    expect(useGameStore.getState().phase).toBe('pre-mene');
    // rule unchanged
    expect(useGameStore.getState().currentRound?.rule?.id).toBe('gauche-caviar');
    void firstRule; // unused but kept for clarity
  });

  it('consumes the veto and draws a new rule when confirming the VetoSheet', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.getState().forceRule(ALL_RULES.find((r) => r.id === 'gauche-caviar')!);
    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('veto-red-button'));
    fireEvent.press(screen.getByTestId('alert-sheet-confirm'));

    expect(useGameStore.getState().vetos.red).toBe(false);
    expect(useGameStore.getState().phase).toBe('pre-mene');
  });

  it('shows a dedicated setup screen before playing a setup rule', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === 'frontiere')!);
    render(<GameScreen />);

    expect(screen.getByText('CONFIGURER')).toBeTruthy();

    fireEvent.press(screen.getByTestId('begin-round-button'));

    expect(useGameStore.getState().phase).toBe('rule-setup');
    expect(screen.getByText('Frontières')).toBeTruthy();
    expect(screen.getByText('Auto-arbitrage')).toBeTruthy();
    expect(screen.getByText('CONFIRMER')).toBeTruthy();
    expect(screen.getByTestId('frontiere-setup-footer')).toBeTruthy();
    expect(screen.getByTestId('frontiere-choice-grid')).toBeTruthy();
    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByTestId('frontiere-blue-left-button'));
    fireEvent.press(screen.getByTestId('frontiere-red-right-button'));

    expect(useGameStore.getState().currentRound?.frontiereChoice).toEqual({ blue: 'left', red: 'right' });
    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('confirm-rule-setup-button'));

    expect(useGameStore.getState().phase).toBe('playing');
    expect(screen.getByTestId('end-round-button')).toBeTruthy();
    expect(screen.getByTestId('frontiere-reminder')).toBeTruthy();
    expect(screen.getByText('Gauche')).toBeTruthy();
    expect(screen.getAllByText('Droite').length).toBeGreaterThan(0);
  });

  it('runs Contrat through mission setup and toggles mission success in game', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === 'contrat')!);
    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('begin-round-button'));

    expect(useGameStore.getState().phase).toBe('rule-setup');
    const setupStyle = StyleSheet.flatten(screen.getByTestId('rule-setup-scroll').props.contentContainerStyle);
    expect(setupStyle.paddingTop).toBe(80);
    expect(setupStyle.paddingHorizontal).toBe(0);
    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(true);
    expect(screen.getByText('Toucher et déplacer le cochonnet')).toBeTruthy();
    const firstBlueMissionButtonStyle = StyleSheet.flatten(screen.getByTestId('contrat-mission-0-blue').props.style);
    expect(firstBlueMissionButtonStyle.width).toBe(80);
    expect(firstBlueMissionButtonStyle.height).toBe(80);

    fireEvent.press(screen.getByTestId('contrat-mission-0-blue'));
    expect(useGameStore.getState().currentRound?.contratMission).toEqual({ blue: 0, red: null });
    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByTestId('contrat-mission-4-red'));
    expect(useGameStore.getState().currentRound?.contratMission).toEqual({ blue: 0, red: 4 });
    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('confirm-rule-setup-button'));

    expect(useGameStore.getState().phase).toBe('playing');
    expect(screen.getByTestId('contrat-short-label-blue').props.children).toBe('Cochonnet déplacé');
    expect(screen.getByTestId('contrat-short-label-red').props.children).toBe('Boule éloignée');
    expect(screen.getAllByText('Mission réussie')).toHaveLength(2);
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByTestId('contrat-success-blue-button'));
    fireEvent.press(screen.getByTestId('contrat-success-red-button'));

    expect(useGameStore.getState().currentRound?.contratSuccess).toEqual({ blue: true, red: true });
    expect(screen.getByTestId('score-modifier-blue').props.children).toBe('+2');
    expect(screen.getByTestId('score-modifier-red').props.children).toBe('+2');

    fireEvent(screen.getByTestId('score-block-blue'), 'pressIn');
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('end-round-button'));

    expect(useGameStore.getState().scores).toEqual({ blue: 3, red: 2 });
  });

  it('runs Assurance vie through the dedicated setup toggles', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === 'assurance-vie')!);
    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('begin-round-button'));

    expect(useGameStore.getState().phase).toBe('rule-setup');
    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(false);
    expect(screen.getByText('CONFIRMER')).toBeTruthy();
    expect(StyleSheet.flatten(screen.getByTestId('assurance-setup-row').props.style).marginBottom).toBe(4);
    expect(screen.getAllByText('Assurance')).toHaveLength(2);
    expect(
      StyleSheet.flatten(screen.getByTestId('assurance-blue-button').props.style).backgroundColor,
    ).toBe(gameUiColors.divider);

    fireEvent.press(screen.getByTestId('assurance-blue-button'));
    fireEvent.press(screen.getByTestId('assurance-red-button'));

    expect(useGameStore.getState().currentRound?.assurance).toEqual({ blue: true, red: true });
    expect(screen.getByText('Bleu assuré')).toBeTruthy();
    expect(screen.getByText('Rouge assuré')).toBeTruthy();
    expect(
      StyleSheet.flatten(screen.getByTestId('assurance-blue-button').props.style).backgroundColor,
    ).toBe(gameUiColors.blueSurface);
    expect(
      StyleSheet.flatten(screen.getByTestId('assurance-red-button').props.style).backgroundColor,
    ).toBe(gameUiColors.redSurface);

    fireEvent.press(screen.getByTestId('confirm-rule-setup-button'));

    expect(useGameStore.getState().phase).toBe('playing');
    expect(StyleSheet.flatten(screen.getByTestId('assurance-status-row').props.style).marginTop).toBeUndefined();
    expect(screen.getByTestId('assurance-blue-status')).toBeTruthy();
    expect(screen.getByTestId('assurance-red-status')).toBeTruthy();
  });

  it('runs Casino through bet setup before choosing the winner in game', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.setState({ scores: { blue: 4, red: 2 } });
    useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === 'casino')!);
    render(<GameScreen />);

    expect(screen.getByText('CONFIGURER')).toBeTruthy();

    fireEvent.press(screen.getByTestId('begin-round-button'));

    expect(useGameStore.getState().phase).toBe('rule-setup');
    expect(screen.getByTestId('rule-setup-scroll')).toBeTruthy();
    expect(screen.getByTestId('casino-bet-blue-value')).toBeTruthy();
    expect(screen.getByTestId('casino-bet-red-value')).toBeTruthy();

    fireEvent.press(screen.getByTestId('casino-bet-blue-increment'));
    fireEvent.press(screen.getByTestId('casino-bet-blue-increment'));
    fireEvent.press(screen.getByTestId('confirm-rule-setup-button'));

    expect(useGameStore.getState().phase).toBe('playing');
    expect(screen.getByText('Mise bleue')).toBeTruthy();
    expect(screen.getByText('Mise rouge')).toBeTruthy();
    expect(screen.getByTestId('casino-bet-blue-readonly')).toBeTruthy();
    expect(screen.getByTestId('casino-bet-red-readonly')).toBeTruthy();
    expect(useGameStore.getState().currentRound?.casinoBets).toEqual({ blue: 2, red: 1 });
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);
    expect(
      StyleSheet.flatten(screen.getByTestId('casino-winner-blue-button').props.style).backgroundColor,
    ).toBe(gameUiColors.divider);
    expect(
      StyleSheet.flatten(screen.getByTestId('casino-winner-red-button').props.style).backgroundColor,
    ).toBe(gameUiColors.divider);

    fireEvent.press(screen.getByTestId('casino-winner-blue-button'));

    expect(screen.getByText('Perdant')).toBeTruthy();
    expect(screen.getAllByText('Gagnant')).toHaveLength(1);
    expect(
      StyleSheet.flatten(screen.getByTestId('casino-winner-blue-button').props.style).backgroundColor,
    ).toBe(gameUiColors.blueSurface);
    expect(
      StyleSheet.flatten(screen.getByTestId('casino-winner-red-button').props.style).backgroundColor,
    ).toBe(gameUiColors.divider);
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('end-round-button'));

    const state = useGameStore.getState();
    expect(state.scores).toEqual({ blue: 6, red: 1 });
  });

  it('keeps Casino rule content anchored to the top across inter-mene, setup and in-game', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.setState({ scores: { blue: 4, red: 2 } });
    useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === 'casino')!);
    render(<GameScreen />);

    const preMeneStyle = StyleSheet.flatten(screen.getByTestId('pre-mene-rule-area').props.style);
    expect(preMeneStyle.justifyContent).toBe('center');
    expect(preMeneStyle.paddingTop).toBeUndefined();

    fireEvent.press(screen.getByTestId('begin-round-button'));

    const setupStyle = StyleSheet.flatten(screen.getByTestId('rule-setup-scroll').props.contentContainerStyle);
    expect(setupStyle.justifyContent).toBe('flex-start');
    expect(setupStyle.paddingTop).toBe(20);

    fireEvent.press(screen.getByTestId('confirm-rule-setup-button'));

    const playingStyle = StyleSheet.flatten(screen.getByTestId('playing-rule-scroll').props.contentContainerStyle);
    expect(playingStyle.justifyContent).toBe('center');
    expect(playingStyle.paddingTop).toBe(80);
  });

  it('runs Prediction through setup before playing the round', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.setState({ scores: { blue: 5, red: 5 } });
    useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === 'prediction')!);
    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('begin-round-button'));

    expect(useGameStore.getState().phase).toBe('rule-setup');
    expect(screen.getByTestId('prediction-setup-blue-value')).toBeTruthy();
    expect(screen.getByTestId('prediction-setup-red-value')).toBeTruthy();
    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(true);

    // Set blue prediction to 2 (start 0, increment twice)
    fireEvent.press(screen.getByTestId('prediction-setup-blue-increment'));
    fireEvent.press(screen.getByTestId('prediction-setup-blue-increment'));
    // Still disabled — red not set
    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(true);

    // Set red prediction to 1
    fireEvent.press(screen.getByTestId('prediction-setup-red-increment'));
    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('confirm-rule-setup-button'));

    expect(useGameStore.getState().phase).toBe('playing');
    expect(useGameStore.getState().currentRound?.predictionValues).toEqual({ blue: 2, red: 1 });
    expect(screen.getByTestId('prediction-readonly-blue')).toBeTruthy();
    expect(screen.getByTestId('prediction-readonly-red')).toBeTruthy();

    // Blue scores 2 (matches prediction) → red loses 2 points
    act(() => { useGameStore.getState().addNormalPoint('blue'); });
    act(() => { useGameStore.getState().addNormalPoint('blue'); });
    fireEvent.press(screen.getByTestId('end-round-button'));

    const state = useGameStore.getState();
    expect(state.scores.blue).toBe(7); // 5 + 2
    expect(state.scores.red).toBe(3);  // 5 - 2
  });

  it('shows Totem next rule as a compact rule card during the round', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === 'totem-immunite')!);
    const nextRule = useGameStore.getState().currentRound?.totemNextRule;

    render(<GameScreen />);
    fireEvent.press(screen.getByTestId('begin-round-button'));

    expect(nextRule).toBeTruthy();
    expect(screen.getByTestId('totem-next-rule-card')).toBeTruthy();
    expect(screen.getByText(nextRule!.name)).toBeTruthy();
    expect(screen.getByText(nextRule!.shortDescription)).toBeTruthy();
    expect(screen.queryByText('Prochaine rÃ¨gle')).toBeNull();
    expect(screen.queryByText('ImmunitÃ©')).toBeNull();
  });
});

describe('GameScreen simple bonus and malus rule controls', () => {
  function startFantasyRule(ruleId: string) {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === ruleId)!);
    render(<GameScreen />);
    fireEvent.press(screen.getByTestId('begin-round-button'));
  }

  it('toggles a max-one bonus from the team action row and shows its score modifier', () => {
    startFantasyRule('gauche-caviar');

    fireEvent.press(screen.getByTestId('gauche-caviar-bonus-blue-button'));

    expect(useGameStore.getState().currentRound?.gaucheBonus.blue).toBe(true);
    expect(screen.getByText('Bravo!')).toBeTruthy();
    expect(screen.getByTestId('score-modifier-blue').props.children).toBe('+1');

    fireEvent.press(screen.getByTestId('gauche-caviar-bonus-blue-button'));

    expect(useGameStore.getState().currentRound?.gaucheBonus.blue).toBe(false);
    expect(screen.queryByTestId('score-modifier-blue')).toBeNull();
  });

  it('increments and long-press decrements censure malus while showing the live modifier', () => {
    startFantasyRule('censure');

    fireEvent.press(screen.getByTestId('censure-malus-red-button'));
    fireEvent.press(screen.getByTestId('censure-malus-red-button'));

    expect(useGameStore.getState().currentRound?.censureMalus.red).toBe(2);
    expect(screen.getByText('Mot prononcé: 2')).toBeTruthy();
    expect(screen.getByTestId('score-modifier-red').props.children).toBe('-2');

    fireEvent(screen.getByTestId('censure-malus-red-button'), 'longPress');

    expect(useGameStore.getState().currentRound?.censureMalus.red).toBe(1);
    expect(screen.getByText('Mot prononcé: 1')).toBeTruthy();
    expect(screen.getByTestId('score-modifier-red').props.children).toBe('-1');
  });

  it('toggles Boule maudite malus from the shared action row', () => {
    startFantasyRule('boule-maudite');

    fireEvent.press(screen.getByTestId('boule-maudite-malus-blue-button'));

    expect(useGameStore.getState().currentRound?.boucleMauditeHit.blue).toBe(true);
    expect(screen.getByText('Fallait mieux viser')).toBeTruthy();
    expect(screen.getByTestId('score-modifier-blue').props.children).toBe('-1');

    fireEvent.press(screen.getByTestId('boule-maudite-malus-blue-button'));

    expect(useGameStore.getState().currentRound?.boucleMauditeHit.blue).toBe(false);
    expect(screen.queryByTestId('score-modifier-blue')).toBeNull();
  });

  it('keeps King of the Hill on the same shared bonus pattern', () => {
    startFantasyRule('king-of-the-hill');

    fireEvent.press(screen.getByTestId('king-of-the-hill-bonus-red-button'));
    fireEvent.press(screen.getByTestId('king-of-the-hill-bonus-red-button'));

    expect(useGameStore.getState().currentRound?.kingBonus.red).toBe(2);
    expect(screen.getAllByText('Boule gagnante').length).toBeGreaterThan(0);
    expect(screen.getByTestId('score-modifier-red').props.children).toBe('+2');
  });
});

describe('GameScreen simple mode - skip inter-mene', () => {
  it('starts new round immediately after finishing a round without round-summary', () => {
    useGameStore.getState().startGame({ mode: 'simple' });

    render(<GameScreen />);

    fireEvent(screen.getByTestId('score-block-blue'), 'pressIn');
    fireEvent.press(screen.getByTestId('end-round-button'));

    const state = useGameStore.getState();
    expect(state.phase).toBe('rule-display');
    expect(state.rounds).toHaveLength(1);
    expect(state.currentRound?.number).toBe(2);
    expect(state.scores.blue).toBe(1);
  });

  it('shows history after first round', () => {
    useGameStore.getState().startGame({ mode: 'simple' });

    render(<GameScreen />);

    fireEvent(screen.getByTestId('score-block-red'), 'pressIn');
    fireEvent.press(screen.getByTestId('end-round-button'));

    expect(screen.getByText('Mène 01')).toBeTruthy();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('does not navigate to round-summary for simple mode', () => {
    useGameStore.getState().startGame({ mode: 'simple' });

    render(<GameScreen />);

    fireEvent(screen.getByTestId('score-block-blue'), 'pressIn');
    fireEvent.press(screen.getByTestId('end-round-button'));

    expect(screen.queryByText('NOUVELLE MÈNE')).toBeNull();
    expect(screen.queryByText('TERMINER LA PARTIE')).toBeNull();
  });

  it('shows game-over screen when winning score is reached', () => {
    useGameStore.getState().startGame({ mode: 'simple', winningScore: 1 });

    render(<GameScreen />);

    fireEvent(screen.getByTestId('score-block-blue'), 'pressIn');
    fireEvent.press(screen.getByTestId('end-round-button'));

    expect(useGameStore.getState().isGameOver).toBe(true);
    expect(screen.getByTestId('cancel-game-button')).toBeTruthy();
    expect(screen.getByText('BLEU GAGNE')).toBeTruthy();
    expect(screen.getByText('NOUVELLE PARTIE')).toBeTruthy();
  });

  it('opens the Petanque match recording flow from the game-over screen', () => {
    useGameStore.getState().startGame({ mode: 'simple', winningScore: 1 });

    render(<GameScreen />);

    fireEvent(screen.getByTestId('score-block-blue'), 'pressIn');
    fireEvent.press(screen.getByTestId('end-round-button'));
    fireEvent.press(screen.getByTestId('save-game-button'));

    expect(screen.getByText('PARTIE CLASSÉE ?')).toBeTruthy();
    expect(mockNavigate).toHaveBeenCalledWith('AddMatch', { sport: 'petanque', source: 'gameResult' });
  });

  it('shows the ranking shortcut after the game has been recorded', () => {
    useGameStore.getState().startGame({ mode: 'simple', winningScore: 1 });

    render(<GameScreen />);

    fireEvent(screen.getByTestId('score-block-blue'), 'pressIn');
    fireEvent.press(screen.getByTestId('end-round-button'));

    act(() => {
      useGameStore.getState().markRankingMatchSaved();
    });

    expect(screen.queryByTestId('save-game-button')).toBeNull();
    expect(screen.getByText('VOIR LE CLASSEMENT')).toBeTruthy();

    fireEvent.press(screen.getByTestId('view-ranking-button'));

    expect(mockNavigate).toHaveBeenCalledWith('Ranking', { sport: 'petanque' });
  });
});

describe('GameScreen normal scoring interaction', () => {
  it('adds normal points from score blocks before enabling round completion', () => {
    useGameStore.getState().startGame({ mode: 'simple' });

    render(<GameScreen />);

    expect(screen.queryByText('Tapez le nombre de points marqués')).toBeNull();
    expect(screen.queryByText(/Bleu marque/)).toBeNull();
    expect(screen.queryByText(/Rouge marque/)).toBeNull();
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);

    fireEvent(screen.getByTestId('score-block-blue'), 'pressIn');

    expect(useGameStore.getState().currentRound?.normalPoints.blue).toBe(1);
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(false);

    fireEvent(screen.getByTestId('score-block-red'), 'pressIn');

    expect(useGameStore.getState().currentRound?.normalPoints.blue).toBe(0);
    expect(useGameStore.getState().currentRound?.normalPoints.red).toBe(0);
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);
  });
});
