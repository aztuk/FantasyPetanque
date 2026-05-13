import React from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { GameActionButton } from '../../components/GameActionButton';
import { GameHistoryList } from '../../components/GameHistoryList';
import { GameScoreBoard } from '../../components/GameScoreBoard';
import { GameTopBar } from '../../components/GameTopBar';
import { useGameStore } from '../../state/gameStore';
import { Team } from '../../../../domain/game/models';
import { gameScreenStyles } from './gameScreenStyles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

function getWinningTeam(scores: Record<Team, number>): Team | null {
  if (scores.blue > scores.red) return 'blue';
  if (scores.red > scores.blue) return 'red';
  return null;
}

export function GameOverView() {
  const navigation = useNavigation<Nav>();
  const { scores, rounds, resetGame } = useGameStore();
  const winner = getWinningTeam(scores);

  const handleCancelGame = () => {
    resetGame();
    navigation.replace('Home');
  };

  const handleStartNewGame = () => {
    resetGame();
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView style={gameScreenStyles.safe} edges={['top', 'bottom']}>
      <GameTopBar onCancel={handleCancelGame} title="Partie terminée" />
      <View style={gameScreenStyles.endContent}>
        <GameScoreBoard
          scores={scores}
          compact
          showTotals={false}
          badgeLabel={winner ? `${winner === 'blue' ? 'Bleu' : 'Rouge'} gagne` : 'Match nul'}
          badgeTeam={winner}
        />
        <GameHistoryList rounds={rounds} style={gameScreenStyles.endHistory} />
      </View>
      <GameActionButton label="Nouvelle partie" onPress={handleStartNewGame} testID="new-game-button" />
    </SafeAreaView>
  );
}
