import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageSourcePropType,
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

const FRUITS: {
  name: 'Apple' | 'Pear' | 'Banana' | 'Grape' | 'Orange';
  color: typeof COLORS[number];
  image: ImageSourcePropType;
}[] = [
  { name: 'Apple', color: COLORS[0], image: require('../../assets/fruits/apple.png') },
  { name: 'Pear', color: COLORS[3], image: require('../../assets/fruits/pear.png') },
  { name: 'Banana', color: COLORS[2], image: require('../../assets/fruits/banana.png') },
  { name: 'Grape', color: COLORS[4], image: require('../../assets/fruits/grape.png') },
  { name: 'Orange', color: COLORS[5], image: require('../../assets/fruits/orange.png') },
];

const LEVELS = [
  { mode: 'color', goal: 12, seconds: 45, spawnMs: 650 },
  { mode: 'color', goal: 15, seconds: 45, spawnMs: 600 },
  { mode: 'fruit', goal: 15, seconds: 60, spawnMs: 600 },
  { mode: 'fruit', goal: 18, seconds: 60, spawnMs: 550 },
  { mode: 'shape', goal: 18, seconds: 60, spawnMs: 550 },
  { mode: 'shape', goal: 20, seconds: 60, spawnMs: 500 },
  { mode: 'mixed', goal: 18, seconds: 75, spawnMs: 500 },
  { mode: 'mixed', goal: 20, seconds: 75, spawnMs: 475 },
  { mode: 'mixed', goal: 22, seconds: 90, spawnMs: 450 },
  { mode: 'mixed', goal: 25, seconds: 90, spawnMs: 425 },
] as const;

const MAX_LIVES = 3;
const MAX_LEVELS = LEVELS.length;

type BalloonColor = typeof COLORS[number];
type BalloonShape = typeof SHAPES[number];
type BalloonFruit = typeof FRUITS[number];
type LevelMode = typeof LEVELS[number]['mode'];
type Timer = ReturnType<typeof setTimeout> | ReturnType<typeof setInterval>;

interface Target {
  color: BalloonColor;
  shape: BalloonShape;
  number: number;
  fruit: BalloonFruit;
}

interface Balloon {
  id: string;
  color: BalloonColor;
  shape: BalloonShape;
  number: number;
  fruit: BalloonFruit;
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
    fruit: randomItem(FRUITS),
  };
}

