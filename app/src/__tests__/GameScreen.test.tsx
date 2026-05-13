import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { ALL_RULES } from '../data/rules/rules';
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
    useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === 'dome-de-fer')!);
    render(<GameScreen />);

    expect(useGameStore.getState().phase).toBe('pre-mene');
    expect(screen.getByTestId('cancel-game-button')).toBeTruthy();
    expect(screen.getByTestId('veto-blue-button')).toBeTruthy();
    expect(screen.getByTestId('veto-red-button')).toBeTruthy();
    expect(screen.getByText('COMMENCER')).toBeTruthy();

    fireEvent.press(screen.getByTestId('begin-round-button'));

    expect(useGameStore.getState().phase).toBe('playing');
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);
  });

  it('shows a dedicated setup screen before playing a setup rule', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    useGameStore.getState().forceRule(ALL_RULES.find((rule) => rule.id === 'frontiere')!);
    render(<GameScreen />);

    expect(screen.getByText('CONFIGURER')).toBeTruthy();

    fireEvent.press(screen.getByTestId('begin-round-button'));

    expect(useGameStore.getState().phase).toBe('rule-setup');
    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(true);

    act(() => {
      useGameStore.getState().setFrontiereChoice('blue', 'left');
      useGameStore.getState().setFrontiereChoice('red', 'right');
    });

    expect(screen.getByTestId('confirm-rule-setup-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('confirm-rule-setup-button'));

    expect(useGameStore.getState().phase).toBe('playing');
    expect(screen.getByTestId('end-round-button')).toBeTruthy();
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

    fireEvent.press(screen.getByTestId('casino-winner-blue-button'));

    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('end-round-button'));

    const state = useGameStore.getState();
    expect(state.scores).toEqual({ blue: 6, red: 1 });
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
});

describe('GameScreen simple mode - skip inter-mene', () => {
  it('starts new round immediately after finishing a round without round-summary', () => {
    useGameStore.getState().startGame({ mode: 'simple' });

    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('score-block-blue'));
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

    fireEvent.press(screen.getByTestId('score-block-red'));
    fireEvent.press(screen.getByTestId('end-round-button'));

    expect(screen.getByText('Mène 01')).toBeTruthy();
    expect(screen.getAllByText('0').length).toBeGreaterThan(0);
    expect(screen.getAllByText('1').length).toBeGreaterThan(0);
  });

  it('does not navigate to round-summary for simple mode', () => {
    useGameStore.getState().startGame({ mode: 'simple' });

    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('score-block-blue'));
    fireEvent.press(screen.getByTestId('end-round-button'));

    expect(screen.queryByText('NOUVELLE MÈNE')).toBeNull();
    expect(screen.queryByText('TERMINER LA PARTIE')).toBeNull();
  });

  it('shows game-over screen when winning score is reached', () => {
    useGameStore.getState().startGame({ mode: 'simple', winningScore: 1 });

    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('score-block-blue'));
    fireEvent.press(screen.getByTestId('end-round-button'));

    expect(useGameStore.getState().isGameOver).toBe(true);
    expect(screen.getByText('Partie terminée')).toBeTruthy();
    expect(screen.getByText('BLEU GAGNE')).toBeTruthy();
    expect(screen.getByText('NOUVELLE PARTIE')).toBeTruthy();
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

    fireEvent.press(screen.getByTestId('score-block-blue'));

    expect(useGameStore.getState().currentRound?.normalPoints.blue).toBe(1);
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('score-block-red'));

    expect(useGameStore.getState().currentRound?.normalPoints.blue).toBe(0);
    expect(useGameStore.getState().currentRound?.normalPoints.red).toBe(0);
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);
  });
});
