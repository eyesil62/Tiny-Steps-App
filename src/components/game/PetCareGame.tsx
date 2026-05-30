// ============================================================
// 🐾 Pet Care World — Ages 4–6
// Adopt, feed, wash, play with your pet
// Uses TouchWorldEngine with care-game mechanics
// ============================================================

import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width: W } = Dimensions.get('window');

const PETS = [
  { id: 'dog',    emoji: '🐶', name: 'Buddy',  sound: 'Woof! Woof! I am so happy!' },
  { id: 'cat',    emoji: '🐱', name: 'Whiskers', sound: 'Purrr... I love you!' },
  { id: 'bunny',  emoji: '🐰', name: 'Hoppy',  sound: 'Boing boing! I love carrots!' },
  { id: 'hamster',emoji: '🐹', name: 'Peanut', sound: 'Squeak! Squeak! Play with me!' },
];

const CARE_ACTIONS = [
  { id: 'feed',  emoji: '🍖', label: 'Feed',  color: '#FF9F43', speech: 'Yum yum! Thank you for feeding me!',    effect: '😋', stat: 'hunger'  },
  { id: 'water', emoji: '💧', label: 'Water', color: '#4D96FF', speech: 'Refreshing! I was so thirsty!',         effect: '💦', stat: 'thirst'  },
  { id: 'wash',  emoji: '🛁', label: 'Wash',  color: '#6BCB77', speech: 'Splish splash! I am so clean now!',     effect: '✨', stat: 'clean'   },
  { id: 'play',  emoji: '🎾', label: 'Play',  color: '#C77DFF', speech: 'Wheee! This is so much fun!',           effect: '🎉', stat: 'happy'   },
  { id: 'sleep', emoji: '😴', label: 'Sleep', color: '#8899BB', speech: 'Yaaaawn... I needed that nap. Zzz...',  effect: '💤', stat: 'energy'  },
  { id: 'love',  emoji: '❤️', label: 'Love',  color: '#FF6B6B', speech: 'I love you so much! You are the best!', effect: '💖', stat: 'love'    },
];

const MAX_STAT = 5;

interface PetStats {
  hunger: number; thirst: number; clean: number;
  happy: number; energy: number; love: number;
}

function StatBar({ label, emoji, value }: { label: string; emoji: string; value: number }) {
  return (
    <View style={stats.row}>
      <Text style={stats.emoji}>{emoji}</Text>
      <View style={stats.bar}>
        {Array.from({ length: MAX_STAT }).map((_, i) => (
          <View key={i} style={[stats.pip, i < value && stats.pipFilled]} />
        ))}
      </View>
    </View>
  );
}

const stats = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emoji:     { fontSize: 16, width: 24 },
  bar:       { flexDirection: 'row', gap: 3 },
  pip:       { width: 14, height: 14, borderRadius: 7, backgroundColor: '#F5EDD8' },
  pipFilled: { backgroundColor: '#6BCB77' },
});

function safeSpeak(text: string) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate: 0.8, pitch: 1.2 }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 120);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate: 0.8, pitch: 1.2 }); } catch {} }, 120));
}

