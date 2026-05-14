import React from 'react';
import { Team } from '../../../../domain/game/models';
import { useGameStore } from '../../state/gameStore';
import { GameTeamActionRow } from '../GameTeamActionRow';
import { Props } from './shared';

export function SortieDePorc({ round }: Props) {
  const { setSortieDePorc } = useGameStore();

  const handlePress = (team: Team) => {
    setSortieDePorc(round.sortieDePorc === team ? null : team);
  };

  return (
    <GameTeamActionRow
      label="Gagnant"
      onTeamPress={handlePress}
      selectedTeam={round.sortieDePorc}
      unselectedLabelWhenSelected="Perdant"
      teamColorOnlyWhenSelected
      testIDPrefix="sortie-de-porc-winner"
    />
  );
}
