import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { ALL_COLORS, ColorItem, getDisplayColor } from '../data/colors';

interface Props {
  selected: string;
  unlockedColors: string[];
  onSelect: (id: string) => void;
}

function ColorSwatch({
  color,
  isSelected,
  isUnlocked,
  onSelect,
}: {
  color: ColorItem;
  isSelected: boolean;
  isUnlocked: boolean;
  onSelect: () => void;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!isUnlocked) return;

    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 4, useNativeDriver: true }),
    ]).start();

    onSelect();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.swatchTouch}>
      <Animated.View
        style={[
          styles.swatch,
          { backgroundColor: getDisplayColor(color), transform: [{ scale: scaleAnim }] },
          isSelected && styles.swatchSelected,
          !isUnlocked && styles.swatchLocked,
        ]}
      >
        {!isUnlocked && <Text style={styles.lockIcon}>🔒</Text>}
      </Animated.View>
      <Text style={styles.colorName} numberOfLines={1}>
        {color.name}
      </Text>
    </TouchableOpacity>
  );
}

export function ColorPalette({ selected, unlockedColors, onSelect }: Props) {
  const basicColors = ALL_COLORS.filter((color) => !color.isSpecial);

  return (
    <View style={styles.container}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {basicColors.map((color) => (
          <ColorSwatch
            key={color.id}
            color={color}
            isSelected={selected === color.id}
            isUnlocked={unlockedColors.includes(color.id)}
            onSelect={() => onSelect(color.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F5EDD8',
    paddingVertical: 6,
  },
  row: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 12,
    alignItems: 'center',
  },
  swatchTouch: {
    alignItems: 'center',
    gap: 4,
  },
  swatch: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchSelected: {
    borderWidth: 4,
    borderColor: '#3D3530',
  },
  swatchLocked: {
    opacity: 0.4,
  },
  lockIcon: {
    fontSize: 13,
  },
  colorName: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8B8178',
    maxWidth: 52,
    textAlign: 'center',
  },
});