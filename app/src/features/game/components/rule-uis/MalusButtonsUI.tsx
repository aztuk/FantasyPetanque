import React from 'react';
import { Team } from '../../../../domain/game/models';
import { GameTeamActionRow } from '../GameTeamActionRow';
import { useGameStore } from '../../state/gameStore';
import { Props } from './shared';

function makeCensureLabel(count: number, max: number): string {
  if (count >= max) return 'Mais chut!';
  return `Mot prononcé: ${count}`;
}

function makeBouleMauditeLabel(hit: boolean): string {
  return hit ? 'Fallait mieux viser' : 'Boule touchée';
}

export function MalusButtonsUI({ round }: Props) {
  const { addCensureMalus, removeCensureMalus, setBouleMauditeHit } = useGameStore();
  const ruleId = round.rule!.id;

  if (ruleId === 'censure') {
    const max = round.rule!.maxMalusPerTeam ?? 3;
    const labels: Record<Team, string> = {
      blue: makeCensureLabel(round.censureMalus.blue, max),
      red: makeCensureLabel(round.censureMalus.red, max),
    };
    const activeTeams = {
      blue: round.censureMalus.blue >= max,
      red: round.censureMalus.red >= max,
    };

    const handlePress = (team: Team) => {
      if (round.censureMalus[team] >= max) {
        removeCensureMalus(team);
        return;
      }

      addCensureMalus(team);
    };

    const handleLongPress = (team: Team) => {
      if (round.censureMalus[team] > 0) removeCensureMalus(team);
    };

    return (
      <GameTeamActionRow
        label={labels}
        activeTeams={activeTeams}
        onTeamPress={handlePress}
        onTeamLongPress={handleLongPress}
        testIDPrefix="censure-malus"
      />
    );
  }

  if (ruleId === 'boule-maudite') {
    const labels: Record<Team, string> = {
      blue: makeBouleMauditeLabel(round.boucleMauditeHit.blue),
      red: makeBouleMauditeLabel(round.boucleMauditeHit.red),
    };
    const activeTeams = {
      blue: round.boucleMauditeHit.blue,
      red: round.boucleMauditeHit.red,
    };

    const handlePress = (team: Team) => {
      setBouleMauditeHit(team, !round.boucleMauditeHit[team]);
    };

    return (
      <GameTeamActionRow
        label={labels}
        activeTeams={activeTeams}
        onTeamPress={handlePress}
        testIDPrefix="boule-maudite-malus"
      />
    );
  }

  return null;
}
