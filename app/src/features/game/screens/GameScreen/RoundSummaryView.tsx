import React from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { GameActionButton } from '../../components/GameActionButton';
import { GameTopBar } from '../../components/GameTopBar';
import { useGameStore } from '../../state/gameStore';
import { gameScreenStyles } from './gameScreenStyles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export function RoundSummaryView() {
  const navigation = useNavigation<Nav>();
  const { debugMode, startNewRound, resetGame } = useGameStore();

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

  return (
    <SafeAreaView style={gameScreenStyles.safe} edges={['top', 'bottom']}>
      <GameTopBar onCancel={handleCancelGame} />
      <View style={gameScreenStyles.centerContent} />
      <GameActionButton
        label="Commencer"
        onPress={() => {
          startNewRound();
          if (debugMode) navigation.replace('DebugRuleSelect');
        }}
      />
    </SafeAreaView>
  );
}