function isCorrectBalloon(balloon: Balloon, target: Target, mode: LevelMode) {
  if (mode === 'color') {
    return balloon.color.name === target.color.name;
  }

  if (mode === 'fruit') {
    return balloon.fruit.name === target.fruit.name;
  }

  if (mode === 'shape') {
    return balloon.shape === target.shape;
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

  if (mode === 'fruit') {
    return `Pop ${target.fruit.name}`;
  }

  if (mode === 'shape') {
    return `Pop ${target.shape}`;
  }

  return `Pop ${target.color.name} ${target.shape} number ${target.number}`;
}

function createWrongBalloon(target: Target, mode: LevelMode) {
  let color = randomItem(COLORS);
  let shape = randomItem(SHAPES);
  let number = randomItem(NUMBERS);
  let fruit = randomItem(FRUITS);

  while (
    (mode === 'color' && color.name === target.color.name) ||
    (mode === 'fruit' && fruit.name === target.fruit.name) ||
    (mode === 'shape' && shape === target.shape) ||
    (
      mode === 'mixed' &&
      color.name === target.color.name &&
      shape === target.shape &&
      number === target.number
    )
  ) {
    color = randomItem(COLORS);
    shape = randomItem(SHAPES);
    number = randomItem(NUMBERS);
    fruit = randomItem(FRUITS);
  }

  return { color, shape, number, fruit };
}

function FruitBody({ fruit, size }: { fruit: BalloonFruit; size: number }) {
  const width = fruit.name === 'Banana' ? size * 2.45 : size * 2.05;
  const height = fruit.name === 'Banana' ? size * 1.5 : size * 2.05;

  return (
    <Image
      source={fruit.image}
      resizeMode="contain"
      style={[styles.fruitImage, { width, height }]}
    />
  );
}

function ShapeBody({
  shape,
  color,
  size,
  number,
  showNumber,
}: {
  shape: BalloonShape;
  color: BalloonColor;
  size: number;
  number: number;
  showNumber: boolean;
}) {
  if (shape === 'Triangle') {
    return (
      <View style={{ alignItems: 'center' }}>
        <View
          style={[
            styles.triangleBalloon,
            {
              borderLeftWidth: size * 0.55,
              borderRightWidth: size * 0.55,
              borderBottomWidth: size * 1.05,
              borderBottomColor: color.hex,
            },
          ]}
        >
          {showNumber && (
            <Text style={[styles.triangleNumber, { fontSize: size * 0.34 }]}>
              {number}
            </Text>
          )}
        </View>
      </View>
    );
  }

  if (shape === 'Square') {
    return (
      <View style={[styles.squareBalloon, { width: size, height: size, backgroundColor: color.hex }]}>
        {showNumber && <Text style={[styles.numberText, { fontSize: size * 0.42 }]}>{number}</Text>}
      </View>
    );
  }

  if (shape === 'Diamond') {
    return (
      <View
        style={[
          styles.diamondBalloon,
          { width: size * 0.85, height: size * 0.85, backgroundColor: color.hex },
        ]}
      >
        {showNumber && (
          <Text style={[styles.numberText, { fontSize: size * 0.42, transform: [{ rotate: '-45deg' }] }]}>
            {number}
          </Text>
        )}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.circleBalloon,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: color.hex },
      ]}
    >
      {showNumber && <Text style={[styles.numberText, { fontSize: size * 0.42 }]}>{number}</Text>}
    </View>
  );
}

function BalloonVisual({ balloon, mode }: { balloon: Balloon; mode: LevelMode }) {
  if (mode === 'fruit') {
    return <FruitBody fruit={balloon.fruit} size={balloon.size} />;
  }

  if (mode === 'shape' || mode === 'mixed') {
    return (
      <ShapeBody
        shape={balloon.shape}
        color={balloon.color}
        size={balloon.size}
        number={balloon.number}
        showNumber={mode === 'mixed'}
      />
    );
  }

  return (
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
      <View style={[styles.shine, { width: balloon.size * 0.28, height: balloon.size * 0.18 }]} />
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
  );
}

function TargetPreview({ target, mode }: { target: Target; mode: LevelMode }) {
  const previewSize = 38;

  if (mode === 'fruit') {
    return (
      <View style={styles.previewItem}>
        <FruitBody fruit={target.fruit} size={previewSize} />
      </View>
    );
  }

  if (mode === 'shape') {
    return (
      <View style={styles.previewItem}>
        <ShapeBody
          shape={target.shape}
          color={COLORS[1]}
          size={previewSize}
          number={target.number}
          showNumber={false}
        />
      </View>
    );
  }

  if (mode === 'mixed') {
    return (
      <View style={styles.previewItem}>
        <ShapeBody
          shape={target.shape}
          color={target.color}
          size={previewSize}
          number={target.number}
          showNumber
        />
      </View>
    );
  }

  return (
    <View style={styles.previewItem}>
      <View
        style={[
          styles.balloonBody,
          {
            width: previewSize,
            height: previewSize * 1.2,
            backgroundColor: target.color.hex,
          },
        ]}
      />
      <View style={[styles.knot, { borderTopColor: target.color.dark }]} />
    </View>
  );
}

