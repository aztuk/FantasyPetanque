import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { colors, componentSizes, radius, shadows, spacing } from '../constants';

interface Props {
  visible: boolean;
  children: React.ReactNode;
  confirmLabel: React.ReactNode;
  cancelLabel: React.ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  testID?: string;
}

const SHEET_TRANSLATE_INITIAL = 500;

export function AlertSheet({
  visible,
  children,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
  testID,
}: Props) {
  const slideAnim = useRef(new Animated.Value(SHEET_TRANSLATE_INITIAL)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: SHEET_TRANSLATE_INITIAL,
          duration: 220,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      testID={testID}
    >
      <View style={styles.container}>
        <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onCancel} />
        </Animated.View>

        <Animated.View
          style={[styles.sheet, { transform: [{ translateY: slideAnim }] }]}
        >
          <View style={styles.content}>{children}</View>

          <View style={styles.footer}>
            <Pressable
              style={[styles.footerButton, styles.cancelButton]}
              onPress={onCancel}
              accessibilityRole="button"
              testID="alert-sheet-cancel"
            >
              {cancelLabel}
            </Pressable>
            <Pressable
              style={[styles.footerButton, styles.confirmButton]}
              onPress={onConfirm}
              accessibilityRole="button"
              testID="alert-sheet-confirm"
            >
              {confirmLabel}
            </Pressable>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlayBackdrop,
  },
  sheet: {
    backgroundColor: colors.darkSmooth,
    borderTopLeftRadius: radius.sheet,
    borderTopRightRadius: radius.sheet,
    ...shadows.alertBox,
  },
  content: {
    padding: spacing[6],
    gap: spacing[1],
  },
  footer: {
    flexDirection: 'row',
    gap: spacing[1],
  },
  footerButton: {
    flex: 1,
    paddingHorizontal: spacing.control,
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: componentSizes.buttonHeight,
  },
  cancelButton: {
    backgroundColor: colors.darkSmooth,
  },
  confirmButton: {
    backgroundColor: colors.primary,
  },
});
