import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, SURFACE, ACCENT, TEAM_COLORS } from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';
import { RoundState, Team } from '../../../domain/game/models';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Summary'>;

function getRuleStat(rounds: RoundState[]): { mostProfitable: string | null; mostPunishing: string | null } {
  const ruleGains: Record<string, number> = {};
  const ruleLosses: Record<string, number> = {};

  for (const round of rounds) {
    if (!round.rule) continue;
    const name = round.rule.name;

    const totalGain = (round.bonuses ?? [])
      .filter((b) => b.value > 0)
      .reduce((s, b) => s + b.value, 0);

    const totalLoss = (round.bonuses ?? [])
      .filter((b) => b.value < 0)
      .reduce((s, b) => s + Math.abs(b.value), 0);

    ruleGains[name] = (ruleGains[name] ?? 0) + totalGain;
    ruleLosses[name] = (ruleLosses[name] ?? 0) + totalLoss;
  }

  const mostProfitable = Object.keys(ruleGains).sort((a, b) => ruleGains[b] - ruleGains[a])[0] ?? null;
  const mostPunishing = Object.keys(ruleLosses).sort((a, b) => ruleLosses[b] - ruleLosses[a])[0] ?? null;

  return { mostProfitable, mostPunishing };
}

export function SummaryScreen() {
  const navigation = useNavigation<Nav>();
  const { scores, rounds, vetos, resetGame } = useGameStore();

  const winner: Team | null = scores.blue > scores.red ? 'blue' : scores.red > scores.blue ? 'red' : null;
  const totalNormalBlue = rounds.reduce((s, r) => s + r.normalPoints.blue, 0);
  const totalNormalRed = rounds.reduce((s, r) => s + r.normalPoints.red, 0);
  const vetosUsed = { blue: !vetos.blue, red: !vetos.red };
  const { mostProfitable, mostPunishing } = getRuleStat(rounds);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Winner */}
        <View style={[styles.winnerBlock, { backgroundColor: winner ? TEAM_COLORS[winner] : '#555' }]}>
          <Text style={styles.winnerLabel}>
            {winner ? `${winner === 'blue' ? 'Bleu' : 'Rouge'} gagne !` : 'Match nul'}
          </Text>
          <Text style={styles.finalScore}>{scores.blue} — {scores.red}</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsCard}>
          <StatRow label="Mènes jouées" value={String(rounds.length)} />
          <StatRow label="Points normaux Bleu" value={String(totalNormalBlue)} />
          <StatRow label="Points normaux Rouge" value={String(totalNormalRed)} />
          <StatRow label="Véto Bleu" value={vetosUsed.blue ? 'Utilisé' : 'Non utilisé'} />
          <StatRow label="Véto Rouge" value={vetosUsed.red ? 'Utilisé' : 'Non utilisé'} />
          {mostProfitable && <StatRow label="Règle la plus rentable" value={mostProfitable} />}
          {mostPunishing && <StatRow label="Règle la plus punitive" value={mostPunishing} />}
        </View>

        {/* Round history */}
        <Text style={styles.sectionTitle}>Historique des mènes</Text>
        {rounds.map((round) => {
          const prevScores = rounds[round.number - 2]?.scoreAfter ?? { blue: 0, red: 0 };
          const dBlue = round.scoreAfter.blue - prevScores.blue;
          const dRed = round.scoreAfter.red - prevScores.red;

          return (
            <View key={round.number} style={styles.roundCard}>
              <Text style={styles.roundTitle}>
                Mène {round.number}{round.rule ? ` — ${round.rule.name}` : ''}
                {round.vetoUsed ? ` (véto ${round.vetoUsed === 'blue' ? 'Bleu' : 'Rouge'})` : ''}
              </Text>

              <View style={styles.roundDetails}>
                <Text style={[styles.teamDelta, { color: TEAM_COLORS.blue }]}>
                  Bleu : {dBlue >= 0 ? `+${dBlue}` : dBlue} → {round.scoreAfter.blue}
                </Text>
                <Text style={[styles.teamDelta, { color: TEAM_COLORS.red }]}>
                  Rouge : {dRed >= 0 ? `+${dRed}` : dRed} → {round.scoreAfter.red}
                </Text>
              </View>

              {(round.bonuses ?? []).length > 0 && (
                <View style={styles.bonusSection}>
                  {round.bonuses.map((b, i) => (
                    <Text key={i} style={[styles.bonusText, { color: b.value >= 0 ? '#AEFFAE' : '#FFAEAE' }]}>
                      {b.team === 'blue' ? '🔵' : '🔴'} {b.reason} : {b.value >= 0 ? `+${b.value}` : b.value}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}

        {/* Actions */}
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

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  content: { padding: 16 },
  winnerBlock: {
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  winnerLabel: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
  },
  finalScore: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 4,
  },
  statsCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  statLabel: { color: TEXT_SECONDARY, fontSize: 14 },
  statValue: { color: TEXT_PRIMARY, fontSize: 14, fontWeight: '600' },
  sectionTitle: {
    color: ACCENT,
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  roundCard: {
    backgroundColor: SURFACE,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
  },
  roundTitle: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  roundDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  teamDelta: {
    fontSize: 14,
    fontWeight: '600',
  },
  bonusSection: { marginTop: 6 },
  bonusText: { fontSize: 13, marginVertical: 1 },
  btn: { marginTop: 16, marginHorizontal: 0 },
});