export default function BalloonPopGame() {
  const { width, height } = useWindowDimensions();

  const gameHeight = useRef(Math.max(360, height * 0.58)).current;
  const balloonBaseSize = useRef(Math.min(98, Math.max(64, width * 0.12))).current;

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
    const currentTarget = targetRef.current;
    const shouldMatch = Math.random() < 0.5;

    let color = randomItem(COLORS);
    let shape = randomItem(SHAPES);
    let number = randomItem(NUMBERS);
    let fruit = randomItem(FRUITS);

    if (shouldMatch) {
      color = currentTarget.color;
      shape = currentTarget.shape;
      number = currentTarget.number;
      fruit = currentTarget.fruit;
    } else {
      const wrong = createWrongBalloon(currentTarget, currentLevel.mode);
      color = wrong.color;
      shape = wrong.shape;
      number = wrong.number;
      fruit = wrong.fruit;
    }

    if (currentLevel.mode === 'fruit') {
      color = fruit.color;
    }

    if (currentLevel.mode === 'shape') {
      color = randomItem(COLORS);
    }

    const size = balloonBaseSize + Math.random() * 26;
    const safeWidth = Math.max(1, width - size - 48);
    const columns = Math.max(3, Math.floor(width / 120));
    const column = idRef.current % columns;
    const columnWidth = width / columns;
    const x = column * columnWidth + 16 + Math.random() * Math.max(12, columnWidth - size - 32);

    const y = new Animated.Value(gameHeight + 10);
    const opacity = new Animated.Value(1);
    const id = `balloon-${Date.now()}-${idRef.current++}`;

    const duration = Math.max(4200, 8500 - levelRef.current * 350 + Math.random() * 1800);

    const anim = Animated.parallel([
      Animated.timing(y, {
        toValue: -(size * 2.8) - 80,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
      Animated.timing(opacity, {
        toValue: 0.95,
        duration,
        easing: Easing.linear,
        useNativeDriver: false,
      }),
    ]);

    const balloon: Balloon = {
      id,
      color,
      shape,
      number,
      fruit,
      x,
      size,
      y,
      opacity,
      anim,
    };

    balloonsRef.current = [...balloonsRef.current, balloon].slice(-18);
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
      const quickSpawn = setTimeout(createBalloon, i * 260);
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

      finishedRef.current = true;
      clearTimers();
      stopBalloons();
      setIsOver(true);
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

    startLevel(levelRef.current);
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
      timersRef.current.push(setTimeout(() => setFeedback(null), 600));

      if (nextCorrectPops >= currentLevel.goal) {
        clearTimers();
        stopBalloons();
        goNextLevel();
      }

      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    setFeedback('Try again');
    timersRef.current.push(setTimeout(() => setFeedback(null), 600));

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
        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>Pop this</Text>
          <TargetPreview target={target} mode={currentLevel.mode} />
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
            <Animated.View
              key={balloon.id}
              style={[
                styles.balloonTouch,
                {
                  left: balloon.x,
                  top: balloon.y,
                  width: balloon.size + 54,
                  height: balloon.size * 2,
                  opacity: balloon.opacity,
                },
              ]}
            >
              <TouchableOpacity
                onPress={() => handlePop(balloon)}
                activeOpacity={0.75}
                style={styles.touchInner}
              >
                <BalloonVisual balloon={balloon} mode={currentLevel.mode} />

                {currentLevel.mode !== 'fruit' && (
                  <>
                    <View style={[styles.knot, { borderTopColor: balloon.color.dark }]} />
                    <View style={styles.string} />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>
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
  targetCard: {
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 180,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 4,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  targetLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: '#8B8178',
    marginBottom: 2,
  },
  previewItem: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3D3530',
    textAlign: 'center',
    marginTop: 2,
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
    top: 114,
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
  },
  touchInner: {
    width: '100%',
    alignItems: 'center',
  },
  fruitImage: {
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
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
  circleBalloon: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },
  squareBalloon: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },
  diamondBalloon: {
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 4 },
    shadowOpacity: 0.22,
    shadowRadius: 6,
    elevation: 5,
  },
  triangleBalloon: {
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triangleNumber: {
    position: 'absolute',
    top: 34,
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
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