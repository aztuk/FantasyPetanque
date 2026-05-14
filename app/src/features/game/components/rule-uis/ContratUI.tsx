import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useGameStore } from '../../state/gameStore';
import { TeamButton } from '../../../../shared/components/TeamButton';
import { CONTRAT_MISSIONS } from '../../../../data/rules/rules';
import { Section, Props, styles, colors, typography, radius, TEAM_COLORS } from './shared';

export function ContratSetupUI({ round }: Props) {
  const { selectContratMission, clearContratMission } = useGameStore();
  const bothSelected = round.contratMission.blue !== null && round.contratMission.red !== null;

  return (
    <Section title="Mission">
      {CONTRAT_MISSIONS.map((mission, idx) => (
        <View key={idx} style={localStyles.missionRow}>
          <TouchableOpacity
            style={[localStyles.missionBtn, { backgroundColor: TEAM_COLORS.blue }, round.contratMission.blue === idx && localStyles.missionSelected, round.contratMission.blue !== null && round.contratMission.blue !== idx && styles.disabledEl]}
            onPress={() => round.contratMission.blue === idx ? clearContratMission('blue') : selectContratMission('blue', idx)}
          >
            <Text style={localStyles.missionBtnLabel}>B</Text>
          </TouchableOpacity>
          <Text style={localStyles.missionText}>{mission}</Text>
          <TouchableOpacity
            style={[localStyles.missionBtn, { backgroundColor: TEAM_COLORS.red }, round.contratMission.red === idx && localStyles.missionSelected, round.contratMission.red !== null && round.contratMission.red !== idx && styles.disabledEl]}
            onPress={() => round.contratMission.red === idx ? clearContratMission('red') : selectContratMission('red', idx)}
          >
            <Text style={localStyles.missionBtnLabel}>R</Text>
          </TouchableOpacity>
        </View>
      ))}
      {bothSelected && (
        <Text style={styles.note}>Les missions sont choisies. Les réussites seront cochées pendant la mène.</Text>
      )}
    </Section>
  );
}

export function ContratResolutionUI({ round }: Props) {
  const { setContratSuccess } = useGameStore();
  const blueMission = round.contratMission.blue;
  const redMission = round.contratMission.red;

  if (blueMission === null || redMission === null) return null;

  return (
    <Section title="Mission">
      <Text style={styles.note}>
        Bleu : {CONTRAT_MISSIONS[blueMission]}{'\n'}
        Rouge : {CONTRAT_MISSIONS[redMission]}
      </Text>
      <View style={styles.row}>
        {(['blue', 'red'] as const).map((team) => (
          <TeamButton
            key={team}
            team={team}
            label={round.contratSuccess[team] ? 'Mission réussie' : 'Mission réussie +2'}
            onPress={() => setContratSuccess(team, !round.contratSuccess[team])}
          />
        ))}
      </View>
    </Section>
  );
}
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

const localStyles = StyleSheet.create({
  missionRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 5 },
  missionBtn: { width: 42, height: 42, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  missionSelected: { borderWidth: 3, borderColor: colors.white },
  missionBtnLabel: { color: colors.white, fontWeight: typography.weight.bold, fontSize: typography.size.base },
  missionText: { flex: 1, color: colors.white, fontSize: typography.size.base, marginHorizontal: 12, lineHeight: 24 },
});
