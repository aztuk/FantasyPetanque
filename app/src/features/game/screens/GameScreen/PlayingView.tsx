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
import { RootStackParamList } from '../../../../app/navigation/types';
import { shouldSkipNormalScore } from '../../../../domain/game/engine';
import { Team } from '../../../../domain/game/models';
import { GameActionButton } from '../../components/GameActionButton';
import { GameScoreBoard } from '../../components/GameScoreBoard';
import { GameTopBar } from '../../components/GameTopBar';
import { RuleDisplay } from '../../components/RuleDisplay';
import { RuleUI } from '../../components/RuleUI';
import { useGameStore } from '../../state/gameStore';
import { gameUiColors } from '../../components/gameUiTheme';
import { gameScreenStyles, COMPACT_SCORE_HEIGHT } from './gameScreenStyles';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

export function PlayingView() {
  const navigation = useNavigation<Nav>();
  const {
    mode,
    scores,
    currentRound,
    debugMode,
    addNormalPoint,
    undoNormalPoint,
    finishRound,
    startNewRound,
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

  const round = currentRound!;
  const bluePoints = round.normalPoints.blue;
  const redPoints = round.normalPoints.red;
  const scoringTeam: Team | null = bluePoints > 0 ? 'blue' : redPoints > 0 ? 'red' : null;
  const skipNormal = shouldSkipNormalScore(round);
  const canFinishRound = skipNormal || scoringTeam !== null;

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
    if (!nextState.isGameOver) {
      if (debugMode) {
        startNewRound();
        navigation.replace('DebugRuleSelect');
      } else {
        startNewRound();
      }
    }
  };

  return (
    <SafeAreaView style={gameScreenStyles.safe} edges={['top', 'bottom']}>
      <GameTopBar onCancel={handleCancelGame} />
      <View style={gameScreenStyles.fantasyContent}>
        <View style={gameScreenStyles.ruleArea} onTouchStart={() => animateDrawer(false)}>
          <ScrollView
            style={StyleSheet.absoluteFill}
            contentContainerStyle={gameScreenStyles.ruleScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {round.rule && (
              <RuleDisplay rule={round.rule} immuneTeam={round.totemImmuneTeam} />
            )}
            <RuleUI round={round} />
          </ScrollView>
        </View>

        <View pointerEvents="none" style={gameScreenStyles.drawerGradient}>
          <LinearGradient
            colors={['transparent', gameUiColors.background]}
            style={StyleSheet.absoluteFill}
          />
        </View>

        <Animated.View
          style={[gameScreenStyles.drawer, { transform: [{ translateY: drawerTranslate }] }]}
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
