import React from 'react';
import { Props } from './shared';
import { BonusButtonsUI } from './BonusButtonsUI';
import { MalusButtonsUI } from './MalusButtonsUI';
import { SortieDePorc } from './SortieDePorc';
import { ContratSetupUI, ContratResolutionUI } from './ContratUI';
import { AssuranceVieSetupUI, AssuranceVieReminderUI } from './AssuranceVieUI';
import { FrontiereSetupUI, FrontiereReminderUI } from './FrontiereUI';
import { CasinoResolutionUI, CasinoSetupUI } from './CasinoUI';
import { PredictionUI, PredictionSetupUI } from './PredictionUI';
import { TotemUI } from './TotemUI';

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
    case 'casino': return <CasinoResolutionUI round={round} />;
    case 'prediction': return <PredictionUI round={round} />;
    case 'totem': return <TotemUI round={round} />;
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
    case 'casino': return <CasinoSetupUI round={round} />;
    case 'prediction': return <PredictionSetupUI round={round} />;
    default: return null;
  }
}
