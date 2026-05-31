import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import { GameShell } from '../../components/game/GameShell';

const ANIMALS = [
  { id: 'cat', name: 'Cat', emoji: '🐱', category: 'Pets', sound: require('../../assets/animal-sounds/cat.mp3') },
  { id: 'dog', name: 'Dog', emoji: '🐶', category: 'Pets', sound: require('../../assets/animal-sounds/dog.mp3') },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', category: 'Pets', sound: require('../../assets/animal-sounds/rabbit.mp3') },

  { id: 'cow', name: 'Cow', emoji: '🐄', category: 'Farm', sound: require('../../assets/animal-sounds/cow.mp3') },
  { id: 'duck', name: 'Duck', emoji: '🦆', category: 'Farm', sound: require('../../assets/animal-sounds/duck.mp3') },
  { id: 'horse', name: 'Horse', emoji: '🐴', category: 'Farm', sound: require('../../assets/animal-sounds/horse.mp3') },
  { id: 'sheep', name: 'Sheep', emoji: '🐑', category: 'Farm', sound: require('../../assets/animal-sounds/sheep.mp3') },
  { id: 'pig', name: 'Pig', emoji: '🐷', category: 'Farm', sound: require('../../assets/animal-sounds/pig.mp3') },
  { id: 'chicken', name: 'Chicken', emoji: '🐔', category: 'Farm', sound: require('../../assets/animal-sounds/chicken.mp3') },
  { id: 'goat', name: 'Goat', emoji: '🐐', category: 'Farm', sound: require('../../assets/animal-sounds/goat.mp3') },

  { id: 'lion', name: 'Lion', emoji: '🦁', category: 'Wild', sound: require('../../assets/animal-sounds/lion.mp3') },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', category: 'Wild', sound: require('../../assets/animal-sounds/elephant.mp3') },
  { id: 'monkey', name: 'Monkey', emoji: '🐵', category: 'Wild', sound: require('../../assets/animal-sounds/monkey.mp3') },

  { id: 'frog', name: 'Frog', emoji: '🐸', category: 'Nature', sound: require('../../assets/animal-sounds/frog.mp3') },
  { id: 'bird', name: 'Bird', emoji: '🐦', category: 'Nature', sound: require('../../assets/animal-sounds/bird.mp3') },
] as const;

type Animal = typeof ANIMALS[number];
type Category = 'All' | Animal['category'];
type Timer = ReturnType<typeof setTimeout>;

const CATEGORIES: Category[] = ['All', 'Pets', 'Farm', 'Wild', 'Nature'];
const MAX_LIVES = 3;
const ROUNDS = 15;

