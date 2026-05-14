import React from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { ButtonIcon } from './ButtonIcon';
import { colors, componentSizes, figmaTextStyles, spacing } from '../constants';

interface AppHeaderProps {
  onBack: () => void;
  title?: string;
  children?: React.ReactNode;
  backgroundColor?: string;
  floating?: boolean;
  iconColor?: string;
  textColor?: string;
  backAccessibilityLabel?: string;
  backButtonTestID?: string;
  testID?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  actionsStyle?: StyleProp<ViewStyle>;
}

export function AppHeader({
  onBack,
  title,
  children,
  backgroundColor = colors.dark,
  floating = false,
  iconColor = colors.textSmooth,
  textColor = colors.white,
  backAccessibilityLabel = 'Retour',
  backButtonTestID,
  testID,
  style,
  titleStyle,
  actionsStyle,
}: AppHeaderProps) {
  const hasTitle = Boolean(title);

  return (
    <View
      testID={testID}
      style={[
        styles.header,
        hasTitle ? styles.withTitle : styles.noTitle,
        !floating && { backgroundColor },
        style,
      ]}
    >
      <ButtonIcon
        onPress={onBack}
        accessibilityLabel={backAccessibilityLabel}
        iconColor={iconColor}
        testID={backButtonTestID}
      />

      {hasTitle ? (
        <Text style={[styles.title, { color: textColor }, titleStyle]}>{title}</Text>
      ) : (
        <View style={[styles.actions, actionsStyle]}>{children}</View>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  withTitle: {
    minHeight: componentSizes.headerHeight,
    padding: spacing[2],
  },
  noTitle: {
    minHeight: componentSizes.headerNoTitleHeight,
    padding: spacing[4],
  },
  title: {
    ...figmaTextStyles.pageTitles,
    flex: 1,
    includeFontPadding: false,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
  },
});
