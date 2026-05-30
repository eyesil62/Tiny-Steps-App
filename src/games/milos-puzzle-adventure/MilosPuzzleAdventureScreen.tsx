// ============================================================
// Milo's Puzzle Adventure — Main Screen
// Premium drag-and-snap puzzle game for ages 2–8
// ============================================================
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, Modal, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

import { usePuzzleStore } from './store/usePuzzleStore';
import { PuzzleBoard }    from './components/PuzzleBoard';
import { PUZZLES, CATEGORIES, getPuzzlesByCategory, Puzzle } from './data/puzzles';
import { STICKERS, TOYS, WORLDS, getBadge } from './data/rewards';

const { width: W } = Dimensions.get('window');

function say(text: string) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate: 0.88, pitch: 1.1 }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 120);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate: 0.88, pitch: 1.1 }); } catch {} }, 120));
}

type Screen = 'home' | 'puzzles' | 'playing' | 'stickers' | 'toys' | 'worlds';

// ── Completion Modal ─────────────────────────────────────
function CompletionModal({ visible, puzzle, onContinue }: { visible: boolean; puzzle: Puzzle | null; onContinue: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const fxAnim    = useRef(new Animated.Value(0)).current;
  const stars     = useRef(Array.from({ length: 5 }, () => ({ y: new Animated.Value(0), opacity: new Animated.Value(0), x: new Animated.Value(0) }))).current;

  useEffect(() => {
    if (!visible || !puzzle) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();

    // Completion FX animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(fxAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.timing(fxAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
      ]), { iterations: 3 }
    ).start();

    stars.forEach((s, i) => {
      Animated.sequence([
        Animated.delay(i * 100),
        Animated.parallel([
          Animated.timing(s.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(s.y, { toValue: -90 - Math.random() * 30, duration: 700, useNativeDriver: true }),
          Animated.timing(s.x, { toValue: (Math.random() - 0.5) * 120, duration: 700, useNativeDriver: true }),
        ]),
        Animated.timing(s.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });

    setTimeout(() => say(puzzle.completionSpeech), 400);
  }, [visible]);

  if (!visible || !puzzle) return null;
  const sticker = STICKERS.find(s => s.id === puzzle.stickerId);
  const toy     = TOYS.find(t => t.id === puzzle.toyId);

  // FX transform based on type
  const fxStyle = (() => {
    switch (puzzle.completionFx) {
      case 'launch': return { transform: [{ translateY: fxAnim.interpolate({ inputRange: [0,1], outputRange: [0,-30] }) }] };
      case 'bounce': return { transform: [{ translateY: fxAnim.interpolate({ inputRange: [0,1], outputRange: [0,-20] }) }] };
      case 'move':   return { transform: [{ translateX: fxAnim.interpolate({ inputRange: [0,1], outputRange: [-15,15] }) }] };
      case 'glow':   return { opacity: fxAnim.interpolate({ inputRange: [0,1], outputRange: [1,0.5] }) };
      default:       return { transform: [{ scale: fxAnim.interpolate({ inputRange: [0,1], outputRange: [1,1.15] }) }] };
    }
  })();

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.modalOverlay}>
        {stars.map((s, i) => (
          <Animated.View key={i} style={[styles.flyStar, { opacity: s.opacity, transform: [{ translateX: s.x }, { translateY: s.y }] }]}>
            <Text style={{ fontSize: 28 }}>⭐</Text>
          </Animated.View>
        ))}
        <Animated.View style={[styles.modalCard, { transform: [{ scale: scaleAnim }] }]}>
          <Animated.Text style={[styles.completedEmoji, fxStyle]}>{puzzle.emoji}</Animated.Text>
          <Text style={styles.modalTitle}>Puzzle Complete!</Text>
          <Text style={styles.modalPuzzleName}>{puzzle.title}</Text>
          <Text style={styles.modalStars}>+10 ⭐</Text>

          <View style={styles.modalRewards}>
            <View style={styles.modalReward}>
              <Text style={styles.modalRewardEmoji}>{sticker?.emoji}</Text>
              <Text style={styles.modalRewardLabel}>Sticker!</Text>
            </View>
            <View style={styles.modalReward}>
              <Text style={styles.modalRewardEmoji}>{toy?.emoji}</Text>
              <Text style={styles.modalRewardLabel}>Toy!</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.modalBtn} onPress={onContinue} activeOpacity={0.88}>
            <Text style={styles.modalBtnText}>Next Puzzle! 🧩</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

export default function MilosPuzzleAdventureScreen() {
  const store = usePuzzleStore();
  const [screen,    setScreen]    = useState<Screen>('home');
  const [category,  setCategory]  = useState('');
  const [puzzle,    setPuzzle]    = useState<Puzzle | null>(null);
  const [showComplete, setShowComplete] = useState(false);

  useEffect(() => { store.loadState(); }, []);

  const completed = store.completedPuzzles.length;
  const badge     = getBadge(completed);

  const handleComplete = () => {
    if (!puzzle) return;
    store.completePuzzle(puzzle.id, puzzle.stickerId, puzzle.toyId, puzzle.world);
    setShowComplete(true);
  };

  const startPuzzle = (p: Puzzle) => {
    setPuzzle(p);
    setScreen('playing');
    say(`Let's build the ${p.title}! Drag each piece into place!`);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: screen === 'playing' ? '#C77DFF' : screen === 'puzzles' ? '#6BCB77' : '#FF9F43',
      }]}>
        <TouchableOpacity onPress={() => {
          if (screen === 'playing') { setPuzzle(null); setScreen('puzzles'); }
          else if (screen === 'puzzles') setScreen('home');
          else if (screen === 'stickers' || screen === 'toys' || screen === 'worlds') setScreen('home');
          else router.back();
        }} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {screen === 'home' ? '🧩 Puzzle Adventure' :
           screen === 'puzzles' ? '🧩 Choose a Puzzle' :
           screen === 'playing' ? `🧩 ${puzzle?.title}` :
           screen === 'stickers' ? '📒 Stickers' :
           screen === 'toys' ? '🧸 Toy Shelf' : '🌍 My Worlds'}
        </Text>
        <View style={styles.starsBadge}><Text style={styles.starsText}>⭐{store.totalStars}</Text></View>
      </View>

      {/* HOME */}
      {screen === 'home' && (
        <ScrollView contentContainerStyle={styles.homeScroll}>
          <View style={styles.miloRow}>
            <Text style={styles.miloEmoji}>🦉</Text>
            <View style={styles.miloBubble}>
              <Text style={styles.miloText}>Let's solve some puzzles together! Each one has a surprise! 🧩</Text>
            </View>
          </View>

          <View style={styles.badgeCard}>
            <Text style={{ fontSize: 44 }}>{badge.emoji}</Text>
            <View>
              <Text style={styles.badgeTitle}>{badge.title}</Text>
              <Text style={styles.badgeSub}>{completed} puzzles solved · ⭐{store.totalStars}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.playBtn} onPress={() => setScreen('puzzles')} activeOpacity={0.88}>
            <Text style={{ fontSize: 36 }}>🧩</Text>
            <Text style={styles.playBtnText}>Solve a Puzzle!</Text>
          </TouchableOpacity>

          <Text style={styles.homeSection}>My Collections</Text>
          <View style={styles.collectRow}>
            <TouchableOpacity style={styles.collectCard} onPress={() => setScreen('stickers')} activeOpacity={0.85}>
              <Text style={{ fontSize: 32 }}>📒</Text>
              <Text style={styles.collectLabel}>Stickers</Text>
              <Text style={styles.collectCount}>{store.unlockedStickers.length}/{STICKERS.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.collectCard} onPress={() => setScreen('toys')} activeOpacity={0.85}>
              <Text style={{ fontSize: 32 }}>🧸</Text>
              <Text style={styles.collectLabel}>Toys</Text>
              <Text style={styles.collectCount}>{store.unlockedToys.length}/{TOYS.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.collectCard} onPress={() => setScreen('worlds')} activeOpacity={0.85}>
              <Text style={{ fontSize: 32 }}>🌍</Text>
              <Text style={styles.collectLabel}>Worlds</Text>
              <Text style={styles.collectCount}>{Object.keys(store.worldProgress).length}/{WORLDS.length}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* PUZZLE SELECT */}
      {screen === 'puzzles' && (
        <ScrollView contentContainerStyle={styles.puzzleScroll}>
          {/* Category filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catRow}>
            <TouchableOpacity style={[styles.catChip, category === '' && styles.catChipActive]} onPress={() => setCategory('')} activeOpacity={0.85}>
              <Text style={styles.catChipText}>All</Text>
            </TouchableOpacity>
            {CATEGORIES.map(cat => {
              const locked = completed < cat.unlockAt;
              return (
                <TouchableOpacity key={cat.id} style={[styles.catChip, category === cat.id && styles.catChipActive, locked && styles.catChipLocked]}
                  onPress={() => !locked && setCategory(cat.id)} activeOpacity={0.85}>
                  <Text style={styles.catChipEmoji}>{locked ? '🔒' : cat.emoji}</Text>
                  <Text style={styles.catChipText}>{cat.name}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Puzzle grid */}
          <View style={styles.puzzleGrid}>
            {(category ? getPuzzlesByCategory(category) : PUZZLES).map(p => {
              const done   = store.completedPuzzles.includes(p.id);
              const locked = completed < p.unlockAt;
              return (
                <TouchableOpacity key={p.id} style={[styles.puzzleCard, done && styles.puzzleCardDone, locked && styles.puzzleCardLocked]}
                  onPress={() => !locked && startPuzzle(p)} activeOpacity={locked ? 0.5 : 0.88}>
                  <View style={[styles.puzzlePreview, { backgroundColor: p.bgColor }]}>
                    <Text style={styles.puzzlePreviewEmoji}>{locked ? '🔒' : p.emoji}</Text>
                    {done && <Text style={styles.puzzleCheck}>✓</Text>}
                  </View>
                  <Text style={styles.puzzleName}>{p.title}</Text>
                  <Text style={styles.puzzlePieces}>{p.pieceCount} pieces</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* PLAYING */}
      {screen === 'playing' && puzzle && (
        <ScrollView contentContainerStyle={styles.playingScroll}>
          <PuzzleBoard key={puzzle.id} puzzle={puzzle} onComplete={handleComplete} />
        </ScrollView>
      )}

      {/* STICKERS */}
      {screen === 'stickers' && (
        <ScrollView contentContainerStyle={styles.gridScroll}>
          <Text style={styles.collectionTitle}>{store.unlockedStickers.length} / {STICKERS.length} stickers</Text>
          <View style={styles.collectionGrid}>
            {STICKERS.map(s => {
              const earned = store.unlockedStickers.includes(s.id);
              return (
                <View key={s.id} style={[styles.collectionSlot, earned && styles.collectionEarned]}>
                  <Text style={[styles.collectionEmoji, !earned && { opacity: 0.25 }]}>{earned ? s.emoji : '❔'}</Text>
                  <Text style={styles.collectionName}>{earned ? s.name : '???'}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* TOYS */}
      {screen === 'toys' && (
        <ScrollView contentContainerStyle={styles.gridScroll}>
          <Text style={styles.collectionTitle}>{store.unlockedToys.length} / {TOYS.length} toys</Text>
          <View style={styles.collectionGrid}>
            {TOYS.map(t => {
              const earned = store.unlockedToys.includes(t.id);
              return (
                <View key={t.id} style={[styles.collectionSlot, earned && styles.collectionEarned]}>
                  <Text style={[styles.collectionEmoji, !earned && { opacity: 0.25 }]}>{earned ? t.emoji : '❔'}</Text>
                  <Text style={styles.collectionName}>{earned ? t.name : '???'}</Text>
                </View>
              );
            })}
          </View>
        </ScrollView>
      )}

      {/* WORLDS */}
      {screen === 'worlds' && (
        <ScrollView contentContainerStyle={styles.gridScroll}>
          <Text style={styles.collectionTitle}>Build your worlds by solving puzzles!</Text>
          {WORLDS.map(world => {
            const items = store.worldProgress[world.id] ?? [];
            return (
              <View key={world.id} style={[styles.worldCard, { borderColor: world.color }]}>
                <View style={[styles.worldBanner, { backgroundColor: world.color }]}>
                  <Text style={styles.worldEmoji}>{world.emoji}</Text>
                  <Text style={styles.worldName}>{world.name}</Text>
                </View>
                <View style={styles.worldItems}>
                  {items.length === 0 ? (
                    <Text style={styles.worldEmpty}>Solve puzzles to build this world!</Text>
                  ) : (
                    items.map((pid, i) => {
                      const p = PUZZLES.find(x => x.id === pid);
                      return p ? <Text key={i} style={{ fontSize: 32 }}>{p.emoji}</Text> : null;
                    })
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Completion modal */}
      <CompletionModal
        visible={showComplete}
        puzzle={puzzle}
        onContinue={() => { setShowComplete(false); setScreen('puzzles'); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#FFF9F0' },
  header:            { flexDirection: 'row', alignItems: 'center', padding: 12 },
  backBtn:           { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:          { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerTitle:       { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '900', color: '#fff' },
  starsBadge:        { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  starsText:         { fontSize: 13, fontWeight: '900', color: '#fff' },
  homeScroll:        { padding: 16, gap: 16, paddingBottom: 32 },
  miloRow:           { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  miloEmoji:         { fontSize: 52 },
  miloBubble:        { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  miloText:          { fontSize: 13, fontWeight: '700', color: '#3D3530', lineHeight: 20 },
  badgeCard:         { backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  badgeTitle:        { fontSize: 18, fontWeight: '900', color: '#3D3530' },
  badgeSub:          { fontSize: 12, color: '#8B8178', fontWeight: '700', marginTop: 2 },
  playBtn:           { backgroundColor: '#C77DFF', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  playBtnText:       { fontSize: 22, fontWeight: '900', color: '#fff' },
  homeSection:       { fontSize: 13, fontWeight: '800', color: '#8B8178' },
  collectRow:        { flexDirection: 'row', gap: 10 },
  collectCard:       { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  collectLabel:      { fontSize: 12, fontWeight: '900', color: '#3D3530' },
  collectCount:      { fontSize: 10, color: '#8B8178', fontWeight: '700' },
  puzzleScroll:      { padding: 16, gap: 14, paddingBottom: 32 },
  catRow:            { gap: 8, paddingBottom: 4 },
  catChip:           { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#fff', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 2, borderColor: '#F5EDD8' },
  catChipActive:     { borderColor: '#6BCB77', backgroundColor: '#E5F7E7' },
  catChipLocked:     { opacity: 0.5 },
  catChipEmoji:      { fontSize: 16 },
  catChipText:       { fontSize: 12, fontWeight: '800', color: '#3D3530' },
  puzzleGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  puzzleCard:        { width: '30%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2 },
  puzzleCardDone:    { borderWidth: 2, borderColor: '#6BCB77' },
  puzzleCardLocked:  { opacity: 0.55 },
  puzzlePreview:     { height: 72, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  puzzlePreviewEmoji:{ fontSize: 40 },
  puzzleCheck:       { position: 'absolute', top: 4, right: 6, fontSize: 16, color: '#6BCB77', fontWeight: '900' },
  puzzleName:        { padding: 6, fontSize: 10, fontWeight: '800', color: '#3D3530', textAlign: 'center' },
  puzzlePieces:      { paddingBottom: 6, fontSize: 9, color: '#8B8178', fontWeight: '700', textAlign: 'center' },
  playingScroll:     { padding: 16, alignItems: 'center', paddingBottom: 40 },
  gridScroll:        { padding: 16, gap: 14, paddingBottom: 32 },
  collectionTitle:   { fontSize: 14, fontWeight: '800', color: '#8B8178', textAlign: 'center' },
  collectionGrid:    { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  collectionSlot:    { width: '28%', backgroundColor: '#F5EDD8', borderRadius: 16, padding: 12, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: '#F5EDD8' },
  collectionEarned:  { backgroundColor: '#FFF3E0', borderColor: '#FF9F43' },
  collectionEmoji:   { fontSize: 40 },
  collectionName:    { fontSize: 10, fontWeight: '800', color: '#8B8178', textAlign: 'center' },
  worldCard:         { backgroundColor: '#fff', borderRadius: 18, borderWidth: 2, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  worldBanner:       { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  worldEmoji:        { fontSize: 28 },
  worldName:         { fontSize: 16, fontWeight: '900', color: '#fff' },
  worldItems:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 14, minHeight: 50, alignItems: 'center' },
  worldEmpty:        { fontSize: 12, color: '#8B8178', fontWeight: '700', fontStyle: 'italic' },
  modalOverlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center' },
  flyStar:           { position: 'absolute', bottom: '40%' },
  modalCard:         { backgroundColor: '#FFF9F0', borderRadius: 28, padding: 28, alignItems: 'center', gap: 12, width: W * 0.82 },
  completedEmoji:    { fontSize: 72 },
  modalTitle:        { fontSize: 26, fontWeight: '900', color: '#3D3530' },
  modalPuzzleName:   { fontSize: 16, fontWeight: '800', color: '#8B8178' },
  modalStars:        { fontSize: 24, fontWeight: '900', color: '#FF9F43' },
  modalRewards:      { flexDirection: 'row', gap: 24, backgroundColor: '#FFF3E0', borderRadius: 16, padding: 16, marginVertical: 4 },
  modalReward:       { alignItems: 'center', gap: 4 },
  modalRewardEmoji:  { fontSize: 40 },
  modalRewardLabel:  { fontSize: 11, fontWeight: '900', color: '#FF9F43' },
  modalBtn:          { backgroundColor: '#6BCB77', borderRadius: 99, paddingHorizontal: 32, paddingVertical: 14, width: '100%', alignItems: 'center' },
  modalBtnText:      { color: '#fff', fontSize: 17, fontWeight: '900' },
});
