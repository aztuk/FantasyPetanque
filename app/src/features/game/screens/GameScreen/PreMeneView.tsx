import React from 'react';
import { Alert, View } from 'react-native';
import { requiresPreMeneSetup } from '../../../../domain/game/engine';
import { Team } from '../../../../domain/game/models';
import { GameActionButton } from '../../components/GameActionButton';
import { RuleDisplay } from '../../components/RuleDisplay';
import { useGameStore } from '../../state/gameStore';
import { GameScreenLayout } from '../GameScreenLayout';
import { gameScreenStyles } from './gameScreenStyles';

export function PreMeneView() {
  const { currentRound, vetos, vetosEnabled, beginRound, useVeto } = useGameStore();

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
    <GameScreenLayout
      drawerConfirmButton={
        <View style={{ gap: 4 }}>
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
        </View>
      }
    >
      {round.rule && (
        <View testID="pre-mene-rule-area" style={gameScreenStyles.ruleTopContent}>
          <RuleDisplay
            rule={round.rule}
            immuneTeam={round.totemImmuneTeam}
            style={gameScreenStyles.preMeneRule}
          />
        </View>
      )}
    </GameScreenLayout>
  );
}
