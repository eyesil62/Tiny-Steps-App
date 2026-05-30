import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { speak } from '../../../src/lib/speech';
import { useAppStore } from '../../../src/stores/useAppStore';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../../src/theme';

interface Habit {
  id:       string;
  emoji:    string;
  label:    string;
  time:     string;
  color:    string;
  colorLight: string;
  done:     boolean;
  praise:   string;
}

const DEFAULT_HABITS: Omit<Habit, 'done'>[] = [
  { id: 'brush-am', emoji: '🦷', label: 'Brush Teeth',   time: 'Morning',   color: colors.sky,      colorLight: colors.skyLight,      praise: 'Amazing! Your teeth are sparkling clean!'   },
  { id: 'wash',     emoji: '🙌', label: 'Wash Hands',    time: 'Anytime',   color: colors.mint,     colorLight: colors.mintLight,     praise: 'Great job! Clean hands keep you healthy!'   },
  { id: 'reading',  emoji: '📚', label: 'Reading Time',  time: 'Afternoon', color: colors.lavender, colorLight: colors.lavenderLight, praise: 'Fantastic! Reading makes you smarter!'       },
  { id: 'tidy',     emoji: '🧹', label: 'Tidy Your Room',time: 'Afternoon', color: colors.orange,   colorLight: colors.sunLight,      praise: 'Wow! Your room looks wonderful!'             },
  { id: 'exercise', emoji: '🏃', label: 'Move & Play',   time: 'Anytime',   color: colors.coral,    colorLight: colors.coralLight,    praise: 'You\'re so active! Keep moving!'             },
  { id: 'brush-pm', emoji: '🌙', label: 'Brush Teeth',   time: 'Bedtime',   color: '#4D72FF',       colorLight: '#E5EAFE',            praise: 'Perfect! Sweet dreams with clean teeth!'     },
  { id: 'grateful', emoji: '💛', label: 'Say Thank You', time: 'Evening',   color: colors.sun,      colorLight: colors.sunLight,      praise: 'You are so kind and grateful! ❤️'           },
  { id: 'water',    emoji: '💧', label: 'Drink Water',   time: 'Anytime',   color: '#00B4D8',       colorLight: '#E0F7FA',            praise: 'Staying hydrated is super important!'        },
];

function getTodayKey() {
  return new Date().toDateString();
}

