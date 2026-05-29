import React from 'react';
import { shouldSkipNormalScore } from '../../../../domain/game/engine';
import { Team } from '../../../../domain/game/models';
import { GameActionButton } from '../../components/GameActionButton';
import { GameDrawer } from '../../components/GameDrawer';
import { GameHistoryList } from '../../components/GameHistoryList';
import { GameScoreBoard } from '../../components/GameScoreBoard';
import { useGameStore } from '../../state/gameStore';
import { GameScreenLayout } from '../GameScreenLayout';
import { gameScreenStyles } from './gameScreenStyles';

export function SimpleModeView() {
  const {
    scores,
    currentRound,
    rounds,
    addNormalPoint,
    undoNormalPoint,
    finishRound,
    startNewRound,
  } = useGameStore();

  const round = currentRound!;
  const bluePoints = round.normalPoints.blue;
  const redPoints = round.normalPoints.red;
  const scoringTeam: Team | null = bluePoints > 0 ? 'blue' : redPoints > 0 ? 'red' : null;
  const skipNormal = shouldSkipNormalScore(round);
  const canFinishRound = skipNormal || scoringTeam !== null;

  const handleTeamPress = (team: Team) => {
    const otherTeam = team === 'blue' ? 'red' : 'blue';
    if (scoringTeam === otherTeam) {
      undoNormalPoint();
      return;
    }
    addNormalPoint(team);
  };

  const handleFinishRound = () => {
    finishRound();
    const nextState = useGameStore.getState();
    if (!nextState.isGameOver) startNewRound();
  };

  return (
    <GameScreenLayout
      drawer={
        <GameDrawer
          testID="game-drawer"
          scoreBoard={
            <GameScoreBoard
              scores={scores}
              roundPoints={{ blue: bluePoints, red: redPoints }}
              roundNumber={round.number}
              variant="drawer"
              onTeamPress={handleTeamPress}
            />
          }
          confirmButton={
            <GameActionButton
              label={canFinishRound ? 'Mène terminée' : 'Points manquants'}
              onPress={handleFinishRound}
              disabled={!canFinishRound}
              testID="end-round-button"
            />
          }
        />
      }
    >
      <GameHistoryList rounds={rounds} orientation="bottom" style={gameScreenStyles.simpleHistory} />
    </GameScreenLayout>
  );
}
