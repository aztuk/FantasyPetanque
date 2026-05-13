import React, { useEffect, useState } from 'react';
import { Keyboard, ScrollView } from 'react-native';
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
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const round = currentRound!;
  const isCasino = round.rule?.id === 'casino';
  const useConfirmLabel = isCasino || round.rule?.id === 'prediction';
  const setupComplete = isPreMeneSetupComplete(round);
  const confirmLabel = useConfirmLabel
    ? 'Confirmer'
    : setupComplete ? 'Commencer' : 'Choix manquants';
  const shouldFocusSetupControls = keyboardVisible && isCasino;

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

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
        contentContainerStyle={[
          gameScreenStyles.ruleSetupScrollContent,
          shouldFocusSetupControls && gameScreenStyles.ruleSetupScrollContentFocused,
        ]}
        showsVerticalScrollIndicator={false}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        testID="rule-setup-scroll"
      >
        {round.rule && !shouldFocusSetupControls && (
          <RuleDisplay
            rule={round.rule}
            immuneTeam={round.totemImmuneTeam}
            style={gameScreenStyles.preMeneRule}
          />
        )}
        <RuleSetupUI round={round} />
      </ScrollView>
      {!keyboardVisible && (
        <GameActionButton
          label={confirmLabel}
          onPress={beginRound}
          disabled={!setupComplete}
          testID="confirm-rule-setup-button"
        />
      )}
    </SafeAreaView>
  );
}
