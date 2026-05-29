import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { Team } from '../../../../domain/game/models';
import { CancelGameSheet } from '../../../../shared/components/CancelGameSheet';
import { GameActionButton } from '../../components/GameActionButton';
import { GameScoreBoard } from '../../components/GameScoreBoard';
import { GameTopBar } from '../../components/GameTopBar';
import { gameUiColors } from '../../components/gameUiTheme';
import { useGameStore } from '../../state/gameStore';
import { typography } from '../../../../shared/constants';
import { gameScreenStyles } from './gameScreenStyles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export interface ScoreStep {
  badgeLabel: string;
  blueDelta: number;
  redDelta: number;
  blueAfter: number;
  redAfter: number;
}

function shortenBadge(reason: string): string {
  if (reason.startsWith('Tir réussi')) return 'TIR RÉUSSI';
  if (reason.startsWith('Boule entre')) return 'EXTRÊMES';
  if (reason.startsWith('A parlé')) return 'CENSURE';
  if (reason === 'Cochonnet sorti') return 'SORTIE DE PORC';
  if (reason.startsWith('Mission réussie')) return reason.replace('Mission réussie : ', '').toUpperCase();
  if (reason.startsWith('A touché')) return 'BOULE MAUDITE';
  if (reason.includes('gagnante')) return 'KING';
  if (reason === 'Casino : mise gagnée') return 'CASINO +';
  if (reason === 'Casino : mise perdue') return 'CASINO −';
  return reason.toUpperCase();
}

export function buildSteps(
  normalPoints: Record<Team, number>,
  bonuses: { team: Team; value: number; reason: string }[],
  impairResult: { winner: Team; points: number; isOdd: boolean } | null,
  ruleId: string | undefined,
  scoreBefore: Record<Team, number>,
  assurance?: Record<Team, boolean>,
): ScoreStep[] {
  const steps: ScoreStep[] = [];
  let blue = scoreBefore.blue;
  let red = scoreBefore.red;

  const blueNormal = normalPoints.blue;
  const redNormal = normalPoints.red;
  const normalWinner: Team | null = blueNormal > 0 ? 'blue' : redNormal > 0 ? 'red' : null;

  if (blueNormal > 0) {
    blue = Math.max(0, blue + blueNormal);
    steps.push({ badgeLabel: 'SCORE NORMAL', blueDelta: blueNormal, redDelta: 0, blueAfter: blue, redAfter: red });
  } else if (redNormal > 0) {
    red = Math.max(0, red + redNormal);
    steps.push({ badgeLabel: 'SCORE NORMAL', blueDelta: 0, redDelta: redNormal, blueAfter: blue, redAfter: red });
  }

  if (ruleId === 'impair-contre-attaque' && impairResult) {
    const { winner, points, isOdd } = impairResult;
    if (isOdd) {
      const blueDelta = winner === 'blue' ? points : 0;
      const redDelta = winner === 'red' ? points : 0;
      blue = Math.max(0, blue + blueDelta);
      red = Math.max(0, red + redDelta);
      steps.push({ badgeLabel: "L'IMPAIR", blueDelta, redDelta, blueAfter: blue, redAfter: red });
    } else {
      const loser: Team = winner === 'blue' ? 'red' : 'blue';
      const blueDelta = loser === 'blue' ? 1 : 0;
      const redDelta = loser === 'red' ? 1 : 0;
      blue = Math.max(0, blue + blueDelta);
      red = Math.max(0, red + redDelta);
      steps.push({ badgeLabel: "L'IMPAIR", blueDelta, redDelta, blueAfter: blue, redAfter: red });
    }
    return steps;
  }

  if (ruleId === 'assurance-vie' && normalWinner && assurance) {
    const loser: Team = normalWinner === 'blue' ? 'red' : 'blue';
    const blueDelta =
      assurance.blue && normalWinner === 'blue' ? -1 :
      assurance.blue && loser === 'blue' ? 1 :
      0;
    const redDelta =
      assurance.red && normalWinner === 'red' ? -1 :
      assurance.red && loser === 'red' ? 1 :
      0;

    if (blueDelta !== 0 || redDelta !== 0) {
      blue = Math.max(0, blue + blueDelta);
      red = Math.max(0, red + redDelta);
      steps.push({ badgeLabel: 'ASSURANCE', blueDelta, redDelta, blueAfter: blue, redAfter: red });
    }
  }

  for (const bm of bonuses) {
    const blueDelta = bm.team === 'blue' ? bm.value : 0;
    const redDelta = bm.team === 'red' ? bm.value : 0;
    blue = Math.max(0, blue + blueDelta);
    red = Math.max(0, red + redDelta);
    steps.push({ badgeLabel: shortenBadge(bm.reason), blueDelta, redDelta, blueAfter: blue, redAfter: red });
  }

  return steps;
}

