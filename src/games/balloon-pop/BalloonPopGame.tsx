import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { speak } from '../../lib/speech';
import { GameShell } from '../../components/game/GameShell';

const COLORS = [
  { name: 'Red', hex: '#FF4757', dark: '#CC1A2A' },
  { name: 'Blue', hex: '#2E86FF', dark: '#1A5FCC' },
  { name: 'Yellow', hex: '#FFD93D', dark: '#CCA800' },
  { name: 'Green', hex: '#6BCB77', dark: '#3A9946' },
  { name: 'Purple', hex: '#C77DFF', dark: '#8B3ED4' },
  { name: 'Orange', hex: '#FF9F43', dark: '#CC6A00' },
];

const SHAPES = ['Circle', 'Square', 'Triangle', 'Diamond'] as const;
const NUMBERS = [1, 2, 3, 4, 5];

const LEVELS = [
  { mode: 'color', goal: 12, seconds: 45, spawnMs: 650 },
  { mode: 'color', goal: 15, seconds: 45, spawnMs: 600 },
  { mode: 'shape', goal: 15, seconds: 60, spawnMs: 600 },
  { mode: 'shape', goal: 18, seconds: 60, spawnMs: 550 },
  { mode: 'number', goal: 18, seconds: 60, spawnMs: 550 },
  { mode: 'number', goal: 20, seconds: 60, spawnMs: 500 },
  { mode: 'mixed', goal: 18, seconds: 75, spawnMs: 500 },
  { mode: 'mixed', goal: 20, seconds: 75, spawnMs: 475 },
  { mode: 'mixed', goal: 22, seconds: 90, spawnMs: 450 },
  { mode: 'mixed', goal: 25, seconds: 90, spawnMs: 425 },
] as const;

const MAX_LIVES = 3;
const MAX_LEVELS = LEVELS.length;

type BalloonColor = typeof COLORS[number];
type BalloonShape = typeof SHAPES[number];
type LevelMode = typeof LEVELS[number]['mode'];
type Timer = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>;

interface Target {
  color: BalloonColor;
  shape: BalloonShape;
  number: number;
}

interface Balloon {
  id: string;
  color: BalloonColor;
  shape: BalloonShape;
  number: number;
  x: number;
  size: number;
  y: Animated.Value;
  opacity: Animated.Value;
  anim: Animated.CompositeAnimation;
}

function randomItem<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function buildTarget(): Target {
  return {
    color: randomItem(COLORS),
    shape: randomItem(SHAPES),
    number: randomItem(NUMBERS),
  };
}

function isCorrectBalloon(balloon: Balloon, target: Target, mode: LevelMode) {
  if (mode === 'color') {
    return balloon.color.name === target.color.name;
  }

  if (mode === 'shape') {
    return balloon.color.name === target.color.name && balloon.shape === target.shape;
  }

  if (mode === 'number') {
    return balloon.color.name === target.color.name && balloon.number === target.number;
  }

  return (
    balloon.color.name === target.color.name &&
    balloon.shape === target.shape &&
    balloon.number === target.number
  );
}

function getPrompt(target: Target, mode: LevelMode) {
  if (mode === 'color') {
    return `Pop ${target.color.name}`;
  }

  if (mode === 'shape') {
    return `Pop ${target.color.name} ${target.shape}`;
  }

  if (mode === 'number') {
    return `Pop ${target.color.name} number ${target.number}`;
  }

  return `Pop ${target.color.name} ${target.shape} number ${target.number}`;
}

function ShapeMarker({ shape }: { shape: BalloonShape }) {
  if (shape === 'Triangle') {
    return <View style={styles.triangle} />;
  }

  if (shape === 'Square') {
    return <View style={styles.square} />;
  }

  if (shape === 'Diamond') {
    return <View style={styles.diamond} />;
  }

  return <View style={styles.circle} />;
}

