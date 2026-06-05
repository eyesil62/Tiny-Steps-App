// ============================================================
// Milo's Quest Island — Ages 5–8
// Original TinySteps adventure game — exploration + puzzles
// Milo the Owl guides the child through 6 island areas
// ============================================================
import React, { useState, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  StyleSheet, ScrollView, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width: W } = Dimensions.get('window');
const STORE_KEY = 'milosquest_v1';

function say(text: string, rate = 0.84, pitch = 1.05) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 130);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} }, 130));
}

interface QuestArea {
  id:          string;
  name:        string;
  emoji:       string;
  mapEmoji:    string;
  color:       string;
  colorLight:  string;
  unlockGems:  number;
  ambient:     string; // milo's intro
  character:   { emoji: string; name: string };
  story:       string;
  puzzles:     Puzzle[];
  hiddenItems: HiddenItem[];
  badge:       { emoji: string; name: string };
}

interface Puzzle {
  id:       string;
  question: string;
  options:  { text: string; emoji: string; correct: boolean }[];
  speech:   string;
  reward:   number; // gems
}

interface HiddenItem {
  id:     string;
  emoji:  string;
  speech: string;
  x:      number;
  y:      number;
}

const AREAS: QuestArea[] = [
  {
    id: 'beach', name: 'Sunstone Beach', emoji: '🏖️', mapEmoji: '🌊',
    color: '#4D96FF', colorLight: '#E5EFFE', unlockGems: 0,
    ambient: 'Welcome to Sunstone Beach! The waves are singing and the sand is warm. I can see something sparkling in the water!',
    character: { emoji: '🧜‍♀️', name: 'Marina the Mermaid' },
    story: 'Marina lost her pearl necklace in the ocean. Can you help her find it by answering her questions?',
    badge: { emoji: '🐚', name: 'Shell Collector' },
    puzzles: [
      { id: 'b1', speech: 'How many shells can you count on the sand?', question: 'The beach has shells. Which creature makes a shell?', reward: 3,
        options: [{ text: '🐠 Fish', emoji: '🐠', correct: false }, { text: '🐚 Snail', emoji: '🐚', correct: true }, { text: '🦅 Eagle', emoji: '🦅', correct: false }] },
      { id: 'b2', speech: 'The ocean is very salty! Why do you think the sea is salty?', question: 'What do we call the water in the ocean?', reward: 3,
        options: [{ text: '🍬 Sweet water', emoji: '🍬', correct: false }, { text: '🧂 Salt water', emoji: '🧂', correct: true }, { text: '💧 Fresh water', emoji: '💧', correct: false }] },
      { id: 'b3', speech: 'Marina found the pearl! Which animal makes pearls?', question: 'Which creature makes a pearl?', reward: 5,
        options: [{ text: '🐬 Dolphin', emoji: '🐬', correct: false }, { text: '🦀 Crab', emoji: '🦀', correct: false }, { text: '🦪 Oyster', emoji: '🦪', correct: true }] },
    ],
    hiddenItems: [
      { id: 'starfish', emoji: '⭐', speech: 'A starfish! Did you know they can grow back their arms?', x: 12, y: 60 },
      { id: 'crab',     emoji: '🦀', speech: 'A crab! Scuttle scuttle! It walks sideways!', x: 68, y: 70 },
      { id: 'treasure', emoji: '💎', speech: 'A hidden gem! Well spotted!', x: 40, y: 45 },
    ],
  },
  {
    id: 'forest', name: 'Whispering Forest', emoji: '🌲', mapEmoji: '🌿',
    color: '#6BCB77', colorLight: '#E5F7E7', unlockGems: 8,
    ambient: 'Shhh! We are in the Whispering Forest! Listen... the trees are talking! And I can hear a fox who needs our help.',
    character: { emoji: '🦊', name: 'Felix the Fox' },
    story: 'Felix the Fox lost his map and cannot find his family den. Help him find his way by answering forest questions!',
    badge: { emoji: '🍃', name: 'Forest Explorer' },
    puzzles: [
      { id: 'f1', speech: 'In the forest, many animals make their homes. What do birds live in?', question: 'What is a bird\'s home called?', reward: 3,
        options: [{ text: '🏠 House', emoji: '🏠', correct: false }, { text: '🪺 Nest', emoji: '🪺', correct: true }, { text: '🏕️ Tent', emoji: '🏕️', correct: false }] },
      { id: 'f2', speech: 'Trees make their food from sunlight! What is that process called?', question: 'Trees turn sunlight into food. This is called...', reward: 3,
        options: [{ text: '🍳 Cooking', emoji: '🍳', correct: false }, { text: '🌱 Photosynthesis', emoji: '🌱', correct: true }, { text: '💤 Sleeping', emoji: '💤', correct: false }] },
      { id: 'f3', speech: 'Felix found his den! The fox family eats berries in winter. Which season comes before winter?', question: 'Which season comes before winter?', reward: 5,
        options: [{ text: '🌸 Spring', emoji: '🌸', correct: false }, { text: '🍂 Autumn', emoji: '🍂', correct: true }, { text: '☀️ Summer', emoji: '☀️', correct: false }] },
    ],
    hiddenItems: [
      { id: 'mushroom', emoji: '🍄', speech: 'A spotted mushroom! Some mushrooms are poisonous so never touch them!', x: 20, y: 55 },
      { id: 'deer',     emoji: '🦌', speech: 'A deer! So gentle and graceful!', x: 65, y: 35 },
      { id: 'acorn',    emoji: '🌰', speech: 'An acorn! Squirrels bury these for winter!', x: 45, y: 68 },
    ],
  },
  {
    id: 'cave', name: 'Crystal Cave', emoji: '🕳️', mapEmoji: '💎',
    color: '#C77DFF', colorLight: '#F3E5FF', unlockGems: 18,
    ambient: 'Hooo! A mysterious cave! I can hear echoes and see crystals glowing. There is someone in there who needs our light!',
    character: { emoji: '🦇', name: 'Bella the Bat' },
    story: 'Bella the Bat is afraid of the dark tonight because her echolocation is not working. Help her by answering cave questions!',
    badge: { emoji: '💎', name: 'Crystal Hunter' },
    puzzles: [
      { id: 'c1', speech: 'Bats use sound to find their way in the dark. What is this called?', question: 'Bats find things using sound. This is called...', reward: 3,
        options: [{ text: '👁️ Vision', emoji: '👁️', correct: false }, { text: '🔊 Echolocation', emoji: '🔊', correct: true }, { text: '👃 Smelling', emoji: '👃', correct: false }] },
      { id: 'c2', speech: 'Caves have amazing rock formations. Which rock grows up from the ground?', question: 'Which cave rock grows from the ground up?', reward: 3,
        options: [{ text: '❄️ Stalagmite', emoji: '⬆️', correct: true }, { text: '💧 Stalactite', emoji: '⬇️', correct: false }, { text: '🪨 Boulder', emoji: '🪨', correct: false }] },
      { id: 'c3', speech: 'Bella can see now! Crystals form over thousands of years. What are crystals made of?', question: 'Crystals are made of...', reward: 5,
        options: [{ text: '🧁 Sugar', emoji: '🧁', correct: false }, { text: '🧊 Ice', emoji: '🧊', correct: false }, { text: '🪨 Minerals', emoji: '🪨', correct: true }] },
    ],
    hiddenItems: [
      { id: 'gem1',  emoji: '💎', speech: 'A brilliant blue diamond! Beautiful!', x: 15, y: 40 },
      { id: 'fossil',emoji: '🦕', speech: 'A fossil! The remains of an animal from millions of years ago!', x: 60, y: 55 },
      { id: 'glow',  emoji: '✨', speech: 'Glowing crystals! They absorb light and glow in the dark!', x: 38, y: 25 },
    ],
  },
  {
    id: 'mountain', name: 'Misty Mountain', emoji: '⛰️', mapEmoji: '🏔️',
    color: '#FF9F43', colorLight: '#FFF0DC', unlockGems: 30,
    ambient: 'We have climbed so high! I can see the whole island from up here! Be careful, the path is narrow. A little goat needs our help!',
    character: { emoji: '🐐', name: 'Gruff the Mountain Goat' },
    story: 'Gruff the Goat got separated from the herd and cannot find the way back down. Answer his mountain questions to help him!',
    badge: { emoji: '🏔️', name: 'Mountain Climber' },
    puzzles: [
      { id: 'm1', speech: 'Mountains are very tall! What is the very top of a mountain called?', question: 'What is the very top of a mountain called?', reward: 3,
        options: [{ text: '🌊 Valley', emoji: '🌊', correct: false }, { text: '⛰️ Summit', emoji: '⛰️', correct: true }, { text: '🌊 River', emoji: '🏞️', correct: false }] },
      { id: 'm2', speech: 'Some mountains have snow on top all year! Why is it cold at the top?', question: 'Why is the top of a mountain colder?', reward: 3,
        options: [{ text: '☁️ Closer to cold clouds', emoji: '☁️', correct: true }, { text: '🌬️ The wind blows cold air there', emoji: '🌬️', correct: false }, { text: '❄️ It always snows there', emoji: '❄️', correct: false }] },
      { id: 'm3', speech: 'Gruff found his herd! Mountains form when...?', question: 'Mountains form when...', reward: 5,
        options: [{ text: '💧 Rain piles up', emoji: '💧', correct: false }, { text: '🌍 Earth\'s plates push up', emoji: '🌍', correct: true }, { text: '☁️ Clouds fall down', emoji: '☁️', correct: false }] },
    ],
    hiddenItems: [
      { id: 'eagle',  emoji: '🦅', speech: 'An eagle! They have the sharpest eyesight of any bird!', x: 70, y: 15 },
      { id: 'snow',   emoji: '❄️', speech: 'Snowflakes! Every single snowflake is completely unique!', x: 25, y: 30 },
      { id: 'goat2',  emoji: '🐑', speech: 'A mountain sheep! They are incredibly sure-footed on the rocks.', x: 50, y: 62 },
    ],
  },
  {
    id: 'waterfall', name: 'Rainbow Waterfall', emoji: '🌊', mapEmoji: '💦',
    color: '#4D96FF', colorLight: '#E5EFFE', unlockGems: 45,
    ambient: 'Listen to the roar of the waterfall! The spray creates a rainbow! A little otter is playing in the pool below!',
    character: { emoji: '🦦', name: 'Otis the Otter' },
    story: 'Otis the Otter found a mysterious bottle with a message inside. Help him decode the message by answering water questions!',
    badge: { emoji: '🌊', name: 'Water Expert' },
    puzzles: [
      { id: 'w1', speech: 'Water falls from the sky as rain. Where does rain come from?', question: 'Where does rain come from?', reward: 3,
        options: [{ text: '🌊 The sea', emoji: '🌊', correct: false }, { text: '☁️ Clouds', emoji: '☁️', correct: true }, { text: '🏔️ Mountains', emoji: '🏔️', correct: false }] },
      { id: 'w2', speech: 'Rainbows appear when light passes through water drops. How many colours in a rainbow?', question: 'How many colours are in a rainbow?', reward: 3,
        options: [{ text: '5️⃣ Five', emoji: '5️⃣', correct: false }, { text: '7️⃣ Seven', emoji: '7️⃣', correct: true }, { text: '9️⃣ Nine', emoji: '9️⃣', correct: false }] },
      { id: 'w3', speech: 'Otis decoded the message! It says water is very important. What percentage of Earth is covered in water?', question: 'How much of Earth is covered in water?', reward: 5,
        options: [{ text: '30%', emoji: '3️⃣', correct: false }, { text: '50%', emoji: '5️⃣', correct: false }, { text: '70%', emoji: '7️⃣', correct: true }] },
    ],
    hiddenItems: [
      { id: 'frog',   emoji: '🐸', speech: 'A frog! Frogs breathe through their skin as well as their lungs!', x: 20, y: 65 },
      { id: 'fish2',  emoji: '🐟', speech: 'A silver fish jumping in the waterfall pool!', x: 55, y: 70 },
      { id: 'rainbow',emoji: '🌈', speech: 'A tiny rainbow in the waterfall spray! Magnificent!', x: 40, y: 20 },
    ],
  },
  {
    id: 'village', name: 'Milo\'s Village', emoji: '🏘️', mapEmoji: '🏠',
    color: '#FF6B6B', colorLight: '#FFE5E5', unlockGems: 65,
    ambient: 'We are back in the village! This is where I live! All the island friends have gathered to celebrate your adventure!',
    character: { emoji: '🦉', name: 'Milo the Owl' },
    story: 'You have completed all the island quests! Milo wants to give you a final challenge before the grand celebration!',
    badge: { emoji: '👑', name: 'Island Champion' },
    puzzles: [
      { id: 'v1', speech: 'You visited the beach, forest, cave, mountain and waterfall. How many areas is that?', question: 'How many quest areas did you visit?', reward: 5,
        options: [{ text: '4️⃣ Four', emoji: '4️⃣', correct: false }, { text: '5️⃣ Five', emoji: '5️⃣', correct: true }, { text: '6️⃣ Six', emoji: '6️⃣', correct: false }] },
      { id: 'v2', speech: 'You helped Marina, Felix, Bella, Gruff and Otis. Which animal is Bella?', question: 'Which animal is Bella?', reward: 5,
        options: [{ text: '🦊 Fox', emoji: '🦊', correct: false }, { text: '🦇 Bat', emoji: '🦇', correct: true }, { text: '🐐 Goat', emoji: '🐐', correct: false }] },
      { id: 'v3', speech: 'Final question! You are a true island explorer. Explorers discover new things. What does discover mean?', question: 'What does "discover" mean?', reward: 10,
        options: [{ text: '😴 To sleep deeply', emoji: '😴', correct: false }, { text: '🔍 To find for the first time', emoji: '🔍', correct: true }, { text: '🍽️ To eat a meal', emoji: '🍽️', correct: false }] },
    ],
    hiddenItems: [
      { id: 'party',    emoji: '🎉', speech: 'A party for you! All your island friends are celebrating!', x: 30, y: 40 },
      { id: 'trophy',   emoji: '🏆', speech: 'The Island Explorer trophy! It has your name on it!', x: 60, y: 30 },
      { id: 'milo-home',emoji: '🦉', speech: 'Milo\'s home! Come in for tea and a story!', x: 15, y: 55 },
    ],
  },
];

