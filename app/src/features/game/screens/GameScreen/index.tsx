import React from 'react';
import { useGameStore } from '../../state/gameStore';
import { GameOverView } from './GameOverView';
import { RoundSummaryView } from './RoundSummaryView';
import { SimpleModeView } from './SimpleModeView';
import { PreMeneView } from './PreMeneView';
import { RuleSetupView } from './RuleSetupView';
import { PlayingView } from './PlayingView';

export function GameScreen() {
  const { mode, phase, isGameOver, currentRound } = useGameStore();

  if (isGameOver) return <GameOverView />;

  if (!currentRound && phase === 'round-summary' && mode === 'fantasy') {
    return <RoundSummaryView />;
  }

  if (!currentRound) return null;

  if (mode === 'simple') return <SimpleModeView />;
  if (phase === 'pre-mene') return <PreMeneView />;
  if (phase === 'rule-setup') return <RuleSetupView />;

  return <PlayingView />;
}
