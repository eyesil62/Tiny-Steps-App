// Reusable wrapper every game uses — header, lives, score, completion
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors, fontSize, fontWeight, radius, shadow } from '../../theme';

interface Props {
  title:     string;
  emoji:     string;
  color:     string;
  score:     number;
  lives:     number;
  maxLives:  number;
  round?:    number;
  maxRounds?: number;
  children:  React.ReactNode;
  onRestart: () => void;
  isWon?:    boolean;
  isOver?:   boolean;
}

export function GameShell({
  title, emoji, color, score, lives, maxLives,
  round, maxRounds, children, onRestart, isWon, isOver,
}: Props) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.cream }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{emoji}</Text>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={styles.scoreText}>⭐{score}</Text>
        </View>
      </View>

      {/* HUD */}
      <View style={styles.hud}>
        <View style={styles.lives}>
          {Array.from({ length: maxLives }).map((_, i) => (
            <Text key={i} style={[styles.heart, i >= lives && styles.heartLost]}>❤️</Text>
          ))}
        </View>
        {round !== undefined && maxRounds !== undefined && (
          <View style={styles.roundBadge}>
            <Text style={styles.roundText}>Round {round}/{maxRounds}</Text>
          </View>
        )}
      </View>

      {/* Game area */}
      <View style={styles.gameArea}>{children}</View>

      {/* Win overlay */}
      {isWon && (
        <View style={styles.overlay}>
          <Text style={styles.overlayEmoji}>🏆</Text>
          <Text style={styles.overlayTitle}>You Won!</Text>
          <Text style={styles.overlayScore}>⭐ {score} stars</Text>
          <TouchableOpacity style={[styles.overlayBtn, { backgroundColor: color }]} onPress={onRestart}>
            <Text style={styles.overlayBtnText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.overlayBack} onPress={() => router.back()}>
            <Text style={[styles.overlayBackText, { color }]}>Back to games</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Game over overlay */}
      {isOver && !isWon && (
        <View style={styles.overlay}>
          <Text style={styles.overlayEmoji}>😢</Text>
          <Text style={styles.overlayTitle}>Try Again!</Text>
          <Text style={styles.overlayScore}>Score: {score}</Text>
          <TouchableOpacity style={[styles.overlayBtn, { backgroundColor: color }]} onPress={onRestart}>
            <Text style={styles.overlayBtnText}>Play Again 🎮</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.overlayBack} onPress={() => router.back()}>
            <Text style={[styles.overlayBackText, { color }]}>Back to games</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1 },
  header:       { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 20, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  backBtn:      { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:     { fontSize: 22, color: colors.white, fontWeight: fontWeight.heavy },
  headerCenter: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerEmoji:  { fontSize: 24 },
  headerTitle:  { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.white },
  scoreBadge:   { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  scoreText:    { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.white },
  hud:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 10 },
  lives:        { flexDirection: 'row', gap: 4 },
  heart:        { fontSize: 22 },
  heartLost:    { opacity: 0.2 },
  roundBadge:   { backgroundColor: colors.white, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 6, ...shadow.sm },
  roundText:    { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.dark },
  gameArea:     { flex: 1 },
  overlay:      { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 99 },
  overlayEmoji: { fontSize: 80 },
  overlayTitle: { fontSize: 36, fontWeight: fontWeight.heavy, color: colors.white },
  overlayScore: { fontSize: fontSize.xl, color: colors.sun, fontWeight: fontWeight.heavy },
  overlayBtn:   { borderRadius: radius.full, paddingHorizontal: 40, paddingVertical: 16, marginTop: 8 },
  overlayBtnText:{ fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.white },
  overlayBack:  { marginTop: 4 },
  overlayBackText:{ fontSize: fontSize.md, fontWeight: fontWeight.heavy },
});
