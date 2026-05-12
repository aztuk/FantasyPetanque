import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { DebugRuleSelectScreen } from '../features/game/screens/DebugRuleSelectScreen';
import { useGameStore } from '../features/game/state/gameStore';

const mockReplace = jest.fn();

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
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

describe('DebugRuleSelectScreen cancel top bar', () => {
  it('confirms before canceling the current game', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    useGameStore.getState().startGame({ mode: 'fantasy' });

    render(<DebugRuleSelectScreen />);

    fireEvent.press(screen.getByTestId('cancel-game-button'));

    expect(alertSpy).toHaveBeenCalledWith(
      'Annuler la partie ?',
      'La partie en cours sera perdue si tu confirmes.',
      expect.arrayContaining([
        expect.objectContaining({ text: 'Continuer' }),
        expect.objectContaining({ text: 'Annuler la partie', style: 'destructive' }),
      ]),
    );

    const confirmBtn = (alertSpy.mock.calls[0][2] as { text: string; onPress?: () => void }[])
      .find((b) => b.text === 'Annuler la partie');
    act(() => {
      confirmBtn?.onPress?.();
    });

    expect(useGameStore.getState().phase).toBe('setup');
    expect(mockReplace).toHaveBeenCalledWith('Home');
  });
});