export default function PetCareGame() {
  const [selectedPet, setSelectedPet] = useState<typeof PETS[0] | null>(null);
  const [petStats, setPetStats] = useState<PetStats>({ hunger: 3, thirst: 3, clean: 3, happy: 3, energy: 4, love: 3 });
  const [reaction, setReaction]   = useState<string | null>(null);
  const [stars,    setStars]       = useState(0);
  const petScale = React.useRef(new Animated.Value(1)).current;
  const petY     = React.useRef(new Animated.Value(0)).current;

  function adoptPet(pet: typeof PETS[0]) {
    setSelectedPet(pet);
    safeSpeak(`You adopted ${pet.name}! Take good care of me!`);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  function doAction(action: typeof CARE_ACTIONS[0]) {
    if (!selectedPet) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeSpeak(action.speech);

    // Update stat
    setPetStats(prev => ({
      ...prev,
      [action.stat]: Math.min(MAX_STAT, (prev as any)[action.stat] + 1),
    }));

    // Pet bounce
    Animated.sequence([
      Animated.spring(petY, { toValue: -20, tension: 120, friction: 5, useNativeDriver: true }),
      Animated.spring(petY, { toValue: 0,   tension: 80,  friction: 6, useNativeDriver: true }),
    ]).start();

    Animated.sequence([
      Animated.timing(petScale, { toValue: 1.2, duration: 150, useNativeDriver: true }),
      Animated.spring(petScale, { toValue: 1,   tension: 100, friction: 4, useNativeDriver: true }),
    ]).start();

    // Reaction
    setReaction(action.effect);
    setTimeout(() => setReaction(null), 1400);
    setStars(s => s + 1);
  }

  function tapPet() {
    if (!selectedPet) return;
    safeSpeak(selectedPet.sound);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.sequence([
      Animated.timing(petY, { toValue: -14, duration: 150, useNativeDriver: true }),
      Animated.spring(petY, { toValue: 0,   tension: 100, friction: 5, useNativeDriver: true }),
    ]).start();
    setReaction('💕');
    setTimeout(() => setReaction(null), 1000);
  }

  // Pet adoption screen
  if (!selectedPet) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={[styles.header, { backgroundColor: '#FF9F43' }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>🐾 Pet Care World</Text>
          <View style={{ width: 36 }} />
        </View>

        <View style={styles.adoptContainer}>
          <Text style={styles.adoptTitle}>Choose your pet! 🐾</Text>
          <Text style={styles.adoptSub}>Tap a pet to adopt it</Text>

          <View style={styles.petsGrid}>
            {PETS.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={styles.petCard}
                onPress={() => adoptPet(pet)}
                activeOpacity={0.85}
              >
                <Text style={styles.petCardEmoji}>{pet.emoji}</Text>
                <Text style={styles.petCardName}>{pet.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const totalHappiness = Math.round(
    Object.values(petStats).reduce((a, b) => a + b, 0) / Object.keys(petStats).length
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { backgroundColor: '#FF9F43' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🐾 {selectedPet.name}</Text>
        <View style={styles.starsBadge}>
          <Text style={styles.starsText}>⭐{stars}</Text>
        </View>
      </View>

      {/* Pet display area */}
      <View style={styles.petArea}>
        {/* Background */}
        <View style={styles.petRoom} />

        {/* Overall happiness */}
        <View style={styles.happinessRow}>
          {Array.from({ length: MAX_STAT }).map((_, i) => (
            <Text key={i} style={[styles.heart, { opacity: i < totalHappiness ? 1 : 0.2 }]}>❤️</Text>
          ))}
        </View>

        {/* Pet */}
        <TouchableOpacity onPress={tapPet} activeOpacity={0.8} style={styles.petWrap}>
          <Animated.View style={{ transform: [{ translateY: petY }, { scale: petScale }] }}>
            <Text style={styles.petEmoji}>{selectedPet.emoji}</Text>
          </Animated.View>
          {reaction && (
            <View style={styles.reactionBubble}>
              <Text style={styles.reactionText}>{reaction}</Text>
            </View>
          )}
          <Text style={styles.tapHint}>Tap me! 👆</Text>
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.statsPanel}>
          <StatBar label="Food"   emoji="🍖" value={petStats.hunger} />
          <StatBar label="Water"  emoji="💧" value={petStats.thirst} />
          <StatBar label="Clean"  emoji="✨" value={petStats.clean}  />
          <StatBar label="Happy"  emoji="😊" value={petStats.happy}  />
          <StatBar label="Energy" emoji="⚡" value={petStats.energy} />
          <StatBar label="Love"   emoji="❤️" value={petStats.love}   />
        </View>
      </View>

      {/* Care action buttons */}
      <View style={styles.actionsGrid}>
        {CARE_ACTIONS.map((action) => (
          <TouchableOpacity
            key={action.id}
            style={[styles.actionBtn, { backgroundColor: action.color }]}
            onPress={() => doAction(action)}
            activeOpacity={0.85}
          >
            <Text style={styles.actionEmoji}>{action.emoji}</Text>
            <Text style={styles.actionLabel}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#FFF9F0' },
  header:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn:        { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:       { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerTitle:    { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#fff' },
  starsBadge:     { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  starsText:      { fontSize: 14, fontWeight: '900', color: '#fff' },
  adoptContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  adoptTitle:     { fontSize: 28, fontWeight: '900', color: '#3D3530' },
  adoptSub:       { fontSize: 15, fontWeight: '700', color: '#8B8178' },
  petsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  petCard:        { width: 130, height: 140, backgroundColor: '#fff', borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4, borderWidth: 2, borderColor: '#FF9F43' },
  petCardEmoji:   { fontSize: 56 },
  petCardName:    { fontSize: 16, fontWeight: '900', color: '#3D3530' },
  petArea:        { flex: 1, position: 'relative', alignItems: 'center' },
  petRoom:        { position: 'absolute', inset: 0, backgroundColor: '#FFF3E0' },
  happinessRow:   { flexDirection: 'row', gap: 4, paddingTop: 12 },
  heart:          { fontSize: 22 },
  petWrap:        { alignItems: 'center', justifyContent: 'center', flex: 1, gap: 8, position: 'relative' },
  petEmoji:       { fontSize: 110 },
  reactionBubble: { position: 'absolute', top: -10, backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  reactionText:   { fontSize: 28 },
  tapHint:        { fontSize: 13, fontWeight: '700', color: '#8B8178' },
  statsPanel:     { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 16, padding: 12, gap: 6, margin: 12, width: W - 32, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  actionsGrid:    { flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, backgroundColor: '#fff', justifyContent: 'center' },
  actionBtn:      { width: (W - 60) / 3, paddingVertical: 12, borderRadius: 16, alignItems: 'center', gap: 4 },
  actionEmoji:    { fontSize: 28 },
  actionLabel:    { fontSize: 11, fontWeight: '900', color: '#fff' },
});
