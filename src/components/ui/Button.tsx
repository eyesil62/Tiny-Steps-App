import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle } from 'react-native';
import { colors, radius, fontSize, fontWeight, shadow } from '../../theme';

interface Props {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({ label, onPress, variant = 'primary', size = 'md', color = colors.coral, loading = false, disabled = false, style }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.82}
      style={[
        styles.base, styles[size],
        variant === 'primary'   && { backgroundColor: color, ...shadow.md },
        variant === 'secondary' && { backgroundColor: colors.white, borderWidth: 2, borderColor: color },
        variant === 'ghost'     && { backgroundColor: 'transparent' },
        (disabled || loading)   && { opacity: 0.5 },
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={variant === 'primary' ? colors.white : color} />
        : <Text style={[styles.label, styles[`${size}Label` as 'smLabel'|'mdLabel'|'lgLabel'],
            variant === 'primary'   && { color: colors.white },
            variant === 'secondary' && { color },
            variant === 'ghost'     && { color },
          ]}>{label}</Text>
      }
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base:    { borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  sm:      { paddingHorizontal: 16, paddingVertical: 10, minWidth: 80 },
  md:      { paddingHorizontal: 28, paddingVertical: 14, minWidth: 140 },
  lg:      { paddingHorizontal: 40, paddingVertical: 18, minWidth: 200 },
  label:   { fontWeight: fontWeight.heavy },
  smLabel: { fontSize: fontSize.sm },
  mdLabel: { fontSize: fontSize.md },
  lgLabel: { fontSize: fontSize.lg },
});
