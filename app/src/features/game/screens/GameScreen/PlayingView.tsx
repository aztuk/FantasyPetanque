import React, { useEffect, useRef, useState } from 'react';
import {
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
import { buildBonusMalusFromRound } from '../../../../domain/game/scoring';
import { CancelGameSheet } from '../../../../shared/components/CancelGameSheet';
import { GameActionButton } from '../../components/GameActionButton';
import { GameScoreBoard } from '../../components/GameScoreBoard';
import { GameTeamActionRow } from '../../components/GameTeamActionRow';
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
    addNormalPoint,
    undoNormalPoint,
    finishRound,
    resetGame,
    setCasinoWinner,
  } = useGameStore();

  const [showCancelSheet, setShowCancelSheet] = useState(false);
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
  const modifierPoints = buildBonusMalusFromRound(round).reduce(
    (acc, item) => {
      acc[item.team] += item.value;
      return acc;
    },
    { blue: 0, red: 0 } as Record<Team, number>,
  );
  const scoringTeam: Team | null = bluePoints > 0 ? 'blue' : redPoints > 0 ? 'red' : null;
  const skipNormal = shouldSkipNormalScore(round);
  const isCasino = round.rule?.id === 'casino';
  const isSortieDePorc = round.rule?.id === 'sortie-de-porc';
  const usesWinnerConfirmation = isCasino || isSortieDePorc;
  const hasWinnerSelection = isCasino ? round.casinoWinner !== null : round.sortieDePorc !== null;
  const renderRuleUIInDrawer =
    round.rule?.uiType === 'cochonnet-sorti' ||
    round.rule?.uiType === 'bonus-buttons' ||
    round.rule?.uiType === 'malus-buttons';
  const canFinishRound = usesWinnerConfirmation ? hasWinnerSelection : skipNormal || scoringTeam !== null;

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
    // GameScreen will route to PostRoundView (phase 'round-summary')
    // PostRoundView.handleNext calls startNewRound() and navigates to DebugRuleSelect if needed
  };

  return (
    <SafeAreaView style={gameScreenStyles.safe} edges={['top', 'bottom']}>
      <CancelGameSheet
        visible={showCancelSheet}
        onConfirm={() => { resetGame(); navigation.replace('Home'); }}
        onCancel={() => setShowCancelSheet(false)}
      />
      <GameTopBar onCancel={() => setShowCancelSheet(true)} />
      <View style={gameScreenStyles.fantasyContent}>
        <View style={gameScreenStyles.ruleArea} onTouchStart={() => { if (!usesWinnerConfirmation) animateDrawer(false); }}>
          <ScrollView
            style={StyleSheet.absoluteFill}
            contentContainerStyle={[
              gameScreenStyles.ruleScrollContent,
              usesWinnerConfirmation && gameScreenStyles.casinoRuleScrollContent,
            ]}
            showsVerticalScrollIndicator={false}
          >
            {round.rule && (
              <RuleDisplay rule={round.rule} immuneTeam={round.totemImmuneTeam} />
            )}
            {!renderRuleUIInDrawer && <RuleUI round={round} />}
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
          onTouchStart={() => { if (!usesWinnerConfirmation) animateDrawer(true); }}
        >
          <View pointerEvents={drawerExpanded ? 'auto' : 'none'}>
            {isCasino && (
              <GameTeamActionRow
                label="Gagnant"
                onTeamPress={setCasinoWinner}
                selectedTeam={round.casinoWinner}
                unselectedLabelWhenSelected="Perdant"
                teamColorOnlyWhenSelected
                testIDPrefix="casino-winner"
              />
            )}
            {renderRuleUIInDrawer && <RuleUI round={round} />}
            {(isCasino || renderRuleUIInDrawer) && <View style={gameScreenStyles.actionScoreGap} />}
            {isSortieDePorc ? (
              <>
                <GameScoreBoard
                  scores={scores}
                  roundNumber={round.number}
                  showRoundBar={false}
                />
                <GameActionButton
                  label="Confirmer"
                  onPress={handleFinishRound}
                  disabled={!canFinishRound}
                  testID="end-round-button"
                />
              </>
            ) : (
              <>
                <GameScoreBoard
                  scores={scores}
                  roundPoints={!isCasino && drawerExpanded ? { blue: bluePoints, red: redPoints } : undefined}
                  modifierPoints={!isCasino && drawerExpanded ? modifierPoints : undefined}
                  roundNumber={round.number}
                  showRoundBar={!isCasino}
                  onTeamPress={drawerExpanded && !skipNormal ? handleTeamPress : undefined}
                />
                <GameActionButton
                  label={isCasino ? 'Confirmer' : canFinishRound ? 'Mène terminée' : 'Points manquants'}
                  onPress={handleFinishRound}
                  disabled={!canFinishRound}
                  testID="end-round-button"
                />
              </>
            )}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}