// Rows appear top-to-bottom, each row springs in then score increments
const SCORE_DELAY = 380;
const STEP_DURATION = 1050;
const INITIAL_DELAY = 300;
const BUTTON_DELAY = 280;
const MAX_ANIM = 12;
const SLIDE_INITIAL = 52;
const BUTTON_HEIGHT = 102; // GameActionButton minHeight

export function PostRoundView() {
  const navigation = useNavigation<Nav>();
  const { rounds, debugMode, startNewRound, resetGame } = useGameStore();
  const [showCancelSheet, setShowCancelSheet] = useState(false);
  const [visibleCount, setVisibleCount] = useState(0);
  const [displayBlue, setDisplayBlue] = useState(0);
  const [displayRed, setDisplayRed] = useState(0);
  const [buttonReady, setButtonReady] = useState(false);

  const fadeAnims = useRef(
    Array.from({ length: MAX_ANIM }, () => new Animated.Value(0)),
  ).current;
  const slideAnims = useRef(
    Array.from({ length: MAX_ANIM }, () => new Animated.Value(SLIDE_INITIAL)),
  ).current;
  // Button container grows from 0 → BUTTON_HEIGHT, pushing content up
  const buttonHeightAnim = useRef(new Animated.Value(0)).current;

  const lastRound = rounds[rounds.length - 1];
  const scoreBefore: Record<Team, number> =
    rounds.length >= 2 ? rounds[rounds.length - 2].scoreAfter : { blue: 0, red: 0 };

  const steps = useMemo(
    () =>
      lastRound
        ? buildSteps(
            lastRound.normalPoints,
            lastRound.bonuses,
            lastRound.impairResult,
            lastRound.rule?.id,
            scoreBefore,
            lastRound.assurance,
          )
        : [],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lastRound?.number],
  );

  const finalBlue = lastRound?.scoreAfter.blue ?? scoreBefore.blue;
  const finalRed = lastRound?.scoreAfter.red ?? scoreBefore.red;

  const triggerShowButton = () => {
    setButtonReady(true);
    Animated.spring(buttonHeightAnim, {
      toValue: BUTTON_HEIGHT,
      tension: 180,
      friction: 22,
      useNativeDriver: false,
    }).start();
  };

  useEffect(() => {
    setDisplayBlue(scoreBefore.blue);
    setDisplayRed(scoreBefore.red);

    if (steps.length === 0) {
      setDisplayBlue(finalBlue);
      setDisplayRed(finalRed);
      const t = setTimeout(triggerShowButton, BUTTON_DELAY);
      return () => clearTimeout(t);
    }

    const t = setTimeout(() => setVisibleCount(1), INITIAL_DELAY);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (visibleCount === 0) return;

    // Rows appear top-to-bottom: first step first, last step last
    const idx = visibleCount - 1;
    const step = steps[idx];
    if (!step) return;

    // 1. Row springs in from below
    Animated.parallel([
      Animated.timing(fadeAnims[idx], { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.spring(slideAnims[idx], { toValue: 0, tension: 280, friction: 16, useNativeDriver: true }),
    ]).start();

    const isLast = visibleCount === steps.length;

    // 2. Score increments after row settles
    // On the last step, set final score explicitly for correctness
    const scoreTimer = setTimeout(() => {
      if (isLast) {
        setDisplayBlue(finalBlue);
        setDisplayRed(finalRed);
      } else {
        setDisplayBlue((prev) => Math.max(0, prev + step.blueDelta));
        setDisplayRed((prev) => Math.max(0, prev + step.redDelta));
      }
    }, SCORE_DELAY);

    // 3. Advance
    const nextTimer = setTimeout(() => {
      if (!isLast) {
        setVisibleCount((c) => c + 1);
      } else {
        setTimeout(triggerShowButton, BUTTON_DELAY);
      }
    }, STEP_DURATION);

    return () => {
      clearTimeout(scoreTimer);
      clearTimeout(nextTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleCount]);

  const replayAnimation = () => {
    for (let i = 0; i < MAX_ANIM; i++) {
      fadeAnims[i].setValue(0);
      slideAnims[i].setValue(SLIDE_INITIAL);
    }
    buttonHeightAnim.setValue(0);
    setButtonReady(false);
    setDisplayBlue(scoreBefore.blue);
    setDisplayRed(scoreBefore.red);
    setVisibleCount(0);
    setTimeout(() => setVisibleCount(1), 100);
  };

  const handleNext = () => {
    startNewRound();
    if (debugMode) navigation.replace('DebugRuleSelect');
  };

  return (
    <SafeAreaView style={gameScreenStyles.safe} edges={['top', 'bottom']}>
      <CancelGameSheet
        visible={showCancelSheet}
        onConfirm={() => { resetGame(); navigation.replace('Home'); }}
        onCancel={() => setShowCancelSheet(false)}
      />
      <GameTopBar onCancel={() => setShowCancelSheet(true)} />

      {/* Fixed header — outside flex-end content so it never moves */}
      <View style={styles.header}>
        {lastRound?.rule && (
          <Text style={styles.ruleName} numberOfLines={1} testID="post-round-rule-name">
            {lastRound.rule.name}
          </Text>
        )}
        {lastRound && (
          <Text style={styles.roundLabel}>Mène {lastRound.number}</Text>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.scoreBoard}>
          {steps.map((step, i) => (
            <Animated.View
              key={i}
              testID={`post-round-step-label-${i}`}
              style={[
                styles.stepRow,
                { opacity: fadeAnims[i], transform: [{ translateY: slideAnims[i] }] },
              ]}
            >
              <View style={styles.badgeOverlay} pointerEvents="none">
                <View style={styles.badgePill}>
                  <Text style={styles.badgeText} numberOfLines={1}>
                    {step.badgeLabel}
                  </Text>
                </View>
              </View>
              <View style={styles.deltaBlocks}>
                <DeltaBlock value={step.blueDelta} team="blue" />
                <DeltaBlock value={step.redDelta} team="red" />
              </View>
            </Animated.View>
          ))}

          <GameScoreBoard
            scores={{ blue: 0, red: 0 }}
            roundPoints={{ blue: displayBlue, red: displayRed }}
            showRoundBar
            showTotals={false}
            style={styles.totalsRow}
          />
        </View>
      </View>

      {/* Button container grows from 0 → BUTTON_HEIGHT, pushing content up */}
      <Animated.View style={[styles.buttonWrap, { height: buttonHeightAnim }]}
        pointerEvents={buttonReady ? 'auto' : 'none'}
      >
        <GameActionButton
          label="Mène suivante"
          onPress={handleNext}
          testID="next-round-button"
        />
      </Animated.View>

      {/* DEBUG — remove after validation */}
      <TouchableOpacity style={styles.debugBtn} onPress={replayAnimation}>
        <Text style={styles.debugBtnText}>↻ Replay</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function DeltaBlock({ value, team }: { value: number; team: Team }) {
  const isActive = value !== 0;
  const surface = team === 'blue' ? gameUiColors.blueSurface : gameUiColors.redSurface;
  return (
    <View style={[styles.deltaBlock, { backgroundColor: isActive ? surface : gameUiColors.divider }]}>
      <Text style={styles.deltaText}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    width: '100%',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 12,
    alignItems: 'center',
    gap: 2,
  },
  ruleName: {
    color: gameUiColors.primary,
    fontFamily: typography.family.display,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -1.28,
    lineHeight: 54,
    textAlign: 'center',
  },
  roundLabel: {
    color: gameUiColors.muted,
    fontFamily: typography.family.bodySemibold,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    letterSpacing: 0,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 4,
    justifyContent: 'flex-end',
    paddingBottom: 4,
  },
  scoreBoard: {
    width: '100%',
    gap: 2,
  },
  stepRow: {
    width: '100%',
    position: 'relative',
  },
  badgeOverlay: {
    position: 'absolute',
    top: -12,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 2,
  },
  badgePill: {
    borderRadius: 40,
    backgroundColor: gameUiColors.background,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 7,
  },
  badgeText: {
    color: gameUiColors.muted,
    fontFamily: typography.family.bodySemibold,
    fontSize: 14,
    fontWeight: typography.weight.bold,
    lineHeight: 14,
    letterSpacing: 0,
    textAlign: 'center',
  },
  deltaBlocks: {
    flexDirection: 'row',
    gap: 4,
  },
  deltaBlock: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deltaText: {
    color: gameUiColors.white,
    fontFamily: typography.family.bodySemibold,
    fontSize: 25,
    fontWeight: typography.weight.semibold,
    lineHeight: 43,
    textAlign: 'center',
    letterSpacing: -1,
  },
  totalsRow: {
    height: 193,
  },
  buttonWrap: {
    width: '100%',
    overflow: 'hidden',
  },
  debugBtn: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  debugBtnText: {
    color: gameUiColors.white,
    fontFamily: typography.family.bodySemibold,
    fontSize: 14,
  },
});
