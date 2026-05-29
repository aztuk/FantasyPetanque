import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../../app/navigation/types';
import { Team } from '../../../../domain/game/models';
import { CancelGameSheet } from '../../../../shared/components/CancelGameSheet';
import { componentSizes, figmaTextStyles, radius } from '../../../../shared/constants';
import { GameActionButton } from '../../components/GameActionButton';
import { GameScoreBoard } from '../../components/GameScoreBoard';
import { GameTopBar } from '../../components/GameTopBar';
import { gameUiColors } from '../../components/gameUiTheme';
import { useGameStore } from '../../state/gameStore';
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
  if (reason === 'Casino : mise perdue') return 'CASINO -';
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

const SCORE_DELAY = 380;
const STEP_DURATION = 1050;
const INITIAL_DELAY = 300;
const BUTTON_DELAY = 280;
const MAX_ANIM = 12;
const SLIDE_INITIAL = 52;
const BUTTON_HEIGHT = componentSizes.gameButtonHeight;

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

    const idx = visibleCount - 1;
    const step = steps[idx];
    if (!step) return;

    Animated.parallel([
      Animated.timing(fadeAnims[idx], { toValue: 1, duration: 100, useNativeDriver: true }),
      Animated.spring(slideAnims[idx], { toValue: 0, tension: 280, friction: 16, useNativeDriver: true }),
    ]).start();

    const isLast = visibleCount === steps.length;

    const scoreTimer = setTimeout(() => {
      if (isLast) {
        setDisplayBlue(finalBlue);
        setDisplayRed(finalRed);
      } else {
        setDisplayBlue((prev) => Math.max(0, prev + step.blueDelta));
        setDisplayRed((prev) => Math.max(0, prev + step.redDelta));
      }
    }, SCORE_DELAY);

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
      <GameTopBar onCancel={() => setShowCancelSheet(true)} floating style={gameScreenStyles.floatingHead} />

      <View style={styles.content}>
        <View style={styles.scoreBoard}>
          <GameScoreBoard
            scores={{ blue: displayBlue, red: displayRed }}
            badgeLabel="Score total"
            variant="totalSummary"
          />

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
        </View>
      </View>

      <Animated.View
        style={[styles.buttonWrap, { height: buttonHeightAnim }]}
        pointerEvents={buttonReady ? 'auto' : 'none'}
      >
        <GameActionButton
          label="Mène suivante"
          onPress={handleNext}
          testID="next-round-button"
        />
      </Animated.View>
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
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-start',
  },
  scoreBoard: {
    width: '100%',
    gap: 4,
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
    borderRadius: radius.pill,
    backgroundColor: gameUiColors.background,
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 7,
  },
  badgeText: {
    ...figmaTextStyles.labels,
    color: gameUiColors.muted,
    textAlign: 'center',
  },
  deltaBlocks: {
    flexDirection: 'row',
    gap: 4,
  },
  deltaBlock: {
    flex: 1,
    height: componentSizes.postRoundStepHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deltaText: {
    ...figmaTextStyles.numberXs40,
    color: gameUiColors.white,
    textAlign: 'center',
  },
  buttonWrap: {
    width: '100%',
    overflow: 'hidden',
  },
});
