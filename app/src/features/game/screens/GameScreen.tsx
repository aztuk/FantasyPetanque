import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { ScoreBlock } from '../../../shared/components/ScoreBlock';
import { TeamButton } from '../../../shared/components/TeamButton';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { RuleUI } from '../components/RuleUI';
import { DebugRulePicker } from '../components/DebugRulePicker';
import { BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, SURFACE, ACCENT, TEAM_COLORS, TEAM_LABELS } from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';
import { shouldSkipNormalScore } from '../../../domain/game/engine';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export function GameScreen() {
  const navigation = useNavigation<Nav>();
  const [debugPickerVisible, setDebugPickerVisible] = useState(false);
  const {
    mode, scores, currentRound, rounds, vetos, phase, debugMode,
    addNormalPoint, undoNormalPoint, finishRound, startNewRound, useVeto, resetGame,
  } = useGameStore();

  const round = currentRound;

  const bluePoints = round?.normalPoints.blue ?? 0;
  const redPoints = round?.normalPoints.red ?? 0;
  const blueActive = bluePoints > 0;
  const redActive = redPoints > 0;

  const scoreTeamDisabled = (team: 'blue' | 'red') => {
    if (team === 'blue') return redActive;
    return blueActive;
  };

  const skipNormal = round ? shouldSkipNormalScore(round) : false;
  const isRoundSummary = phase === 'round-summary';
  const isGameOver = useGameStore((s) => s.isGameOver);

  if (isGameOver) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.scoresRow}>
            <ScoreBlock team="blue" score={scores.blue} />
            <ScoreBlock team="red" score={scores.red} />
          </View>
          <Text style={styles.gameOver}>Partie terminée !</Text>
          <PrimaryButton
            label="Voir le résumé"
            onPress={() => navigation.navigate('Summary')}
            style={styles.fullBtn}
          />
          <PrimaryButton
            label="Nouvelle partie"
            onPress={() => { resetGame(); navigation.navigate('Home'); }}
            style={styles.fullBtn}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (isRoundSummary) {
    const lastRound = rounds[rounds.length - 1];
    const prevScores = rounds.length >= 2
      ? rounds[rounds.length - 2].scoreAfter
      : { blue: 0, red: 0 };

    const deltaBlue = lastRound ? lastRound.scoreAfter.blue - prevScores.blue : 0;
    const deltaRed = lastRound ? lastRound.scoreAfter.red - prevScores.red : 0;

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.scoresRow}>
            <ScoreBlock team="blue" score={scores.blue} delta={deltaBlue} />
            <ScoreBlock team="red" score={scores.red} delta={deltaRed} />
          </View>

          {lastRound?.rule && (
            <View style={styles.roundSummaryCard}>
              <Text style={styles.roundLabel}>Mène {lastRound.number} — {lastRound.rule.name}</Text>
              {deltaBlue !== 0 && <Text style={[styles.deltaText, { color: TEAM_COLORS.blue }]}>Bleu : {deltaBlue > 0 ? `+${deltaBlue}` : deltaBlue}</Text>}
              {deltaRed !== 0 && <Text style={[styles.deltaText, { color: TEAM_COLORS.red }]}>Rouge : {deltaRed > 0 ? `+${deltaRed}` : deltaRed}</Text>}
            </View>
          )}

          <PrimaryButton
            label="Nouvelle mène"
            onPress={startNewRound}
            style={styles.fullBtn}
          />
          <PrimaryButton
            label="Terminer la partie"
            onPress={() => navigation.navigate('Summary')}
            style={styles.fullBtn}
            variant="secondary"
          />
        </View>
      </SafeAreaView>
    );
  }

  if (!round) return null;

  const isScoringPhase = phase === 'scoring' || (phase === 'playing' && (bluePoints > 0 || redPoints > 0));

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Scores */}
        <View style={styles.scoresRow}>
          <ScoreBlock team="blue" score={scores.blue} />
          <ScoreBlock team="red" score={scores.red} />
        </View>

        {/* Mène info */}
        <Text style={styles.roundInfo}>Mène {round.number}</Text>

        {/* Rule display (fantasy mode) */}
        {mode === 'fantasy' && round.rule && (
          <View style={styles.ruleCard}>
            <View style={styles.ruleCardHeader}>
              <Text style={styles.ruleName}>{round.rule.name}</Text>
              {debugMode && (
                <TouchableOpacity
                  style={styles.debugChangeBtn}
                  onPress={() => setDebugPickerVisible(true)}
                >
                  <Text style={styles.debugChangeBtnLabel}>🛠 Changer</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.ruleDesc}>{round.rule.description}</Text>

            {/* Immune team banner */}
            {round.totemImmuneTeam && (
              <View style={[styles.immuneBanner, { borderColor: TEAM_COLORS[round.totemImmuneTeam] }]}>
                <Text style={[styles.immuneText, { color: TEAM_COLORS[round.totemImmuneTeam] }]}>
                  {TEAM_LABELS[round.totemImmuneTeam]} est immunisé — joue normalement
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Veto buttons (only before scoring starts) */}
        {mode === 'fantasy' && bluePoints === 0 && redPoints === 0 && phase !== 'scoring' && (
          <View style={styles.vetoRow}>
            {(['blue', 'red'] as const).map((team) => (
              <TouchableOpacity
                key={team}
                style={[styles.vetoBtn, !vetos[team] && styles.vetoUsed, { borderColor: TEAM_COLORS[team] }]}
                onPress={() => {
                  Alert.alert(
                    'Véto',
                    `${TEAM_LABELS[team]} utilise son véto. La règle sera rechangée.`,
                    [
                      { text: 'Annuler', style: 'cancel' },
                      { text: 'Confirmer', onPress: () => useVeto(team) },
                    ],
                  );
                }}
                disabled={!vetos[team]}
              >
                <Text style={[styles.vetoBtnLabel, { color: vetos[team] ? TEAM_COLORS[team] : '#666' }]}>
                  {vetos[team] ? `Véto ${team === 'blue' ? '🔵' : '🔴'}` : `Véto utilisé`}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Rule-specific UI */}
        {mode === 'fantasy' && <RuleUI round={round} />}

        {/* Simple mode reminder */}
        {mode === 'simple' && (
          <View style={styles.ruleCard}>
            <Text style={styles.ruleName}>Mode simple</Text>
            <Text style={styles.ruleDesc}>Comptez les points normalement.</Text>
          </View>
        )}

        {/* Scoring section */}
        {!skipNormal && (
          <View style={styles.scoringSection}>
            <Text style={styles.scoringSectionTitle}>
              {bluePoints > 0 || redPoints > 0 ? 'Points normaux' : 'Qui marque ?'}
            </Text>

            <View style={styles.scoreButtons}>
              <TeamButton
                team="blue"
                label={`Bleu marque${bluePoints > 0 ? ` (${bluePoints})` : ''}`}
                onPress={() => addNormalPoint('blue')}
                disabled={scoreTeamDisabled('blue')}
              />
              <TeamButton
                team="red"
                label={`Rouge marque${redPoints > 0 ? ` (${redPoints})` : ''}`}
                onPress={() => addNormalPoint('red')}
                disabled={scoreTeamDisabled('red')}
              />
            </View>

            {(bluePoints > 0 || redPoints > 0) && (
              <TouchableOpacity style={styles.undoBtn} onPress={undoNormalPoint}>
                <Text style={styles.undoBtnLabel}>↩ Annuler dernier point</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* End round button */}
        <PrimaryButton
          label="Mène terminée"
          onPress={finishRound}
          style={styles.endRoundBtn}
        />

        <View style={{ height: 40 }} />
      </ScrollView>

      <DebugRulePicker
        visible={debugPickerVisible}
        onClose={() => setDebugPickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BACKGROUND },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  container: {
    flex: 1,
    padding: 16,
  },
  scoresRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  roundInfo: {
    color: TEXT_SECONDARY,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  ruleCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
  },
  ruleCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  ruleName: {
    color: ACCENT,
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
  },
  debugChangeBtn: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#555',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  debugChangeBtnLabel: {
    color: '#AAA',
    fontSize: 13,
    fontWeight: '600',
  },
  ruleDesc: {
    color: TEXT_PRIMARY,
    fontSize: 15,
    lineHeight: 22,
  },
  immuneBanner: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  immuneText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  vetoRow: {
    flexDirection: 'row',
    marginVertical: 8,
    gap: 8,
  },
  vetoBtn: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  vetoUsed: { borderColor: '#444' },
  vetoBtnLabel: { fontSize: 13, fontWeight: '600' },
  scoringSection: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
  },
  scoringSectionTitle: {
    color: TEXT_SECONDARY,
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
  },
  scoreButtons: {
    flexDirection: 'row',
  },
  undoBtn: {
    marginTop: 10,
    padding: 10,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    alignItems: 'center',
  },
  undoBtnLabel: { color: TEXT_SECONDARY, fontSize: 14 },
  endRoundBtn: {
    marginTop: 12,
    marginHorizontal: 0,
  },
  fullBtn: {
    marginTop: 12,
    marginHorizontal: 0,
  },
  gameOver: {
    color: ACCENT,
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    marginVertical: 40,
  },
  roundSummaryCard: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  roundLabel: {
    color: ACCENT,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  deltaText: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 2,
  },
});
