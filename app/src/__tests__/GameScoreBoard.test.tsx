import React from 'react';
import { StyleSheet } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { GameScoreBoard } from '../features/game/components/GameScoreBoard';
import { componentSizes } from '../shared/constants';

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
    fireEvent(screen.getByTestId('score-block-blue'), 'pressIn');
    expect(onPress).toHaveBeenCalledWith('blue');
    fireEvent(screen.getByTestId('score-block-red'), 'pressIn');
    expect(onPress).toHaveBeenCalledWith('red');
  });

  it('renders bonus and malus modifiers inside round score blocks', () => {
    render(
      <GameScoreBoard
        scores={{ blue: 5, red: 3 }}
        roundPoints={{ blue: 2, red: 0 }}
        modifierPoints={{ blue: 1, red: -2 }}
      />,
    );

    expect(screen.getByTestId('score-modifier-blue').props.children).toBe('+1');
    expect(screen.getByTestId('score-modifier-red').props.children).toBe('-2');
  });

  it('uses the compact drawer score height for the drawer variant', () => {
    render(
      <GameScoreBoard
        scores={{ blue: 5, red: 3 }}
        roundPoints={{ blue: 2, red: 0 }}
        roundNumber={3}
        variant="drawer"
      />,
    );

    const style = StyleSheet.flatten(screen.getByTestId('game-score-board').props.style);
    expect(style.height).toBe(componentSizes.drawerScoreBoardHeight);
  });

  it('uses the Figma total summary height for summary screens', () => {
    render(
      <GameScoreBoard
        scores={{ blue: 13, red: 8 }}
        badgeLabel="Score total"
        variant="totalSummary"
      />,
    );

    const style = StyleSheet.flatten(screen.getByTestId('game-score-board').props.style);
    expect(style.height).toBe(componentSizes.totalSummaryScoreBoardHeight);
    expect(screen.getByText('SCORE TOTAL')).toBeTruthy();
  });

  it('re-renders without crashing when score changes', () => {
    const { rerender } = render(<GameScoreBoard scores={{ blue: 5, red: 3 }} />);
    act(() => { rerender(<GameScoreBoard scores={{ blue: 8, red: 3 }} />); });
    act(() => { rerender(<GameScoreBoard scores={{ blue: 8, red: 6 }} />); });
  });
});
