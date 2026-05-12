import React from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { ScoreBlock } from '../../../shared/components/ScoreBlock';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { RuleUI } from '../components/RuleUI';
import { colors, typography, radius, TEAM_COLORS, TEAM_LABELS } from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';
import { shouldSkipNormalScore } from '../../../domain/game/engine';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export function GameScreen() {
  const navigation = useNavigation<Nav>();
  const {
    mode, scores, currentRound, rounds, vetos, vetosEnabled, phase, debugMode,
    addNormalPoint, undoNormalPoint, finishRound, startNewRound, useVeto, resetGame,
  } = useGameStore();

  const round = currentRound;

  const bluePoints = round?.normalPoints.blue ?? 0;
  const redPoints = round?.normalPoints.red ?? 0;
  const blueActive = bluePoints > 0;
  const redActive = redPoints > 0;
  const hasNormalPoints = blueActive || redActive;
  const scoringTeam: 'blue' | 'red' | null =
    blueActive ? 'blue' :
    redActive ? 'red' : null;

  const getScoreBlockPress = (team: 'blue' | 'red') => {
    const otherTeam = team === 'blue' ? 'red' : 'blue';
    return scoringTeam === otherTeam ? undoNormalPoint : () => addNormalPoint(team);
  };

  const getScoreBlockActionLabel = (team: 'blue' | 'red') => {
    if (scoringTeam !== null && scoringTeam !== team) return 'Tapez pour annuler';
    return undefined;
  };

  const skipNormal = round ? shouldSkipNormalScore(round) : false;
  const isRoundSummary = phase === 'round-summary';
  const isGameOver = useGameStore((s) => s.isGameOver);

  const handleStartNewRound = () => {
    startNewRound();
    if (mode === 'fantasy' && debugMode) {
      navigation.replace('DebugRuleSelect');
    }
  };

  if (isGameOver) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.container}>
          <View style={styles.scoresRow}>
            <ScoreBlock team="blue" score={scores.blue} />
            <ScoreBlock team="red" score={scores.red} />
          </View>
          <Text style={styles.gameOver}>Partie terminée.</Text>
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
            <View style={styles.roundSummary}>
              <Text style={styles.roundSummaryLabel}>{lastRound.rule.name}</Text>
              {deltaBlue !== 0 && (
                <Text style={[styles.roundSummaryDelta, { color: TEAM_COLORS.blue }]}>
                  Bleu {deltaBlue > 0 ? `+${deltaBlue}` : deltaBlue}
                </Text>
              )}
              {deltaRed !== 0 && (
                <Text style={[styles.roundSummaryDelta, { color: TEAM_COLORS.red }]}>
                  Rouge {deltaRed > 0 ? `+${deltaRed}` : deltaRed}
                </Text>
              )}
            </View>
          )}

          <PrimaryButton label="Nouvelle mène" onPress={handleStartNewRound} style={styles.fullBtn} />
          <PrimaryButton label="Terminer la partie" onPress={() => navigation.navigate('Summary')} style={styles.fullBtn} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  if (!round) return null;

  const canShowVeto = mode === 'fantasy' && phase === 'rule-display' && vetosEnabled;

  return (
    <SafeAreaView style={styles.safe}>
      {canShowVeto && (
        <View style={styles.vetoBar}>
          {(['blue', 'red'] as const).map((team) => (
            <TouchableOpacity
              key={team}
              style={[styles.vetoBtn, { borderColor: vetos[team] ? TEAM_COLORS[team] : colors.surface2 }]}
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
              <Text style={[styles.vetoBtnLabel, { color: vetos[team] ? TEAM_COLORS[team] : colors.textSecondary }]}>
                {vetos[team] ? `Véto ${team === 'blue' ? '🔵' : '🔴'}` : 'Véto utilisé'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {skipNormal && (
          <View style={styles.scoresRow}>
            <ScoreBlock team="blue" score={scores.blue} />
            <ScoreBlock team="red" score={scores.red} />
          </View>
        )}

        {/* Règle — affichage éditorial sans conteneur */}
        {mode === 'fantasy' && round.rule && (
          <View style={styles.ruleSection}>
            <Text style={styles.ruleName}>{round.rule.name}</Text>
            <Text style={styles.ruleDesc}>{round.rule.description}</Text>
            {round.totemImmuneTeam && (
              <Text style={[styles.immuneText, { color: TEAM_COLORS[round.totemImmuneTeam] }]}>
                {TEAM_LABELS[round.totemImmuneTeam]} est immunisé — joue normalement
              </Text>
            )}
          </View>
        )}

        {mode === 'fantasy' && <RuleUI round={round} />}

        {!skipNormal && (
          <View style={styles.scoringSection}>
            <Text style={styles.scoringPrompt}>Tapez le nombre de points marqués</Text>
            <View style={styles.interactiveScoresRow}>
              <ScoreBlock
                team="blue"
                score={scores.blue}
                delta={bluePoints}
                showLabel={false}
                actionLabel={getScoreBlockActionLabel('blue')}
                onPress={getScoreBlockPress('blue')}
                square
                testID="score-block-blue"
              />
              <ScoreBlock
                team="red"
                score={scores.red}
                delta={redPoints}
                showLabel={false}
                actionLabel={getScoreBlockActionLabel('red')}
                onPress={getScoreBlockPress('red')}
                square
                testID="score-block-red"
              />
            </View>
          </View>
        )}

        <View style={{ height: 24 }} />
      </ScrollView>

      <View style={styles.bottomBar}>
        <PrimaryButton
          label="Mène terminée"
          onPress={finishRound}
          disabled={!skipNormal && !hasNormalPoints}
          style={styles.endRoundBtn}
          testID="end-round-button"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 20, paddingTop: 16 },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 16 },

  scoresRow: { flexDirection: 'row', marginBottom: 24 },

  // Règle — éditorial, pas de carte
  ruleSection: {
    paddingVertical: 8,
    marginBottom: 20,
  },
  ruleName: {
    color: colors.accent,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.extrabold,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 50,
  },
  ruleDesc: {
    color: colors.textPrimary,
    fontSize: typography.size.md,
    lineHeight: 30,
    textAlign: 'center',
  },
  immuneText: {
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 24,
  },

  // Veto
  vetoBar: { flexDirection: 'row', gap: 8, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  vetoBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1.5,
    alignItems: 'center',
  },
  vetoBtnLabel: { fontSize: typography.size.base, fontWeight: typography.weight.semibold },

  // Score interactif
  scoringSection: { paddingVertical: 16 },
  scoringPrompt: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  interactiveScoresRow: { flexDirection: 'row' },
  // Résumé de mène — sans carte
  roundSummary: { paddingVertical: 20, marginBottom: 8 },
  roundSummaryLabel: {
    color: colors.accent,
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
    marginBottom: 12,
    textAlign: 'center',
  },
  roundSummaryDelta: {
    fontSize: typography.size.md,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    marginVertical: 2,
  },

  bottomBar: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: colors.background,
  },
  endRoundBtn: { marginHorizontal: 0 },
  fullBtn: { marginTop: 12, marginHorizontal: 0 },

  gameOver: {
    color: colors.accent,
    fontSize: typography.size.xxl,
    fontWeight: typography.weight.extrabold,
    textAlign: 'center',
    marginVertical: 40,
    lineHeight: 52,
  },
});
