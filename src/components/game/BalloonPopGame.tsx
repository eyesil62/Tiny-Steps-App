// 🎈 Color Balloon Pop — Enterprise-grade, 10 levels, smooth physics
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Dimensions, Animated, Easing,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { speak } from '../../lib/speech';
import { GameShell } from './GameShell';

const { width: W, height: H } = Dimensions.get('window');
const GAME_H = H * 0.72; // playfield height

const COLORS = [
  { name: 'Red',    hex: '#FF4757', light: '#FFE5E8', dark: '#CC1A2A' },
  { name: 'Blue',   hex: '#2E86FF', light: '#E5F0FF', dark: '#1A5FCC' },
  { name: 'Yellow', hex: '#FFD93D', light: '#FFF8DC', dark: '#CCA800' },
  { name: 'Green',  hex: '#6BCB77', light: '#E5F7E7', dark: '#3A9946' },
  { name: 'Purple', hex: '#C77DFF', light: '#F3E5FF', dark: '#8B3ED4' },
  { name: 'Orange', hex: '#FF9F43', light: '#FFF0DC', dark: '#CC6A00' },
];

// Level config — 10 levels, increasing difficulty
const LEVELS = [
  { n: 1,  balloonCount: 6,  correctCount: 2, baseDuration: 7000, colorCount: 2 },
  { n: 2,  balloonCount: 7,  correctCount: 2, baseDuration: 6500, colorCount: 3 },
  { n: 3,  balloonCount: 8,  correctCount: 3, baseDuration: 6000, colorCount: 3 },
  { n: 4,  balloonCount: 9,  correctCount: 3, baseDuration: 5500, colorCount: 4 },
  { n: 5,  balloonCount: 10, correctCount: 3, baseDuration: 5000, colorCount: 4 },
  { n: 6,  balloonCount: 11, correctCount: 4, baseDuration: 4500, colorCount: 5 },
  { n: 7,  balloonCount: 12, correctCount: 4, baseDuration: 4000, colorCount: 5 },
  { n: 8,  balloonCount: 13, correctCount: 4, baseDuration: 3500, colorCount: 6 },
  { n: 9,  balloonCount: 14, correctCount: 5, baseDuration: 3200, colorCount: 6 },
  { n: 10, balloonCount: 16, correctCount: 5, baseDuration: 2800, colorCount: 6 },
];

interface Balloon {
  id:       string;
  color:    typeof COLORS[0];
  x:        number;
  size:     number;
  y:        Animated.Value;
  popped:   boolean;
  anim:     Animated.CompositeAnimation | null;
}

