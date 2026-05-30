import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '../../../src/stores/useAppStore';
import { LEARNING_MODULES, getModulesForAge } from '../../../src/data/learningModules';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../../src/theme';
import type { AgeGroup } from '../../../src/types';

export default function LearnScreen() {
  const activeChild = useAppStore((s) => s.activeChild);
  const isPremium   = useAppStore((s) => s.isPremium);
  const ageGroup    = (activeChild?.age_group ?? '2-4') as AgeGroup;
  const modules     = getModulesForAge(ageGroup);
  const free        = modules.filter(m => !m.isPremium);
  const premium     = modules.filter(m => m.isPremium);
  const name        = activeChild?.name ?? 'Explorer';

  const renderModule = (module: typeof LEARNING_MODULES[0], locked: boolean) => (
    <TouchableOpacity
      key={module.id}
      style={[styles.card, { borderColor: module.color }, locked && styles.cardLocked]}
      onPress={() => !locked && router.push(`/(app)/learn/${module.id}` as any)}
      activeOpacity={locked ? 0.5 : 0.85}
    >
      {/* Color header */}
      <View style={[styles.cardHeader, { backgroundColor: module.color }]}>
        <Text style={styles.cardHeaderEmoji}>{locked ? '🔒' : module.emoji}</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{module.title}</Text>
        <Text style={styles.cardCount}>{module.items.length} items</Text>
        <View style={[styles.badge, { backgroundColor: locked ? colors.sunLight : module.colorLight }]}>
          <Text style={[styles.badgeText, { color: locked ? colors.dark : module.color }]}>
            {locked ? '⭐ Premium' : 'FREE'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={styles.header}>
        <Text style={styles.title}>Let's Learn! 📚</Text>
        <Text style={styles.sub}>Pick a topic, {name}!</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionLabel}>FREE MODULES</Text>
        <View style={styles.grid}>
          {free.map(m => renderModule(m, false))}
        </View>

        {premium.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>PREMIUM MODULES</Text>
            <View style={styles.grid}>
              {premium.map(m => renderModule(m, !isPremium))}
            </View>
          </>
        )}

        {!isPremium && (
          <View style={styles.upgradeBanner}>
            <Text style={styles.upgradeEmoji}>🌟</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.upgradeTitle}>Unlock everything!</Text>
              <Text style={styles.upgradeSub}>Animals, Shapes, Fruits + more</Text>
            </View>
            <TouchableOpacity style={styles.upgradeBtn} activeOpacity={0.85}>
              <Text style={styles.upgradeBtnText}>Try Free</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:       { padding: spacing.lg, paddingTop: spacing.xl, backgroundColor: colors.sky, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title:        { fontSize: fontSize.xxl, fontWeight: fontWeight.heavy, color: colors.white },
  sub:          { fontSize: fontSize.md, color: 'rgba(255,255,255,0.88)', fontWeight: fontWeight.bold, marginTop: 4 },
  scroll:       { padding: spacing.lg, gap: spacing.lg, paddingBottom: 40 },
  sectionLabel: { fontSize: fontSize.xs, fontWeight: fontWeight.heavy, color: colors.warmGray, letterSpacing: 1.5 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card:         { width: '47%', backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden', ...shadow.sm },
  cardLocked:   { opacity: 0.75 },
  cardHeader:   { height: 70, alignItems: 'center', justifyContent: 'center' },
  cardHeaderEmoji:{ fontSize: 38 },
  cardBody:     { padding: 12, gap: 4 },
  cardTitle:    { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark },
  cardCount:    { fontSize: fontSize.xs, color: colors.warmGray, fontWeight: fontWeight.bold },
  badge:        { alignSelf: 'flex-start', borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 3, marginTop: 4 },
  badgeText:    { fontSize: 10, fontWeight: fontWeight.heavy },
  upgradeBanner:{ backgroundColor: colors.sun, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadow.md },
  upgradeEmoji: { fontSize: 36 },
  upgradeTitle: { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark },
  upgradeSub:   { fontSize: fontSize.sm, color: 'rgba(0,0,0,0.55)' },
  upgradeBtn:   { backgroundColor: colors.coral, borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 10 },
  upgradeBtnText:{ fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.white },
});
