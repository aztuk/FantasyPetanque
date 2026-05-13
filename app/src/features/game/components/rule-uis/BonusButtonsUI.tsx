import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useGameStore } from '../../state/gameStore';
import { TeamButton } from '../../../../shared/components/TeamButton';
import { Section, Props, styles, TEAM_COLORS } from './shared';

export function BonusButtonsUI({ round }: Props) {
  const { addBonus, removeBonus } = useGameStore();
  const ruleId = round.rule!.id as 'gauche-caviar' | 'les-extremes' | 'king-of-the-hill';

  const getBonusState = (team: 'blue' | 'red'): boolean | number => {
    if (ruleId === 'king-of-the-hill') return round.kingBonus[team];
    if (ruleId === 'gauche-caviar') return round.gaucheBonus[team];
    if (ruleId === 'les-extremes') return round.extremesBonus[team];
    return false;
  };

  const getBonusLabel = (): string => {
    if (ruleId === 'king-of-the-hill') return 'Boule gagnante dans zone +1';
    if (ruleId === 'gauche-caviar') return 'Tir réussi +1';
    if (ruleId === 'les-extremes') return 'Boule dans zone +1';
    return '+1';
  };

  return (
    <Section title="Bonus">
      {(['blue', 'red'] as const).map((team) => {
        const bonusState = getBonusState(team);
        const count = typeof bonusState === 'number' ? bonusState : (bonusState ? 1 : 0);
        const max = round.rule!.maxBonusPerTeam ?? 1;

        return (
          <View key={team} style={styles.teamRow}>
            <TeamButton team={team} label={getBonusLabel()} onPress={() => addBonus(team, ruleId)} disabled={count >= max} />
            <TouchableOpacity style={[styles.undoBtn, count === 0 && styles.disabledEl]} onPress={() => removeBonus(team, ruleId)} disabled={count === 0}>
              <Text style={styles.undoText}>Annuler</Text>
            </TouchableOpacity>
            {count > 0 && <Text style={[styles.countBadge, { color: TEAM_COLORS[team] }]}>+{count}</Text>}
          </View>
        );
      })}
    </Section>
  );
}
