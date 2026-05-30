import React, { useState } from 'react';
import { TextInput, View, Text, StyleSheet, ViewStyle, TextInputProps } from 'react-native';
import { colors, radius, fontSize, fontWeight, shadow } from '../../theme';

interface Props extends Omit<TextInputProps, 'style'> {
  label?: string; error?: string; style?: ViewStyle;
}

export function Input({ label, error, style, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[{ gap: 6 }, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, focused && styles.focused, error && styles.errored]}
        placeholderTextColor={colors.warmGray}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  label:     { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.dark },
  input:     { backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: fontSize.md, color: colors.dark, borderWidth: 2, borderColor: colors.sand, ...shadow.sm },
  focused:   { borderColor: colors.coral },
  errored:   { borderColor: colors.error },
  errorText: { fontSize: fontSize.xs, color: colors.error, fontWeight: fontWeight.bold },
});
