import React from 'react';
import {
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { ArrowLeftIcon } from 'phosphor-react-native';
import { colors, textStyles } from '../constants';

interface AppHeaderProps {
  onBack: () => void;
  title?: string;
  children?: React.ReactNode;
  backgroundColor?: string;
  iconColor?: string;
  textColor?: string;
  backAccessibilityLabel?: string;
  backButtonTestID?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  actionsStyle?: StyleProp<ViewStyle>;
}

export function AppHeader({
  onBack,
  title,
  children,
  backgroundColor = colors.dark,
  iconColor = colors.textSmooth,
  textColor = colors.white,
  backAccessibilityLabel = 'Retour',
  backButtonTestID,
  style,
  titleStyle,
  actionsStyle,
}: AppHeaderProps) {
  return (
    <View style={[styles.header, { backgroundColor }, style]}>
      <Pressable
        style={styles.backButton}
        onPress={onBack}
        accessibilityRole="button"
        accessibilityLabel={backAccessibilityLabel}
        testID={backButtonTestID}
      >
        <ArrowLeftIcon color={iconColor} size={32} weight="regular" />
      </Pressable>

      {title ? (
        <Text style={[styles.title, { color: textColor }, titleStyle]}>{title}</Text>
      ) : (
        <View style={[styles.actions, actionsStyle]}>{children}</View>
      )}
    </View>
  );
}
// TODO A REMPLACER: styles legacy a migrer depuis Design.md + figmaTextStyles, ecran par ecran.

const styles = StyleSheet.create({
  header: {
    height: 80,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...textStyles.titleLg,
    flex: 1,
    fontWeight: '700',
    includeFontPadding: false,
  },
  actions: {
    flex: 1,
    flexDirection: 'row',
  },
});
