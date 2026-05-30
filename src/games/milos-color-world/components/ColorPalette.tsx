import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Animated } from 'react-native';
import { ALL_COLORS, ColorItem, getDisplayColor } from '../data/colors';

interface Props {
  selected:       string;
  unlockedColors: string[];
  onSelect:       (id: string) => void;
}

function ColorSwatch({ color, isSelected, isUnlocked, onSelect }: {
  color: ColorItem; isSelected: boolean; isUnlocked: boolean; onSelect: () => void;
}) {
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (!isUnlocked) return;
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 120, friction: 4, useNativeDriver: true }),
    ]).start();
    onSelect();
  };

  const displayColor = getDisplayColor(color);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} style={styles.swatchTouch}>
      <Animated.View style={[
        styles.swatch,
        { backgroundColor: displayColor },
        isSelected && styles.swatchSelected,
        !isUnlocked && styles.swatchLocked,
      ]}>
        {color.isSpecial && isUnlocked && (
          <Text style={styles.specialMark}>✨</Text>
        )}
        {!isUnlocked && (
          <Text style={styles.lockIcon}>🔒</Text>
        )}
        {isSelected && <View style={styles.selectedDot} />}
      </Animated.View>
      <Text style={styles.colorName} numberOfLines={1}>{color.name}</Text>
    </TouchableOpacity>
  );
}

export function ColorPalette({ selected, unlockedColors, onSelect }: Props) {
  const basic   = ALL_COLORS.filter(c => !c.isSpecial);
  const special = ALL_COLORS.filter(c =>  c.isSpecial);

  return (
    <View style={styles.container}>
      {/* Basic colors */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {basic.map(color => (
          <ColorSwatch
            key={color.id}
            color={color}
            isSelected={selected === color.id}
            isUnlocked={unlockedColors.includes(color.id)}
            onSelect={() => onSelect(color.id)}
          />
        ))}
      </ScrollView>
      {/* Special colors */}
      <View style={styles.specialHeader}>
        <Text style={styles.specialLabel}>✨ Special Paints</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {special.map(color => (
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
  container:    { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F5EDD8' },
  row:          { paddingHorizontal: 10, paddingVertical: 8, gap: 8, alignItems: 'center' },
  swatchTouch:  { alignItems: 'center', gap: 3 },
  swatch:       { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: 'rgba(0,0,0,0.1)', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  swatchSelected:{ borderWidth: 3, borderColor: '#3D3530', transform: [{ scale: 1.15 }] },
  swatchLocked: { opacity: 0.5 },
  specialMark:  { fontSize: 12 },
  lockIcon:     { fontSize: 14 },
  selectedDot:  { position: 'absolute', bottom: -6, width: 6, height: 6, borderRadius: 3, backgroundColor: '#3D3530' },
  colorName:    { fontSize: 8, fontWeight: '700', color: '#8B8178', maxWidth: 42, textAlign: 'center' },
  specialHeader:{ paddingHorizontal: 14, paddingTop: 4 },
  specialLabel: { fontSize: 10, fontWeight: '800', color: '#C77DFF', letterSpacing: 0.5 },
});
