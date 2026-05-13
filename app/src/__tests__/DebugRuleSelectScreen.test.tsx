import React from 'react';
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
    useGameStore.getState().startGame({ mode: 'fantasy' });

    render(<DebugRuleSelectScreen />);

    fireEvent.press(screen.getByTestId('cancel-game-button'));

    expect(screen.getByText(/Etes-vous/)).toBeTruthy();

    act(() => {
      fireEvent.press(screen.getByTestId('alert-sheet-confirm'));
    });

    expect(useGameStore.getState().phase).toBe('setup');
    expect(mockReplace).toHaveBeenCalledWith('Home');
  });
});
