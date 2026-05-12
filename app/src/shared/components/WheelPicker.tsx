import React, { useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { BACKGROUND, TEXT_PRIMARY, TEXT_SECONDARY, ACCENT } from '../constants';

const ITEM_HEIGHT = 64;
const VISIBLE = 3;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE;

interface WheelPickerProps {
  min: number;
  max: number;
  value: number;
  onChange: (v: number) => void;
}

export function WheelPicker({ min, max, value, onChange }: WheelPickerProps) {
  const scrollRef = useRef<ScrollView>(null);
  const values = Array.from({ length: max - min + 1 }, (_, i) => min + i);

  useEffect(() => {
    const targetY = (value - min) * ITEM_HEIGHT;
    const timer = setTimeout(() => {
      scrollRef.current?.scrollTo({ y: targetY, animated: false });
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      {/* Top fade */}
      <View style={styles.fadeTop} pointerEvents="none" />
      {/* Center selection lines */}
      <View style={[styles.line, { top: ITEM_HEIGHT }]} pointerEvents="none" />
      <View style={[styles.line, { top: ITEM_HEIGHT * 2 }]} pointerEvents="none" />
      {/* Bottom fade */}
      <View style={styles.fadeBottom} pointerEvents="none" />

      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        decelerationRate="fast"
        contentContainerStyle={styles.content}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_HEIGHT);
          const clamped = Math.max(0, Math.min(idx, values.length - 1));
          onChange(values[clamped]);
        }}
      >
        {values.map((v) => (
          <View key={v} style={styles.item}>
            <Text style={styles.itemText}>{v}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: CONTAINER_HEIGHT,
    width: 120,
    overflow: 'hidden',
  },
  content: {
    paddingVertical: ITEM_HEIGHT,
  },
  item: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemText: {
    color: TEXT_PRIMARY,
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  line: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 1,
    backgroundColor: ACCENT,
    zIndex: 2,
  },
  fadeTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: `${BACKGROUND}CC`,
    zIndex: 1,
  },
  fadeBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: ITEM_HEIGHT,
    backgroundColor: `${BACKGROUND}CC`,
    zIndex: 1,
  },
});
