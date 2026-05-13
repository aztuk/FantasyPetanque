import React from 'react';
import { Alert, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { requiresPreMeneSetup } from '../../../../domain/game/engine';
import { Team } from '../../../../domain/game/models';
import { GameActionButton } from '../../components/GameActionButton';
import { GameTopBar } from '../../components/GameTopBar';
import { RuleDisplay } from '../../components/RuleDisplay';
import { useGameStore } from '../../state/gameStore';
import { gameScreenStyles } from './gameScreenStyles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export function PreMeneView() {
  const navigation = useNavigation<Nav>();
  const { currentRound, vetos, vetosEnabled, beginRound, useVeto, resetGame } = useGameStore();

  const round = currentRound!;
  const requiresSetup = requiresPreMeneSetup(round.rule);

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
      <GameTopBar onCancel={handleCancelGame} />
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
