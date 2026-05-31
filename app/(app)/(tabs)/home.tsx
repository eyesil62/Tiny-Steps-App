import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '../../../src/stores/useAppStore';
import { AVATARS } from '../../../src/components/ui/AvatarPicker';
import { getCurrentLevel, getNextLevel } from '../../../src/data/rewardsData';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../../src/theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getAvatar(id: string) {
  return AVATARS.find(a => a.id === id)?.emoji ?? '🦉';
}

export default function HomeScreen() {
  const activeChild    = useAppStore((s) => s.activeChild);
  const children       = useAppStore((s) => s.children);
  const setActiveChild = useAppStore((s) => s.setActiveChild);
  const [showSwitcher, setShowSwitcher] = useState(false);

  const name    = activeChild?.name ?? 'Explorer';
  const avatar  = getAvatar(activeChild?.avatar_id ?? 'owl');
  const stars   = 30;
  const streak  = 5;
  const level   = getCurrentLevel(stars);
  const nextLvl = getNextLevel(stars);
  const lvlPct  = nextLvl
    ? Math.min(100, ((stars - level.minStars) / (nextLvl.minStars - level.minStars)) * 100)
    : 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EBF0FA' }}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.profileBtn}
          onPress={() => children.length > 1 && setShowSwitcher(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarEmoji}>{avatar}</Text>
          <View>
            <Text style={styles.greet}>{greeting()},</Text>
            <Text style={styles.name}>{name}! 👋</Text>
          </View>
          {children.length > 1 && <Text style={styles.switchArrow}>▾</Text>}
        </TouchableOpacity>
        <View style={styles.streakBadge}>
          <Text style={styles.streakText}>🔥 {streak}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Level + stars card */}
        <View style={styles.levelCard}>
          <View style={styles.levelTop}>
            <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
              <Text style={styles.levelEmoji}>{level.emoji}</Text>
              <Text style={styles.levelName}>{level.title}</Text>
            </View>
            <Text style={styles.starsCount}>⭐ {stars}</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${lvlPct}%`, backgroundColor: level.color }]} />
          </View>
          {nextLvl && (
            <Text style={styles.levelHint}>{nextLvl.minStars - stars} stars to {nextLvl.emoji} {nextLvl.title}</Text>
          )}
        </View>

        {/* Quick access */}
        <Text style={styles.section}>Jump back in</Text>
        <View style={styles.grid}>
          {[
            { emoji: '📚', label: 'Learning',  bg: colors.skyLight,      border: colors.sky,      path: '/(app)/(tabs)/learn'    },
            { emoji: '🎮', label: 'Games',      bg: colors.coralLight,    border: colors.coral,    path: '/(app)/(tabs)/games'   },
            { emoji: '📖', label: 'Story',      bg: colors.lavenderLight, border: colors.lavender, path: '/(app)/(tabs)/stories' },
            { emoji: '⭐', label: 'Habits',     bg: colors.sunLight,      border: colors.sun,      path: '/(app)/(tabs)/habits'  },
          ].map((item) => (
            <TouchableOpacity
              key={item.label}
              activeOpacity={0.8}
              onPress={() => router.push(item.path as any)}
              style={[styles.quickCard, { backgroundColor: item.bg, borderColor: item.border }]}
            >
              <Text style={{ fontSize: 36 }}>{item.emoji}</Text>
              <Text style={styles.quickLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's habits */}
        <Text style={styles.section}>Today's habits</Text>
        <View style={styles.card}>
          {[
            { emoji: '🦷', label: 'Brush teeth',  done: false },
            { emoji: '📚', label: 'Reading time', done: false },
            { emoji: '🙌', label: 'Wash hands',   done: false },
            { emoji: '🌙', label: 'Bedtime',       done: false },
          ].map((h, i) => (
            <View key={i} style={styles.habitRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Text style={{ fontSize: 22 }}>{h.emoji}</Text>
                <Text style={[styles.habitLabel, h.done && styles.habitDone]}>{h.label}</Text>
              </View>
              <View style={[styles.check, h.done && styles.checkDone]}>
                {h.done && <Text style={{ color: colors.white, fontSize: 13, fontWeight: '900' }}>✓</Text>}
              </View>
            </View>
          ))}
          <TouchableOpacity
            style={styles.habitsLink}
            onPress={() => router.push('/(app)/(tabs)/habits')}
            activeOpacity={0.8}
          >
            <Text style={styles.habitsLinkText}>View all habits →</Text>
          </TouchableOpacity>
        </View>

        {/* Mascot */}
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginBottom: 20 }}>
          <Text style={{ fontSize: 48 }}>{avatar}</Text>
          <View style={styles.bubble}>
            <Text style={styles.bubbleText}>
              Ready to learn something amazing today, {name}? 🌟
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Child switcher modal */}
      <Modal visible={showSwitcher} transparent animationType="slide">
        <TouchableOpacity style={styles.modalBg} onPress={() => setShowSwitcher(false)} activeOpacity={1}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>Switch Child</Text>
            {children.map((child) => (
              <TouchableOpacity
                key={child.id}
                style={[styles.childRow, activeChild?.id === child.id && styles.childRowActive]}
                onPress={() => { setActiveChild(child); setShowSwitcher(false); }}
                activeOpacity={0.8}
              >
                <Text style={{ fontSize: 36 }}>{getAvatar(child.avatar_id)}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.childName}>{child.name}</Text>
                  <Text style={styles.childAge}>Ages {child.age_group}</Text>
                </View>
                {activeChild?.id === child.id && <Text style={{ color: colors.mint, fontSize: 20, fontWeight: '900' }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.addChild}
              onPress={() => { setShowSwitcher(false); router.push('/(auth)/child-setup'); }}
            >
              <Text style={styles.addChildText}>+ Add another child</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:       { backgroundColor: '#2D5BE3', padding: spacing.lg, paddingTop: spacing.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  profileBtn:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarEmoji:  { fontSize: 36 },
  greet:        { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.85)', fontWeight: fontWeight.bold },
  name:         { fontSize: fontSize.xl, color: colors.white, fontWeight: fontWeight.heavy },
  switchArrow:  { color: 'rgba(255,255,255,0.7)', fontSize: 18, marginLeft: 4 },
  streakBadge:  { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  streakText:   { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.white },
  scroll:       { padding: spacing.lg, gap: spacing.lg },
  levelCard:    { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, gap: 8, ...shadow.md },
  levelTop:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  levelBadge:   { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  levelEmoji:   { fontSize: 16 },
  levelName:    { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.white },
  starsCount:   { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.dark },
  progressBar:  { height: 10, backgroundColor: colors.sand, borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.full },
  levelHint:    { fontSize: fontSize.xs, color: colors.warmGray, fontWeight: fontWeight.bold },
  section:      { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: '#1A2B5F' },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  quickCard:    { width: '47%', aspectRatio: 1, borderRadius: 18, borderWidth: 0, alignItems: 'center', justifyContent: 'center', gap: 6, ...shadow.md },
  quickLabel:   { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.dark },
  card:         { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, gap: 2, ...shadow.md },
  habitRow:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.sand },
  habitLabel:   { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.dark },
  habitDone:    { textDecorationLine: 'line-through', color: colors.warmGray },
  check:        { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  checkDone:    { backgroundColor: colors.mint, borderColor: colors.mint },
  habitsLink:   { paddingTop: 10, alignItems: 'flex-end' },
  habitsLinkText:{ fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: '#2D5BE3' },
  bubble:       { flex: 1, backgroundColor: colors.white, borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, ...shadow.sm },
  bubbleText:   { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.dark, lineHeight: 20 },
  modalBg:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet:   { backgroundColor: colors.white, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: spacing.xl, gap: spacing.md },
  modalTitle:   { fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center', marginBottom: 8 },
  childRow:     { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 14, borderRadius: radius.lg, backgroundColor: '#EBF0FA' },
  childRowActive:{ backgroundColor: colors.mintLight, borderWidth: 2, borderColor: colors.mint },
  childName:    { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.dark },
  childAge:     { fontSize: fontSize.sm, color: colors.warmGray, fontWeight: fontWeight.bold },
  addChild:     { backgroundColor: colors.sand, borderRadius: radius.full, paddingVertical: 14, alignItems: 'center' },
  addChildText: { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: '#2D5BE3' },
});
