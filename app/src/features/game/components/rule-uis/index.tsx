import React from 'react';
import { Props } from './shared';
import { BonusButtonsUI } from './BonusButtonsUI';
import { MalusButtonsUI } from './MalusButtonsUI';
import { SortieDePorc } from './SortieDePorc';
import { ContratSetupUI, ContratResolutionUI } from './ContratUI';
import { AssuranceVieSetupUI, AssuranceVieReminderUI } from './AssuranceVieUI';
import { FrontiereSetupUI, FrontiereReminderUI } from './FrontiereUI';
import { CasinoUI } from './CasinoUI';
import { PredictionUI } from './PredictionUI';
import { TotemUI } from './TotemUI';
import { ImpairUI } from './ImpairUI';

export function RuleUI({ round }: Props) {
  const rule = round.rule;
  if (!rule) return null;

  switch (rule.uiType) {
    case 'bonus-buttons': return <BonusButtonsUI round={round} />;
    case 'malus-buttons': return <MalusButtonsUI round={round} />;
    case 'cochonnet-sorti': return <SortieDePorc round={round} />;
    case 'contrat': return <ContratResolutionUI round={round} />;
    case 'assurance-vie': return <AssuranceVieReminderUI round={round} />;
    case 'frontiere': return <FrontiereReminderUI round={round} />;
    case 'casino': return <CasinoUI round={round} />;
    case 'prediction': return <PredictionUI round={round} />;
    case 'totem': return <TotemUI round={round} />;
    case 'impair': return <ImpairUI />;
    default: return null;
  }
}

export function RuleSetupUI({ round }: Props) {
  const rule = round.rule;
  if (!rule) return null;

  switch (rule.uiType) {
    case 'contrat': return <ContratSetupUI round={round} />;
    case 'assurance-vie': return <AssuranceVieSetupUI round={round} />;
    case 'frontiere': return <FrontiereSetupUI round={round} />;
    default: return null;
  }
}
