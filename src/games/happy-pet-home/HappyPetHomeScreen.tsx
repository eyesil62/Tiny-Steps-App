// ============================================================
// Happy Pet Home — Main Game Screen (V1)
// Coordinates all sub-screens and the main pet room
// ============================================================
import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Modal, Animated, ScrollView, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

import { useHappyPetStore } from './store/useHappyPetStore';
import { PETS } from './data/pets';
import { FOODS, TOYS, BLANKETS } from './data/items';
import { PetCharacter } from './components/PetCharacter';
import { PetRoom }      from './components/PetRoom';
import { NeedBar }      from './components/NeedBar';
import { ActionButton } from './components/ActionButton';
import { RewardStars }  from './components/RewardStars';
import PetSelectScreen  from './screens/PetSelectScreen';
import PetNamingScreen  from './screens/PetNamingScreen';
import { getNeedEmoji, getMood, getMoodEmoji, getMoodLabel } from './utils/petNeeds';

const { width: W, height: H } = Dimensions.get('window');

function safeSpeak(text: string, rate = 0.82, pitch = 1.15) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 150);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} }, 150));
}

// ── Mini-game: Feed ──────────────────────────────────────────
function FeedModal({ pet, onFeed, onClose }: any) {
  const [selected, setSelected] = useState<string | null>(null);
  const plateY = useRef(new Animated.Value(100)).current;
  const plateOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(plateY, { toValue: 0, tension: 80, friction: 8, useNativeDriver: true }),
      Animated.timing(plateOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    safeSpeak(`${pet.name} is hungry! Pick the right food!`);
  }, []);

  const handleFood = (food: typeof FOODS[0]) => {
    setSelected(food.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeSpeak(`Yum! ${pet.sounds.happy}`, 0.88, 1.2);
    setTimeout(() => {
      onFeed(food.id, food.hungerBoost);
      onClose();
    }, 1400);
  };

  return (
    <Animated.View style={[styles.miniGameContainer, { transform: [{ translateY: plateY }], opacity: plateOpacity }]}>
      <TouchableOpacity style={styles.miniGameClose} onPress={onClose}>
        <Text style={styles.miniGameCloseText}>✕</Text>
      </TouchableOpacity>

      <Text style={styles.miniGameTitle}>🍽️ Feed {pet.name}!</Text>
      <Text style={styles.miniGameSub}>Tap the food to feed your pet</Text>

      {/* Pet waiting */}
      <View style={styles.miniPetWrap}>
        <Text style={styles.miniPetEmoji}>{pet.hungryEmoji}</Text>
        {selected && <Text style={styles.miniReaction}>😋 Yummy!</Text>}
      </View>

      {/* Food options */}
      <View style={styles.foodGrid}>
        {FOODS.map((food) => (
          <TouchableOpacity
            key={food.id}
            style={[styles.foodBtn, selected === food.id && styles.foodBtnSelected]}
            onPress={() => handleFood(food)}
            disabled={!!selected}
            activeOpacity={0.85}
          >
            <Text style={styles.foodEmoji}>{food.emoji}</Text>
            <Text style={styles.foodName}>{food.name}</Text>
            <Text style={styles.foodBoost}>+{food.hungerBoost}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </Animated.View>
  );
}

// ── Mini-game: Bath ──────────────────────────────────────────
function BathModal({ pet, onWash, onClose }: any) {
  const [scrubs, setScrubs] = useState(0);
  const [bubbles, setBubbles] = useState<{ id: number; x: number; y: number }[]>([]);
  const SCRUBS_NEEDED = 5;
  const progress = Math.min(100, (scrubs / SCRUBS_NEEDED) * 100);
  const completed = useRef(false);

  useEffect(() => {
    safeSpeak(`Bath time! Rub the ${pet.name} to make bubbles!`);
  }, []);

  const handleScrub = () => {
    if (completed.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newScrubs = scrubs + 1;
    setScrubs(newScrubs);
    // Add bubble
    setBubbles(prev => [...prev, { id: Date.now(), x: Math.random() * 180 + 20, y: Math.random() * 80 + 20 }]);
    safeSpeak('Splash!', 1.0, 1.3);
    if (newScrubs >= SCRUBS_NEEDED) {
      completed.current = true;
      setTimeout(() => {
        safeSpeak(pet.sounds.clean);
        onWash();
        onClose();
      }, 1200);
    }
  };

  return (
    <View style={styles.miniGameContainer}>
      <TouchableOpacity style={styles.miniGameClose} onPress={onClose}>
        <Text style={styles.miniGameCloseText}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.miniGameTitle}>🛁 Bath Time!</Text>
      <Text style={styles.miniGameSub}>Tap {pet.name} to scrub scrub scrub!</Text>

      <View style={styles.bathTub}>
        {/* Bubbles */}
        {bubbles.map(b => (
          <Animated.Text key={b.id} style={[styles.bubble, { left: b.x, top: b.y }]}>💦</Animated.Text>
        ))}
        {/* Pet in tub */}
        <TouchableOpacity onPress={handleScrub} activeOpacity={0.8} style={styles.bathPet}>
          <Text style={styles.miniPetEmoji}>{scrubs >= SCRUBS_NEEDED ? pet.cleanEmoji : pet.emoji}</Text>
          {scrubs >= SCRUBS_NEEDED && (
            <Text style={styles.cleanText}>✨ Squeaky clean!</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.bathProgress}>
        <View style={styles.bathProgressBar}>
          <View style={[styles.bathProgressFill, { width: `${progress}%` }]} />
        </View>
        <Text style={styles.bathProgressText}>{scrubs}/{SCRUBS_NEEDED} scrubs</Text>
      </View>
    </View>
  );
}

// ── Mini-game: Play ──────────────────────────────────────────
function PlayModal({ pet, onPlay, onClose }: any) {
  const [caught, setCaught] = useState(false);
  const [toyIndex, setToyIndex] = useState(0);
  const toy = TOYS[toyIndex];
  const toyX = useRef(new Animated.Value(W * 0.2)).current;
  const toyY = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    safeSpeak(pet.sounds.play);
    startToyMove();
    return () => { loopRef.current?.stop(); };
  }, [toyIndex]);

  function startToyMove() {
    loopRef.current?.stop();
    setCaught(false);
    toyX.setValue(W * 0.15);
    toyY.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(toyX, { toValue: W * 0.6, duration: 1200, useNativeDriver: true }),
        Animated.timing(toyX, { toValue: W * 0.15, duration: 1200, useNativeDriver: true }),
      ])
    );
    loopRef.current = loop;
    loop.start();
  }

  const handleCatch = () => {
    setCaught(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    safeSpeak(`${pet.sounds.happy}`, 0.85, 1.25);
    setTimeout(() => {
      onPlay(toy.happyBoost);
      if (toyIndex < TOYS.length - 1) {
        setToyIndex(n => n + 1);
      } else {
        onClose();
      }
    }, 1200);
  };

  return (
    <View style={styles.miniGameContainer}>
      <TouchableOpacity style={styles.miniGameClose} onPress={onClose}>
        <Text style={styles.miniGameCloseText}>✕</Text>
      </TouchableOpacity>
      <Text style={styles.miniGameTitle}>🎾 Play Time!</Text>
      <Text style={styles.miniGameSub}>Tap the toy to play!</Text>

      <View style={styles.playArea}>
        <Text style={styles.miniPetEmoji}>{pet.happyEmoji}</Text>
        {!caught ? (
          <Animated.View style={[styles.flyingToy, { transform: [{ translateX: toyX }, { translateY: toyY }] }]}>
            <TouchableOpacity onPress={handleCatch} activeOpacity={0.8}>
              <Text style={styles.toyEmoji}>{toy.emoji}</Text>
            </TouchableOpacity>
          </Animated.View>
        ) : (
          <Text style={styles.caughtText}>🎉 Caught it! +{toy.happyBoost} happy</Text>
        )}
      </View>

      <Text style={styles.playHint}>Round {toyIndex + 1} / {TOYS.length}</Text>
    </View>
  );
}

