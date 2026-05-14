import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { colors, componentSizes, figmaTextStyles } from '../constants';

const PICKER_LINE_WIDTH = componentSizes.wheelPickerWidth;
const PICKER_VIEWPORT_WIDTH = 260;
const PICKER_VERTICAL_PADDING =
  (componentSizes.wheelPickerHeight - componentSizes.wheelPickerItemHeight) / 2;
const PICKER_LINE_TOP =
  (componentSizes.wheelPickerHeight - componentSizes.wheelPickerSelectedHeight) / 2;
const PICKER_UNIT_TOP =
  (componentSizes.wheelPickerHeight - componentSizes.wheelPickerItemHeight) / 2 + 43;
const PICKER_UNIT_LEFT = 168;

interface WheelPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
  unit?: string;
  testID?: string;
}

export function WheelPicker({ min, max, value, onChange, unit, testID }: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const scrollY = useRef(
    new Animated.Value((value - min) * componentSizes.wheelPickerItemHeight),
  ).current;
  const values = useMemo(
    () => Array.from({ length: max - min + 1 }, (_, i) => min + i),
    [max, min],
  );

  useEffect(() => {
    const targetY = (value - min) * componentSizes.wheelPickerItemHeight;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: targetY, animated: false });
    }, 0);
    return () => clearTimeout(timer);
  }, [min, scrollRef, value]);

  const handleScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = Math.round(
      event.nativeEvent.contentOffset.y / componentSizes.wheelPickerItemHeight,
    );
    const index = Math.max(0, Math.min(rawIndex, values.length - 1));
    const nextValue = values[index];
    if (nextValue !== value) onChange(nextValue);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.line, styles.topLine]} pointerEvents="none" />
      <View style={[styles.line, styles.bottomLine]} pointerEvents="none" />
      {unit ? (
        <View
          style={styles.unitOverlay}
          pointerEvents="none"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          <Text style={styles.unit}>{unit}</Text>
        </View>
      ) : null}

      <Animated.ScrollView
        ref={scrollRef}
        testID={testID}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        snapToInterval={componentSizes.wheelPickerItemHeight}
        decelerationRate="fast"
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        onMomentumScrollEnd={handleScrollEnd}
      >
        {values.map((itemValue) => {
          const itemOffset = (itemValue - min) * componentSizes.wheelPickerItemHeight;
          const inputRange = [
            itemOffset - componentSizes.wheelPickerItemHeight * 2,
            itemOffset - componentSizes.wheelPickerItemHeight,
            itemOffset,
            itemOffset + componentSizes.wheelPickerItemHeight,
            itemOffset + componentSizes.wheelPickerItemHeight * 2,
          ];

          return (
            <View key={itemValue} style={styles.option}>
              <Animated.Text
                style={[
                  styles.optionText,
                  {
                    color: scrollY.interpolate({
                      inputRange,
                      outputRange: [
                        colors.textSmooth,
                        colors.textSmooth,
                        colors.white,
                        colors.textSmooth,
                        colors.textSmooth,
                      ],
                      extrapolate: 'clamp',
                    }),
                    fontSize: scrollY.interpolate({
                      inputRange,
                      outputRange: [
                        figmaTextStyles.numberSm60.fontSize,
                        figmaTextStyles.numberMd80.fontSize,
                        figmaTextStyles.numberLg100.fontSize,
                        figmaTextStyles.numberMd80.fontSize,
                        figmaTextStyles.numberSm60.fontSize,
                      ],
                      extrapolate: 'clamp',
                    }),
                    lineHeight: scrollY.interpolate({
                      inputRange,
                      outputRange: [
                        figmaTextStyles.numberSm60.lineHeight,
                        figmaTextStyles.numberMd80.lineHeight,
                        figmaTextStyles.numberLg100.lineHeight,
                        figmaTextStyles.numberMd80.lineHeight,
                        figmaTextStyles.numberSm60.lineHeight,
                      ],
                      extrapolate: 'clamp',
                    }),
                    letterSpacing: scrollY.interpolate({
                      inputRange,
                      outputRange: [
                        figmaTextStyles.numberSm60.letterSpacing,
                        figmaTextStyles.numberMd80.letterSpacing,
                        figmaTextStyles.numberLg100.letterSpacing,
                        figmaTextStyles.numberMd80.letterSpacing,
                        figmaTextStyles.numberSm60.letterSpacing,
                      ],
                      extrapolate: 'clamp',
                    }),
                    opacity: scrollY.interpolate({
                      inputRange,
                      outputRange: [0.5, 1, 1, 1, 0.5],
                      extrapolate: 'clamp',
                    }),
                  },
                ]}
              >
                {itemValue}
              </Animated.Text>
            </View>
          );
        })}
      </Animated.ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: componentSizes.wheelPickerHeight,
    width: PICKER_VIEWPORT_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  scroll: {
    height: componentSizes.wheelPickerHeight,
    width: '100%',
  },
  content: {
    paddingVertical: PICKER_VERTICAL_PADDING,
  },
  option: {
    width: '100%',
    height: componentSizes.wheelPickerItemHeight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    ...figmaTextStyles.numberMd80,
    color: colors.textSmooth,
    textAlign: 'center',
    includeFontPadding: false,
  },
  line: {
    position: 'absolute',
    width: PICKER_LINE_WIDTH,
    height: 2,
    backgroundColor: colors.primary,
    zIndex: 2,
  },
  topLine: {
    top: PICKER_LINE_TOP,
  },
  bottomLine: {
    top: PICKER_LINE_TOP + componentSizes.wheelPickerSelectedHeight,
  },
  unitOverlay: {
    position: 'absolute',
    top: PICKER_UNIT_TOP,
    left: PICKER_UNIT_LEFT,
    zIndex: 3,
  },
  unit: {
    ...figmaTextStyles.bodyMd,
    color: colors.textSmooth,
    includeFontPadding: false,
  },
});
