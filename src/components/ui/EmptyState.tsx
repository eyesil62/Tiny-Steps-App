import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, fontSize, fontWeight, radius, shadow } from '../../theme';

interface Props {
  emoji:       string;
  title:       string;
  description: string;
  actionLabel?: string;
  onAction?:   () => void;
}

export function EmptyState({ emoji, title, description, actionLabel, onAction }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.btn} onPress={onAction} activeOpacity={0.85}>
          <Text style={styles.btnText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emoji:       { fontSize: 64 },
  title:       { fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center' },
  description: { fontSize: fontSize.md, color: colors.warmGray, fontWeight: fontWeight.bold, textAlign: 'center', lineHeight: 22 },
  btn:         { backgroundColor: colors.coral, borderRadius: radius.full, paddingHorizontal: 28, paddingVertical: 14, marginTop: 8, ...shadow.sm },
  btnText:     { color: colors.white, fontSize: fontSize.md, fontWeight: fontWeight.heavy },
});
