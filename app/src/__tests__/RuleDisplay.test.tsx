import React from 'react';
import { StyleSheet } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { Rule } from '../domain/game/models';
import { RuleDisplay, parseRuleDescription, parseRuleDisplayContent } from '../features/game/components/RuleDisplay';
import { gameUiColors } from '../features/game/components/gameUiTheme';
import { figmaTextStyles } from '../shared/constants';

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

describe('parseRuleDisplayContent', () => {
  it('keeps every description sentence in the body', () => {
    expect(
      parseRuleDisplayContent(
        'Chaque joueur doit lancer avec <b>sa mauvaise main</b>. Un tir réussi vaut <b>1 point bonus</b>. Maximum 1 par équipe.',
      ),
    ).toEqual({
      paragraphs: [
        [
          { text: 'Chaque joueur doit lancer avec ', bold: false },
          { text: 'sa mauvaise main', bold: true },
          { text: '.', bold: false },
        ],
        [
          { text: 'Un tir réussi vaut ', bold: false },
          { text: '1 point bonus', bold: true },
          { text: '.', bold: false },
        ],
        [
          { text: 'Maximum 1 par équipe.', bold: false },
        ],
      ],
    });
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

  it('renders rule note as muted note text', () => {
    render(
      <RuleDisplay
        rule={{
          ...baseRule,
          description: 'Chaque joueur doit lancer.',
          note: 'Maximum 1 par équipe.',
        }}
      />,
    );

    const noteStyle = StyleSheet.flatten(screen.getByText('Maximum 1 par équipe.').props.style);

    expect(screen.getByText('Chaque joueur doit lancer.')).toBeTruthy();
    expect(noteStyle.color).toBe(gameUiColors.muted);
    expect(noteStyle.fontSize).toBe(figmaTextStyles.bodySm.fontSize);
  });

  it('renders no-normal-score rule note as muted note text', () => {
    render(
      <RuleDisplay
        rule={{
          ...baseRule,
          description: 'Chaque équipe mise des points.',
          note: 'Pas de score normal sur cette mène.',
        }}
      />,
    );

    const noteStyle = StyleSheet.flatten(screen.getByText('Pas de score normal sur cette mène.').props.style);

    expect(screen.getByText('Chaque équipe mise des points.')).toBeTruthy();
    expect(noteStyle.color).toBe(gameUiColors.muted);
  });

  it('can hide the compact final note while keeping the description body', () => {
    render(
      <RuleDisplay
        rule={{
          ...baseRule,
          description: 'Chaque joueur doit lancer.',
          note: 'Maximum 1 par equipe.',
        }}
        showNote={false}
      />,
    );

    expect(screen.getByText(/R.gle test/)).toBeTruthy();
    expect(screen.getByText(/Chaque joueur doit lancer/)).toBeTruthy();
    expect(screen.queryByText(/Maximum 1 par/)).toBeNull();
  });

  it('renders compact rule cards with only the title and short description', () => {
    render(
      <RuleDisplay
        rule={{
          ...baseRule,
          description: 'Description longue qui ne doit pas apparaitre.',
          shortDescription: 'Description courte',
          note: 'Note masquee',
        }}
        variant="compact"
        testID="compact-rule"
      />,
    );

    const cardStyle = StyleSheet.flatten(screen.getByTestId('compact-rule').props.style);
    const titleStyle = StyleSheet.flatten(screen.getByText(/R.gle test/).props.style);

    expect(screen.getByText('Description courte')).toBeTruthy();
    expect(screen.queryByText(/Description longue/)).toBeNull();
    expect(screen.queryByText(/Note masquee/)).toBeNull();
    expect(cardStyle.backgroundColor).toBe(gameUiColors.darkOverlay);
    expect(titleStyle.color).toBe(gameUiColors.secondary);
  });
});
