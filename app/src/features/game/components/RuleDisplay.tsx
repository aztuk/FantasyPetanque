import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Rule, Team } from '../../../domain/game/models';
import { TEAM_LABELS, figmaTextStyles, radius, spacing } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  rule: Rule;
  immuneTeam?: Team | null;
  showNote?: boolean;
  variant?: 'default' | 'compact';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export interface RuleDescriptionSegment {
  text: string;
  bold: boolean;
}

export interface RuleDisplayContent {
  paragraphs: RuleDescriptionSegment[][];
}

const RULE_TEXT_TAG_PATTERN = /<\/?b>/g;
const PARAGRAPH_SPLIT_PATTERN = /\n{2,}|(?<=\.)\s+(?=[A-ZÀ-ÖØ-Þ])/;

function normalizeRuleDescription(description: string): string {
  return description.trim().replace(/\\n/g, '\n');
}

export function parseRuleDescription(description: string): RuleDescriptionSegment[] {
  const source = normalizeRuleDescription(description);
  let boldDepth = 0;
  const segments: RuleDescriptionSegment[] = [];
  let cursor = 0;

  const pushSegment = (text: string) => {
    if (!text) return;

    const segment = {
      text,
      bold: boldDepth > 0,
    };
    const previous = segments[segments.length - 1];

    if (previous && previous.bold === segment.bold) {
      previous.text += segment.text;
      return;
    }

    segments.push(segment);
  };

  for (const match of source.matchAll(RULE_TEXT_TAG_PATTERN)) {
    const matchIndex = match.index ?? cursor;

    pushSegment(source.slice(cursor, matchIndex));

    switch (match[0]) {
      case '<b>':
        boldDepth += 1;
        break;
      case '</b>':
        boldDepth = Math.max(0, boldDepth - 1);
        break;
      default:
        break;
    }

    cursor = matchIndex + match[0].length;
  }

  pushSegment(source.slice(cursor));

  return segments;
}

export function parseRuleDisplayContent(description: string): RuleDisplayContent {
  const source = normalizeRuleDescription(description);

  const paragraphs = source
    .split(PARAGRAPH_SPLIT_PATTERN)
    .map((paragraph) => parseRuleDescription(paragraph))
    .filter((paragraph) => paragraph.length > 0);

  return {
    paragraphs,
  };
}

function renderSegments(segments: RuleDescriptionSegment[]) {
  if (!segments.some((segment) => segment.bold)) {
    return segments.map((segment) => segment.text).join('');
  }

  return segments.map((segment, index) => (
    <Text
      key={`${segment.text}-${index}`}
      style={[
        segment.bold && styles.highlightText,
      ]}
    >
      {segment.text}
    </Text>
  ));
}

export function RuleDisplay({
  rule,
  immuneTeam = null,
  showNote = true,
  variant = 'default',
  style,
  testID,
}: Props) {
  if (variant === 'compact') {
    return (
      <View style={[styles.compactWrapper, style]} testID={testID}>
        <Text style={styles.compactTitle}>{rule.name}</Text>
        <Text style={styles.compactDescription}>{rule.shortDescription}</Text>
      </View>
    );
  }

  const content = parseRuleDisplayContent(rule.description);

  return (
    <View style={[styles.wrapper, style]} testID={testID}>
      <Text style={styles.title}>{rule.name}</Text>
      <View style={styles.descriptionGroup}>
        {content.paragraphs.map((paragraph, paragraphIndex) => (
          <Text key={`paragraph-${paragraphIndex}`} style={styles.description}>
            {renderSegments(paragraph)}
          </Text>
        ))}
        {showNote && rule.note && (
          <Text style={styles.note}>
            {renderSegments(parseRuleDescription(rule.note))}
          </Text>
        )}
      </View>
      {immuneTeam && (
        <Text style={styles.immunity}>
          {TEAM_LABELS[immuneTeam]} est immunisé contre cette règle.
        </Text>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 4,
  },
  title: {
    ...figmaTextStyles.pageTitles,
    width: '100%',
    color: gameUiColors.primary,
    textAlign: 'center',
  },
  descriptionGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  description: {
    ...figmaTextStyles.bodyMd,
    width: '100%',
    color: gameUiColors.white,
    textAlign: 'center',
  },
  note: {
    ...figmaTextStyles.bodySm,
    width: '100%',
    color: gameUiColors.muted,
    textAlign: 'center',
  },
  highlightText: {
    color: gameUiColors.secondary,
  },
  immunity: {
    ...figmaTextStyles.bodySm,
    width: '100%',
    color: gameUiColors.muted,
    textAlign: 'center',
    marginTop: 12,
  },
  compactWrapper: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[1],
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[3],
    borderRadius: radius.input,
    backgroundColor: gameUiColors.darkOverlay,
  },
  compactTitle: {
    ...figmaTextStyles.buttonActions,
    width: '100%',
    color: gameUiColors.secondary,
    textAlign: 'center',
  },
  compactDescription: {
    ...figmaTextStyles.bodySm,
    width: '100%',
    color: gameUiColors.white,
    textAlign: 'center',
  },
});