export default function HabitsScreen() {
  const activeChild = useAppStore((s) => s.activeChild);
  const name = activeChild?.name ?? 'Explorer';

  const [habits, setHabits] = useState<Habit[]>(
    DEFAULT_HABITS.map(h => ({ ...h, done: false }))
  );
  const [streak,   setStreak]   = useState(5); // placeholder streak
  const [totalStars, setTotalStars] = useState(30);
  const [lastPop, setLastPop] = useState<string | null>(null);
  const popScale = React.useRef(new Animated.Value(1)).current;

  const doneCount = habits.filter(h => h.done).length;
  const allDone   = doneCount === habits.length;

  const completeHabit = useCallback((habit: Habit) => {
    if (habit.done) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    speak(habit.praise, { rate: 0.88, pitch: 1.1 });
    setLastPop(habit.praise);

    // Pop animation
    Animated.sequence([
      Animated.spring(popScale, { toValue: 1.1, useNativeDriver: true }),
      Animated.spring(popScale, { toValue: 1.0, useNativeDriver: true }),
    ]).start();

    setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, done: true } : h));
    setTotalStars(s => s + 2);

    setTimeout(() => setLastPop(null), 3000);
  }, [popScale]);

  const resetHabits = () => {
    setHabits(prev => prev.map(h => ({ ...h, done: false })));
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Daily Habits ⭐</Text>
          <Text style={styles.sub}>Keep your streak going, {name}!</Text>
        </View>
        <View style={styles.streakBox}>
          <Text style={styles.streakEmoji}>🔥</Text>
          <Text style={styles.streakNum}>{streak}</Text>
          <Text style={styles.streakLabel}>days</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressWrap}>
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{doneCount} of {habits.length} done</Text>
          <Text style={styles.progressStars}>⭐ {totalStars} stars</Text>
        </View>
        <View style={styles.progressBar}>
          <Animated.View style={[
            styles.progressFill,
            { width: `${(doneCount / habits.length) * 100}%` },
          ]} />
        </View>
        {allDone && (
          <Text style={styles.allDoneText}>🎉 All done! Amazing job today!</Text>
        )}
      </View>

      {/* Praise popup */}
      {lastPop && (
        <Animated.View style={[styles.praisePopup, { transform: [{ scale: popScale }] }]}>
          <Text style={styles.praiseText}>{lastPop}</Text>
        </Animated.View>
      )}

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {habits.map((habit) => (
          <TouchableOpacity
            key={habit.id}
            onPress={() => completeHabit(habit)}
            activeOpacity={habit.done ? 1 : 0.85}
            style={[
              styles.habitCard,
              { borderColor: habit.color },
              habit.done && { backgroundColor: habit.colorLight },
            ]}
          >
            {/* Left accent */}
            <View style={[styles.accent, { backgroundColor: habit.color }]} />

            {/* Emoji */}
            <View style={[styles.emojiBox, { backgroundColor: habit.colorLight }]}>
              <Text style={styles.habitEmoji}>{habit.emoji}</Text>
            </View>

            {/* Info */}
            <View style={styles.habitInfo}>
              <Text style={[styles.habitLabel, habit.done && styles.habitLabelDone]}>
                {habit.label}
              </Text>
              <Text style={styles.habitTime}>{habit.time}</Text>
            </View>

            {/* Stars earned */}
            {habit.done && (
              <View style={styles.starsBadge}>
                <Text style={styles.starsText}>+2 ⭐</Text>
              </View>
            )}

            {/* Checkbox */}
            <View style={[styles.checkbox, habit.done && { backgroundColor: habit.color, borderColor: habit.color }]}>
              {habit.done && <Text style={styles.checkmark}>✓</Text>}
            </View>
          </TouchableOpacity>
        ))}

        {/* Motivational message */}
        <View style={styles.mascotRow}>
          <Text style={styles.mascotEmoji}>🦉</Text>
          <View style={styles.mascotBubble}>
            <Text style={styles.mascotText}>
              {allDone
                ? `🎉 ${name}, you completed all your habits today! You are a superstar!`
                : doneCount === 0
                ? `Good morning ${name}! Let's start your daily habits! You can do it! 💪`
                : `Keep going ${name}! ${habits.length - doneCount} habit${habits.length - doneCount > 1 ? 's' : ''} left! 🌟`}
            </Text>
          </View>
        </View>

        {/* Reset button for testing */}
        {allDone && (
          <TouchableOpacity style={styles.resetBtn} onPress={resetHabits} activeOpacity={0.8}>
            <Text style={styles.resetText}>Reset (New Day)</Text>
          </TouchableOpacity>
        )}

        {/* Streak info */}
        <View style={styles.streakCard}>
          <Text style={styles.streakCardTitle}>🔥 Your Streak</Text>
          <View style={styles.streakDots}>
            {Array.from({ length: 7 }).map((_, i) => (
              <View key={i} style={[styles.streakDot, i < streak % 7 && styles.streakDotFilled]} >
                <Text style={styles.streakDotText}>
                  {['M','T','W','T','F','S','S'][i]}
                </Text>
              </View>
            ))}
          </View>
          <Text style={styles.streakMsg}>
            {streak >= 7 ? '🏆 One week streak! You\'re incredible!' :
             streak >= 3 ? '🔥 Great streak! Keep it going!' :
             '⭐ Build your streak day by day!'}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:          { padding: spacing.lg, paddingTop: spacing.xl, backgroundColor: colors.sun, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:           { fontSize: fontSize.xxl, fontWeight: fontWeight.heavy, color: colors.dark },
  sub:             { fontSize: fontSize.sm, color: 'rgba(0,0,0,0.5)', fontWeight: fontWeight.bold, marginTop: 4 },
  streakBox:       { backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: radius.lg, padding: 12, alignItems: 'center', minWidth: 64 },
  streakEmoji:     { fontSize: 28 },
  streakNum:       { fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: colors.dark },
  streakLabel:     { fontSize: fontSize.xs, color: colors.warmGray, fontWeight: fontWeight.heavy },
  progressWrap:    { padding: spacing.lg, paddingBottom: 0, gap: 8 },
  progressRow:     { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel:   { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.dark },
  progressStars:   { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.warmGray },
  progressBar:     { height: 12, backgroundColor: colors.sand, borderRadius: radius.full, overflow: 'hidden' },
  progressFill:    { height: '100%', backgroundColor: colors.sun, borderRadius: radius.full },
  allDoneText:     { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.mint, textAlign: 'center' },
  praisePopup:     { margin: spacing.lg, marginBottom: 0, backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, ...shadow.md, borderWidth: 2, borderColor: colors.sun },
  praiseText:      { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center' },
  scroll:          { padding: spacing.lg, gap: spacing.sm, paddingBottom: 40 },
  habitCard:       { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 2, borderLeftWidth: 0, flexDirection: 'row', alignItems: 'center', gap: 12, overflow: 'hidden', ...shadow.sm },
  accent:          { width: 6, alignSelf: 'stretch' },
  emojiBox:        { width: 52, height: 52, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', margin: 10, marginLeft: 6 },
  habitEmoji:      { fontSize: 28 },
  habitInfo:       { flex: 1 },
  habitLabel:      { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark },
  habitLabelDone:  { textDecorationLine: 'line-through', color: colors.warmGray },
  habitTime:       { fontSize: fontSize.xs, color: colors.warmGray, fontWeight: fontWeight.bold, marginTop: 2 },
  starsBadge:      { backgroundColor: colors.sunLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  starsText:       { fontSize: 12, fontWeight: fontWeight.heavy, color: colors.dark },
  checkbox:        { width: 28, height: 28, borderRadius: 14, borderWidth: 2.5, borderColor: colors.sand, alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  checkmark:       { color: colors.white, fontSize: 15, fontWeight: fontWeight.heavy },
  mascotRow:       { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 8 },
  mascotEmoji:     { fontSize: 44 },
  mascotBubble:    { flex: 1, backgroundColor: colors.white, borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, ...shadow.sm },
  mascotText:      { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.dark, lineHeight: 20 },
  resetBtn:        { backgroundColor: colors.sand, borderRadius: radius.full, paddingVertical: 12, alignItems: 'center' },
  resetText:       { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.warmGray },
  streakCard:      { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, gap: 12, ...shadow.sm, marginTop: 4 },
  streakCardTitle: { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center' },
  streakDots:      { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  streakDot:       { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.sand, alignItems: 'center', justifyContent: 'center' },
  streakDotFilled: { backgroundColor: colors.sun },
  streakDotText:   { fontSize: 11, fontWeight: fontWeight.heavy, color: colors.dark },
  streakMsg:       { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.warmGray, textAlign: 'center' },
});
