import React, { useState } from 'react';
import { View } from 'react-native';
import { requiresPreMeneSetup } from '../../../../domain/game/engine';
import { Team } from '../../../../domain/game/models';
import { VetoSheet } from '../../../../shared/components/VetoSheet';
import { GameActionButton } from '../../components/GameActionButton';
import { GameDrawer } from '../../components/GameDrawer';
import { RuleDisplay } from '../../components/RuleDisplay';
import { useGameStore } from '../../state/gameStore';
import { GameScreenLayout } from '../GameScreenLayout';
import { gameScreenStyles } from './gameScreenStyles';

export function PreMeneView() {
  const { currentRound, vetos, vetosEnabled, beginRound, useVeto } = useGameStore();
  const [pendingVetoTeam, setPendingVetoTeam] = useState<Team | null>(null);

  const round = currentRound!;
  const requiresSetup = requiresPreMeneSetup(round.rule);

  const handleVetoPress = (team: Team) => {
    setPendingVetoTeam(team);
  };

  const handleVetoConfirm = () => {
    if (pendingVetoTeam) {
      useVeto(pendingVetoTeam);
    }
    setPendingVetoTeam(null);
  };

  const handleVetoCancel = () => {
    setPendingVetoTeam(null);
  };

  return (
    <>
      <GameScreenLayout
        drawer={
          <GameDrawer
            testID="game-drawer"
            actions={vetosEnabled ? (
              <View style={gameScreenStyles.vetoRow}>
                {(['blue', 'red'] as const).map((team) => (
                  <GameActionButton
                    key={team}
                    label={vetos[team] ? 'Veto' : 'Utilisé'}
                    onPress={() => handleVetoPress(team)}
                    disabled={!vetos[team]}
                    variant={vetos[team] ? team : 'muted'}
                    style={gameScreenStyles.vetoButton}
                    testID={`veto-${team}-button`}
                  />
                ))}
              </View>
            ) : undefined}
            confirmButton={
              <GameActionButton
                label={requiresSetup ? 'Configurer' : 'Commencer'}
                onPress={beginRound}
                testID="begin-round-button"
              />
            }
          />
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

      <VetoSheet
        visible={pendingVetoTeam !== null}
        team={pendingVetoTeam}
        onConfirm={handleVetoConfirm}
        onCancel={handleVetoCancel}
      />
    </>
  );
}
