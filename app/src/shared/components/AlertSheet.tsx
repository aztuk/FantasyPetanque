import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { colors } from '../constants';

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
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: colors.brand.darkSmooth,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    shadowColor: colors.brand.dark,
    shadowOffset: { width: 0, height: -12 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 12,
  },
  content: {
    padding: 24,
    gap: 4,
  },
  footer: {
    flexDirection: 'row',
  },
  footerButton: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 102,
  },
  cancelButton: {
    backgroundColor: colors.brand.darkSmooth,
  },
  confirmButton: {
    backgroundColor: colors.brand.primary,
  },
});