// ── Mini-game: Sleep ─────────────────────────────────────────
function SleepModal({ pet, onSleep, onClose }: any) {
  const [step, setStep]           = useState<'light'|'blanket'|'lullaby'|'done'>('light');
  const [blanketPicked, setBlanket] = useState<string | null>(null);
  const dimAnim = useRef(new Animated.Value(1)).current;

  const dimScreen = () => {
    Animated.timing(dimAnim, { toValue: 0.1, duration: 1500, useNativeDriver: false }).start();
  };

  const handleLight = () => {
    safeSpeak('Click! Lights off. Time to choose a blanket.');
    setStep('blanket');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleBlanket = (b: typeof BLANKETS[0]) => {
    setBlanket(b.id);
    safeSpeak(`The ${b.name}! So cozy!`);
    setStep('lullaby');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleLullaby = () => {
    safeSpeak(pet.sounds.sleepy, 0.7, 0.88);
    dimScreen();
    setStep('done');
    setTimeout(() => { onSleep(); onClose(); }, 3000);
  };

  return (
    <Animated.View style={[styles.miniGameContainer, styles.sleepContainer, { backgroundColor: dimAnim.interpolate({ inputRange: [0.1, 1], outputRange: ['#0a0a1a', '#FFF0DC'] }) }]}>
      <TouchableOpacity style={styles.miniGameClose} onPress={onClose}>
        <Text style={[styles.miniGameCloseText, { color: step === 'done' ? '#fff' : '#3D3530' }]}>✕</Text>
      </TouchableOpacity>
      <Text style={[styles.miniGameTitle, step === 'done' && { color: '#fff' }]}>😴 Bedtime!</Text>

      {step === 'light' && (
        <View style={styles.sleepStep}>
          <Text style={styles.sleepStepEmoji}>💡</Text>
          <Text style={styles.sleepStepText}>Turn off the light</Text>
          <TouchableOpacity style={styles.sleepBtn} onPress={handleLight} activeOpacity={0.85}>
            <Text style={styles.sleepBtnText}>Click off 💡</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'blanket' && (
        <View style={styles.sleepStep}>
          <Text style={styles.sleepStepText}>Pick a cosy blanket 🛏️</Text>
          <View style={styles.blanketsRow}>
            {BLANKETS.map(b => (
              <TouchableOpacity
                key={b.id}
                style={[styles.blanketBtn, { backgroundColor: b.color }]}
                onPress={() => handleBlanket(b)}
                activeOpacity={0.85}
              >
                <Text style={styles.blanketEmoji}>{b.emoji}</Text>
                <Text style={styles.blanketName}>{b.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {step === 'lullaby' && (
        <View style={styles.sleepStep}>
          <Text style={styles.sleepStepEmoji}>{blanketPicked ? BLANKETS.find(b => b.id === blanketPicked)?.emoji : '🌙'}</Text>
          <Text style={styles.sleepStepText}>Play a lullaby 🎵</Text>
          <TouchableOpacity style={[styles.sleepBtn, { backgroundColor: '#1a2a6c' }]} onPress={handleLullaby} activeOpacity={0.85}>
            <Text style={[styles.sleepBtnText, { color: '#fff' }]}>🌙 Play lullaby</Text>
          </TouchableOpacity>
        </View>
      )}

      {step === 'done' && (
        <View style={styles.sleepStep}>
          <Text style={{ fontSize: 80 }}>{pet.sleepEmoji}</Text>
          <Text style={[styles.sleepStepText, { color: '#fff' }]}>Sweet dreams, {pet.name}... 💤</Text>
          <Text style={[styles.sleepHint, { color: 'rgba(255,255,255,0.6)' }]}>Closing in a moment...</Text>
        </View>
      )}
    </Animated.View>
  );
}

// ── Main Room Screen ─────────────────────────────────────────
function PetRoomScreen() {
  const store      = useHappyPetStore();
  const pet        = PETS.find(p => p.id === store.petId) ?? PETS[0];
  const mood       = getMood(store.needs);

  const [activeModal, setActiveModal] = useState<'feed'|'bath'|'play'|'sleep'|null>(null);
  const [showStars,   setShowStars]   = useState(false);
  const [starsCount,  setStarsCount]  = useState(0);
  const [sleeping,    setSleeping]    = useState(false);
  const greetScale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (store.showGreeting) {
      safeSpeak(store.greetingText, 0.85, 1.1);
      Animated.spring(greetScale, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();
    }
  }, [store.showGreeting]);

  const handleTapPet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeSpeak(mood >= 70 ? pet.sounds.happy : pet.sounds.greet, 0.85, 1.2);
  };

  const handleAction = (action: 'feed'|'bath'|'play'|'sleep') => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setActiveModal(action);
  };

  const earnStars = (count: number) => {
    setStarsCount(count);
    setShowStars(true);
    setTimeout(() => setShowStars(false), 1500);
  };

  const todayDone = store.todayActions;

  return (
    <SafeAreaView style={styles.roomSafe}>
      {/* Header */}
      <View style={[styles.roomHeader, { backgroundColor: pet.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backTextWhite}>←</Text>
        </TouchableOpacity>
        <View style={styles.roomHeaderCenter}>
          <Text style={styles.roomPetName}>{store.petName}</Text>
          <Text style={styles.roomMoodLabel}>{getMoodEmoji(mood)} {getMoodLabel(mood)}</Text>
        </View>
        <View style={styles.roomStarsBadge}>
          <Text style={styles.roomStarsText}>⭐ {store.stars}</Text>
        </View>
      </View>

      {/* Pet room + character */}
      <View style={styles.roomArea}>
        <PetRoom
          unlockedItems={store.unlockedItems}
          sleeping={sleeping}
          bgColor={pet.colorLight}
        />
        <View style={styles.petCenter}>
          <PetCharacter
            pet={pet}
            name={store.petName}
            needs={store.needs}
            sleeping={sleeping}
            onTap={handleTapPet}
          />
        </View>
      </View>

      {/* Need bars */}
      <View style={styles.needsPanel}>
        {(['hunger','cleanliness','happiness','energy'] as const).map(key => (
          <NeedBar key={key} needKey={key} value={store.needs[key]} />
        ))}
      </View>

      {/* Action buttons */}
      <View style={styles.actionsRow}>
        <ActionButton
          emoji="🍖" label="Feed" color="#FF9F43"
          onPress={() => handleAction('feed')}
          badge={todayDone.includes('feed') ? '✓' : undefined}
        />
        <ActionButton
          emoji="🛁" label="Bath" color="#4D96FF"
          onPress={() => handleAction('bath')}
          badge={todayDone.includes('wash') ? '✓' : undefined}
        />
        <ActionButton
          emoji="🎾" label="Play" color="#6BCB77"
          onPress={() => handleAction('play')}
          badge={todayDone.includes('play') ? '✓' : undefined}
        />
        <ActionButton
          emoji="😴" label="Sleep" color="#C77DFF"
          onPress={() => handleAction('sleep')}
          badge={todayDone.includes('sleep') ? '✓' : undefined}
          disabled={sleeping}
        />
      </View>

      {/* Daily checklist */}
      <View style={styles.checklistRow}>
        {[
          { key: 'feed', emoji: '🍖' },
          { key: 'wash', emoji: '🛁' },
          { key: 'play', emoji: '🎾' },
          { key: 'sleep',emoji: '😴' },
        ].map(({ key, emoji }) => (
          <View key={key} style={[styles.checkDot, todayDone.includes(key) && styles.checkDotDone]}>
            <Text style={styles.checkDotEmoji}>{emoji}</Text>
          </View>
        ))}
        <Text style={styles.streakText}>🔥 {store.streak} day streak</Text>
      </View>

      {/* Flying stars */}
      <RewardStars count={starsCount} visible={showStars} />

      {/* Greeting overlay */}
      {store.showGreeting && (
        <View style={styles.greetOverlay}>
          <Animated.View style={[styles.greetBubble, { backgroundColor: pet.colorLight, transform: [{ scale: greetScale }] }]}>
            <Text style={{ fontSize: 56 }}>{pet.emoji}</Text>
            <Text style={styles.greetText}>{store.greetingText}</Text>
            <TouchableOpacity
              style={[styles.greetBtn, { backgroundColor: pet.color }]}
              onPress={store.dismissGreeting}
              activeOpacity={0.85}
            >
              <Text style={styles.greetBtnText}>Hello {store.petName}! 💕</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}

      {/* Mini-game modals */}
      <Modal visible={activeModal === 'feed'} transparent animationType="slide">
        <View style={styles.modalBg}>
          <FeedModal
            pet={pet}
            onFeed={(id: string, boost: number) => {
              store.feedPet(id, boost);
              earnStars(2);
            }}
            onClose={() => setActiveModal(null)}
          />
        </View>
      </Modal>

      <Modal visible={activeModal === 'bath'} transparent animationType="slide">
        <View style={styles.modalBg}>
          <BathModal
            pet={pet}
            onWash={() => { store.washPet(); earnStars(3); }}
            onClose={() => setActiveModal(null)}
          />
        </View>
      </Modal>

      <Modal visible={activeModal === 'play'} transparent animationType="slide">
        <View style={styles.modalBg}>
          <PlayModal
            pet={pet}
            onPlay={(boost: number) => { store.playWithPet(boost); earnStars(2); }}
            onClose={() => setActiveModal(null)}
          />
        </View>
      </Modal>

      <Modal visible={activeModal === 'sleep'} transparent animationType="fade">
        <View style={styles.modalBg}>
          <SleepModal
            pet={pet}
            onSleep={() => { store.sleepPet(); setSleeping(true); earnStars(2); setTimeout(() => setSleeping(false), 8000); }}
            onClose={() => setActiveModal(null)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// ── Entry point ───────────────────────────────────────────────
export default function HappyPetHomeScreen() {
  const store = useHappyPetStore();

  useEffect(() => {
    store.loadSavedState();
  }, []);

  switch (store.currentScreen) {
    case 'select': return <PetSelectScreen />;
    case 'name':   return <PetNamingScreen />;
    default:       return <PetRoomScreen />;
  }
}

// ── Styles ─────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Room
  roomSafe:         { flex: 1, backgroundColor: '#FFF9F0' },
  roomHeader:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backTextWhite:    { fontSize: 22, color: '#fff', fontWeight: '900' },
  roomHeaderCenter: { flex: 1, alignItems: 'center' },
  roomPetName:      { fontSize: 18, fontWeight: '900', color: '#fff' },
  roomMoodLabel:    { fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },
  roomStarsBadge:   { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  roomStarsText:    { fontSize: 14, fontWeight: '900', color: '#fff' },
  roomArea:         { flex: 1, position: 'relative' },
  petCenter:        { position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' },
  needsPanel:       { backgroundColor: 'rgba(255,255,255,0.95)', paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  actionsRow:       { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F5EDD8' },
  checklistRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff' },
  checkDot:         { width: 32, height: 32, borderRadius: 16, backgroundColor: '#F5EDD8', alignItems: 'center', justifyContent: 'center' },
  checkDotDone:     { backgroundColor: '#6BCB77' },
  checkDotEmoji:    { fontSize: 16 },
  streakText:       { marginLeft: 'auto', fontSize: 12, fontWeight: '800', color: '#FF9F43' },
  // Greeting
  greetOverlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', zIndex: 100 },
  greetBubble:      { borderRadius: 28, padding: 28, alignItems: 'center', gap: 14, width: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10 },
  greetText:        { fontSize: 18, fontWeight: '800', color: '#3D3530', textAlign: 'center', lineHeight: 26 },
  greetBtn:         { borderRadius: 99, paddingHorizontal: 28, paddingVertical: 14, width: '100%', alignItems: 'center' },
  greetBtnText:     { color: '#fff', fontSize: 16, fontWeight: '900' },
  // Modal
  modalBg:          { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  miniGameContainer:{ backgroundColor: '#FFF9F0', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, gap: 16, paddingBottom: 40, position: 'relative', maxHeight: H * 0.82 },
  miniGameClose:    { position: 'absolute', top: 16, right: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5EDD8', borderRadius: 16, zIndex: 10 },
  miniGameCloseText:{ fontSize: 16, fontWeight: '900', color: '#8B8178' },
  miniGameTitle:    { fontSize: 24, fontWeight: '900', color: '#3D3530', textAlign: 'center' },
  miniGameSub:      { fontSize: 14, color: '#8B8178', fontWeight: '700', textAlign: 'center' },
  miniPetWrap:      { alignItems: 'center', position: 'relative' },
  miniPetEmoji:     { fontSize: 80 },
  miniReaction:     { fontSize: 18, fontWeight: '800', color: '#6BCB77' },
  // Feed
  foodGrid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  foodBtn:          { backgroundColor: '#fff', borderRadius: 16, padding: 12, alignItems: 'center', gap: 4, width: 80, borderWidth: 2, borderColor: '#F5EDD8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  foodBtnSelected:  { backgroundColor: '#E5F7E7', borderColor: '#6BCB77' },
  foodEmoji:        { fontSize: 30 },
  foodName:         { fontSize: 10, fontWeight: '800', color: '#3D3530' },
  foodBoost:        { fontSize: 9, fontWeight: '700', color: '#6BCB77' },
  // Bath
  bathTub:          { backgroundColor: '#E5EFFE', borderRadius: 20, height: 150, position: 'relative', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  bubble:           { position: 'absolute', fontSize: 18 },
  bathPet:          { alignItems: 'center' },
  cleanText:        { fontSize: 16, fontWeight: '900', color: '#4D96FF' },
  bathProgress:     { gap: 6 },
  bathProgressBar:  { height: 12, backgroundColor: '#E0E0E0', borderRadius: 6, overflow: 'hidden' },
  bathProgressFill: { height: '100%', backgroundColor: '#4D96FF', borderRadius: 6 },
  bathProgressText: { fontSize: 12, fontWeight: '800', color: '#8B8178', textAlign: 'center' },
  // Play
  playArea:         { height: 160, position: 'relative', alignItems: 'center', justifyContent: 'center', backgroundColor: '#E5F7E7', borderRadius: 20, overflow: 'hidden' },
  flyingToy:        { position: 'absolute', top: 50 },
  toyEmoji:         { fontSize: 44 },
  caughtText:       { fontSize: 16, fontWeight: '900', color: '#6BCB77' },
  playHint:         { textAlign: 'center', fontSize: 12, color: '#8B8178', fontWeight: '700' },
  // Sleep
  sleepContainer:   { borderTopLeftRadius: 28, borderTopRightRadius: 28 },
  sleepStep:        { alignItems: 'center', gap: 14 },
  sleepStepEmoji:   { fontSize: 60 },
  sleepStepText:    { fontSize: 18, fontWeight: '800', color: '#3D3530', textAlign: 'center' },
  sleepBtn:         { backgroundColor: '#FFD93D', borderRadius: 99, paddingHorizontal: 32, paddingVertical: 14 },
  sleepBtnText:     { fontSize: 16, fontWeight: '900', color: '#3D3530' },
  blanketsRow:      { flexDirection: 'row', gap: 12 },
  blanketBtn:       { borderRadius: 16, padding: 14, alignItems: 'center', gap: 4, width: 90 },
  blanketEmoji:     { fontSize: 32 },
  blanketName:      { fontSize: 10, fontWeight: '800', color: '#3D3530', textAlign: 'center' },
  sleepHint:        { fontSize: 12, fontWeight: '700' },
});
