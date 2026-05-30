import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';

interface Props {
  emoji:    string;
  label:    string;
  color:    string;
  onPress:  () => void;
  disabled?: boolean;
  badge?:   string;
}

export function ActionButton({ emoji, label, color, onPress, disabled, badge }: Props) {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    if (disabled) return;
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.88, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 120, friction: 5, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85} disabled={disabled}>
      <Animated.View style={[
        styles.btn,
        { backgroundColor: color, transform: [{ scale }] },
        disabled && styles.disabled,
      ]}>
        <Text style={styles.emoji}>{emoji}</Text>
        <Text style={styles.label}>{label}</Text>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn:     { alignItems: 'center', justifyContent: 'center', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 10, gap: 4, minWidth: 72, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 8, elevation: 5, position: 'relative' },
  emoji:   { fontSize: 34 },
  label:   { fontSize: 11, fontWeight: '900', color: '#fff', textAlign: 'center' },
  disabled:{ opacity: 0.4 },
  badge:   { position: 'absolute', top: -6, right: -6, backgroundColor: '#FFD93D', borderRadius: 99, paddingHorizontal: 6, paddingVertical: 2 },
  badgeText:{ fontSize: 9, fontWeight: '900', color: '#3D3530' },
});
