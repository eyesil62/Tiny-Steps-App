import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '../../../src/stores/useAppStore';
import { GAMES, getWorldGames, getClassicGames } from '../../../src/data/gamesData';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../../src/theme';
import type { AgeGroup } from '../../../src/types';

export default function GamesScreen() {
  const activeChild = useAppStore((s) => s.activeChild);
  const isPremium   = useAppStore((s) => s.isPremium);
  const ageGroup    = (activeChild?.age_group ?? '2-4') as AgeGroup;
  const worldGames  = getWorldGames(ageGroup);
  const classicGames= getClassicGames(ageGroup);
  const name        = activeChild?.name ?? 'Explorer';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      <View style={styles.header}>
        <Text style={styles.title}>Game Time! 🎮</Text>
        <Text style={styles.sub}>Let's play, {name}!</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Mini-World Games ─────────────────────────── */}
        {worldGames.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>🌍 MINI WORLDS</Text>
              <Text style={styles.sectionSub}>Explore & discover!</Text>
            </View>

            {worldGames.map((game) => {
              const locked = game.isPremium && !isPremium;
              return (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.worldCard, { borderColor: game.color }, locked && styles.worldCardLocked]}
                  onPress={() => !locked && router.push(`/(app)/games/${game.id}` as any)}
                  activeOpacity={locked ? 0.55 : 0.88}
                >
                  {/* Color panel */}
                  <View style={[styles.worldPanel, { backgroundColor: game.color }]}>
                    <Text style={styles.worldPanelEmoji}>{locked ? '🔒' : game.emoji}</Text>
                    <View style={styles.worldTypeBadge}>
                      <Text style={styles.worldTypeBadgeText}>WORLD</Text>
                    </View>
                    {game.isNew && !locked && (
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>NEW</Text>
                      </View>
                    )}
                  </View>

                  {/* Info */}
                  <View style={styles.worldInfo}>
                    <Text style={styles.worldTitle}>{game.title}</Text>
                    <Text style={styles.worldDesc}>{game.description}</Text>
                    <View style={styles.worldTagRow}>
                      <View style={[styles.tag, { backgroundColor: game.colorLight }]}>
                        <Text style={[styles.tagText, { color: game.color }]}>🎓 {game.teaches}</Text>
                      </View>
                      {locked && (
                        <View style={[styles.tag, { backgroundColor: colors.sunLight }]}>
                          <Text style={[styles.tagText, { color: colors.dark }]}>⭐ Premium</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {!locked && <Text style={styles.arrow}>▶</Text>}
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── Classic Games ─────────────────────────────── */}
        {classicGames.length > 0 && (
          <>
            <View style={styles.sectionRow}>
              <Text style={styles.sectionLabel}>🎯 QUICK GAMES</Text>
              <Text style={styles.sectionSub}>Fast & fun!</Text>
            </View>
            <View style={styles.classicGrid}>
              {classicGames.map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={[styles.classicCard, { backgroundColor: game.colorLight, borderColor: game.color }]}
                  onPress={() => router.push(`/(app)/games/${game.id}` as any)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.classicEmoji}>{game.emoji}</Text>
                  <Text style={styles.classicTitle}>{game.title}</Text>
                  <Text style={styles.classicTeaches}>{game.teaches}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:          { padding: spacing.lg, paddingTop: spacing.xl, backgroundColor: colors.coral, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  title:           { fontSize: fontSize.xxl, fontWeight: fontWeight.heavy, color: colors.white },
  sub:             { fontSize: fontSize.md, color: 'rgba(255,255,255,0.88)', fontWeight: fontWeight.bold, marginTop: 4 },
  scroll:          { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  sectionRow:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
  sectionLabel:    { fontSize: fontSize.xs, fontWeight: fontWeight.heavy, color: colors.warmGray, letterSpacing: 1.5 },
  sectionSub:      { fontSize: fontSize.xs, color: colors.warmGray, fontWeight: fontWeight.bold },
  worldCard:       { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 2, overflow: 'hidden', ...shadow.md, flexDirection: 'row', alignItems: 'center' },
  worldCardLocked: { opacity: 0.65 },
  worldPanel:      { width: 82, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center', position: 'relative', minHeight: 90, gap: 4 },
  worldPanelEmoji: { fontSize: 38 },
  worldTypeBadge:  { position: 'absolute', bottom: 5, backgroundColor: 'rgba(0,0,0,0.28)', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  worldTypeBadgeText:{ fontSize: 7, fontWeight: fontWeight.heavy, color: colors.white, letterSpacing: 0.5 },
  newBadge:        { position: 'absolute', top: 5, right: -2, backgroundColor: '#FFD93D', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  newBadgeText:    { fontSize: 8, fontWeight: fontWeight.heavy, color: '#3D3530' },
  worldInfo:       { flex: 1, padding: 12, gap: 3 },
  worldTitle:      { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark },
  worldDesc:       { fontSize: fontSize.xs, color: colors.warmGray, fontWeight: fontWeight.bold, lineHeight: 16 },
  worldTagRow:     { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 4 },
  tag:             { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3 },
  tagText:         { fontSize: 10, fontWeight: fontWeight.heavy },
  arrow:           { fontSize: 16, color: colors.warmGray, paddingRight: 12 },
  classicGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  classicCard:     { width: '30%', borderRadius: radius.md, borderWidth: 2, padding: 10, alignItems: 'center', gap: 4, ...shadow.sm },
  classicEmoji:    { fontSize: 34 },
  classicTitle:    { fontSize: 11, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center' },
  classicTeaches:  { fontSize: 9, color: colors.warmGray, fontWeight: fontWeight.bold, textAlign: 'center' },
});
