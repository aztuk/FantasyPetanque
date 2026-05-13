import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { RoundState } from '../../../domain/game/models';
import { typography } from '../../../shared/constants';
import { gameUiColors, gameUiMotion } from './gameUiTheme';

interface Props {
  rounds: RoundState[];
  orientation?: 'top' | 'bottom';
  style?: StyleProp<ViewStyle>;
  animateNewItems?: boolean;
}

const HISTORY_ITEM_HEIGHT = 51;
const premiumEasing = Easing.bezier(...gameUiMotion.curves.premium);

function getRoundScore(round: RoundState, rounds: RoundState[]) {
  const fallback = { blue: 0, red: 0 };
  return round.scoreAfter ?? rounds[round.number - 2]?.scoreAfter ?? fallback;
}

function formatRoundNumber(number: number) {
  return `Mène ${String(number).padStart(2, '0')}`;
}

interface GameHistoryItemProps {
  round: RoundState;
  rounds: RoundState[];
  animateEntry?: boolean;
}

export function GameHistoryItem({ round, rounds, animateEntry = false }: GameHistoryItemProps) {
  const score = getRoundScore(round, rounds);
  const { width } = useWindowDimensions();
  const spaceProgress = useRef(new Animated.Value(animateEntry ? 0 : 1)).current;
  const transferProgress = useRef(new Animated.Value(animateEntry ? 0 : 1)).current;
  const finalProgress = useRef(new Animated.Value(animateEntry ? 0 : 1)).current;
  const reflectionProgress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!animateEntry) return undefined;

    const animation = Animated.sequence([
      Animated.timing(spaceProgress, {
        toValue: 1,
        duration: 150,
        easing: premiumEasing,
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(transferProgress, {
          toValue: 1,
          duration: 260,
          easing: premiumEasing,
          useNativeDriver: true,
        }),
        Animated.timing(finalProgress, {
          toValue: 1,
          duration: 220,
          delay: 90,
          easing: premiumEasing,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(reflectionProgress, {
        toValue: 1,
        duration: 720,
        easing: premiumEasing,
        useNativeDriver: true,
      }),
    ]);

    animation.start();
    return () => animation.stop();
  }, [animateEntry, finalProgress, reflectionProgress, spaceProgress, transferProgress]);

  const itemHeight = spaceProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, HISTORY_ITEM_HEIGHT],
  });
  const transferStyle = animateEntry ? {
    opacity: transferProgress,
    transform: [
      {
        translateY: transferProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [HISTORY_ITEM_HEIGHT, 0],
        }),
      },
      {
        scale: transferProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [1.2, 1],
        }),
      },
    ],
  } : null;
  const finalStyle = animateEntry ? {
    opacity: finalProgress,
    transform: [
      {
        translateY: finalProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [12, 0],
        }),
      },
    ],
  } : null;
  const reflectionStyle = {
    opacity: reflectionProgress.interpolate({
      inputRange: [0, 0.18, 0.82, 1],
      outputRange: [0, 0.16, 0.16, 0],
    }),
    transform: [
      {
        translateX: reflectionProgress.interpolate({
          inputRange: [0, 1],
          outputRange: [-150, width + 150],
        }),
      },
      { rotateZ: '-12deg' },
    ],
  };

  return (
    <Animated.View
      style={[
        animateEntry ? styles.animatedItemClip : styles.itemClip,
        animateEntry ? { height: itemHeight } : null,
      ]}
      testID={animateEntry ? 'game-history-animated-item' : undefined}
    >
      <View style={styles.item}>
        <Animated.Text style={[styles.score, styles.blue, transferStyle, finalStyle]}>
          {score.blue}
        </Animated.Text>
        <Animated.Text style={[styles.roundLabel, transferStyle, finalStyle]}>
          {formatRoundNumber(round.number)}
        </Animated.Text>
        <Animated.Text style={[styles.score, styles.red, transferStyle, finalStyle]}>
          {score.red}
        </Animated.Text>
        {animateEntry && (
          <Animated.View pointerEvents="none" style={[styles.itemReflection, reflectionStyle]}>
            <LinearGradient
              colors={[
                'rgba(231,194,65,0)',
                'rgba(231,194,65,0.22)',
                'rgba(255,238,170,0.34)',
                'rgba(231,194,65,0.22)',
                'rgba(231,194,65,0)',
              ]}
              locations={[0, 0.28, 0.5, 0.72, 1]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={styles.itemReflectionGradient}
              testID="game-history-item-reflection"
            />
          </Animated.View>
        )}
      </View>
    </Animated.View>
  );
}

