import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, radius, shadow } from '../../theme';

interface Props { children: React.ReactNode; style?: ViewStyle; color?: string; }

export function Card({ children, style, color }: Props) {
  return (
    <View style={[styles.card, color ? { backgroundColor: color } : null, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, ...shadow.md },
});
