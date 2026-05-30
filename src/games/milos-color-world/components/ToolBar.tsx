import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';

interface Props {
  canUndo:   boolean;
  canRedo:   boolean;
  onUndo:    () => void;
  onRedo:    () => void;
  onClear:   () => void;
  onSave?:   () => void;
  progress:  number;  // 0-100
}

function Tool({ emoji, label, onPress, disabled, color = '#F5EDD8' }: any) {
  return (
    <TouchableOpacity
      onPress={() => { if (!disabled) { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); onPress(); } }}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.tool, { backgroundColor: color }, disabled && styles.toolDisabled]}
    >
      <Text style={styles.toolEmoji}>{emoji}</Text>
      <Text style={styles.toolLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

export function ToolBar({ canUndo, canRedo, onUndo, onRedo, onClear, progress }: Props) {
  return (
    <View style={styles.container}>
      {/* Progress bar */}
      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Progress</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.progressPct}>{Math.round(progress)}%</Text>
      </View>

      {/* Tools */}
      <View style={styles.tools}>
        <Tool emoji="↩️" label="Undo"  onPress={onUndo}  disabled={!canUndo} />
        <Tool emoji="↪️" label="Redo"  onPress={onRedo}  disabled={!canRedo} />
        <Tool emoji="🗑️" label="Clear" onPress={onClear} color="#FFE5E5" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { backgroundColor: '#fff', padding: 10, gap: 6, borderTopWidth: 1, borderTopColor: '#F5EDD8' },
  progressRow:  { flexDirection: 'row', alignItems: 'center', gap: 8 },
  progressLabel:{ fontSize: 11, fontWeight: '800', color: '#8B8178', width: 55 },
  progressBar:  { flex: 1, height: 8, backgroundColor: '#F5EDD8', borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#6BCB77', borderRadius: 4 },
  progressPct:  { fontSize: 11, fontWeight: '800', color: '#6BCB77', width: 32, textAlign: 'right' },
  tools:        { flexDirection: 'row', gap: 8 },
  tool:         { flex: 1, alignItems: 'center', borderRadius: 12, paddingVertical: 8, gap: 2 },
  toolDisabled: { opacity: 0.35 },
  toolEmoji:    { fontSize: 22 },
  toolLabel:    { fontSize: 9, fontWeight: '800', color: '#3D3530' },
});
