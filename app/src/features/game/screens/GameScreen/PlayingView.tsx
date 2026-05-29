import React from 'react';
import { View } from 'react-native';
import { shouldSkipNormalScore } from '../../../../domain/game/engine';
import { Team } from '../../../../domain/game/models';
import { buildBonusMalusFromRound } from '../../../../domain/game/scoring';
import { GameActionButton } from '../../components/GameActionButton';
import { GameScoreBoard } from '../../components/GameScoreBoard';
import { GameTeamActionRow } from '../../components/GameTeamActionRow';
import { RuleDisplay } from '../../components/RuleDisplay';
import { RuleUI } from '../../components/RuleUI';
import { useGameStore } from '../../state/gameStore';
import { GameScreenLayout } from '../GameScreenLayout';

export function PlayingView() {
  const {
    scores,
    currentRound,
    addNormalPoint,
    undoNormalPoint,
    finishRound,
    setCasinoWinner,
  } = useGameStore();

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
  const isContrat = round.rule?.id === 'contrat';
  const isSortieDePorc = round.rule?.id === 'sortie-de-porc';
  const usesWinnerConfirmation = isCasino || isSortieDePorc;
  const hasWinnerSelection = isCasino ? round.casinoWinner !== null : round.sortieDePorc !== null;
  const renderRuleUIInDrawer =
    round.rule?.uiType === 'cochonnet-sorti' ||
    round.rule?.uiType === 'contrat' ||
    round.rule?.uiType === 'assurance-vie' ||
    round.rule?.uiType === 'bonus-buttons' ||
    round.rule?.uiType === 'malus-buttons';
  const alwaysExpanded = usesWinnerConfirmation || renderRuleUIInDrawer;
  const canFinishRound = usesWinnerConfirmation ? hasWinnerSelection : skipNormal || scoringTeam !== null;

  const handleTeamPress = (team: Team) => {
    const otherTeam = team === 'blue' ? 'red' : 'blue';
    if (scoringTeam === otherTeam) {
      undoNormalPoint();
      return;
    }
    addNormalPoint(team);
  };

  const confirmLabel = isCasino || isContrat || isSortieDePorc
    ? 'Confirmer'
    : canFinishRound ? 'Mène terminée' : 'Points manquants';

  if (alwaysExpanded) {
    return (
      <GameScreenLayout
        scrollTestID="playing-rule-scroll"
        drawerTotalScore={
          <View style={{ gap: 4 }}>
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
            <GameScoreBoard
              scores={scores}
              roundPoints={!isCasino && !isSortieDePorc ? { blue: bluePoints, red: redPoints } : undefined}
              modifierPoints={!isCasino && !isSortieDePorc ? modifierPoints : undefined}
              roundNumber={round.number}
              showRoundBar={!isCasino && !isSortieDePorc}
              onTeamPress={!skipNormal && !isCasino && !isSortieDePorc ? handleTeamPress : undefined}
            />
          </View>
        }
        drawerConfirmButton={
          <GameActionButton
            label={confirmLabel}
            onPress={finishRound}
            disabled={!canFinishRound}
            testID="end-round-button"
          />
        }
      >
        {round.rule && (
          <RuleDisplay
            rule={round.rule}
            immuneTeam={round.totemImmuneTeam}
          />
        )}
        {!renderRuleUIInDrawer && <RuleUI round={round} />}
      </GameScreenLayout>
    );
  }

  // Normal collapsible case — key resets drawer state on new round
  return (
    <GameScreenLayout
      key={round.number}
      scrollTestID="playing-rule-scroll"
      drawerMeneScore={
        <GameScoreBoard
          scores={scores}
          roundPoints={{ blue: bluePoints, red: redPoints }}
          modifierPoints={modifierPoints}
          showRoundBar
          showTotals={false}
          onTeamPress={!skipNormal ? handleTeamPress : undefined}
        />
      }
      drawerTotalScore={
        <GameScoreBoard
          scores={scores}
          roundNumber={round.number}
          showRoundBar={false}
        />
      }
      drawerConfirmButton={
        <GameActionButton
          label={canFinishRound ? 'Mène terminée' : 'Points manquants'}
          onPress={finishRound}
          disabled={!canFinishRound}
          testID="end-round-button"
        />
      }
      collapsible
    >
      {round.rule && (
        <RuleDisplay
          rule={round.rule}
          immuneTeam={round.totemImmuneTeam}
        />
      )}
      <RuleUI round={round} />
    </GameScreenLayout>
  );
}
