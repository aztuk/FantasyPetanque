import React from 'react';
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { Rule, Team } from '../../../domain/game/models';
import { TEAM_LABELS, typography } from '../../../shared/constants';
import { gameUiColors } from './gameUiTheme';

interface Props {
  rule: Rule;
  immuneTeam?: Team | null;
  style?: StyleProp<ViewStyle>;
}

export interface RuleDescriptionSegment {
  text: string;
  bold: boolean;
}

export interface RuleDisplayContent {
  paragraphs: RuleDescriptionSegment[][];
  note: RuleDescriptionSegment[] | null;
}

const RULE_TEXT_TAG_PATTERN = /<\/?b>/g;
const FINAL_NOTE_PATTERN = /(?:^|\s)((?:Maximum|Pas de score normal)\b[\s\S]*?)\.?$/;
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
  const noteMatch = source.match(FINAL_NOTE_PATTERN);
  const bodySource = noteMatch ? source.slice(0, noteMatch.index).trim() : source;
  const noteSource = noteMatch ? noteMatch[1].trim().replace(/\.$/, '') : null;

  const paragraphs = bodySource
    .split(PARAGRAPH_SPLIT_PATTERN)
    .map((paragraph) => parseRuleDescription(paragraph))
    .filter((paragraph) => paragraph.length > 0);

  return {
    paragraphs,
    note: noteSource ? parseRuleDescription(noteSource) : null,
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

export function RuleDisplay({ rule, immuneTeam = null, style }: Props) {
  const content = parseRuleDisplayContent(rule.description);

  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.title}>{rule.name}</Text>
      <View style={styles.descriptionGroup}>
        {content.paragraphs.map((paragraph, paragraphIndex) => (
          <Text key={`paragraph-${paragraphIndex}`} style={styles.description}>
            {renderSegments(paragraph)}
          </Text>
        ))}
        {content.note && (
          <Text style={styles.note}>
            {renderSegments(content.note)}
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
    width: '100%',
    color: gameUiColors.primary,
    fontFamily: typography.family.bodySemibold,
    fontSize: 32,
    lineHeight: 54,
    fontWeight: typography.weight.bold,
    textAlign: 'center',
    letterSpacing: 0,
  },
  descriptionGroup: {
    width: '100%',
    alignItems: 'center',
    gap: 24,
  },
  description: {
    width: '100%',
    color: gameUiColors.white,
    fontFamily: typography.family.body,
    fontSize: 21,
    lineHeight: 32,
    fontWeight: typography.weight.regular,
    textAlign: 'center',
    letterSpacing: 0,
  },
  note: {
    width: '100%',
    color: gameUiColors.muted,
    fontFamily: typography.family.body,
    fontSize: 18,
    lineHeight: 31,
    fontWeight: typography.weight.regular,
    textAlign: 'center',
    letterSpacing: 0,
  },
  highlightText: {
    color: gameUiColors.secondary,
    fontFamily: typography.family.bodySemibold,
    fontWeight: typography.weight.bold,
  },
  immunity: {
    width: '100%',
    color: gameUiColors.muted,
    fontFamily: typography.family.body,
    fontSize: 18,
    lineHeight: 31,
    fontWeight: typography.weight.regular,
    textAlign: 'center',
    letterSpacing: 0,
    marginTop: 12,
  },
});
