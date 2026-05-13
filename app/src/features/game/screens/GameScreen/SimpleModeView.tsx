import React from 'react';
import { Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { shouldSkipNormalScore } from '../../../../domain/game/engine';
import { Team } from '../../../../domain/game/models';
import { GameActionButton } from '../../components/GameActionButton';
import { GameHistoryList } from '../../components/GameHistoryList';
import { GameScoreBoard } from '../../components/GameScoreBoard';
import { GameTopBar } from '../../components/GameTopBar';
import { useGameStore } from '../../state/gameStore';
import { gameScreenStyles } from './gameScreenStyles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export function SimpleModeView() {
  const navigation = useNavigation<Nav>();
  const {
    scores,
    currentRound,
    rounds,
    addNormalPoint,
    undoNormalPoint,
    finishRound,
    startNewRound,
    resetGame,
  } = useGameStore();

  const round = currentRound!;
  const bluePoints = round.normalPoints.blue;
  const redPoints = round.normalPoints.red;
  const scoringTeam: Team | null = bluePoints > 0 ? 'blue' : redPoints > 0 ? 'red' : null;
  const skipNormal = shouldSkipNormalScore(round);
  const canFinishRound = skipNormal || scoringTeam !== null;

  const handleCancelGame = () => {
    Alert.alert(
      'Annuler la partie ?',
      'La partie en cours sera perdue si tu confirmes.',
      [
        { text: 'Continuer', style: 'cancel' },
        {
          text: 'Annuler la partie',
          style: 'destructive',
          onPress: () => {
            resetGame();
            navigation.replace('Home');
          },
        },
      ],
    );
  };

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
    <SafeAreaView style={gameScreenStyles.safe} edges={['top', 'bottom']}>
      <GameTopBar onCancel={handleCancelGame} />
      <GameHistoryList rounds={rounds} orientation="bottom" style={gameScreenStyles.simpleHistory} />
      <GameScoreBoard
        scores={scores}
        roundPoints={{ blue: bluePoints, red: redPoints }}
        roundNumber={round.number}
        onTeamPress={handleTeamPress}
      />
      <GameActionButton
        label={canFinishRound ? 'Mène terminée' : 'Points manquants'}
        onPress={handleFinishRound}
        disabled={!canFinishRound}
        testID="end-round-button"
      />
    </SafeAreaView>
  );
}
