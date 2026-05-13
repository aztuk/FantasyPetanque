import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { CancelGameSheet } from '../../../../shared/components/CancelGameSheet';
import { GameActionButton } from '../../components/GameActionButton';
import { GameTopBar } from '../../components/GameTopBar';
import { useGameStore } from '../../state/gameStore';
import { gameScreenStyles } from './gameScreenStyles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export function RoundSummaryView() {
  const navigation = useNavigation<Nav>();
  const { debugMode, startNewRound, resetGame } = useGameStore();
  const [showCancelSheet, setShowCancelSheet] = useState(false);

  return (
    <SafeAreaView style={gameScreenStyles.safe} edges={['top', 'bottom']}>
      <CancelGameSheet
        visible={showCancelSheet}
        onConfirm={() => { resetGame(); navigation.replace('Home'); }}
        onCancel={() => setShowCancelSheet(false)}
      />
      <GameTopBar onCancel={() => setShowCancelSheet(true)} />
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
