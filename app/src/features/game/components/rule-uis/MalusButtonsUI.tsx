import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useGameStore } from '../../state/gameStore';
import { TeamButton } from '../../../../shared/components/TeamButton';
import { Section, Props, styles, TEAM_COLORS } from './shared';

export function MalusButtonsUI({ round }: Props) {
  const { addCensureMalus, removeCensureMalus, setBouleMauditeHit } = useGameStore();
  const ruleId = round.rule!.id;

  if (ruleId === 'censure') {
    return (
      <Section title="Malus">
        {(['blue', 'red'] as const).map((team) => {
          const count = round.censureMalus[team];
          const max = round.rule!.maxMalusPerTeam ?? 3;
          return (
            <View key={team} style={styles.teamRow}>
              <TeamButton team={team} label="A parlé -1" onPress={() => addCensureMalus(team)} disabled={count >= max} />
              <TouchableOpacity style={[styles.undoBtn, count === 0 && styles.disabledEl]} onPress={() => removeCensureMalus(team)} disabled={count === 0}>
                <Text style={styles.undoText}>Annuler</Text>
              </TouchableOpacity>
              {count > 0 && <Text style={[styles.countBadge, { color: TEAM_COLORS[team] }]}>{-count}</Text>}
            </View>
          );
        })}
      </Section>
    );
  }

  if (ruleId === 'boule-maudite') {
    return (
      <Section title="Malus">
        {(['blue', 'red'] as const).map((team) => {
          const hit = round.boucleMauditeHit[team];
          return (
            <View key={team} style={styles.teamRow}>
              <TeamButton team={team} label="A touché la boule -1" onPress={() => setBouleMauditeHit(team, true)} disabled={hit} />
              <TouchableOpacity style={[styles.undoBtn, !hit && styles.disabledEl]} onPress={() => setBouleMauditeHit(team, false)} disabled={!hit}>
                <Text style={styles.undoText}>Annuler</Text>
              </TouchableOpacity>
              {hit && <Text style={[styles.countBadge, { color: TEAM_COLORS[team] }]}>-1</Text>}
            </View>
          );
        })}
      </Section>
    );
  }

  return null;
}
