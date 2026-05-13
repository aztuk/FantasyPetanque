import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  LayoutChangeEvent,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import {
  isPreMeneSetupComplete,
  requiresPreMeneSetup,
  shouldSkipNormalScore,
} from '../../../domain/game/engine';
import { Team } from '../../../domain/game/models';
import { GameActionButton } from '../components/GameActionButton';
import { GameHistoryList } from '../components/GameHistoryList';
import { GameScoreBoard } from '../components/GameScoreBoard';
import { GameTopBar } from '../components/GameTopBar';
import { RuleDisplay } from '../components/RuleDisplay';
import { RuleSetupUI, RuleUI } from '../components/RuleUI';
import { useGameStore } from '../state/gameStore';
import { gameUiColors } from '../components/gameUiTheme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

const COMPACT_SCORE_HEIGHT = 59;

function getWinningTeam(scores: Record<Team, number>): Team | null {
  if (scores.blue > scores.red) return 'blue';
  if (scores.red > scores.blue) return 'red';
  return null;
}

export function GameScreen() {
  const navigation = useNavigation<Nav>();
  const {
    mode,
    scores,
    currentRound,
    rounds,
    vetos,
    vetosEnabled,
    phase,
    debugMode,
    isGameOver,
    addNormalPoint,
    undoNormalPoint,
    finishRound,
    startNewRound,
    beginRound,
    useVeto,
    resetGame,
  } = useGameStore();

  const [drawerExpanded, setDrawerExpanded] = useState(true);
  const drawerTranslate = useRef(new Animated.Value(0)).current;
  const drawerExpandedRef = useRef(true);
  const drawerHeightRef = useRef(400);
  const roundNumberRef = useRef<number | null>(null);

  useEffect(() => {
    const roundNumber = currentRound?.number ?? null;
    if (roundNumber !== roundNumberRef.current) {
      roundNumberRef.current = roundNumber;
      drawerTranslate.setValue(0);
      drawerExpandedRef.current = true;
      setDrawerExpanded(true);
    }
  });

  const animateDrawer = (expand: boolean) => {
    if (expand === drawerExpandedRef.current) return;
    drawerExpandedRef.current = expand;
    setDrawerExpanded(expand);
    Animated.timing(drawerTranslate, {
      toValue: expand ? 0 : drawerHeightRef.current - COMPACT_SCORE_HEIGHT,
      duration: 280,
      easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
      useNativeDriver: true,
    }).start();
  };

  const handleDrawerLayout = (e: LayoutChangeEvent) => {
    drawerHeightRef.current = e.nativeEvent.layout.height;
  };

  const round = currentRound;
  const bluePoints = round?.normalPoints.blue ?? 0;
  const redPoints = round?.normalPoints.red ?? 0;
  const scoringTeam: Team | null = bluePoints > 0 ? 'blue' : redPoints > 0 ? 'red' : null;
  const hasNormalPoints = scoringTeam !== null;
  const skipNormal = round ? shouldSkipNormalScore(round) : false;
  const canFinishRound = skipNormal || hasNormalPoints;
  const requiresSetup = round ? requiresPreMeneSetup(round.rule) : false;
  const setupComplete = round ? isPreMeneSetupComplete(round) : true;

  const handleCancelGame = () => {
    Alert.alert(
      'Annuler la partie ?',
      'La partie en cours sera perdue si tu confirmes.',
      [
        { text: 'Continuer', style: 'cancel' },
        {
          text: 'Annuler la partie',
          style: 'destructive',
          onPress: () => {
            resetGame();
            navigation.replace('Home');
          },
        },
      ],
    );
  };

  const handleTeamPress = (team: Team) => {
    const otherTeam = team === 'blue' ? 'red' : 'blue';
    if (scoringTeam === otherTeam) {
      undoNormalPoint();
      return;
    }
    addNormalPoint(team);
  };

  const handleFinishRound = () => {
    finishRound();
    const nextState = useGameStore.getState();

    if (mode === 'simple') {
      if (!nextState.isGameOver) startNewRound();
      return;
    }

    if (!nextState.isGameOver) {
      if (debugMode) {
        startNewRound();
        navigation.replace('DebugRuleSelect');
      } else {
        startNewRound();
      }
    }
  };

  const handleStartNewGame = () => {
    resetGame();
    navigation.navigate('Home');
  };

  const handleVeto = (team: Team) => {
    Alert.alert(
      'Véto',
      `${team === 'blue' ? 'Bleu' : 'Rouge'} utilise son véto. La règle sera changée.`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Confirmer', onPress: () => useVeto(team) },
      ],
    );
  };

  if (isGameOver) {
    const winner = getWinningTeam(scores);

    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <GameTopBar onCancel={handleCancelGame} title="Partie terminée" />
        <View style={styles.endContent}>
          <GameScoreBoard
            scores={scores}
            compact
            showTotals={false}
            badgeLabel={winner ? `${winner === 'blue' ? 'Bleu' : 'Rouge'} gagne` : 'Match nul'}
            badgeTeam={winner}
          />
          <GameHistoryList rounds={rounds} style={styles.endHistory} />
        </View>
        <GameActionButton label="Nouvelle partie" onPress={handleStartNewGame} testID="new-game-button" />
      </SafeAreaView>
    );
  }

  if (!round && phase === 'round-summary' && mode === 'fantasy') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <GameTopBar onCancel={handleCancelGame} />
        <View style={styles.centerContent} />
        <GameActionButton
          label="Commencer"
          onPress={() => {
            startNewRound();
            if (debugMode) navigation.replace('DebugRuleSelect');
          }}
        />
      </SafeAreaView>
    );
  }

  if (!round) return null;

  if (mode === 'simple') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <GameTopBar onCancel={handleCancelGame} />
        <View style={styles.content}>
          <GameHistoryList rounds={rounds} orientation="bottom" style={styles.simpleHistory} />
          <GameScoreBoard
            scores={scores}
            roundPoints={{ blue: bluePoints, red: redPoints }}
            roundNumber={round.number}
            onTeamPress={handleTeamPress}
          />
        </View>
        <GameActionButton
          label={canFinishRound ? 'Mène terminée' : 'Points manquants'}
          onPress={handleFinishRound}
          disabled={!canFinishRound}
          testID="end-round-button"
        />
      </SafeAreaView>
    );
  }

  if (phase === 'pre-mene') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <GameTopBar onCancel={handleCancelGame} />
        <View style={styles.centerContent}>
          {round.rule && (
            <RuleDisplay
              rule={round.rule}
              immuneTeam={round.totemImmuneTeam}
              style={styles.preMeneRule}
            />
          )}
        </View>

        {vetosEnabled && (
          <View style={styles.vetoRow}>
            {(['blue', 'red'] as const).map((team) => (
              <GameActionButton
                key={team}
                label={vetos[team] ? 'Veto' : 'Utilisé'}
                onPress={() => handleVeto(team)}
                disabled={!vetos[team]}
                variant={vetos[team] ? team : 'muted'}
                style={styles.vetoButton}
                testID={`veto-${team}-button`}
              />
            ))}
          </View>
        )}

        <GameActionButton
          label={requiresSetup ? 'Configurer' : 'Commencer'}
          onPress={beginRound}
          testID="begin-round-button"
        />
      </SafeAreaView>
    );
  }

  if (phase === 'rule-setup') {
    return (
      <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
        <GameTopBar onCancel={handleCancelGame} />
        <ScrollView
          style={styles.ruleSetupContent}
          contentContainerStyle={styles.ruleSetupScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {round.rule && (
            <RuleDisplay
              rule={round.rule}
              immuneTeam={round.totemImmuneTeam}
              style={styles.preMeneRule}
            />
          )}
          <RuleSetupUI round={round} />
        </ScrollView>
        <GameActionButton
          label={setupComplete ? 'Commencer' : 'Choix manquants'}
          onPress={beginRound}
          disabled={!setupComplete}
          testID="confirm-rule-setup-button"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <GameTopBar onCancel={handleCancelGame} />
      <View style={styles.fantasyContent}>
        {/* Zone règle — touch ou scroll → état lecture */}
        <View style={styles.ruleArea} onTouchStart={() => animateDrawer(false)}>
          <ScrollView
            style={StyleSheet.absoluteFill}
            contentContainerStyle={styles.ruleScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {round.rule && (
              <RuleDisplay rule={round.rule} immuneTeam={round.totemImmuneTeam} />
            )}
            <RuleUI round={round} />
          </ScrollView>
        </View>

        {/* Gradient */}
        <View pointerEvents="none" style={styles.drawerGradient}>
          <LinearGradient
            colors={['transparent', gameUiColors.background]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        {/* Drawer — touch → état score */}
        <Animated.View
          style={[styles.drawer, { transform: [{ translateY: drawerTranslate }] }]}
          onLayout={handleDrawerLayout}
          onTouchStart={() => animateDrawer(true)}
        >
          <GameScoreBoard
            scores={scores}
            roundPoints={drawerExpanded ? { blue: bluePoints, red: redPoints } : undefined}
            roundNumber={round.number}
            onTeamPress={drawerExpanded && !skipNormal ? handleTeamPress : undefined}
          />
          <GameActionButton
            label={canFinishRound ? 'Mène terminée' : 'Points manquants'}
            onPress={handleFinishRound}
            disabled={!canFinishRound}
            testID="end-round-button"
          />
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: gameUiColors.background,
  },
  content: {
    flex: 1,
    width: '100%',
    justifyContent: 'flex-end',
  },
  fantasyContent: {
    flex: 1,
    width: '100%',
  },
  centerContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ruleSetupContent: {
    flex: 1,
    width: '100%',
  },
  ruleSetupScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  simpleHistory: {
    flex: 1,
  },
  ruleArea: {
    flex: 1,
    width: '100%',
  },
  ruleScrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingBottom: COMPACT_SCORE_HEIGHT + 20,
  },
  drawer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerGradient: {
    position: 'absolute',
    bottom: COMPACT_SCORE_HEIGHT,
    left: 0,
    right: 0,
    height: 80,
  },
  preMeneRule: {
    marginTop: -16,
  },
  vetoRow: {
    width: '100%',
    flexDirection: 'row',
    gap: 4,
  },
  vetoButton: {
    flex: 1,
  },
  endContent: {
    flex: 1,
    width: '100%',
  },
  endHistory: {
    flex: 1,
  },
});
