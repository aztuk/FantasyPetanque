import React, { useState } from 'react';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { isPreMeneSetupComplete } from '../../../../domain/game/engine';
import { CancelGameSheet } from '../../../../shared/components/CancelGameSheet';
import { GameActionButton } from '../../components/GameActionButton';
import { GameTopBar } from '../../components/GameTopBar';
import { RuleDisplay } from '../../components/RuleDisplay';
import { RuleSetupUI } from '../../components/RuleUI';
import { useGameStore } from '../../state/gameStore';
import { gameScreenStyles } from './gameScreenStyles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export function RuleSetupView() {
  const navigation = useNavigation<Nav>();
  const { currentRound, beginRound, resetGame } = useGameStore();

  const [showCancelSheet, setShowCancelSheet] = useState(false);

  const round = currentRound!;
  const setupComplete = isPreMeneSetupComplete(round);

  return (
    <SafeAreaView style={gameScreenStyles.safe} edges={['top', 'bottom']}>
      <CancelGameSheet
        visible={showCancelSheet}
        onConfirm={() => { resetGame(); navigation.replace('Home'); }}
        onCancel={() => setShowCancelSheet(false)}
      />
      <GameTopBar onCancel={() => setShowCancelSheet(true)} />
      <ScrollView
        style={gameScreenStyles.ruleSetupContent}
        contentContainerStyle={gameScreenStyles.ruleSetupScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {round.rule && (
          <RuleDisplay
            rule={round.rule}
            immuneTeam={round.totemImmuneTeam}
            style={gameScreenStyles.preMeneRule}
          />
        )}
        <RuleSetupUI round={round} />
      </ScrollView>
      <GameActionButton
        label={setupComplete ? 'Commencer' : 'Choix manquants'}
        onPress={beginRound}
        disabled={!setupComplete}
        testID="confirm-rule-setup-button"
      />
    </SafeAreaView>
  );
}
