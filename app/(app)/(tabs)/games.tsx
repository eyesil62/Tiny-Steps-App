import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAppStore } from '../../../src/stores/useAppStore';
import { getWorldGames, getClassicGames } from '../../../src/data/gamesData';
import { fontSize, fontWeight, radius, shadow } from '../../../src/theme';
import type { AgeGroup } from '../../../src/types';

const BG    = '#EBF0FA';
const NAVY  = '#2D5BE3';
const TEAL  = '#4ECDC4';
const DARK  = '#1A2B5F';
const WHITE = '#FFFFFF';

const PAD = 16;
const GAP = 12;
const SW  = Dimensions.get('window').width;
const W2  = (SW - PAD * 2 - GAP) / 2;
const W3  = (SW - PAD * 2 - GAP * 2) / 3;

export default function GamesScreen() {
  const activeChild  = useAppStore((s) => s.activeChild);
  const isPremium    = useAppStore((s) => s.isPremium);
  const ageGroup     = (activeChild?.age_group ?? '2-4') as AgeGroup;
  const worldGames   = getWorldGames(ageGroup);
  const classicGames = getClassicGames(ageGroup);
  const name         = activeChild?.name ?? 'Explorer';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BG }}>

      {/* ── Header ────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Game Time! 🎮</Text>
          <Text style={styles.headerSub}>Let's play, {name}!</Text>
        </View>
        <View style={styles.starPill}>
          <Text style={styles.starPillText}>⭐ 30</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* ── Mini Worlds ───────────────────────────────── */}
        {worldGames.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>My Mini Worlds</Text>

            <View style={styles.worldGrid}>
              {worldGames.map((game) => {
                const locked = game.isPremium && !isPremium;
                return (
                  <TouchableOpacity
                    key={game.id}
                    style={[styles.worldCard, locked && styles.lockedCard]}
                    onPress={() => !locked && router.push(`/(app)/games/${game.id}` as any)}
                    activeOpacity={0.85}
                  >
                    {/* Illustration area */}
                    <View style={[styles.worldArt, { backgroundColor: game.colorLight }]}>
                      <Text style={styles.worldEmoji}>{locked ? '🔒' : game.emoji}</Text>
                      <View style={[styles.accentLine, { backgroundColor: TEAL }]} />
                      {game.isNew && !locked && (
                        <View style={[styles.cornerBadge, { backgroundColor: NAVY }]}>
                          <Text style={styles.cornerBadgeText}>NEW</Text>
                        </View>
                      )}
                      {locked && (
                        <View style={[styles.cornerBadge, { backgroundColor: '#FFD93D' }]}>
                          <Text style={[styles.cornerBadgeText, { color: '#3D3530' }]}>PRO</Text>
                        </View>
                      )}
                    </View>

                    {/* Info */}
                    <View style={styles.cardBody}>
                      <Text style={styles.worldCardTitle} numberOfLines={1}>{game.title}</Text>
                      <View style={[styles.tag, { backgroundColor: `${game.color}22` }]}>
                        <Text style={[styles.tagText, { color: game.color }]}>{game.teaches}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        )}

        {/* ── Quick Games ───────────────────────────────── */}
        {classicGames.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 8 }]}>Quick Games</Text>

            <View style={styles.classicGrid}>
              {classicGames.map((game) => (
                <TouchableOpacity
                  key={game.id}
                  style={styles.classicCard}
                  onPress={() => router.push(`/(app)/games/${game.id}` as any)}
                  activeOpacity={0.85}
                >
                  <View style={[styles.classicArt, { backgroundColor: game.colorLight }]}>
                    <Text style={styles.classicEmoji}>{game.emoji}</Text>
                    <View style={[styles.accentLine, { backgroundColor: TEAL }]} />
                  </View>
                  <View style={styles.cardBody}>
                    <Text style={styles.classicCardTitle} numberOfLines={1}>{game.title}</Text>
                    <View style={[styles.tag, { backgroundColor: `${game.color}22` }]}>
                      <Text style={[styles.tagText, { color: game.color }]}>{game.teaches}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:          { backgroundColor: NAVY, paddingHorizontal: PAD, paddingTop: 16, paddingBottom: 28, borderBottomLeftRadius: 28, borderBottomRightRadius: 28, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle:     { fontSize: fontSize.xxl, fontWeight: fontWeight.heavy, color: WHITE },
  headerSub:       { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.75)', fontWeight: fontWeight.bold, marginTop: 2 },
  starPill:        { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  starPillText:    { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: WHITE },

  scroll:          { padding: PAD, gap: GAP, paddingBottom: 40 },
  sectionTitle:    { fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: DARK, marginBottom: 4 },
  lockedCard:      { opacity: 0.62 },

  // World cards — 2-column portrait grid
  worldGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  worldCard:       { width: W2, backgroundColor: WHITE, borderRadius: 18, overflow: 'hidden', ...shadow.md },
  worldArt:        { height: 130, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  worldEmoji:      { fontSize: 54 },
  accentLine:      { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3 },
  cornerBadge:     { position: 'absolute', top: 8, left: 8, borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3 },
  cornerBadgeText: { fontSize: 9, fontWeight: fontWeight.heavy, color: WHITE, letterSpacing: 0.5 },
  cardBody:        { padding: 10, gap: 6 },
  worldCardTitle:  { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: DARK },
  tag:             { borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  tagText:         { fontSize: 10, fontWeight: fontWeight.heavy },

  // Classic cards — 3-column grid
  classicGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: GAP },
  classicCard:     { width: W3, backgroundColor: WHITE, borderRadius: 16, overflow: 'hidden', ...shadow.sm },
  classicArt:      { height: 86, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  classicEmoji:    { fontSize: 36 },
  classicCardTitle:{ fontSize: 11, fontWeight: fontWeight.heavy, color: DARK, textAlign: 'center' },
});
