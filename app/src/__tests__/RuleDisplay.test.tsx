import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Rule } from '../domain/game/models';
import { RuleDisplay, parseRuleDescription } from '../features/game/components/RuleDisplay';
import { gameUiColors } from '../features/game/components/gameUiTheme';

const baseRule: Rule = {
  id: 'test-rule',
  name: 'Règle test',
  description: '',
  shortDescription: 'Test',
  tags: [],
  uiType: 'none',
};

describe('parseRuleDescription', () => {
  it('parses bold and actual line breaks', () => {
    expect(parseRuleDescription('Gagne <b>+1 bonus</b>.\nMaximum 1.')).toEqual([
      { text: 'Gagne ', bold: false },
      { text: '+1 bonus', bold: true },
      { text: '.\nMaximum 1.', bold: false },
    ]);
  });

  it('turns escaped line break markers into rendered line breaks', () => {
    expect(parseRuleDescription('Première ligne\\nDeuxième ligne')).toEqual([
      { text: 'Première ligne\nDeuxième ligne', bold: false },
    ]);
  });
});

describe('RuleDisplay', () => {
  it('renders rich rule descriptions without showing bold markup tags', () => {
    render(
      <RuleDisplay
        rule={{
          ...baseRule,
          description: 'Gagne <b>+1 bonus</b>. Auto-arbitrage.',
        }}
      />,
    );

    expect(screen.getByText('Règle test')).toBeTruthy();
    expect(screen.getByText('+1 bonus')).toBeTruthy();
    expect(screen.getByText(/Auto-arbitrage/)).toBeTruthy();
    expect(screen.queryByText(/<b>/)).toBeNull();
  });

  it('applies highlight styles to bold segments', () => {
    render(
      <RuleDisplay
        rule={{
          ...baseRule,
          description: '<b>Important</b> Détail secondaire',
        }}
      />,
    );

    expect(StyleSheet.flatten(screen.getByText('Important').props.style).color).toBe(gameUiColors.secondary);
    expect(StyleSheet.flatten(screen.getByText('Détail secondaire').props.style).color).toBeUndefined();
  });
});
