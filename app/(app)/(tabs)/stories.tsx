import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '../../../src/stores/useAppStore';
import { STORIES, getStoriesForAge, getBedtimeStories } from '../../../src/data/storiesData';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../../src/theme';
import type { AgeGroup } from '../../../src/types';

type Tab = 'all' | 'bedtime' | 'free';

export default function StoriesScreen() {
  const activeChild = useAppStore((s) => s.activeChild);
  const isPremium   = useAppStore((s) => s.isPremium);
  const ageGroup    = (activeChild?.age_group ?? '2-4') as AgeGroup;
  const [tab, setTab] = useState<Tab>('all');

  const ageStories = getStoriesForAge(ageGroup);
  const displayed  = tab === 'bedtime' ? getBedtimeStories().filter(s => s.ageGroups.includes(ageGroup))
                   : tab === 'free'    ? ageStories.filter(s => !s.isPremium)
                   : ageStories;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={styles.header}>
        <Text style={styles.title}>Story Time 📖</Text>
        <Text style={styles.sub}>Tap a story to begin</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {([['all','All'],['free','Free'],['bedtime','🌙 Bedtime']] as [Tab,string][]).map(([key, label]) => (
          <TouchableOpacity
            key={key}
            onPress={() => setTab(key)}
            style={[styles.tab, tab === key && styles.tabActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {displayed.map((story) => {
          const locked = story.isPremium && !isPremium;
          return (
            <TouchableOpacity
              key={story.id}
              style={[styles.card, { borderColor: story.color }]}
              onPress={() => !locked && router.push(`/(app)/stories/${story.id}` as any)}
              activeOpacity={locked ? 0.6 : 0.85}
            >
              {/* Color strip */}
              <View style={[styles.strip, { backgroundColor: story.color }]}>
                <Text style={styles.stripEmoji}>{locked ? '🔒' : story.emoji}</Text>
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardTop}>
                  <Text style={styles.cardTitle}>{story.title}</Text>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    {story.isBedtime && (
                      <View style={[styles.badge, { backgroundColor: '#1a1040' }]}>
                        <Text style={styles.badgeText}>🌙 Bedtime</Text>
                      </View>
                    )}
                    {!story.isPremium && (
                      <View style={[styles.badge, { backgroundColor: colors.mint }]}>
                        <Text style={styles.badgeText}>FREE</Text>
                      </View>
                    )}
                  </View>
                </View>
                <Text style={styles.cardMeta}>
                  {story.pages.length} pages · ~{story.duration} min · {story.theme}
                </Text>
                {locked && (
                  <Text style={styles.lockedText}>⭐ Premium story — unlock to read</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:       { padding: spacing.lg, paddingTop: spacing.xl, backgroundColor: colors.lavender, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title:        { fontSize: fontSize.xxl, fontWeight: fontWeight.heavy, color: colors.white },
  sub:          { fontSize: fontSize.md, color: 'rgba(255,255,255,0.85)', fontWeight: fontWeight.bold, marginTop: 4 },
  tabs:         { flexDirection: 'row', gap: 8, padding: spacing.lg, paddingBottom: 0 },
  tab:          { flex: 1, paddingVertical: 10, borderRadius: radius.full, backgroundColor: colors.white, alignItems: 'center', ...shadow.sm },
  tabActive:    { backgroundColor: colors.lavender },
  tabText:      { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.warmGray },
  tabTextActive:{ color: colors.white },
  scroll:       { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  card:         { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 2, flexDirection: 'row', overflow: 'hidden', ...shadow.sm },
  strip:        { width: 70, alignItems: 'center', justifyContent: 'center' },
  stripEmoji:   { fontSize: 36 },
  cardBody:     { flex: 1, padding: 14, gap: 6 },
  cardTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 },
  cardTitle:    { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark, flex: 1 },
  badge:        { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText:    { fontSize: 10, fontWeight: fontWeight.heavy, color: colors.white },
  cardMeta:     { fontSize: fontSize.xs, color: colors.warmGray, fontWeight: fontWeight.bold },
  lockedText:   { fontSize: fontSize.xs, color: colors.orange, fontWeight: fontWeight.heavy },
});
