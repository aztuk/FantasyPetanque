import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { colors, typography, radius, TEAM_COLORS } from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';
import { RoundState, Team } from '../../../domain/game/models';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Summary'>;

function getRuleStat(rounds: RoundState[]): { mostProfitable: string | null; mostPunishing: string | null } {
  const ruleGains: Record<string, number> = {};
  const ruleLosses: Record<string, number> = {};

  for (const round of rounds) {
    if (!round.rule) continue;
    const name = round.rule.name;
    const totalGain = (round.bonuses ?? []).filter((b) => b.value > 0).reduce((s, b) => s + b.value, 0);
    const totalLoss = (round.bonuses ?? []).filter((b) => b.value < 0).reduce((s, b) => s + Math.abs(b.value), 0);
    ruleGains[name] = (ruleGains[name] ?? 0) + totalGain;
    ruleLosses[name] = (ruleLosses[name] ?? 0) + totalLoss;
  }

  return {
    mostProfitable: Object.keys(ruleGains).sort((a, b) => ruleGains[b] - ruleGains[a])[0] ?? null,
    mostPunishing: Object.keys(ruleLosses).sort((a, b) => ruleLosses[b] - ruleLosses[a])[0] ?? null,
  };
}

export function SummaryScreen() {
  const navigation = useNavigation<Nav>();
  const { scores, rounds, vetos, resetGame } = useGameStore();

  const winner: Team | null = scores.blue > scores.red ? 'blue' : scores.red > scores.blue ? 'red' : null;
  const totalNormalBlue = rounds.reduce((s, r) => s + r.normalPoints.blue, 0);
  const totalNormalRed = rounds.reduce((s, r) => s + r.normalPoints.red, 0);
  const vetosUsed = { blue: !vetos.blue, red: !vetos.red };
  const { mostProfitable, mostPunishing } = getRuleStat(rounds);

  const winnerColor = winner ? TEAM_COLORS[winner] : colors.darkSmooth;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Bloc vainqueur — seul élément avec un vrai fond coloré */}
        <View style={[styles.winnerBlock, { backgroundColor: winnerColor }]}>
          <Text style={styles.winnerLabel}>
            {winner ? `${winner === 'blue' ? 'Bleu' : 'Rouge'} gagne` : 'Match nul'}
          </Text>
          <Text style={styles.finalScore}>{scores.blue} — {scores.red}</Text>
        </View>

        {/* Stats — liste flottante sans carte */}
        <Text style={styles.sectionTitle}>Statistiques</Text>

        <StatRow label="Mènes jouées" value={String(rounds.length)} />
        <StatRow label="Points Bleu" value={String(totalNormalBlue)} />
        <StatRow label="Points Rouge" value={String(totalNormalRed)} />
        <StatRow label="Véto Bleu" value={vetosUsed.blue ? 'Utilisé' : 'Non utilisé'} />
        <StatRow label="Véto Rouge" value={vetosUsed.red ? 'Utilisé' : 'Non utilisé'} />
        {mostProfitable && <StatRow label="Règle la plus rentable" value={mostProfitable} />}
        {mostPunishing && <StatRow label="Règle la plus punitive" value={mostPunishing} />}

        {/* Historique — liste sans cartes */}
        <Text style={[styles.sectionTitle, { marginTop: 32 }]}>Historique</Text>

        {rounds.map((round) => {
          const prevScores = rounds[round.number - 2]?.scoreAfter ?? { blue: 0, red: 0 };
          const dBlue = round.scoreAfter.blue - prevScores.blue;
          const dRed = round.scoreAfter.red - prevScores.red;

          return (
            <View key={round.number} style={styles.roundRow}>
              <View style={styles.roundHeader}>
                <Text style={styles.roundTitle}>
                  Mène {round.number}{round.rule ? ` — ${round.rule.name}` : ''}
                </Text>
                {round.vetoUsed && (
                  <Text style={styles.vetoTag}>Véto {round.vetoUsed === 'blue' ? 'Bleu' : 'Rouge'}</Text>
                )}
              </View>

              <View style={styles.roundDeltas}>
                <Text style={[styles.teamDelta, { color: TEAM_COLORS.blue }]}>
                  Bleu {dBlue >= 0 ? `+${dBlue}` : dBlue} → {round.scoreAfter.blue}
                </Text>
                <Text style={[styles.teamDelta, { color: TEAM_COLORS.red }]}>
                  Rouge {dRed >= 0 ? `+${dRed}` : dRed} → {round.scoreAfter.red}
                </Text>
              </View>

              {(round.bonuses ?? []).map((b, i) => (
                <Text key={i} style={styles.bonusText}>
                  {b.team === 'blue' ? '🔵' : '🔴'} {b.reason} : {b.value >= 0 ? `+${b.value}` : b.value}
                </Text>
              ))}
            </View>
          );
        })}

        <PrimaryButton
          label="Nouvelle partie"
          onPress={() => { resetGame(); navigation.navigate('Home'); }}
          style={styles.btn}
        />
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dark },
  content: { paddingHorizontal: 24, paddingTop: 16 },

  winnerBlock: {
    borderRadius: radius.xl,
    paddingVertical: 32,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 36,
  },
  winnerLabel: {
    color: colors.white,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.extrabold,
    lineHeight: 50,
  },
  finalScore: {
    color: 'rgba(236,235,232,0.85)', // colors.white à 85% — pas de token Figma pour la variante transparente
    fontSize: typography.size.lg,
    fontWeight: typography.weight.bold,
    marginTop: 8,
  },

  sectionTitle: {
    color: colors.primary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 12,
  },

  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkSmooth,
  },
  statLabel: { color: colors.textSmooth, fontSize: typography.size.base },
  statValue: { color: colors.white, fontSize: typography.size.base, fontWeight: typography.weight.semibold },

  roundRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.darkSmooth,
  },
  roundHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  roundTitle: { color: colors.white, fontSize: typography.size.base, fontWeight: typography.weight.bold, flex: 1 },
  vetoTag: { color: colors.textSmooth, fontSize: typography.size.base, marginLeft: 8 },
  roundDeltas: { flexDirection: 'row', gap: 20, marginBottom: 4 },
  teamDelta: { fontSize: typography.size.base, fontWeight: typography.weight.semibold },
  bonusText: { fontSize: typography.size.base, marginTop: 4, lineHeight: 22, color: colors.secondary },

  btn: { marginTop: 28, marginHorizontal: 0 },
});