export default function MilosQuestIsland() {
  const [gems,         setGems]         = useState(0);
  const [unlockedAreas,setUnlocked]     = useState<string[]>(['beach']);
  const [earnedBadges, setEarnedBadges] = useState<string[]>([]);
  const [activeArea,   setActiveArea]   = useState<QuestArea | null>(null);
  const [puzzleIndex,  setPuzzleIndex]  = useState(0);
  const [feedback,     setFeedback]     = useState<{ text: string; correct: boolean } | null>(null);
  const [foundHidden,  setFoundHidden]  = useState<string[]>([]);
  const [completedAreas, setCompleted]  = useState<string[]>([]);
  const [showDailyChest, setShowChest]  = useState(false);
  const miloAnim  = React.useRef(new Animated.Value(0)).current;
  const chestAnim = React.useRef(new Animated.Value(0)).current;
  const answeredRef = React.useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY).then(raw => {
      if (!raw) return;
      const s = JSON.parse(raw);
      setGems(s.gems ?? 0);
      setUnlocked(s.unlockedAreas ?? ['beach']);
      setEarnedBadges(s.earnedBadges ?? []);
      setFoundHidden(s.foundHidden ?? []);
      setCompleted(s.completedAreas ?? []);
      // Daily treasure chest
      const lastDay = s.lastDay;
      const today   = new Date().toDateString();
      if (lastDay !== today) setShowChest(true);
    });
    // Milo float
    const float = Animated.loop(Animated.sequence([
      Animated.timing(miloAnim, { toValue: -8, duration: 1500, useNativeDriver: true }),
      Animated.timing(miloAnim, { toValue: 0,  duration: 1500, useNativeDriver: true }),
    ]));
    float.start();
    return () => float.stop();
  }, []);

  const save = (g: number, u: string[], b: string[], f: string[], c: string[]) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify({
      gems: g, unlockedAreas: u, earnedBadges: b,
      foundHidden: f, completedAreas: c, lastDay: new Date().toDateString(),
    }));
  };

  const openArea = (area: QuestArea) => {
    if (!unlockedAreas.includes(area.id)) {
      say(`You need ${area.unlockGems} gems to unlock ${area.name}! Keep exploring!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    answeredRef.current = false;
    setActiveArea(area);
    setPuzzleIndex(0);
    setFeedback(null);
    setTimeout(() => say(area.ambient, 0.82, 1.05), 500);
  };

  const handleAnswer = useCallback((correct: boolean, areaId: string) => {
    if (!activeArea || answeredRef.current) return;
    answeredRef.current = true;
    const puzzle = activeArea.puzzles[puzzleIndex];
    Haptics.impactAsync(correct ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);

    if (correct) {
      const reward  = puzzle.reward;
      const newGems = gems + reward;
      say(`Wonderful! That is correct! You earned ${reward} gems!`);
      setFeedback({ text: `✅ +${reward} 💎`, correct: true });
      setGems(newGems);

      // Unlock next areas
      const newUnlocked = [...unlockedAreas];
      AREAS.forEach(a => {
        if (!newUnlocked.includes(a.id) && newGems >= a.unlockGems) newUnlocked.push(a.id);
      });
      setUnlocked(newUnlocked);

      setTimeout(() => {
        setFeedback(null);
        answeredRef.current = false;
        const next = puzzleIndex + 1;
        if (next >= activeArea.puzzles.length) {
          // Area complete!
          say(`Amazing! You completed ${activeArea.name}! You earned the ${activeArea.badge.name} badge!`);
          const newBadges    = earnedBadges.includes(activeArea.badge.emoji) ? earnedBadges : [...earnedBadges, activeArea.badge.emoji];
          const newCompleted = completedAreas.includes(areaId) ? completedAreas : [...completedAreas, areaId];
          setEarnedBadges(newBadges);
          setCompleted(newCompleted);
          save(newGems, newUnlocked, newBadges, foundHidden, newCompleted);
          setTimeout(() => setActiveArea(null), 2000);
        } else {
          setPuzzleIndex(next);
          setTimeout(() => say(activeArea.puzzles[next].speech, 0.82, 1.0), 600);
          save(newGems, newUnlocked, earnedBadges, foundHidden, completedAreas);
        }
      }, 1400);
    } else {
      say('Not quite! Have another try!');
      setFeedback({ text: '❌ Try again!', correct: false });
      setTimeout(() => {
        setFeedback(null);
        answeredRef.current = false;
      }, 1000);
    }
  }, [activeArea, puzzleIndex, gems, earnedBadges, unlockedAreas, foundHidden, completedAreas]);

  const tapHidden = (item: HiddenItem, areaId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    say(item.speech);
    if (!foundHidden.includes(item.id)) {
      const newGems = gems + 1;
      const newFound = [...foundHidden, item.id];
      setGems(newGems);
      setFoundHidden(newFound);
      save(newGems, unlockedAreas, earnedBadges, newFound, completedAreas);
    }
  };

  const claimChest = () => {
    const reward = 3 + Math.floor(Math.random() * 5);
    const newGems = gems + reward;
    say(`Daily treasure! ${reward} gems for you!`);
    setGems(newGems);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setShowChest(false);
    save(newGems, unlockedAreas, earnedBadges, foundHidden, completedAreas);
  };

  const currentPuzzle = activeArea?.puzzles[puzzleIndex];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => activeArea ? setActiveArea(null) : router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ Milo's Quest Island</Text>
        <View style={styles.gemsBadge}><Text style={styles.gemsText}>💎{gems}</Text></View>
      </View>

      {!activeArea ? (
        // ── ISLAND MAP ────────────────────────────────────
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.mapScroll}>
          {/* Milo greeting */}
          <View style={styles.miloRow}>
            <Animated.Text style={[styles.miloEmoji, { transform: [{ translateY: miloAnim }] }]}>🦉</Animated.Text>
            <View style={styles.miloBubble}>
              <Text style={styles.miloText}>
                {completedAreas.length === 0
                  ? 'Welcome, brave explorer! I am Milo! Let\'s discover the island together!'
                  : `You have explored ${completedAreas.length} area${completedAreas.length > 1 ? 's' : ''}! Keep going, explorer!`}
              </Text>
            </View>
          </View>

          {/* Daily chest */}
          {showDailyChest && (
            <TouchableOpacity style={styles.dailyChest} onPress={claimChest} activeOpacity={0.85}>
              <Text style={{ fontSize: 44 }}>🎁</Text>
              <View>
                <Text style={styles.chestTitle}>Daily Treasure Chest!</Text>
                <Text style={styles.chestSub}>Tap to claim your gems!</Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Badges earned */}
          {earnedBadges.length > 0 && (
            <View style={styles.badgeRow}>
              <Text style={styles.badgeLabel}>Your badges:</Text>
              {earnedBadges.map((b, i) => <Text key={i} style={{ fontSize: 28 }}>{b}</Text>)}
            </View>
          )}

          {/* Area cards */}
          <Text style={styles.mapTitle}>Choose your destination:</Text>
          <View style={styles.areaGrid}>
            {AREAS.map((area) => {
              const locked    = !unlockedAreas.includes(area.id);
              const completed = completedAreas.includes(area.id);
              return (
                <TouchableOpacity
                  key={area.id}
                  style={[styles.areaCard, { borderColor: area.color }, locked && styles.areaLocked, completed && styles.areaCompleted]}
                  onPress={() => openArea(area)}
                  activeOpacity={locked ? 0.6 : 0.85}
                >
                  <View style={[styles.areaBanner, { backgroundColor: locked ? '#E0E0E0' : area.color }]}>
                    <Text style={styles.areaEmoji}>{locked ? '🔒' : area.emoji}</Text>
                    {completed && <View style={styles.completedStamp}><Text style={styles.completedStampText}>✓</Text></View>}
                  </View>
                  <View style={styles.areaInfo}>
                    <Text style={styles.areaName}>{area.name}</Text>
                    <Text style={styles.areaChar}>{area.character.emoji} {area.character.name}</Text>
                    {locked && <Text style={styles.areaLock}>💎{area.unlockGems} to unlock</Text>}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

      ) : (
        // ── AREA VIEW ────────────────────────────────────
        <View style={styles.areaView}>
          {/* Area header */}
          <View style={[styles.areaHeader, { backgroundColor: activeArea.color }]}>
            <Text style={styles.areaHeaderEmoji}>{activeArea.emoji}</Text>
            <View>
              <Text style={styles.areaHeaderName}>{activeArea.name}</Text>
              <Text style={styles.areaHeaderChar}>{activeArea.character.emoji} {activeArea.character.name}</Text>
            </View>
            <Text style={styles.areaProgress}>{puzzleIndex + 1}/{activeArea.puzzles.length}</Text>
          </View>

          {/* Hidden items strip */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hiddenStrip} contentContainerStyle={styles.hiddenContent}>
            {activeArea.hiddenItems.map(item => (
              <TouchableOpacity key={item.id} onPress={() => tapHidden(item, activeArea.id)} activeOpacity={0.8} style={styles.hiddenItem}>
                <Text style={styles.hiddenEmoji}>{item.emoji}</Text>
                {!foundHidden.includes(item.id) && <View style={styles.hiddenDot} />}
              </TouchableOpacity>
            ))}
            <Text style={styles.hiddenHint}>👆 Tap hidden items!</Text>
          </ScrollView>

          {/* Story card */}
          <View style={[styles.storyCard, { borderColor: activeArea.color }]}>
            <Text style={styles.storyCharEmoji}>{activeArea.character.emoji}</Text>
            <Text style={styles.storyText}>{activeArea.story}</Text>
          </View>

          {/* Puzzle dots */}
          <View style={styles.puzzleDots}>
            {activeArea.puzzles.map((_, i) => (
              <View key={i} style={[styles.dot, i <= puzzleIndex && { backgroundColor: activeArea.color }, i < puzzleIndex && { width: 20 }]} />
            ))}
          </View>

          {/* Current puzzle */}
          {currentPuzzle && (
            <View style={styles.puzzleArea}>
              <View style={styles.questionCard}>
                <Text style={styles.questionText}>{currentPuzzle.question}</Text>
              </View>
              {feedback && (
                <View style={[styles.feedbackBubble, feedback.correct ? styles.feedbackGood : styles.feedbackBad]}>
                  <Text style={styles.feedbackText}>{feedback.text}</Text>
                </View>
              )}
              <View style={styles.optionsGrid}>
                {currentPuzzle.options.map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.optionBtn, { borderColor: activeArea.color }]}
                    onPress={() => handleAnswer(opt.correct, activeArea.id)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.optionEmoji}>{opt.emoji}</Text>
                    <Text style={styles.optionText}>{opt.text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:            { flex: 1, backgroundColor: '#0d1b2a' },
  header:          { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#1a3a5c' },
  backBtn:         { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:        { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerTitle:     { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '900', color: '#fff' },
  gemsBadge:       { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  gemsText:        { fontSize: 14, fontWeight: '900', color: '#FFD93D' },
  mapScroll:       { padding: 16, gap: 14, paddingBottom: 32 },
  miloRow:         { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  miloEmoji:       { fontSize: 52 },
  miloBubble:      { flex: 1, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, borderBottomLeftRadius: 4, padding: 12 },
  miloText:        { color: '#fff', fontSize: 13, fontWeight: '700', lineHeight: 20 },
  dailyChest:      { backgroundColor: '#FFD93D', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14 },
  chestTitle:      { fontSize: 16, fontWeight: '900', color: '#3D3530' },
  chestSub:        { fontSize: 12, color: '#8B6914', fontWeight: '700' },
  badgeRow:        { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 12 },
  badgeLabel:      { color: '#fff', fontWeight: '800', fontSize: 13 },
  mapTitle:        { color: 'rgba(255,255,255,0.7)', fontWeight: '800', fontSize: 12, letterSpacing: 1 },
  areaGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  areaCard:        { width: '47%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 16, borderWidth: 2, overflow: 'hidden' },
  areaLocked:      { opacity: 0.6 },
  areaCompleted:   { borderWidth: 3 },
  areaBanner:      { height: 70, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  areaEmoji:       { fontSize: 36 },
  completedStamp:  { position: 'absolute', top: 6, right: 8, backgroundColor: '#FFD93D', borderRadius: 99, width: 22, height: 22, alignItems: 'center', justifyContent: 'center' },
  completedStampText:{ fontSize: 12, fontWeight: '900', color: '#3D3530' },
  areaInfo:        { padding: 10, gap: 2 },
  areaName:        { fontSize: 12, fontWeight: '900', color: '#fff' },
  areaChar:        { fontSize: 11, color: 'rgba(255,255,255,0.65)', fontWeight: '700' },
  areaLock:        { fontSize: 10, color: '#FFD93D', fontWeight: '800', marginTop: 2 },
  areaView:        { flex: 1, backgroundColor: '#FFF9F0' },
  areaHeader:      { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  areaHeaderEmoji: { fontSize: 36 },
  areaHeaderName:  { fontSize: 17, fontWeight: '900', color: '#fff' },
  areaHeaderChar:  { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  areaProgress:    { marginLeft: 'auto', fontSize: 15, fontWeight: '900', color: 'rgba(255,255,255,0.8)' },
  hiddenStrip:     { maxHeight: 70 },
  hiddenContent:   { paddingHorizontal: 16, alignItems: 'center', gap: 12 },
  hiddenItem:      { alignItems: 'center', position: 'relative' },
  hiddenEmoji:     { fontSize: 32 },
  hiddenDot:       { width: 6, height: 6, borderRadius: 3, backgroundColor: '#FF6B6B', position: 'absolute', top: 0, right: 0 },
  hiddenHint:      { fontSize: 10, color: '#8B8178', fontWeight: '700', alignSelf: 'center' },
  storyCard:       { margin: 12, borderRadius: 16, borderWidth: 2, padding: 14, backgroundColor: '#fff', flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  storyCharEmoji:  { fontSize: 38 },
  storyText:       { flex: 1, fontSize: 13, fontWeight: '700', color: '#3D3530', lineHeight: 20 },
  puzzleDots:      { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: 8 },
  dot:             { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
  puzzleArea:      { flex: 1, paddingHorizontal: 14, gap: 12 },
  questionCard:    { backgroundColor: '#fff', borderRadius: 18, padding: 18, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  questionText:    { fontSize: 16, fontWeight: '800', color: '#3D3530', lineHeight: 24, textAlign: 'center' },
  feedbackBubble:  { borderRadius: 14, padding: 10, alignItems: 'center' },
  feedbackGood:    { backgroundColor: '#E5F7E7' },
  feedbackBad:     { backgroundColor: '#FFE5E5' },
  feedbackText:    { fontSize: 16, fontWeight: '900' },
  optionsGrid:     { gap: 10 },
  optionBtn:       { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 2.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2 },
  optionEmoji:     { fontSize: 28 },
  optionText:      { fontSize: 15, fontWeight: '800', color: '#3D3530', flex: 1 },
});