export function GameHistoryList({
  rounds,
  orientation = 'top',
  style,
  animateNewItems = process.env.NODE_ENV !== 'test',
}: Props) {
  const scrollRef = useRef<ScrollView>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);
  const previousLastRoundRef = useRef(rounds.length > 0 ? rounds[rounds.length - 1].number : 0);
  const animatedRoundRef = useRef<number | null>(null);
  const lastRoundNumber = rounds.length > 0 ? rounds[rounds.length - 1].number : null;
  const orderedRounds = rounds;
  const shouldKeepLatestVisible = orientation === 'bottom';
  const scrollToLatestRound = useCallback(() => {
    if (!shouldKeepLatestVisible) return;
    scrollRef.current?.scrollToEnd({ animated: false });
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
      frameRef.current = null;
    });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: false });
      timeoutRef.current = null;
    }, 50);
  }, [shouldKeepLatestVisible]);

  useEffect(() => {
    scrollToLatestRound();
  }, [rounds.length, scrollToLatestRound]);

  if (
    animateNewItems &&
    shouldKeepLatestVisible &&
    lastRoundNumber !== null &&
    lastRoundNumber > previousLastRoundRef.current
  ) {
    animatedRoundRef.current = lastRoundNumber;
  }
  previousLastRoundRef.current = lastRoundNumber ?? 0;

  useEffect(() => () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
  }, []);

  const contentStyle = [
    styles.content,
    shouldKeepLatestVisible ? styles.bottomContent : styles.topContent,
  ];

  return (
    <View style={[styles.container, shouldKeepLatestVisible && styles.bottomContainer, style]}>
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={contentStyle}
        onContentSizeChange={scrollToLatestRound}
        onLayout={scrollToLatestRound}
        showsVerticalScrollIndicator={false}
        testID={shouldKeepLatestVisible ? 'game-history-bottom-list' : 'game-history-list'}
      >
        {orderedRounds.map((round) => (
          <GameHistoryItem
            key={round.number}
            round={round}
            rounds={rounds}
            animateEntry={animateNewItems && shouldKeepLatestVisible && animatedRoundRef.current === round.number}
          />
        ))}
      </ScrollView>
      {shouldKeepLatestVisible && (
        <LinearGradient
          colors={[gameUiColors.background, 'rgba(40,38,31,0)']}
          pointerEvents="none"
          style={styles.topFade}
          testID="game-history-top-fade"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
  },
  bottomContainer: {
    marginBottom: 24,
  },
  scroll: {
    flex: 1,
  },
  content: {
    width: '100%',
  },
  topContent: {
    paddingTop: 24,
    paddingBottom: 4,
  },
  bottomContent: {
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  topFade: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 44,
  },
  itemClip: {
    height: HISTORY_ITEM_HEIGHT,
    overflow: 'hidden',
  },
  animatedItemClip: {
    overflow: 'hidden',
  },
  item: {
    minHeight: HISTORY_ITEM_HEIGHT,
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: gameUiColors.divider,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  itemReflection: {
    position: 'absolute',
    top: -20,
    bottom: -20,
    width: 110,
  },
  itemReflectionGradient: {
    flex: 1,
  },
  score: {
    flex: 1,
    fontFamily: typography.family.bodySemibold,
    fontSize: 25,
    lineHeight: 43,
    fontWeight: typography.weight.semibold,
    textAlign: 'center',
    letterSpacing: 0,
  },
  blue: {
    color: gameUiColors.blueText,
  },
  red: {
    color: gameUiColors.redText,
  },
  roundLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
    color: gameUiColors.muted,
    fontFamily: typography.family.body,
    fontSize: 18,
    lineHeight: 31,
    fontWeight: typography.weight.medium,
    textAlign: 'center',
    letterSpacing: 0,
  },
});
