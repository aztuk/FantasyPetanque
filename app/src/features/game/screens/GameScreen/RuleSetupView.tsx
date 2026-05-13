import React from 'react';
import { Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { isPreMeneSetupComplete } from '../../../../domain/game/engine';
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

  const round = currentRound!;
  const setupComplete = isPreMeneSetupComplete(round);

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
