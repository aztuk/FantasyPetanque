import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
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

  it('shows confirmation alert when cancel is pressed', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    useGameStore.getState().startGame({ mode: 'simple' });
    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('cancel-game-button'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Annuler la partie ?',
      'La partie en cours sera perdue si tu confirmes.',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Continuer' }),
        expect.objectContaining({ text: 'Annuler la partie', style: 'destructive' }),
      ]),
    );
  });

  it('resets game and navigates home on confirm', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    useGameStore.getState().startGame({ mode: 'simple' });
    useGameStore.getState().addNormalPoint('blue');
    render(<GameScreen />);

    fireEvent.press(screen.getByTestId('cancel-game-button'));

    const confirmBtn = (alertSpy.mock.calls[0][2] as { text: string; onPress?: () => void }[])
      .find((b) => b.text === 'Annuler la partie');
    act(() => {
      confirmBtn?.onPress?.();
    });

    expect(useGameStore.getState().phase).toBe('setup');
    expect(mockReplace).toHaveBeenCalledWith('Home');
    expect(mockNavigate).not.toHaveBeenCalledWith('Home');
  });

  it('keeps veto actions in the safe top bar for fantasy games', () => {
    useGameStore.getState().startGame({ mode: 'fantasy', vetosEnabled: true });
    render(<GameScreen />);

    expect(screen.getByTestId('cancel-game-button')).toBeTruthy();
    expect(screen.getAllByText(/Véto/)).toHaveLength(2);
  });
});

describe('GameScreen normal scoring interaction', () => {
  it('adds normal points from score blocks before enabling round completion', () => {
    useGameStore.getState().startGame({ mode: 'simple' });

    render(<GameScreen />);

    expect(screen.getByText('Tapez le nombre de points marqués')).toBeTruthy();
    expect(screen.queryByText(/Bleu marque/)).toBeNull();
    expect(screen.queryByText(/Rouge marque/)).toBeNull();
    expect(screen.queryByText('Bleu')).toBeNull();
    expect(screen.queryByText('Rouge')).toBeNull();
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);

    fireEvent.press(screen.getByTestId('score-block-blue'));

    expect(screen.getByText('+1')).toBeTruthy();
    expect(screen.getByText('Tapez pour annuler')).toBeTruthy();
    expect(screen.queryByText(/Annuler dernier point/)).toBeNull();
    expect(useGameStore.getState().currentRound?.normalPoints.blue).toBe(1);
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(false);

    fireEvent.press(screen.getByTestId('score-block-red'));

    expect(useGameStore.getState().currentRound?.normalPoints.blue).toBe(0);
    expect(useGameStore.getState().currentRound?.normalPoints.red).toBe(0);
    expect(screen.queryByText('+1')).toBeNull();
    expect(screen.queryByText('Tapez pour annuler')).toBeNull();
    expect(screen.getByTestId('end-round-button').props.accessibilityState.disabled).toBe(true);
  });
});