export default function BalloonPopGame() {
  const { width, height } = useWindowDimensions();

  const gameHeight = Math.max(360, height * 0.62);
  const balloonBaseSize = Math.min(92, Math.max(58, width * 0.11));

  const [level, setLevel] = useState(1);
  const [target, setTarget] = useState<Target>(buildTarget());
  const [correctPops, setCorrectPops] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const balloonsRef = useRef<Balloon[]>([]);
  const timersRef = useRef<Timer[]>([]);
  const targetRef = useRef<Target>(target);
  const correctPopsRef = useRef(0);
  const levelRef = useRef(1);
  const finishedRef = useRef(false);
  const idRef = useRef(0);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((timer) => {
      clearTimeout(timer as ReturnType<typeof setTimeout>);
      clearInterval(timer as ReturnType<typeof setInterval>);
    });
    timersRef.current = [];
  }, []);

  const stopBalloons = useCallback(() => {
    balloonsRef.current.forEach((balloon) => balloon.anim.stop());
  }, []);

  const removeBalloon = useCallback((id: string) => {
    balloonsRef.current = balloonsRef.current.filter((balloon) => balloon.id !== id);
    setBalloons([...balloonsRef.current]);
  }, []);

  const createBalloon = useCallback(() => {
    if (finishedRef.current) return;

    const currentLevel = LEVELS[levelRef.current - 1];
    const shouldMatch = Math.random() < 0.5;
    const currentTarget = targetRef.current;

    let color = randomItem(COLORS);
    let shape = randomItem(SHAPES);
    let number = randomItem(NUMBERS);

    if (shouldMatch) {
      color = currentTarget.color;

      if (currentLevel.mode === 'shape' || currentLevel.mode === 'mixed') {
        shape = currentTarget.shape;
      }

      if (currentLevel.mode === 'number' || currentLevel.mode === 'mixed') {
        number = currentTarget.number;
      }
    }

    const size = balloonBaseSize + Math.random() * 26;
    const safeWidth = Math.max(1, width - size - 28);
    const x = 14 + Math.random() * safeWidth;

    const y = new Animated.Value(gameHeight + size + 80);
    const opacity = new Animated.Value(1);
    const id = `balloon-${Date.now()}-${idRef.current++}`;

    const duration = Math.max(4200, 8500 - levelRef.current * 350 + Math.random() * 1800);

    const anim = Animated.parallel([
      Animated.timing(y, {
        toValue: -size - 220,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.95,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ]);

    const balloon: Balloon = {
      id,
      color,
      shape,
      number,
      x,
      size,
      y,
      opacity,
      anim,
    };

    balloonsRef.current = [...balloonsRef.current, balloon].slice(-20);
    setBalloons([...balloonsRef.current]);

    anim.start(({ finished }) => {
      if (finished) {
        removeBalloon(id);
      }
    });
  }, [balloonBaseSize, gameHeight, removeBalloon, width]);

  const startLevel = useCallback((nextLevel: number) => {
    clearTimers();
    stopBalloons();

    balloonsRef.current = [];
    setBalloons([]);

    const levelConfig = LEVELS[nextLevel - 1];
    const nextTarget = buildTarget();

    levelRef.current = nextLevel;
    targetRef.current = nextTarget;
    correctPopsRef.current = 0;
    finishedRef.current = false;

    setLevel(nextLevel);
    setTarget(nextTarget);
    setCorrectPops(0);
    setFeedback(null);
    setIsWon(false);
    setIsOver(false);

    speak(getPrompt(nextTarget, levelConfig.mode), { rate: 0.9 });

    for (let i = 0; i < 10; i++) {
      const quickSpawn = setTimeout(createBalloon, i * 100);
      timersRef.current.push(quickSpawn);
    }

    const spawnTimer = setInterval(createBalloon, Number(levelConfig.spawnMs));
    const levelLimitTimer = setTimeout(() => {
      if (nextLevel >= MAX_LEVELS) {
        finishedRef.current = true;
        clearTimers();
        stopBalloons();
        setIsWon(true);
        speak('Great job', { rate: 0.9 });
        return;
      }

      setFeedback('Level complete');
      const nextTimer = setTimeout(() => startLevel(nextLevel + 1), 1200);
      timersRef.current.push(nextTimer);
    }, Number(levelConfig.seconds) * 1000);

    timersRef.current.push(spawnTimer, levelLimitTimer);
  }, [clearTimers, createBalloon, stopBalloons]);

  const restart = useCallback(() => {
    clearTimers();
    stopBalloons();

    setScore(0);
    setLives(MAX_LIVES);
    setIsWon(false);
    setIsOver(false);
    setFeedback(null);
    finishedRef.current = false;

    startLevel(1);
  }, [clearTimers, startLevel, stopBalloons]);

  useEffect(() => {
    startLevel(1);

    return () => {
      clearTimers();
      stopBalloons();
    };
  }, [startLevel, clearTimers, stopBalloons]);

  const goNextLevel = useCallback(() => {
    const nextLevel = levelRef.current + 1;

    if (nextLevel > MAX_LEVELS) {
      finishedRef.current = true;
      clearTimers();
      stopBalloons();
      setIsWon(true);
      speak('Great job', { rate: 0.9 });
      return;
    }

    setFeedback('Level complete');
    const nextTimer = setTimeout(() => startLevel(nextLevel), 1000);
    timersRef.current.push(nextTimer);
  }, [clearTimers, startLevel, stopBalloons]);

  const handlePop = useCallback((balloon: Balloon) => {
    if (finishedRef.current || isWon || isOver) return;

    const currentLevel = LEVELS[levelRef.current - 1];
    const correct = isCorrectBalloon(balloon, targetRef.current, currentLevel.mode);

    balloon.anim.stop();
    removeBalloon(balloon.id);

    if (correct) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const nextCorrectPops = correctPopsRef.current + 1;
      correctPopsRef.current = nextCorrectPops;

      setCorrectPops(nextCorrectPops);
      setScore((current) => current + 10 + levelRef.current);
      setFeedback('Great pop');
      setTimeout(() => setFeedback(null), 600);

      if (nextCorrectPops >= currentLevel.goal) {
        clearTimers();
        stopBalloons();
        goNextLevel();
      }

      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setFeedback('Try again');
    setTimeout(() => setFeedback(null), 600);

    setLives((current) => {
      const nextLives = current - 1;

      if (nextLives <= 0) {
        finishedRef.current = true;
        clearTimers();
        stopBalloons();
        setIsOver(true);
        return 0;
      }

      return nextLives;
    });
  }, [clearTimers, goNextLevel, isOver, isWon, removeBalloon, stopBalloons]);

  const currentLevel = LEVELS[level - 1];
  const prompt = getPrompt(target, currentLevel.mode);

  return (
    <GameShell
      title="Balloon Pop"
      emoji=""
      color="#FF6B6B"
      score={score}
      lives={lives}
      maxLives={MAX_LIVES}
      round={level}
      maxRounds={MAX_LEVELS}
      onRestart={restart}
      isWon={isWon}
      isOver={isOver}
    >
      <View style={styles.container}>
        <View style={styles.promptRow}>
          <Text style={styles.promptText}>{prompt}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.statusText}>Level {level} / {MAX_LEVELS}</Text>
          <Text style={styles.statusText}>{correctPops} / {currentLevel.goal}</Text>
        </View>

        {feedback && (
          <View style={styles.feedbackBubble}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        <View style={[styles.sky, { height: gameHeight }]}>
          <View style={[styles.cloud, { top: '12%', left: '6%' }]} />
          <View style={[styles.cloud, { top: '32%', right: '8%' }]} />
          <View style={[styles.cloud, { top: '58%', left: '22%' }]} />

          {balloons.map((balloon) => (
            <TouchableOpacity
              key={balloon.id}
              onPress={() => handlePop(balloon)}
              activeOpacity={0.75}
              style={[
                styles.balloonTouch,
                {
                  left: balloon.x,
                  width: balloon.size + 28,
                  height: balloon.size * 1.75,
                },
              ]}
            >
              <Animated.View
                style={{
                  opacity: balloon.opacity,
                  transform: [{ translateY: balloon.y }],
                }}
              >
                <View
                  style={[
                    styles.balloonBody,
                    {
                      width: balloon.size,
                      height: balloon.size * 1.2,
                      backgroundColor: balloon.color.hex,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.shine,
                      {
                        width: balloon.size * 0.28,
                        height: balloon.size * 0.18,
                      },
                    ]}
                  />

                  {(currentLevel.mode === 'shape' || currentLevel.mode === 'mixed') && (
                    <View style={styles.shapeWrap}>
                      <ShapeMarker shape={balloon.shape} />
                    </View>
                  )}

                  {(currentLevel.mode === 'number' || currentLevel.mode === 'mixed') && (
                    <Text style={[styles.numberText, { fontSize: balloon.size * 0.42 }]}>
                      {balloon.number}
                    </Text>
                  )}

                  <View
                    style={[
                      styles.innerGlow,
                      {
                        width: balloon.size * 0.5,
                        height: balloon.size * 0.35,
                        backgroundColor: `${balloon.color.dark}30`,
                      },
                    ]}
                  />
                </View>

                <View style={[styles.knot, { borderTopColor: balloon.color.dark }]} />
                <View style={styles.string} />
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.ground}>
          <View style={styles.grass} />
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  promptRow: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  promptText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#3D3530',
    textAlign: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#8B8178',
  },
  feedbackBubble: {
    position: 'absolute',
    top: 68,
    alignSelf: 'center',
    zIndex: 50,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  feedbackText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 16,
  },
  sky: {
    backgroundColor: '#87CEEB',
    overflow: 'hidden',
    position: 'relative',
  },
  cloud: {
    position: 'absolute',
    width: 90,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 18,
  },
  balloonTouch: {
    position: 'absolute',
    bottom: 0,
    alignItems: 'center',
  },
  balloonBody: {
    borderRadius: 999,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },
  shine: {
    position: 'absolute',
    top: '8%',
    left: '12%',
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 999,
  },
  innerGlow: {
    borderRadius: 999,
    position: 'absolute',
    bottom: '10%',
    right: '10%',
  },
  shapeWrap: {
    position: 'absolute',
    top: '26%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  square: {
    width: 22,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  triangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 13,
    borderRightWidth: 13,
    borderBottomWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'rgba(255,255,255,0.9)',
  },
  diamond: {
    width: 22,
    height: 22,
    backgroundColor: 'rgba(255,255,255,0.9)',
    transform: [{ rotate: '45deg' }],
  },
  numberText: {
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  knot: {
    width: 0,
    height: 0,
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignSelf: 'center',
  },
  string: {
    width: 1.5,
    height: 34,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignSelf: 'center',
  },
  ground: {
    height: 40,
    backgroundColor: '#8BC34A',
  },
  grass: {
    height: 12,
    backgroundColor: '#7CB342',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
});