function shuffle<T>(arr: readonly T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function AnimalSoundsGame() {
  const { width } = useWindowDimensions();
  const cardSize = useMemo(() => Math.min(170, (width - 54) / 2), [width]);

  const [category, setCategory] = useState<Category>('All');
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [round, setRound] = useState(1);
  const [target, setTarget] = useState<Animal | null>(null);
  const [options, setOptions] = useState<Animal[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [collected, setCollected] = useState<string[]>([]);
  const [stickers, setStickers] = useState<string[]>([]);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isWon, setIsWon] = useState(false);
  const [isOver, setIsOver] = useState(false);

  const timersRef = useRef<Timer[]>([]);
  const playerRef = useRef<ReturnType<typeof createAudioPlayer> | null>(null);
  const roundAnimalsRef = useRef<Animal[]>([]);
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const celebrationAnim = useRef(new Animated.Value(0)).current;

  const animalsForCategory = useMemo(() => {
    if (category === 'All') return ANIMALS;
    return ANIMALS.filter((animal) => animal.category === category);
  }, [category]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const playSound = useCallback((animal: Animal) => {
    try {
      playerRef.current?.release();
      const player = createAudioPlayer(animal.sound);
      playerRef.current = player;
      player.seekTo(0);
      player.play();

      Animated.sequence([
        Animated.timing(bounceAnim, { toValue: 1.1, duration: 120, useNativeDriver: true }),
        Animated.timing(bounceAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    } catch {
      setFeedback('Sound missing');
    }
  }, [bounceAnim]);

  const showCelebration = useCallback((text: string) => {
    setFeedback(text);
    celebrationAnim.setValue(0);

    Animated.sequence([
      Animated.timing(celebrationAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(celebrationAnim, { toValue: 0, duration: 420, delay: 500, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => setFeedback(null), 1000);
    timersRef.current.push(timer);
  }, [celebrationAnim]);

  const buildRound = useCallback((roundNum: number) => {
    clearTimers();
    setSelected(null);
    setFeedback(null);

    if (roundNum === 1 || roundAnimalsRef.current.length === 0) {
      roundAnimalsRef.current = shuffle(animalsForCategory).slice(0, Math.min(ROUNDS, animalsForCategory.length));
    }

    const pick = roundAnimalsRef.current[(roundNum - 1) % roundAnimalsRef.current.length];
    const wrong = shuffle(ANIMALS.filter((animal) => animal.id !== pick.id)).slice(0, 3);
    const nextOptions = shuffle([pick, ...wrong]);

    setTarget(pick);
    setOptions(nextOptions);

    const timer = setTimeout(() => playSound(pick), 500);
    timersRef.current.push(timer);
  }, [animalsForCategory, clearTimers, playSound]);

  const restart = useCallback(() => {
    clearTimers();
    playerRef.current?.release();
    roundAnimalsRef.current = [];

    setScore(0);
    setStars(0);
    setLives(MAX_LIVES);
    setRound(1);
    setIsWon(false);
    setIsOver(false);
    setSelected(null);
    setFeedback(null);

    buildRound(1);
  }, [buildRound, clearTimers]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      interruptionMode: 'mixWithOthers',
    });

    buildRound(1);

    return () => {
      clearTimers();
      playerRef.current?.release();
    };
  }, [buildRound, clearTimers]);

  const changeCategory = useCallback((nextCategory: Category) => {
    setCategory(nextCategory);
    clearTimers();
    playerRef.current?.release();
    roundAnimalsRef.current = [];

    setScore(0);
    setStars(0);
    setLives(MAX_LIVES);
    setRound(1);
    setIsWon(false);
    setIsOver(false);
    setSelected(null);
    setFeedback(null);
  }, [clearTimers]);

  useEffect(() => {
    buildRound(1);
  }, [category]);

  const handleTap = useCallback((animal: Animal) => {
    if (!target || selected || isWon || isOver) return;

    setSelected(animal.id);

    if (animal.id === target.id) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound(animal);

      setScore((current) => current + 15);
      setStars((current) => current + 1);

      setCollected((current) => (
        current.includes(animal.id) ? current : [...current, animal.id]
      ));

      const nextSticker = `${animal.name} Sticker`;
      setStickers((current) => (
        current.includes(nextSticker) ? current : [...current, nextSticker]
      ));

      showCelebration(`${animal.name} found`);

      const timer = setTimeout(() => {
        const nextRound = round + 1;

        if (nextRound > Math.min(ROUNDS, animalsForCategory.length)) {
          setIsWon(true);
          return;
        }

        setRound(nextRound);
        buildRound(nextRound);
      }, 1100);

      timersRef.current.push(timer);
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    showCelebration('Try again');

    const nextLives = lives - 1;
    setLives(nextLives);

    const timer = setTimeout(() => {
      if (nextLives <= 0) {
        setIsOver(true);
        return;
      }

      setSelected(null);
      setFeedback(null);
      playSound(target);
    }, 900);

    timersRef.current.push(timer);
  }, [
    animalsForCategory.length,
    buildRound,
    isOver,
    isWon,
    lives,
    playSound,
    round,
    selected,
    showCelebration,
    target,
  ]);

  const maxRounds = Math.min(ROUNDS, animalsForCategory.length);

  return (
    <GameShell
      title="Animal Safari"
      emoji="🦁"
      color="#6BCB77"
      score={score}
      lives={lives}
      maxLives={MAX_LIVES}
      round={round}
      maxRounds={maxRounds}
      onRestart={restart}
      isWon={isWon}
      isOver={isOver}
    >
      <View style={styles.container}>
        <View style={styles.categories}>
          {CATEGORIES.map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => changeCategory(item)}
              style={[styles.categoryChip, category === item && styles.categoryChipActive]}
            >
              <Text style={[styles.categoryText, category === item && styles.categoryTextActive]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.collectionRow}>
          <Text style={styles.collectionText}>
            Animals {collected.length}/{ANIMALS.length}
          </Text>
          <Text style={styles.collectionText}>
            Stickers {stickers.length}
          </Text>
        </View>

        <View style={styles.soundCard}>
          <Text style={styles.soundTitle}>Who made this sound?</Text>

          <TouchableOpacity
            onPress={() => target && playSound(target)}
            activeOpacity={0.85}
            style={styles.soundButton}
          >
            <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
              <Text style={styles.soundButtonText}>Play Sound</Text>
            </Animated.View>
          </TouchableOpacity>
        </View>

        <View style={styles.grid}>
          {options.map((animal) => {
            const isSelected = selected === animal.id;
            const isCorrect = isSelected && target?.id === animal.id;
            const isWrong = isSelected && target?.id !== animal.id;
            const isCollected = collected.includes(animal.id);

            return (
              <TouchableOpacity
                key={animal.id}
                onPress={() => handleTap(animal)}
                activeOpacity={0.85}
                style={[
                  styles.card,
                  { width: cardSize, height: cardSize * 0.92 },
                  isCorrect && styles.cardCorrect,
                  isWrong && styles.cardWrong,
                ]}
              >
                <Text style={styles.animalEmoji}>{animal.emoji}</Text>
                <Text style={styles.animalName}>{animal.name}</Text>
                <Text style={styles.animalCategory}>{animal.category}</Text>
                {isCollected && <Text style={styles.collectedText}>Collected</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {feedback && (
          <Animated.View
            style={[
              styles.celebration,
              {
                opacity: celebrationAnim,
                transform: [
                  {
                    scale: celebrationAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <Text style={styles.celebrationText}>{feedback}</Text>
          </Animated.View>
        )}
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 14,
    gap: 10,
    alignItems: 'center',
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#DDEFD8',
  },
  categoryChipActive: {
    backgroundColor: '#6BCB77',
    borderColor: '#6BCB77',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#3D3530',
  },
  categoryTextActive: {
    color: '#FFFFFF',
  },
  collectionRow: {
    flexDirection: 'row',
    gap: 14,
  },
  collectionText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#8B8178',
  },
  soundCard: {
    width: '100%',
    borderRadius: 24,
    padding: 14,
    alignItems: 'center',
    backgroundColor: '#E7F8DF',
    borderWidth: 3,
    borderColor: '#6BCB77',
  },
  soundTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#3D3530',
    marginBottom: 8,
  },
  soundButton: {
    minWidth: 160,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  soundButtonText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#3D3530',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 3,
    borderColor: '#F5EDD8',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  cardCorrect: {
    borderColor: '#6BCB77',
    backgroundColor: '#E5F7E7',
  },
  cardWrong: {
    borderColor: '#FF6B6B',
    backgroundColor: '#FFE5E5',
  },
  animalEmoji: {
    fontSize: 70,
  },
  animalName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#3D3530',
  },
  animalCategory: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8B8178',
  },
  collectedText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6BCB77',
  },
  celebration: {
    position: 'absolute',
    top: '42%',
    alignSelf: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderWidth: 3,
    borderColor: '#FFD93D',
  },
  celebrationText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#3D3530',
  },
});