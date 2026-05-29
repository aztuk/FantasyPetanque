import React from 'react';
import { shouldSkipNormalScore } from '../../../../domain/game/engine';
import { Team } from '../../../../domain/game/models';
import { buildBonusMalusFromRound } from '../../../../domain/game/scoring';
import { GameActionButton } from '../../components/GameActionButton';
import { GameDrawer } from '../../components/GameDrawer';
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
    round.rule?.uiType === 'frontiere' ||
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

  const confirmLabel = isCasino || isContrat || isSortieDePorc
    ? 'Confirmer'
    : canFinishRound ? 'Mène terminée' : 'Points manquants';
  const shouldShowDrawerActions = isCasino || renderRuleUIInDrawer;
  const shouldShowDrawerScore = !isCasino && !isSortieDePorc;

  return (
    <GameScreenLayout
      key={round.number}
      scrollTestID="playing-rule-scroll"
      drawer={
        <GameDrawer
          testID="game-drawer"
          actions={shouldShowDrawerActions ? (
            <>
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
            </>
          ) : undefined}
          scoreBoard={shouldShowDrawerScore ? (
            <GameScoreBoard
              scores={scores}
              roundPoints={{ blue: bluePoints, red: redPoints }}
              modifierPoints={modifierPoints}
              roundNumber={round.number}
              variant="drawer"
              onTeamPress={!skipNormal ? handleTeamPress : undefined}
            />
          ) : undefined}
          confirmButton={
            <GameActionButton
              label={confirmLabel}
              onPress={finishRound}
              disabled={!canFinishRound}
              testID="end-round-button"
            />
          }
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
