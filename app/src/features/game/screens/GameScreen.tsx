import React from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../app/navigation/types';
import { shouldSkipNormalScore } from '../../../domain/game/engine';
import { Team } from '../../../domain/game/models';
import { GameActionButton } from '../components/GameActionButton';
import { GameHistoryList } from '../components/GameHistoryList';
import { GameScoreBoard } from '../components/GameScoreBoard';
import { GameTopBar } from '../components/GameTopBar';
import { RuleDisplay } from '../components/RuleDisplay';
import { RuleUI } from '../components/RuleUI';
import { useGameStore } from '../state/gameStore';
import { gameUiColors } from '../components/gameUiTheme';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Game'>;

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

  const round = currentRound;
  const bluePoints = round?.normalPoints.blue ?? 0;
  const redPoints = round?.normalPoints.red ?? 0;
  const scoringTeam: Team | null = bluePoints > 0 ? 'blue' : redPoints > 0 ? 'red' : null;
  const hasNormalPoints = scoringTeam !== null;
  const skipNormal = round ? shouldSkipNormalScore(round) : false;
  const canFinishRound = skipNormal || hasNormalPoints;

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

        <GameActionButton label="Commencer" onPress={beginRound} testID="begin-round-button" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <GameTopBar onCancel={handleCancelGame} />
      <View style={styles.content}>
        <View style={styles.fantasyMain}>
          {round.rule && (
            <RuleDisplay rule={round.rule} immuneTeam={round.totemImmuneTeam} />
          )}
          <RuleUI round={round} />
        </View>

        <GameScoreBoard
          scores={scores}
          roundPoints={{ blue: bluePoints, red: redPoints }}
          roundNumber={round.number}
          onTeamPress={skipNormal ? undefined : handleTeamPress}
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
  centerContent: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simpleHistory: {
    flex: 1,
  },
  fantasyMain: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 0,
    paddingVertical: 20,
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
