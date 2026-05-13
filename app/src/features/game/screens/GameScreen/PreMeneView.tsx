import React, { useState } from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { requiresPreMeneSetup } from '../../../../domain/game/engine';
import { Team } from '../../../../domain/game/models';
import { CancelGameSheet } from '../../../../shared/components/CancelGameSheet';
import { GameActionButton } from '../../components/GameActionButton';
import { GameTopBar } from '../../components/GameTopBar';
import { RuleDisplay } from '../../components/RuleDisplay';
import { useGameStore } from '../../state/gameStore';
import { gameScreenStyles } from './gameScreenStyles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export function PreMeneView() {
  const navigation = useNavigation<Nav>();
  const { currentRound, vetos, vetosEnabled, beginRound, useVeto, resetGame } = useGameStore();

  const [showCancelSheet, setShowCancelSheet] = useState(false);

  const round = currentRound!;
  const requiresSetup = requiresPreMeneSetup(round.rule);

  const handleVeto = (team: Team) => {
    Alert.alert(
      'Véto',
      `${team === 'blue' ? 'Bleu' : 'Rouge'} utilise son véto. La règle sera changée.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => useVeto(team) },
      ],
    );
  };

  return (
    <SafeAreaView style={gameScreenStyles.safe} edges={['top', 'bottom']}>
      <CancelGameSheet
        visible={showCancelSheet}
        onConfirm={() => { resetGame(); navigation.replace('Home'); }}
        onCancel={() => setShowCancelSheet(false)}
      />
      <GameTopBar onCancel={() => setShowCancelSheet(true)} />
      <View style={gameScreenStyles.centerContent}>
        {round.rule && (
          <RuleDisplay
            rule={round.rule}
            immuneTeam={round.totemImmuneTeam}
            style={gameScreenStyles.preMeneRule}
          />
        )}
      </View>

      {vetosEnabled && (
        <View style={gameScreenStyles.vetoRow}>
          {(['blue', 'red'] as const).map((team) => (
            <GameActionButton
              key={team}
              label={vetos[team] ? 'Veto' : 'Utilisé'}
              onPress={() => handleVeto(team)}
              disabled={!vetos[team]}
              variant={vetos[team] ? team : 'muted'}
              style={gameScreenStyles.vetoButton}
              testID={`veto-${team}-button`}
            />
          ))}
        </View>
      )}

      <GameActionButton
        label={requiresSetup ? 'Configurer' : 'Commencer'}
        onPress={beginRound}
        testID="begin-round-button"
      />
    </SafeAreaView>
  );
}
