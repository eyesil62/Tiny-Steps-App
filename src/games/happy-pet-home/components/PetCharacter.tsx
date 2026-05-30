// ============================================================
// Happy Pet Home — Pet Character with full animations
// idle breathe, blink, tap wiggle, happy jump, sleepy dim
// ============================================================
import React, { useEffect, useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet,
} from 'react-native';
import { getMood, PetNeeds } from '../utils/petNeeds';
import { Pet } from '../data/pets';

type PetMood = 'happy' | 'normal' | 'hungry' | 'dirty' | 'sleepy' | 'sleeping';

interface Props {
  pet:      Pet;
  name:     string;
  needs:    PetNeeds;
  sleeping: boolean;
  onTap:    () => void;
}

function getPetMood(needs: PetNeeds, sleeping: boolean): PetMood {
  if (sleeping)             return 'sleeping';
  if (needs.energy  < 20)  return 'sleepy';
  if (needs.hunger  < 25)  return 'hungry';
  if (needs.cleanliness < 25) return 'dirty';
  const mood = getMood(needs);
  if (mood >= 80)           return 'happy';
  return 'normal';
}

function getPetEmoji(pet: Pet, mood: PetMood): string {
  switch (mood) {
    case 'sleeping': return pet.sleepEmoji;
    case 'happy':    return pet.happyEmoji;
    case 'hungry':   return pet.hungryEmoji;
    case 'dirty':    return pet.dirtyEmoji;
    case 'sleepy':   return pet.emoji;
    default:         return pet.emoji;
  }
}

export function PetCharacter({ pet, name, needs, sleeping, onTap }: Props) {
  const mood = getPetMood(needs, sleeping);

  // Animations
  const breatheY  = useRef(new Animated.Value(0)).current;
  const wiggleX   = useRef(new Animated.Value(0)).current;
  const jumpY     = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const blinkOpac = useRef(new Animated.Value(1)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;

  // Idle breathing loop
  useEffect(() => {
    if (sleeping) return;
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheY, { toValue: -4, duration: 1600, useNativeDriver: true }),
        Animated.timing(breatheY, { toValue: 0,  duration: 1600, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [sleeping]);

  // Happy jump loop when very happy
  useEffect(() => {
    if (mood !== 'happy') { jumpY.setValue(0); return; }
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.spring(jumpY, { toValue: -20, tension: 200, friction: 4, useNativeDriver: true }),
        Animated.spring(jumpY, { toValue: 0,   tension: 120, friction: 6, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, [mood]);

  // Blink loop
  useEffect(() => {
    if (sleeping) return;
    const blink = Animated.loop(
      Animated.sequence([
        Animated.delay(3000 + Math.random() * 2000),
        Animated.timing(blinkOpac, { toValue: 0.3, duration: 80,  useNativeDriver: true }),
        Animated.timing(blinkOpac, { toValue: 1,   duration: 80,  useNativeDriver: true }),
      ])
    );
    blink.start();
    return () => blink.stop();
  }, [sleeping]);

  // Tap wiggle
  const handleTap = useCallback(() => {
    Animated.sequence([
      Animated.timing(wiggleX, { toValue: 12,  duration: 60, useNativeDriver: true }),
      Animated.timing(wiggleX, { toValue: -12, duration: 60, useNativeDriver: true }),
      Animated.timing(wiggleX, { toValue: 8,   duration: 60, useNativeDriver: true }),
      Animated.timing(wiggleX, { toValue: -8,  duration: 60, useNativeDriver: true }),
      Animated.timing(wiggleX, { toValue: 0,   duration: 60, useNativeDriver: true }),
    ]).start();
    // Scale pulse
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.18, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1,    tension: 100, friction: 4, useNativeDriver: true }),
    ]).start();
    onTap();
  }, [onTap]);

  const petEmoji = getPetEmoji(pet, mood);
  const moodIndicator = {
    happy:    { emoji: '💕', label: 'Super happy!' },
    hungry:   { emoji: '🍖', label: 'Feed me!' },
    dirty:    { emoji: '🛁', label: 'Bath time!' },
    sleepy:   { emoji: '💤', label: 'So sleepy...' },
    sleeping: { emoji: '💤', label: 'Zzz...' },
    normal:   { emoji: null, label: null },
  }[mood];

  return (
    <View style={styles.container}>
      {/* Mood bubble */}
      {moodIndicator.emoji && (
        <View style={[styles.moodBubble, { backgroundColor: pet.colorLight }]}>
          <Text style={styles.moodEmoji}>{moodIndicator.emoji}</Text>
          <Text style={styles.moodText}>{moodIndicator.label}</Text>
        </View>
      )}

      <TouchableOpacity onPress={handleTap} activeOpacity={0.85}>
        <Animated.View style={{
          transform: [
            { translateY: Animated.add(breatheY, jumpY) },
            { translateX: wiggleX },
            { scale: scaleAnim },
          ],
          opacity: blinkOpac,
        }}>
          {/* Shadow */}
          <Animated.View style={[styles.shadow, {
            transform: [{ scaleX: scaleAnim }],
            opacity: sleeping ? 0.2 : 0.25,
          }]} />

          {/* Pet emoji */}
          <Text style={[styles.petEmoji, sleeping && styles.petSleeping]}>
            {petEmoji}
          </Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Name tag */}
      <View style={[styles.nameTag, { backgroundColor: pet.color }]}>
        <Text style={styles.nameText}>{name}</Text>
      </View>

      {/* Tap hint */}
      {!sleeping && (
        <Text style={styles.tapHint}>👆 tap me!</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:   { alignItems: 'center', gap: 6 },
  moodBubble:  { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginBottom: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  moodEmoji:   { fontSize: 20 },
  moodText:    { fontSize: 13, fontWeight: '800', color: '#3D3530' },
  shadow:      { width: 90, height: 12, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 99, alignSelf: 'center', marginBottom: -8 },
  petEmoji:    { fontSize: 110, textAlign: 'center' },
  petSleeping: { opacity: 0.85 },
  nameTag:     { borderRadius: 99, paddingHorizontal: 16, paddingVertical: 6, marginTop: 4 },
  nameText:    { fontSize: 15, fontWeight: '900', color: '#fff' },
  tapHint:     { fontSize: 11, fontWeight: '700', color: '#C0B5AE', marginTop: 2 },
});
