import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { speak } from '../../../src/lib/speech';
import { getModuleById } from '../../../src/data/learningModules';
import { useAppStore } from '../../../src/stores/useAppStore';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../../src/theme';
import type { AgeGroup } from '../../../src/types';

const { width } = Dimensions.get('window');
const CARD_SIZE = (width - 48) / 2;

export default function ModuleScreen() {
  const { moduleId }  = useLocalSearchParams<{ moduleId: string }>();
  const module        = getModuleById(moduleId);
  const activeChild   = useAppStore((s) => s.activeChild);
  const ageGroup      = (activeChild?.age_group ?? '2-4') as AgeGroup;
  const language      = activeChild?.language ?? 'en';
  const [learned, setLearned]     = useState<Set<string>>(new Set());
  const [activeItem, setActiveItem] = useState<string | null>(null);

  if (!module) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 48 }}>🤔</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 20 }}>
          <Text style={{ color: colors.coral, fontWeight: fontWeight.heavy }}>← Go back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const progress  = learned.size / module.items.length * 100;
  const isComplete = learned.size === module.items.length;

  const speakItem = useCallback((word: string, emoji: string, itemId: string) => {
    setActiveItem(itemId);
    setLearned(prev => new Set([...prev, itemId]));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Speak the word clearly
    speak(word, {
      language,
      rate: 0.8,
      pitch: 1.1,
      onDone:  () => setActiveItem(null),
      onError: () => setActiveItem(null),
    });
  }, [language]);

  // For alphabet: speak "A is for Apple" style
  const getSpokenText = (id: string, word: string) => {
    if (module.id === 'alphabet') return `${id.toUpperCase()} is for ${word}`;
    if (module.id === 'numbers')  return word;
    if (module.id === 'colors')   return `${word}`;
    return word;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: module.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{module.emoji}</Text>
          <Text style={styles.headerTitle}>{module.title}</Text>
        </View>
        <View style={styles.progressBadge}>
          <Text style={styles.progressText}>{learned.size}/{module.items.length}</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${progress}%`, backgroundColor: module.color }]} />
      </View>

      {/* Instruction */}
      <Text style={styles.instruction}>
        {isComplete ? '🎉 Amazing! You learned them all!' : '👆 Tap each card to hear the word!'}
      </Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {module.items.map((item) => {
          const isLearned = learned.has(item.id);
          const isActive  = activeItem === item.id;
          // Only show fun facts for ages 8-10
          const showFact  = item.fact && isLearned && ageGroup === '8-10';

          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => speakItem(getSpokenText(item.id, item.word), item.emoji, item.id)}
              activeOpacity={0.82}
              style={[
                styles.card,
                { borderColor: module.color },
                isLearned && { backgroundColor: module.colorLight },
                isActive  && styles.cardActive,
              ]}
            >
              {/* Learned check */}
              {isLearned && (
                <View style={[styles.checkmark, { backgroundColor: module.color }]}>
                  <Text style={styles.checkmarkText}>✓</Text>
                </View>
              )}
              {/* Speaking indicator */}
              {isActive && <Text style={styles.soundIcon}>🔊</Text>}

              <Text style={styles.cardEmoji}>{item.emoji}</Text>
              <Text style={styles.cardWord}>{item.word}</Text>

              {/* Alphabet letter hint */}
              {module.id === 'alphabet' && (
                <Text style={[styles.cardLetter, { color: module.color }]}>
                  {item.id.toUpperCase()}
                </Text>
              )}

              {/* Fun fact — only for 8-10 */}
              {showFact && (
                <Text style={styles.fact}>{item.fact}</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Completion banner */}
      {isComplete && (
        <View style={[styles.completeBanner, { backgroundColor: module.color }]}>
          <Text style={styles.completeText}>⭐ {module.items.length * 5} stars earned!</Text>
          <TouchableOpacity onPress={() => router.back()} style={styles.completeBtn}>
            <Text style={styles.completeBtnText}>Back to modules</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:         { flexDirection: 'row', alignItems: 'center', padding: spacing.lg, paddingTop: spacing.xl, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backBtn:        { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  backText:       { fontSize: fontSize.xl, color: colors.white, fontWeight: fontWeight.heavy },
  headerCenter:   { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerEmoji:    { fontSize: 28 },
  headerTitle:    { fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: colors.white },
  progressBadge:  { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  progressText:   { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.white },
  progressBar:    { height: 6, backgroundColor: colors.sand, margin: spacing.lg, borderRadius: radius.full, overflow: 'hidden' },
  progressFill:   { height: '100%', borderRadius: radius.full },
  instruction:    { textAlign: 'center', fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.warmGray, marginBottom: spacing.md },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: spacing.lg, paddingBottom: 40 },
  card:           { width: CARD_SIZE, minHeight: CARD_SIZE, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 2.5, alignItems: 'center', justifyContent: 'center', padding: 12, gap: 4, ...shadow.sm, position: 'relative' },
  cardActive:     { transform: [{ scale: 1.06 }], ...shadow.md },
  checkmark:      { position: 'absolute', top: 8, right: 8, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  checkmarkText:  { color: colors.white, fontSize: 12, fontWeight: fontWeight.heavy },
  soundIcon:      { position: 'absolute', top: 8, left: 8, fontSize: 16 },
  cardEmoji:      { fontSize: 44 },
  cardWord:       { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center' },
  cardLetter:     { fontSize: fontSize.xl, fontWeight: fontWeight.heavy },
  fact:           { fontSize: 10, color: colors.warmGray, textAlign: 'center', marginTop: 4, lineHeight: 14 },
  completeBanner: { margin: spacing.lg, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  completeText:   { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.white },
  completeBtn:    { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: radius.full, paddingHorizontal: 16, paddingVertical: 8 },
  completeBtnText:{ fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.white },
});
