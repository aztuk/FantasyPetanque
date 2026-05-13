import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { GameScoreBoard } from '../features/game/components/GameScoreBoard';

describe('GameScoreBoard', () => {
  it('renders without crashing', () => {
    render(<GameScoreBoard scores={{ blue: 5, red: 3 }} />);
  });

  it('renders round badge when roundNumber is provided', () => {
    render(
      <GameScoreBoard
        scores={{ blue: 5, red: 3 }}
        roundPoints={{ blue: 2, red: 0 }}
        roundNumber={3}
      />,
    );
    expect(screen.getByText('MÈNE 03')).toBeTruthy();
  });

  it('renders both team blocks', () => {
    render(<GameScoreBoard scores={{ blue: 5, red: 3 }} />);
    expect(screen.getByTestId('score-block-blue')).toBeTruthy();
    expect(screen.getByTestId('score-block-red')).toBeTruthy();
  });

  it('calls onTeamPress with correct team when pressed', () => {
    const onPress = jest.fn();
    render(<GameScoreBoard scores={{ blue: 5, red: 3 }} onTeamPress={onPress} />);
    fireEvent.press(screen.getByTestId('score-block-blue'));
    expect(onPress).toHaveBeenCalledWith('blue');
    fireEvent.press(screen.getByTestId('score-block-red'));
    expect(onPress).toHaveBeenCalledWith('red');
  });

  it('re-renders without crashing when score changes', () => {
    const { rerender } = render(<GameScoreBoard scores={{ blue: 5, red: 3 }} />);
    act(() => { rerender(<GameScoreBoard scores={{ blue: 8, red: 3 }} />); });
    act(() => { rerender(<GameScoreBoard scores={{ blue: 8, red: 6 }} />); });
  });
});
