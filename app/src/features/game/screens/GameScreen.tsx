import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useGameStore } from '../state/gameStore';
import { ScoreBlock } from '../../../shared/components/ScoreBlock';
import { PrimaryButton } from '../../../shared/components/PrimaryButton';
import { RuleUI } from '../components/RuleUI';
import { GameTopBar } from '../components/GameTopBar';
import { colors, typography, radius, TEAM_COLORS, TEAM_LABELS } from '../../../shared/constants';
import { RootStackParamList } from '../../../app/navigation/types';
import { shouldSkipNormalScore } from '../../../domain/game/engine';
import { RoundState } from '../../../domain/game/models';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

function SimpleHistoryRow({ round, rounds }: { round: RoundState; rounds: RoundState[] }) {
  const prevScores = rounds[round.number - 2]?.scoreAfter ?? { blue: 0, red: 0 };
  const dBlue = round.scoreAfter.blue - prevScores.blue;
  const dRed = round.scoreAfter.red - prevScores.red;

  const scoringTeam = dBlue > 0 ? 'blue' : dRed > 0 ? 'red' : null;
  const delta = scoringTeam ? (scoringTeam === 'blue' ? dBlue : dRed) : 0;
  const label = scoringTeam
    ? `${TEAM_LABELS[scoringTeam]} +${delta}`
    : 'Mène nulle';
  const labelColor = scoringTeam ? TEAM_COLORS[scoringTeam] : colors.textSecondary;

  return (
    <View style={historyStyles.row}>
      <Text style={historyStyles.meneLabel}>Mène {round.number}</Text>
      <Text style={[historyStyles.delta, { color: labelColor }]}>{label}</Text>
      <Text style={historyStyles.score}>
        {round.scoreAfter.blue} — {round.scoreAfter.red}
      </Text>
    </View>
  );
}

const historyStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surface2,
  },
  meneLabel: {
    color: colors.textSecondary,
    fontSize: typography.size.base,
    width: 72,
  },
  delta: {
    flex: 1,
    fontSize: typography.size.base,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
  },
  score: {
    color: colors.textPrimary,
    fontSize: typography.size.base,
    fontWeight: typography.weight.bold,
    width: 64,
    textAlign: 'right',
  },
});

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
  const canShowVeto = mode === 'fantasy' && phase === 'rule-display' && vetosEnabled;

  const handleStartNewRound = () => {
    startNewRound();
    if (mode === 'fantasy' && debugMode) {
      navigation.replace('DebugRuleSelect');
    }
  };

  const handleFinishRound = () => {
    finishRound();
    if (mode === 'simple') {
      const { isGameOver: over } = useGameStore.getState();
      if (!over) startNewRound();
    }
  };

  const handleCancelGame = () => {
    Alert.alert(
      'Annuler la partie ?',
      'La partie en cours sera perdue si tu confirmes.',
      [
        { text: 'Continuer', style: 'cancel' },
        {
          text: 'Annuler la partie',
          style: 'destructive',
          onPress: () => { resetGame(); navigation.replace('Home'); },
        },
      ],
    );
  };

  const renderTopBar = () => (
    <GameTopBar onCancel={handleCancelGame}>
      {canShowVeto && (['blue', 'red'] as const).map((team) => (
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
          accessibilityRole="button"
          accessibilityState={{ disabled: !vetos[team] }}
        >
          <Text style={[styles.vetoBtnLabel, { color: vetos[team] ? TEAM_COLORS[team] : colors.textSecondary }]}>
            {vetos[team] ? `Véto ${team === 'blue' ? '🔵' : '🔴'}` : 'Véto utilisé'}
          </Text>
        </TouchableOpacity>
      ))}
    </GameTopBar>
  );

  if (isGameOver) {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
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

  // Inter-mène summary — fantasy mode only
  if (isRoundSummary && mode === 'fantasy') {
    const lastRound = rounds[rounds.length - 1];
    const prevScores = rounds.length >= 2
      ? rounds[rounds.length - 2].scoreAfter
      : { blue: 0, red: 0 };

    const deltaBlue = lastRound ? lastRound.scoreAfter.blue - prevScores.blue : 0;
    const deltaRed = lastRound ? lastRound.scoreAfter.red - prevScores.red : 0;

    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {renderTopBar()}
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

  // Simple mode — history grows upward above score blocks, blocks anchored at bottom
  if (mode === 'simple') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        {renderTopBar()}

        <ScrollView
          style={styles.simpleScroll}
          contentContainerStyle={styles.simpleScrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {rounds.map((r) => (
            <SimpleHistoryRow key={r.number} round={r} rounds={rounds} />
          ))}

          <View style={styles.simpleScoreArea}>
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
        </ScrollView>

        <View style={styles.bottomBar}>
          <PrimaryButton
            label="Mène terminée"
            onPress={handleFinishRound}
            disabled={!hasNormalPoints}
            style={styles.endRoundBtn}
            testID="end-round-button"
          />
        </View>
      </SafeAreaView>
    );
  }

  // Fantasy mode
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {renderTopBar()}

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {skipNormal && (
          <View style={styles.scoresRow}>
            <ScoreBlock team="blue" score={scores.blue} />
            <ScoreBlock team="red" score={scores.red} />
          </View>
        )}

        {round.rule && (
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

        <RuleUI round={round} />

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
          onPress={handleFinishRound}
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

  // Simple mode layout — content sticks to bottom, history grows upward
  simpleScroll: { flex: 1, paddingHorizontal: 20 },
  simpleScrollContent: { flexGrow: 1, justifyContent: 'flex-end', paddingTop: 12 },
  simpleScoreArea: { paddingVertical: 24 },

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

  // Résumé de mène — sans carte (fantasy inter-mène)
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
