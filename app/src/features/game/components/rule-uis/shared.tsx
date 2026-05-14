import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RoundState } from '../../../../domain/game/models';
import { colors, typography, radius, TEAM_COLORS } from '../../../../shared/constants';

export interface Props {
  round: RoundState;
}

export function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionAccent} />
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
      {children}
    </View>
  );
}
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

export const styles = StyleSheet.create({
  section: {
    width: '100%',
    maxWidth: 420,
    marginVertical: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkSmooth,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionAccent: {
    width: 3,
    height: 18,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginRight: 10,
  },
  sectionTitle: {
    color: colors.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  row: { flexDirection: 'row', marginTop: 8 },
  teamRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 6 },
  teamLabel: { fontSize: typography.size.base, fontWeight: typography.weight.semibold, width: 100 },
  note: {
    color: colors.textSmooth,
    fontSize: typography.size.base,
    lineHeight: 26,
    marginTop: 8,
  },
  undoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.darkSmooth,
    borderRadius: radius.md,
    marginLeft: 8,
  },
  disabledEl: { opacity: 0.35 },
  undoText: { color: colors.textSmooth, fontSize: typography.size.base },
  countBadge: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginLeft: 10,
    minWidth: 28,
    textAlign: 'center',
  },
});

export { colors, typography, radius, TEAM_COLORS };
