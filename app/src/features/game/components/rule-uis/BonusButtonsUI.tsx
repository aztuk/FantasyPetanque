import React from 'react';
import { Team } from '../../../../domain/game/models';
import { GameTeamActionRow } from '../GameTeamActionRow';
import { useGameStore } from '../../state/gameStore';
import { Props } from './shared';

type BonusRuleId = 'gauche-caviar' | 'les-extremes' | 'king-of-the-hill';

const ACTION_LABELS: Record<BonusRuleId, string> = {
  'gauche-caviar': 'Tir réussi',
  'les-extremes': 'Placement réussi',
  'king-of-the-hill': 'Boule gagnante',
};

const MAXED_LABELS: Record<BonusRuleId, string> = {
  'gauche-caviar': 'Bravo!',
  'les-extremes': 'Bravo!',
  'king-of-the-hill': 'Au sommet!',
};

export function BonusButtonsUI({ round }: Props) {
  const { addBonus, removeBonus } = useGameStore();
  const ruleId = round.rule!.id as BonusRuleId;
  const max = round.rule!.maxBonusPerTeam ?? 1;

  const getBonusState = (team: Team): boolean | number => {
    if (ruleId === 'king-of-the-hill') return round.kingBonus[team];
    if (ruleId === 'gauche-caviar') return round.gaucheBonus[team];
    if (ruleId === 'les-extremes') return round.extremesBonus[team];
    return false;
  };

  const getCount = (team: Team): number => {
    const bonusState = getBonusState(team);
    return typeof bonusState === 'number' ? bonusState : (bonusState ? 1 : 0);
  };

  const otherTeam = (team: Team): Team => (team === 'blue' ? 'red' : 'blue');

  const isKingCancelMode = (team: Team): boolean =>
    ruleId === 'king-of-the-hill' && getCount(otherTeam(team)) > 0 && getCount(team) === 0;

  const labels = (['blue', 'red'] as const).reduce((acc, team) => {
    if (isKingCancelMode(team)) {
      acc[team] = 'Retirer';
    } else {
      const count = getCount(team);
      acc[team] = count >= max ? MAXED_LABELS[ruleId] : ACTION_LABELS[ruleId];
    }
    return acc;
  }, {} as Record<Team, string>);

  const activeTeams = {
    blue: getCount('blue') >= max,
    red: getCount('red') >= max,
  };

  const handlePress = (team: Team) => {
    if (isKingCancelMode(team)) {
      removeBonus(otherTeam(team), ruleId);
      return;
    }

    if (getCount(team) >= max) {
      removeBonus(team, ruleId);
      return;
    }

    addBonus(team, ruleId);
  };

  const handleLongPress = (team: Team) => {
    if (getCount(team) > 0) removeBonus(team, ruleId);
  };

  return (
    <GameTeamActionRow
      label={labels}
      activeTeams={activeTeams}
      onTeamPress={handlePress}
      onTeamLongPress={handleLongPress}
      testIDPrefix={`${ruleId}-bonus`}
    />
  );
}