function makeBalloon(id: string, color: typeof COLORS[0], levelCfg: typeof LEVELS[0], index: number): Balloon {
  const size     = 60 + Math.random() * 35;
  const variance = Math.random() * 1500;
  const duration = levelCfg.baseDuration + variance - (index * 100);
  const delay    = index * 280;
  const yVal     = new Animated.Value(GAME_H + 20);

  const anim = Animated.timing(yVal, {
    toValue:       -150,
    duration:      Math.max(1800, duration),
    delay,
    easing:        Easing.linear,
    useNativeDriver: true,
  });

  return { id, color, size, x: 30 + Math.random() * (W - 90), y: yVal, popped: false, anim };
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function BalloonPopGame() {
  const [gameLevel, setGameLevel] = useState(1);
  const [target,    setTarget]    = useState(COLORS[0]);
  const [balloons,  setBalloons]  = useState<Balloon[]>([]);
  const [score,     setScore]     = useState(0);
  const [lives,     setLives]     = useState(3);
  const [isWon,     setIsWon]     = useState(false);
  const [isOver,    setIsOver]    = useState(false);
  const [feedback,  setFeedback]  = useState<string | null>(null);
  const balloonsRef = useRef<Balloon[]>([]);
  const MAX_LEVELS  = 10;

  const startLevel = useCallback((lvlNum: number) => {
    const cfg    = LEVELS[Math.min(lvlNum - 1, LEVELS.length - 1)];
    const usedColors = shuffle(COLORS).slice(0, cfg.colorCount);
    const newTarget  = usedColors[0];
    setTarget(newTarget);
    setFeedback(null);

    // Build balloons: correct + wrong
    const pool: Balloon[] = [];
    for (let i = 0; i < cfg.correctCount; i++) {
      pool.push(makeBalloon(`c${i}-${Date.now()}`, newTarget, cfg, i));
    }
    const wrongColors = shuffle(usedColors.filter(c => c.name !== newTarget.name));
    for (let i = cfg.correctCount; i < cfg.balloonCount; i++) {
      const wc = wrongColors[i % wrongColors.length] ?? usedColors[1];
      pool.push(makeBalloon(`w${i}-${Date.now()}`, wc, cfg, i));
    }

    const shuffled = shuffle(pool);
    balloonsRef.current = shuffled;
    setBalloons([...shuffled]);

    // Announce
    setTimeout(() => speak(`Pop the ${newTarget.name} balloons!`, { rate: 0.88 }), 400);

    // Start all animations
    shuffled.forEach(b => b.anim?.start());
  }, []);

  const restart = useCallback(() => {
    balloonsRef.current.forEach(b => b.anim?.stop());
    setScore(0); setLives(3); setGameLevel(1);
    setIsWon(false); setIsOver(false);
    startLevel(1);
  }, [startLevel]);

  useEffect(() => {
    startLevel(1);
    return () => balloonsRef.current.forEach(b => b.anim?.stop());
  }, []);

  const handlePop = useCallback((balloon: Balloon) => {
    if (balloon.popped || isWon || isOver) return;

    if (balloon.color.name === target.name) {
      // ✅ Correct pop
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      speak(balloon.color.name, { rate: 1.0, pitch: 1.3 });
      balloon.anim?.stop();

      balloonsRef.current = balloonsRef.current.map(b =>
        b.id === balloon.id ? { ...b, popped: true } : b
      );
      setBalloons([...balloonsRef.current]);
      setScore(s => s + 10 + gameLevel);

      // Show positive feedback
      setFeedback('⭐ Great pop!');
      setTimeout(() => setFeedback(null), 800);

      // Check if all correct balloons popped
      const remaining = balloonsRef.current.filter(
        b => !b.popped && b.color.name === target.name
      );
      if (remaining.length === 0) {
        balloonsRef.current.forEach(b => b.anim?.stop());
        const next = gameLevel + 1;
        if (next > MAX_LEVELS) {
          setTimeout(() => setIsWon(true), 500);
        } else {
          setTimeout(() => {
            setGameLevel(next);
            startLevel(next);
          }, 900);
        }
      }
    } else {
      // ❌ Wrong pop
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      speak('Oops! Try again!', { rate: 1.0 });
      setFeedback('💨 Wrong one!');
      setTimeout(() => setFeedback(null), 800);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        balloonsRef.current.forEach(b => b.anim?.stop());
        setTimeout(() => setIsOver(true), 400);
      }
    }
  }, [target, isWon, isOver, gameLevel, lives, startLevel]);

  return (
    <GameShell
      title="Balloon Pop" emoji="🎈" color="#FF6B6B"
      score={score} lives={lives} maxLives={3}
      round={gameLevel} maxRounds={MAX_LEVELS}
      onRestart={restart} isWon={isWon} isOver={isOver}
    >
      <View style={styles.container}>
        {/* Target prompt */}
        <View style={styles.promptRow}>
          <Text style={styles.promptText}>Pop the</Text>
          <View style={[styles.colorDot, { backgroundColor: target.hex }]} />
          <Text style={[styles.promptColor, { color: target.hex }]}>{target.name}</Text>
          <Text style={styles.promptText}>ones!</Text>
        </View>

        {/* Level indicator */}
        <View style={styles.levelRow}>
          <Text style={styles.levelText}>Level {gameLevel} / {MAX_LEVELS}</Text>
          {gameLevel >= 7 && <Text style={styles.speedWarning}>⚡ Fast!</Text>}
        </View>

        {/* Feedback flash */}
        {feedback && (
          <View style={styles.feedbackBubble}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {/* Sky / Playfield */}
        <View style={styles.sky}>
          {/* Clouds */}
          <View style={[styles.cloud, { top: '15%', left: '5%', opacity: 0.5 }]} />
          <View style={[styles.cloud, { top: '35%', right: '8%', opacity: 0.4, transform: [{ scaleX: 0.7 }] }]} />
          <View style={[styles.cloud, { top: '55%', left: '20%', opacity: 0.35, transform: [{ scaleX: 0.8 }] }]} />

          {/* Balloons */}
          {balloons.map((balloon) => {
            if (balloon.popped) return null;
            return (
              <TouchableOpacity
                key={balloon.id}
                onPress={() => handlePop(balloon)}
                activeOpacity={0.7}
                style={[styles.balloonTouch, { left: balloon.x - balloon.size / 2 }]}
              >
                <Animated.View style={{ transform: [{ translateY: balloon.y }] }}>
                  {/* Balloon body */}
                  <View style={[styles.balloonBody, {
                    width: balloon.size,
                    height: balloon.size * 1.2,
                    backgroundColor: balloon.color.hex,
                  }]}>
                    {/* Shine */}
                    <View style={[styles.shine, {
                      width: balloon.size * 0.28,
                      height: balloon.size * 0.18,
                    }]} />
                    {/* Inner glow */}
                    <View style={[styles.innerGlow, {
                      width: balloon.size * 0.5,
                      height: balloon.size * 0.35,
                      backgroundColor: `${balloon.color.dark}30`,
                    }]} />
                  </View>
                  {/* Knot */}
                  <View style={[styles.knot, { borderTopColor: balloon.color.dark }]} />
                  {/* String */}
                  <View style={styles.string} />
                </Animated.View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Ground */}
        <View style={styles.ground}>
          <View style={styles.grass} />
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1 },
  promptRow:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, flexWrap: 'wrap' },
  promptText:    { fontSize: 18, fontWeight: '800', color: '#3D3530' },
  colorDot:      { width: 26, height: 26, borderRadius: 13 },
  promptColor:   { fontSize: 20, fontWeight: '900' },
  levelRow:      { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginBottom: 4 },
  levelText:     { fontSize: 12, fontWeight: '800', color: '#8B8178' },
  speedWarning:  { fontSize: 12, fontWeight: '900', color: '#FF6B6B' },
  feedbackBubble:{ position: 'absolute', top: 60, alignSelf: 'center', zIndex: 50, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 8 },
  feedbackText:  { color: '#fff', fontWeight: '900', fontSize: 16 },
  sky: {
    flex: 1,
    backgroundColor: '#87CEEB',
    overflow: 'hidden',
    position: 'relative',
  },
  cloud: {
    position: 'absolute',
    width: 80, height: 30,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
  },
  balloonTouch:  { position: 'absolute', bottom: 0 },
  balloonBody: {
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 5,
  },
  shine:         { backgroundColor: 'rgba(255,255,255,0.45)', borderRadius: 999, margin: '8%' },
  innerGlow:     { borderRadius: 999, position: 'absolute', bottom: '10%', right: '10%' },
  knot: {
    width: 0, height: 0,
    borderLeftWidth: 5, borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent', borderRightColor: 'transparent',
    alignSelf: 'center',
  },
  string:        { width: 1.5, height: 28, backgroundColor: 'rgba(0,0,0,0.3)', alignSelf: 'center' },
  ground:        { height: 40, backgroundColor: '#8BC34A' },
  grass:         { height: 12, backgroundColor: '#7CB342', borderTopLeftRadius: 8, borderTopRightRadius: 8 },
});
