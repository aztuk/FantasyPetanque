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
import { BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, SURFACE, ACCENT, TEAM_COLORS, TEAM_LABELS } from '../../../shared/constants';
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

  const scoreTeamDisabled = (team: 'blue' | 'red') => {
    if (team === 'blue') return redActive;
    return blueActive;
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
              <Text style={styles.roundLabel}>{lastRound.rule.name}</Text>
              {deltaBlue !== 0 && <Text style={[styles.deltaText, { color: TEAM_COLORS.blue }]}>Bleu : {deltaBlue > 0 ? `+${deltaBlue}` : deltaBlue}</Text>}
              {deltaRed !== 0 && <Text style={[styles.deltaText, { color: TEAM_COLORS.red }]}>Rouge : {deltaRed > 0 ? `+${deltaRed}` : deltaRed}</Text>}
            </View>
          )}

          <PrimaryButton
            label="Nouvelle mène"
            onPress={handleStartNewRound}
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

  const canShowVeto = mode === 'fantasy' && phase === 'rule-display' && vetosEnabled;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Veto bar — pinned to top */}
      {canShowVeto && (
        <View style={styles.vetoBar}>
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

      {/* Scrollable content */}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {/* Scores */}
        {skipNormal && (
          <View style={styles.scoresRow}>
            <ScoreBlock team="blue" score={scores.blue} />
            <ScoreBlock team="red" score={scores.red} />
          </View>
        )}

        {/* Rule display (fantasy mode) */}
        {mode === 'fantasy' && round.rule && (
          <View style={styles.ruleCard}>
            <Text style={styles.ruleName}>{round.rule.name}</Text>
            <Text style={styles.ruleDesc}>{round.rule.description}</Text>

            {round.totemImmuneTeam && (
              <View style={[styles.immuneBanner, { borderColor: TEAM_COLORS[round.totemImmuneTeam] }]}>
                <Text style={[styles.immuneText, { color: TEAM_COLORS[round.totemImmuneTeam] }]}>
                  {TEAM_LABELS[round.totemImmuneTeam]} est immunisé — joue normalement
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Rule-specific UI */}
        {mode === 'fantasy' && <RuleUI round={round} />}

        {/* Scoring section */}
        {!skipNormal && (
          <View style={styles.scoringSection}>
            <Text style={styles.scoringPrompt}>Tapez le nombre de points marqués</Text>

            <View style={styles.interactiveScoresRow}>
              <ScoreBlock
                team="blue"
                score={scores.blue}
                delta={bluePoints}
                showLabel={false}
                onPress={() => addNormalPoint('blue')}
                disabled={scoreTeamDisabled('blue')}
                testID="score-block-blue"
              />
              <ScoreBlock
                team="red"
                score={scores.red}
                delta={redPoints}
                showLabel={false}
                onPress={() => addNormalPoint('red')}
                disabled={scoreTeamDisabled('red')}
                testID="score-block-red"
              />
            </View>

            {hasNormalPoints && (
              <TouchableOpacity style={styles.undoBtn} onPress={undoNormalPoint}>
                <Text style={styles.undoBtnLabel}>↩ Annuler dernier point</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        <View style={{ height: 16 }} />
      </ScrollView>

      {/* End round button — pinned to bottom */}
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
  safe: { flex: 1, backgroundColor: BACKGROUND },
  scroll: { flex: 1 },
  scrollContent: { padding: 16 },
  container: {
    flex: 1,
    padding: 16,
  },
  scoresRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  ruleCard: {
    backgroundColor: SURFACE,
    borderRadius: 16,
    padding: 24,
    marginBottom: 12,
    alignItems: 'center',
  },
  ruleName: {
    color: ACCENT,
    fontSize: 30,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 12,
  },
  ruleDesc: {
    color: TEXT_PRIMARY,
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
  },
  immuneBanner: {
    borderWidth: 2,
    borderRadius: 8,
    padding: 8,
    marginTop: 14,
    alignItems: 'center',
    width: '100%',
  },
  immuneText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  vetoBar: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
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
    paddingVertical: 28,
    marginVertical: 8,
  },
  scoringPrompt: {
    color: TEXT_PRIMARY,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 14,
  },
  interactiveScoresRow: {
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
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: BACKGROUND,
  },
  endRoundBtn: {
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
    textAlign: 'center',
  },
  deltaText: {
    fontSize: 18,
    fontWeight: '700',
    marginVertical: 2,
  },
});
