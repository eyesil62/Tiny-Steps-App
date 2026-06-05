// ============================================================
// Milo's Busy Day — Premium Game Screen
// Routine + discovery mini-world for ages 3–6
// Original TinySteps game — Toca Life meets Daniel Tiger
// ============================================================
import React, {
  useState, useRef, useEffect, useCallback, useMemo,
} from 'react';
import {
  View, Text, TouchableOpacity, Animated, StyleSheet,
  Dimensions, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useMilosBusyDayStore } from './store/useMilosBusyDayStore';
import { ROOMS, RoomObject, AnimType } from './data/rooms';
import { MISSIONS, getDailyMission } from './data/missions';
import { UNLOCK_ITEMS } from './data/unlocks';

const { width: W, height: H } = Dimensions.get('window');

// ── Screen state type ─────────────────────────────────────
type ScreenState = 'home' | 'room' | 'complete' | 'shop' | 'stickers' | 'explore-select';

// ── Speech helper ─────────────────────────────────────────
function say(text: string, rate = 0.82, pitch = 1.12) {
  Speech.isSpeakingAsync()
    .then(speaking => {
      const go = () => {
        try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {}
      };
      if (speaking) { Speech.stop().then(go).catch(go); }
      else { setTimeout(go, 120); }
    })
    .catch(() => {
      setTimeout(() => {
        try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {}
      }, 140);
    });
}

// ── Get time-aware greeting ───────────────────────────────
function getMiloGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning! Ready for today's adventure?";
  if (hour < 18) return "Good afternoon! Let's have some fun!";
  return "Good evening! Time for the bedtime routine?";
}

// ── Object animation state ────────────────────────────────
interface ObjAnim {
  y:        Animated.Value;
  x:        Animated.Value;
  scale:    Animated.Value;
  rotate:   Animated.Value;
  reaction: string | null;
  toggleOn: boolean;
  done:     boolean;
}

function makeAnim(): ObjAnim {
  return {
    y:        new Animated.Value(0),
    x:        new Animated.Value(0),
    scale:    new Animated.Value(1),
    rotate:   new Animated.Value(0),
    reaction: null,
    toggleOn: false,
    done:     false,
  };
}

function triggerAnim(type: AnimType, a: ObjAnim) {
  switch (type) {
    case 'bounce':
      Animated.sequence([
        Animated.spring(a.y, { toValue: -22, tension: 200, friction: 4, useNativeDriver: true }),
        Animated.spring(a.y, { toValue: 0,   tension: 120, friction: 6, useNativeDriver: true }),
      ]).start();
      break;
    case 'wiggle':
      Animated.sequence([
        Animated.timing(a.x, { toValue:  10, duration: 60, useNativeDriver: true }),
        Animated.timing(a.x, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(a.x, { toValue:   6, duration: 60, useNativeDriver: true }),
        Animated.timing(a.x, { toValue:  -6, duration: 60, useNativeDriver: true }),
        Animated.timing(a.x, { toValue:   0, duration: 60, useNativeDriver: true }),
      ]).start();
      break;
    case 'pulse':
      Animated.sequence([
        Animated.timing(a.scale, { toValue: 1.35, duration: 140, useNativeDriver: true }),
        Animated.spring(a.scale,  { toValue: 1,    tension: 100, friction: 4, useNativeDriver: true }),
      ]).start();
      break;
    case 'spin':
      Animated.timing(a.rotate, { toValue: 1, duration: 500, useNativeDriver: true })
        .start(() => a.rotate.setValue(0));
      break;
    case 'pop':
      Animated.sequence([
        Animated.timing(a.scale, { toValue: 1.45, duration: 100, useNativeDriver: true }),
        Animated.timing(a.scale, { toValue: 0.90, duration: 80,  useNativeDriver: true }),
        Animated.spring(a.scale, { toValue: 1,    tension: 100, friction: 4, useNativeDriver: true }),
      ]).start();
      break;
    case 'slide':
      Animated.sequence([
        Animated.timing(a.x, { toValue: 20, duration: 180, useNativeDriver: true }),
        Animated.spring(a.x, { toValue: 0,  tension: 80,  friction: 6, useNativeDriver: true }),
      ]).start();
      break;
  }
}

// ─────────────────────────────────────────────────────────
// COMPONENT: Floating Milo Guide
// ─────────────────────────────────────────────────────────
function MiloGuide({ speech, visible }: { speech: string; visible: boolean }) {
  const breatheY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breatheY, { toValue: -6, duration: 1500, useNativeDriver: true }),
        Animated.timing(breatheY, { toValue:  0, duration: 1500, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [breatheY]);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [visible, fadeAnim]);

  return (
    <Animated.View style={[styles.miloWrap, { opacity: fadeAnim }]}>
      <Animated.Text style={[styles.miloEmoji, { transform: [{ translateY: breatheY }] }]}>
        🦉
      </Animated.Text>
      {speech.length > 0 && (
        <View style={styles.miloBubble}>
          <Text style={styles.miloSpeech}>{speech}</Text>
        </View>
      )}
    </Animated.View>
  );
}

// ─────────────────────────────────────────────────────────
// COMPONENT: Confetti (10 floating pieces)
// ─────────────────────────────────────────────────────────
const CONFETTI_EMOJIS = ['🎊', '🎉', '✨', '⭐', '🌟', '🎈', '🎀', '💫', '🌈', '🦄'];

interface ConfettiPiece {
  anim:    Animated.Value;
  opacity: Animated.Value;
  x:       number;
  emoji:   string;
}

function Confetti() {
  const pieces = useRef<ConfettiPiece[]>(
    Array.from({ length: 10 }, (_, i) => ({
      anim:    new Animated.Value(-60),
      opacity: new Animated.Value(1),
      x:       Math.random() * 90 + 5,
      emoji:   CONFETTI_EMOJIS[i % CONFETTI_EMOJIS.length],
    })),
  ).current;

  useEffect(() => {
    Animated.stagger(
      80,
      pieces.map(p =>
        Animated.sequence([
          Animated.parallel([
            Animated.timing(p.anim,    { toValue: H + 60,  duration: 2200, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0,        duration: 2200, useNativeDriver: true }),
          ]),
        ]),
      ),
    ).start();
  }, []);

  return (
    <>
      {pieces.map((p, i) => (
        <Animated.Text
          key={i}
          style={[
            styles.confettiPiece,
            { left: `${p.x}%` as any, transform: [{ translateY: p.anim }], opacity: p.opacity },
          ]}
        >
          {p.emoji}
        </Animated.Text>
      ))}
    </>
  );
}

// ─────────────────────────────────────────────────────────
// COMPONENT: Room Scene
// ─────────────────────────────────────────────────────────
interface RoomSceneProps {
  roomId:          string;
  missionObjectIds: string[]; // obj.id values that are mission targets
  exploreMode:     boolean;
  onComplete:      () => void;
  missionStepSpeech?: string;
  missionColor:    string;
}

function RoomScene({
  roomId,
  missionObjectIds,
  exploreMode,
  onComplete,
  missionStepSpeech,
  missionColor,
}: RoomSceneProps) {
  const room      = useMemo(() => ROOMS.find(r => r.id === roomId) ?? ROOMS[0], [roomId]);
  const store     = useMilosBusyDayStore();
  const animMap   = useRef<Map<string, ObjAnim>>(new Map());
  const [tick, setTick]             = useState(0);
  const [miloSpeech, setMiloSpeech] = useState('');
  const [stepsDone, setStepsDone]   = useState<string[]>([]);
  const [starFeedback, setStarFeedback] = useState<string | null>(null);
  const lastActionRef = useRef(Date.now());

  // Idle reminder in mission mode
  useEffect(() => {
    if (exploreMode) return;
    const interval = setInterval(() => {
      const idle = Date.now() - lastActionRef.current;
      const remaining = missionObjectIds.filter(id => !stepsDone.includes(id));
      if (idle > 22000 && remaining.length > 0) {
        const reminders = [
          `Keep going! ${remaining.length} more thing${remaining.length > 1 ? 's' : ''} to do!`,
          "Milo needs your help! Look for the red dots!",
          "You can do it! Tap the glowing objects!",
        ];
        const r = reminders[Math.floor(Math.random() * reminders.length)];
        setMiloSpeech(r);
        say(r, 0.82, 1.05);
        lastActionRef.current = Date.now();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [stepsDone, missionObjectIds, exploreMode]);

  // Initial speech
  useEffect(() => {
    const speech = exploreMode
      ? `Welcome to the ${room.name}! Tap everything to explore!`
      : (missionStepSpeech ?? '');
    if (speech) {
      setTimeout(() => {
        setMiloSpeech(speech);
        say(speech, 0.82, 1.1);
      }, 500);
    }
  }, [roomId, exploreMode]);

  function getAnim(id: string): ObjAnim {
    if (!animMap.current.has(id)) animMap.current.set(id, makeAnim());
    return animMap.current.get(id)!;
  }

  const handleTap = useCallback((obj: RoomObject) => {
    const anim = getAnim(obj.id);
    lastActionRef.current = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Toggle logic
    let speech = obj.speech;
    if (obj.toggle) {
      anim.toggleOn = !anim.toggleOn;
      speech = anim.toggleOn ? obj.toggle.speechOn : obj.toggle.speechOff;
    }

    say(speech);
    triggerAnim(obj.animType, anim);
    setMiloSpeech(speech);

    anim.reaction = obj.reaction;
    setTick(n => n + 1);
    setTimeout(() => { anim.reaction = null; setTick(n => n + 1); }, 1300);

    // Helper star bonus (only once per object)
    if (obj.isHelper && obj.helperStars > 0 && !store.interactedObjects.includes(obj.id)) {
      store.addStars('helper', obj.helperStars);
      setStarFeedback(`+${obj.helperStars} ⭐`);
      setTimeout(() => setStarFeedback(null), 1100);
    }

    store.tapObject(obj.id, obj.isHelper ? obj.helperStars : 0);

    // Mission item completion (non-explore mode only)
    if (!exploreMode && missionObjectIds.includes(obj.id) && !stepsDone.includes(obj.id)) {
      anim.done = true;
      const newDone = [...stepsDone, obj.id];
      setStepsDone(newDone);
      store.addStars('routine', 3);
      setStarFeedback(`+3 ⭐`);
      setTimeout(() => setStarFeedback(null), 1100);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Check completion
      if (newDone.filter(id => missionObjectIds.includes(id)).length >= missionObjectIds.length) {
        setTimeout(() => {
          say(room.completionSpeech, 0.85, 1.1);
          setMiloSpeech(room.completionSpeech);
          setTimeout(() => onComplete(), 2200);
        }, 500);
      }
    }
  }, [stepsDone, missionObjectIds, exploreMode, store, room, onComplete]);

  const missionTargets = exploreMode ? [] : missionObjectIds;
  const doneMission    = stepsDone.filter(id => missionTargets.includes(id));
  const progress       = missionTargets.length > 0
    ? (doneMission.length / missionTargets.length) * 100
    : 0;

  return (
    <View style={[styles.roomScene, { backgroundColor: room.bgColor }]}>
      {/* Wall tint */}
      <View style={[styles.roomWall, { backgroundColor: room.wallColor }]} />

      {/* Objects */}
      {room.objects.map(obj => {
        const anim      = getAnim(obj.id);
        const rotateStr = anim.rotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
        const display   = obj.toggle ? (anim.toggleOn ? obj.toggle.on : obj.toggle.off) : obj.emoji;
        const isMTarget = !exploreMode && missionTargets.includes(obj.id);
        const isDone    = anim.done;

        return (
          <TouchableOpacity
            key={obj.id}
            onPress={() => handleTap(obj)}
            activeOpacity={0.78}
            style={[
              styles.roomObj,
              { left: `${obj.x}%` as any, top: `${obj.y}%` as any, zIndex: isMTarget ? 20 : 10 },
            ]}
          >
            <Animated.View style={{
              transform: [
                { translateY: anim.y },
                { translateX: anim.x },
                { scale: anim.scale },
                { rotate: rotateStr },
              ],
            }}>
              <Text style={[styles.objEmoji, { fontSize: obj.size }, isDone && styles.objDone]}>
                {display}
              </Text>
              {/* Mission target indicator */}
              {isMTarget && !isDone && (
                <View style={[styles.missionDot, { backgroundColor: missionColor }]} />
              )}
              {/* Completion checkmark */}
              {isDone && <Text style={styles.doneCheck}>✓</Text>}
            </Animated.View>
            {/* Reaction bubble */}
            {anim.reaction && (
              <View style={styles.reactionBubble}>
                <Text style={styles.reactionText}>{anim.reaction}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Floor strip */}
      <View style={[styles.floor, { backgroundColor: room.floorColor }]} />

      {/* Progress bar (mission mode only) */}
      {!exploreMode && missionTargets.length > 0 && (
        <View style={styles.roomProgressTrack}>
          <View style={[styles.roomProgressFill, { width: `${progress}%` as any, backgroundColor: missionColor }]} />
        </View>
      )}

      {/* Star feedback */}
      {starFeedback && (
        <View style={styles.starFeedback}>
          <Text style={styles.starFeedbackText}>{starFeedback}</Text>
        </View>
      )}

      {/* Milo guide */}
      <MiloGuide speech={miloSpeech} visible={miloSpeech.length > 0} />
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN: HOME
// ─────────────────────────────────────────────────────────
interface HomeScreenProps {
  onStartMission:  (id: string) => void;
  onExplore:       () => void;
  onShop:          () => void;
  onStickers:      () => void;
}

function HomeScreen({ onStartMission, onExplore, onShop, onStickers }: HomeScreenProps) {
  const store        = useMilosBusyDayStore();
  const dailyMission = getDailyMission();
  const greeting     = getMiloGreeting();

  const floatY = useRef(new Animated.Value(0)).current;
  const chestScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, { toValue: -10, duration: 1600, useNativeDriver: true }),
        Animated.timing(floatY, { toValue:   0, duration: 1600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [floatY]);

  // Glowing chest pulse
  useEffect(() => {
    const today = new Date().toDateString();
    if (store.lastChestDate !== today) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(chestScale, { toValue: 1.12, duration: 700, useNativeDriver: true }),
          Animated.timing(chestScale, { toValue: 1.00, duration: 700, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [store.lastChestDate, chestScale]);

  const today         = new Date().toDateString();
  const chestAvailable = store.lastChestDate !== today;

  const handleChestClaim = () => {
    if (!chestAvailable) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    store.claimDailyChest();
    say("Hooray! You found 8 stars in the daily chest! Well done!", 0.84, 1.1);
  };

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={styles.homeScroll}
      showsVerticalScrollIndicator={false}
    >
      {/* Title hero */}
      <View style={styles.homeHero}>
        <Animated.Text style={[styles.miloHeroEmoji, { transform: [{ translateY: floatY }] }]}>
          🦉
        </Animated.Text>
        <Text style={styles.homeTitle}>Milo's Busy Day</Text>
        <View style={styles.miloBubbleHome}>
          <Text style={styles.miloBubbleHomeText}>{greeting}</Text>
        </View>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statChipEmoji}>⭐</Text>
          <Text style={styles.statChipValue}>{store.totalStars}</Text>
          <Text style={styles.statChipLabel}>Stars</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipEmoji}>🔥</Text>
          <Text style={styles.statChipValue}>{store.streak}</Text>
          <Text style={styles.statChipLabel}>Streak</Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statChipEmoji}>🏅</Text>
          <Text style={styles.statChipValue}>{store.completedMissions.length}</Text>
          <Text style={styles.statChipLabel}>Badges</Text>
        </View>
      </View>

      {/* Daily chest */}
      {chestAvailable && (
        <TouchableOpacity onPress={handleChestClaim} activeOpacity={0.85}>
          <Animated.View style={[styles.chestCard, { transform: [{ scale: chestScale }] }]}>
            <Text style={styles.chestEmoji}>🎁</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.chestTitle}>Daily Chest!</Text>
              <Text style={styles.chestSub}>Tap to claim your 8 free stars!</Text>
            </View>
            <Text style={styles.chestArrow}>→</Text>
          </Animated.View>
        </TouchableOpacity>
      )}

      {/* Today's Adventure */}
      <Text style={styles.sectionLabel}>TODAY'S ADVENTURE</Text>
      <TouchableOpacity
        style={[styles.featuredMissionCard, { backgroundColor: dailyMission.color }]}
        onPress={() => onStartMission(dailyMission.id)}
        activeOpacity={0.9}
      >
        <Text style={styles.featuredMissionEmoji}>{dailyMission.emoji}</Text>
        <Text style={styles.featuredMissionTitle}>{dailyMission.title}</Text>
        <Text style={styles.featuredMissionSub}>{dailyMission.steps.length} steps • {dailyMission.description}</Text>
        <View style={styles.featuredMissionBtn}>
          <Text style={styles.featuredMissionBtnText}>START ADVENTURE 🚀</Text>
        </View>
      </TouchableOpacity>

      {/* All Adventures */}
      <Text style={styles.sectionLabel}>ALL ADVENTURES</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.missionCardsRow}
      >
        {MISSIONS.map(m => {
          const locked    = m.unlockAt > store.totalStars;
          const completed = store.completedMissions.includes(m.id);
          return (
            <TouchableOpacity
              key={m.id}
              style={[
                styles.missionCard,
                { borderColor: locked ? '#E0E0E0' : m.color },
                locked && styles.missionCardLocked,
              ]}
              onPress={() => { if (!locked) onStartMission(m.id); }}
              activeOpacity={locked ? 1 : 0.85}
            >
              <Text style={[styles.missionCardEmoji, locked && styles.lockedEmoji]}>
                {locked ? '🔒' : m.emoji}
              </Text>
              <Text style={[styles.missionCardTitle, locked && styles.lockedText]}>
                {m.title}
              </Text>
              {completed && <Text style={styles.missionCardBadge}>{m.badge}</Text>}
              {locked && (
                <Text style={styles.missionCardLockText}>{m.unlockAt}⭐ needed</Text>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom action row */}
      <View style={styles.bottomActionRow}>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#4D96FF' }]} onPress={onExplore} activeOpacity={0.88}>
          <Text style={styles.actionCardEmoji}>🗺️</Text>
          <Text style={styles.actionCardLabel}>Free Explore</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#FF9F43' }]} onPress={onShop} activeOpacity={0.88}>
          <Text style={styles.actionCardEmoji}>⭐</Text>
          <Text style={styles.actionCardLabel}>Star Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionCard, { backgroundColor: '#C77DFF' }]} onPress={onStickers} activeOpacity={0.88}>
          <Text style={styles.actionCardEmoji}>📒</Text>
          <Text style={styles.actionCardLabel}>Stickers</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN: COMPLETE
// ─────────────────────────────────────────────────────────
interface CompleteScreenProps {
  missionId:    string;
  starsEarned:  number;
  onPlayAgain:  () => void;
  onTryAnother: () => void;
  onHome:       () => void;
}

function CompleteScreen({
  missionId, starsEarned, onPlayAgain, onTryAnother, onHome,
}: CompleteScreenProps) {
  const store    = useMilosBusyDayStore();
  const mission  = MISSIONS.find(m => m.id === missionId) ?? MISSIONS[0];
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const isFirstComplete = !store.completedMissions.includes(missionId);

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 55, friction: 7, useNativeDriver: true }).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const speech = isFirstComplete
      ? `Incredible! You earned the ${mission.title} badge! You are a superstar!`
      : `Amazing job finishing ${mission.title}! Milo is so proud of you!`;
    setTimeout(() => say(speech, 0.85, 1.1), 400);

    if (isFirstComplete) {
      store.addCompletedMission(missionId, mission.badge);
    }
  }, []);

  return (
    <View style={styles.completeScreen}>
      <Confetti />
      <Animated.View style={[styles.completeCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.completeOwl}>🦉</Text>
        <Text style={styles.completeMissionEmoji}>{mission.emoji}</Text>
        <Text style={styles.completeTitle}>Mission Complete!</Text>
        <Text style={styles.completeMissionName}>{mission.title}</Text>
        <Text style={styles.completeStars}>⭐ +{starsEarned} stars earned!</Text>

        {isFirstComplete && (
          <View style={styles.newBadgeRow}>
            <Text style={styles.newBadgeLabel}>🎊 New Badge Earned!</Text>
            <Text style={styles.newBadgeEmoji}>{mission.badge}</Text>
          </View>
        )}

        <View style={styles.completeButtons}>
          <TouchableOpacity style={[styles.completeBtn, { backgroundColor: mission.color }]} onPress={onPlayAgain} activeOpacity={0.88}>
            <Text style={styles.completeBtnText}>Play Again 🔄</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.completeBtn, { backgroundColor: '#6BCB77' }]} onPress={onTryAnother} activeOpacity={0.88}>
            <Text style={styles.completeBtnText}>Try Another</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onHome} style={styles.homeLink}>
            <Text style={styles.homeLinkText}>🏠 Home</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN: SHOP
// ─────────────────────────────────────────────────────────
function ShopScreen({ onBack }: { onBack: () => void }) {
  const store = useMilosBusyDayStore();

  const handleBuy = (id: string, cost: number) => {
    if (store.unlockedItems.includes(id)) return;
    if (store.totalStars < cost) {
      say("Not enough stars yet! Keep playing to earn more!", 0.84, 1.1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    store.spendStars(cost);
    store.unlockItem(id);
    say("Wonderful! You bought a new item! Enjoy!", 0.84, 1.1);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <View style={[styles.subHeader, { backgroundColor: '#FF9F43' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>⭐ Star Shop</Text>
        <View style={styles.subHeaderStars}>
          <Text style={styles.subHeaderStarsText}>⭐ {store.totalStars}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.shopGrid}>
        {UNLOCK_ITEMS.map(item => {
          const owned    = store.unlockedItems.includes(item.id);
          const canAfford = store.totalStars >= item.cost;
          return (
            <View key={item.id} style={[styles.shopCard, owned && styles.shopCardOwned]}>
              <Text style={styles.shopItemEmoji}>{item.emoji}</Text>
              <Text style={styles.shopItemName}>{item.name}</Text>
              <Text style={styles.shopItemCategory}>{item.category}</Text>
              {owned ? (
                <View style={styles.ownedBadge}>
                  <Text style={styles.ownedBadgeText}>✓ Owned</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[styles.buyBtn, !canAfford && styles.buyBtnDimmed]}
                  onPress={() => handleBuy(item.id, item.cost)}
                  activeOpacity={canAfford ? 0.85 : 1}
                >
                  <Text style={styles.buyBtnText}>⭐ {item.cost}</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN: STICKERS
// ─────────────────────────────────────────────────────────
function StickersScreen({ onBack }: { onBack: () => void }) {
  const store = useMilosBusyDayStore();

  return (
    <View style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <View style={[styles.subHeader, { backgroundColor: '#C77DFF' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>📒 My Sticker Book</Text>
        <View style={styles.subHeaderStars}>
          <Text style={styles.subHeaderStarsText}>🔥 {store.streak}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.stickersContent}>
        {/* Streak badge */}
        <View style={styles.streakBadge}>
          <Text style={styles.streakBadgeEmoji}>🔥</Text>
          <Text style={styles.streakBadgeText}>{store.streak} day streak!</Text>
        </View>

        <Text style={styles.stickersLabel}>Mission Badges</Text>
        <View style={styles.stickersGrid}>
          {MISSIONS.map(m => {
            const earned = store.earnedStickers.includes(m.badge);
            return (
              <View key={m.id} style={[styles.stickerSlot, earned && styles.stickerSlotEarned]}>
                <Text style={[styles.stickerEmoji, !earned && styles.stickerLocked]}>
                  {earned ? m.badge : '❔'}
                </Text>
                <Text style={[styles.stickerName, !earned && styles.stickerLockedText]}>
                  {earned ? m.title : `Complete\n${m.title}`}
                </Text>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// SCREEN: EXPLORE SELECT
// ─────────────────────────────────────────────────────────
function ExploreSelectScreen({
  onSelectRoom,
  onBack,
}: {
  onSelectRoom: (roomId: string) => void;
  onBack: () => void;
}) {
  return (
    <View style={{ flex: 1, backgroundColor: '#FFF9F0' }}>
      <View style={[styles.subHeader, { backgroundColor: '#4D96FF' }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.subHeaderTitle}>🗺️ Free Explore</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.exploreGrid}>
        <Text style={styles.exploreHint}>Tap any room to explore freely!</Text>
        {ROOMS.map(room => (
          <TouchableOpacity
            key={room.id}
            style={[styles.exploreRoomCard, { backgroundColor: room.bgColor, borderColor: room.wallColor }]}
            onPress={() => onSelectRoom(room.id)}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreRoomEmoji}>{room.emoji}</Text>
            <Text style={styles.exploreRoomName}>{room.name}</Text>
            <Text style={styles.exploreRoomObjects}>{room.objects.length} things to find!</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ─────────────────────────────────────────────────────────
// MAIN ENTRY POINT
// ─────────────────────────────────────────────────────────
export default function MilosBusyDayScreen() {
  const store = useMilosBusyDayStore();

  const [screen,       setScreen]       = useState<ScreenState>('home');
  const [missionId,    setMissionId]    = useState(getDailyMission().id);
  const [roomIndex,    setRoomIndex]    = useState(0);
  const [exploreRoom,  setExploreRoom]  = useState<string | null>(null);
  const [starsAtStart, setStarsAtStart] = useState(0);

  useEffect(() => { store.loadState(); }, []);

  const mission     = useMemo(() => MISSIONS.find(m => m.id === missionId) ?? MISSIONS[0], [missionId]);
  const currentStep = mission.steps[roomIndex];

  const startMission = (id: string) => {
    setMissionId(id);
    setRoomIndex(0);
    store.resetDay();
    setStarsAtStart(store.totalStars);
    setScreen('room');
    const m = MISSIONS.find(x => x.id === id);
    if (m) { say(`Let's start ${m.title}! ${m.description}`, 0.84, 1.05); }
  };

  const handleRoomComplete = () => {
    store.completeStep(currentStep.id);
    const nextIndex = roomIndex + 1;
    if (nextIndex >= mission.steps.length) {
      setScreen('complete');
    } else {
      setRoomIndex(nextIndex);
    }
  };

  // HOME
  if (screen === 'home') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.mainHeader}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.mainHeaderTitle}>Milo's Busy Day</Text>
          <View style={styles.mainHeaderStars}>
            <Text style={styles.mainHeaderStarsText}>⭐ {store.totalStars}</Text>
          </View>
        </View>
        <HomeScreen
          onStartMission={startMission}
          onExplore={() => setScreen('explore-select')}
          onShop={() => setScreen('shop')}
          onStickers={() => setScreen('stickers')}
        />
      </SafeAreaView>
    );
  }

  // SHOP
  if (screen === 'shop') {
    return (
      <SafeAreaView style={styles.safe}>
        <ShopScreen onBack={() => setScreen('home')} />
      </SafeAreaView>
    );
  }

  // STICKERS
  if (screen === 'stickers') {
    return (
      <SafeAreaView style={styles.safe}>
        <StickersScreen onBack={() => setScreen('home')} />
      </SafeAreaView>
    );
  }

  // EXPLORE SELECT
  if (screen === 'explore-select') {
    return (
      <SafeAreaView style={styles.safe}>
        <ExploreSelectScreen
          onSelectRoom={roomId => {
            setExploreRoom(roomId);
            setScreen('room');
          }}
          onBack={() => setScreen('home')}
        />
      </SafeAreaView>
    );
  }

  // COMPLETE
  if (screen === 'complete') {
    const starsEarned = store.totalStars - starsAtStart;
    return (
      <SafeAreaView style={styles.safe}>
        <CompleteScreen
          missionId={missionId}
          starsEarned={Math.max(0, starsEarned)}
          onPlayAgain={() => {
            setRoomIndex(0);
            store.resetDay();
            setStarsAtStart(store.totalStars);
            setScreen('room');
          }}
          onTryAnother={() => setScreen('home')}
          onHome={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  // ROOM (mission or explore)
  const isExplore   = exploreRoom !== null && screen === 'room' && !mission.steps.some(s => s.room === exploreRoom);
  const activeRoomId = isExplore ? (exploreRoom ?? 'bedroom') : (currentStep?.room ?? 'bedroom');
  const missionObjs  = isExplore ? [] : (currentStep?.objects ?? []);
  const roomData     = ROOMS.find(r => r.id === activeRoomId) ?? ROOMS[0];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.mainHeader, { backgroundColor: isExplore ? '#4D96FF' : mission.color }]}>
        <TouchableOpacity
          onPress={() => {
            if (isExplore) {
              setExploreRoom(null);
              setScreen('explore-select');
            } else {
              setScreen('home');
            }
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          {isExplore ? (
            <Text style={styles.headerRoomName}>🗺️ Explore: {roomData.name}</Text>
          ) : (
            <>
              <Text style={styles.headerRoomName}>{currentStep?.emoji} {currentStep?.label}</Text>
              <Text style={styles.headerProgress}>{roomIndex + 1} / {mission.steps.length}</Text>
            </>
          )}
        </View>
        <View style={styles.mainHeaderStars}>
          <Text style={styles.mainHeaderStarsText}>⭐ {store.totalStars}</Text>
        </View>
      </View>

      {/* Step dots (mission only) */}
      {!isExplore && (
        <View style={styles.stepDots}>
          {mission.steps.map((s, i) => (
            <View
              key={s.id}
              style={[
                styles.stepDot,
                i <= roomIndex && { backgroundColor: mission.color },
                i < roomIndex  && { width: 20, borderRadius: 4 },
              ]}
            />
          ))}
        </View>
      )}

      {/* Scene */}
      <View style={styles.sceneArea}>
        <RoomScene
          key={`${activeRoomId}-${isExplore ? 'explore' : missionId + roomIndex}`}
          roomId={activeRoomId}
          missionObjectIds={missionObjs}
          exploreMode={isExplore}
          onComplete={handleRoomComplete}
          missionStepSpeech={currentStep?.speech}
          missionColor={isExplore ? '#4D96FF' : mission.color}
        />
      </View>

      {/* Room name badge */}
      <View style={[styles.roomNameBadge, { backgroundColor: (isExplore ? '#4D96FF' : mission.color) + 'CC' }]}>
        <Text style={styles.roomNameText}>
          {roomData.emoji} {roomData.name}
        </Text>
        <Text style={styles.roomHint}>
          {isExplore ? '🔍 Tap to discover!' : '👆 Find the red dots!'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────
// STYLES
// ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#FFF9F0' },

  // Main header
  mainHeader:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: '#FF9F43' },
  mainHeaderTitle:    { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '900', color: '#fff' },
  mainHeaderStars:    { minWidth: 60, alignItems: 'flex-end' },
  mainHeaderStarsText:{ fontSize: 15, fontWeight: '900', color: '#fff' },

  // Sub-screen header
  subHeader:          { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  subHeaderTitle:     { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '900', color: '#fff' },
  subHeaderStars:     { minWidth: 60, alignItems: 'flex-end' },
  subHeaderStarsText: { fontSize: 15, fontWeight: '900', color: '#fff' },

  backBtn:            { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:           { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerCenter:       { flex: 1, alignItems: 'center' },
  headerRoomName:     { fontSize: 15, fontWeight: '900', color: '#fff' },
  headerProgress:     { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '700' },

  // Step dots
  stepDots:           { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 7, backgroundColor: '#fff' },
  stepDot:            { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },

  // Scene
  sceneArea:          { flex: 1 },
  roomScene:          { flex: 1, position: 'relative', overflow: 'hidden' },
  roomWall:           { position: 'absolute', top: 0, left: 0, right: 0, height: '45%', opacity: 0.4 },
  roomObj:            { position: 'absolute', alignItems: 'center' },
  objEmoji:           { textAlign: 'center' },
  objDone:            { opacity: 0.65 },
  missionDot:         { position: 'absolute', top: -5, right: -5, width: 11, height: 11, borderRadius: 5.5 },
  doneCheck:          { position: 'absolute', top: -10, right: -10, fontSize: 18, color: '#6BCB77', fontWeight: '900' },
  reactionBubble:     { position: 'absolute', top: -30, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 14, paddingHorizontal: 8, paddingVertical: 3, zIndex: 99 },
  reactionText:       { fontSize: 20 },
  floor:              { position: 'absolute', bottom: 0, left: 0, right: 0, height: 50, opacity: 0.55 },
  roomProgressTrack:  { position: 'absolute', bottom: 50, left: 0, right: 0, height: 7, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 4 },
  roomProgressFill:   { height: '100%', borderRadius: 4 },
  starFeedback:       { position: 'absolute', top: 18, right: 14, backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6, zIndex: 50 },
  starFeedbackText:   { color: '#FFD93D', fontWeight: '900', fontSize: 16 },

  // Milo guide
  miloWrap:           { position: 'absolute', bottom: 58, left: 8, flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '80%', zIndex: 40 },
  miloEmoji:          { fontSize: 44 },
  miloBubble:         { backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 14, borderBottomLeftRadius: 4, padding: 10, maxWidth: W * 0.52, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 6, elevation: 3 },
  miloSpeech:         { fontSize: 12, fontWeight: '700', color: '#3D3530', lineHeight: 18 },

  // Room name badge
  roomNameBadge:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 9 },
  roomNameText:       { fontSize: 13, fontWeight: '900', color: '#fff' },
  roomHint:           { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.88)' },

  // ── HOME ─────────────────────────────────────────────────
  homeScroll:         { padding: 16, gap: 18, paddingBottom: 36 },
  homeHero:           { alignItems: 'center', gap: 6 },
  miloHeroEmoji:      { fontSize: 72 },
  homeTitle:          { fontSize: 28, fontWeight: '900', color: '#3D3530' },
  miloBubbleHome:     { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, maxWidth: W * 0.8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 2 },
  miloBubbleHomeText: { fontSize: 14, fontWeight: '700', color: '#3D3530', textAlign: 'center' },

  statsRow:           { flexDirection: 'row', justifyContent: 'space-around' },
  statChip:           { alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, paddingVertical: 12, paddingHorizontal: 18, gap: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  statChipEmoji:      { fontSize: 26 },
  statChipValue:      { fontSize: 22, fontWeight: '900', color: '#3D3530' },
  statChipLabel:      { fontSize: 10, fontWeight: '800', color: '#8B8178' },

  chestCard:          { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFD700', borderRadius: 20, paddingHorizontal: 18, paddingVertical: 14, shadowColor: '#FFD700', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  chestEmoji:         { fontSize: 40 },
  chestTitle:         { fontSize: 17, fontWeight: '900', color: '#3D3530' },
  chestSub:           { fontSize: 12, fontWeight: '700', color: '#5D4E00' },
  chestArrow:         { fontSize: 22, fontWeight: '900', color: '#3D3530' },

  sectionLabel:       { fontSize: 12, fontWeight: '900', color: '#8B8178', letterSpacing: 1 },

  featuredMissionCard:{ borderRadius: 24, padding: 22, alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.18, shadowRadius: 14, elevation: 6 },
  featuredMissionEmoji:{ fontSize: 64 },
  featuredMissionTitle:{ fontSize: 26, fontWeight: '900', color: '#fff' },
  featuredMissionSub: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  featuredMissionBtn: { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 99, paddingHorizontal: 28, paddingVertical: 13, marginTop: 4 },
  featuredMissionBtnText: { fontSize: 15, fontWeight: '900', color: '#fff', letterSpacing: 0.5 },

  missionCardsRow:    { gap: 12, paddingBottom: 4 },
  missionCard:        { alignItems: 'center', backgroundColor: '#fff', borderRadius: 18, borderWidth: 2.5, paddingHorizontal: 14, paddingVertical: 14, gap: 6, minWidth: 100, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  missionCardLocked:  { backgroundColor: '#F5F5F5', borderColor: '#E0E0E0' },
  missionCardEmoji:   { fontSize: 32 },
  missionCardTitle:   { fontSize: 11, fontWeight: '900', color: '#3D3530', textAlign: 'center' },
  missionCardBadge:   { fontSize: 20 },
  missionCardLockText:{ fontSize: 10, fontWeight: '800', color: '#BDBDBD', textAlign: 'center' },
  lockedEmoji:        { opacity: 0.5 },
  lockedText:         { color: '#BDBDBD' },

  bottomActionRow:    { flexDirection: 'row', gap: 12 },
  actionCard:         { flex: 1, alignItems: 'center', borderRadius: 18, paddingVertical: 16, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },
  actionCardEmoji:    { fontSize: 30 },
  actionCardLabel:    { fontSize: 11, fontWeight: '900', color: '#fff' },

  // ── COMPLETE ─────────────────────────────────────────────
  completeScreen:     { flex: 1, backgroundColor: 'rgba(0,0,0,0.82)', alignItems: 'center', justifyContent: 'center', padding: 20 },
  confettiPiece:      { position: 'absolute', top: -60, fontSize: 28, zIndex: 100 },
  completeCard:       { backgroundColor: '#FFF9F0', borderRadius: 28, padding: 28, alignItems: 'center', gap: 12, width: '100%' },
  completeOwl:        { fontSize: 60 },
  completeMissionEmoji: { fontSize: 48 },
  completeTitle:      { fontSize: 30, fontWeight: '900', color: '#3D3530' },
  completeMissionName:{ fontSize: 18, fontWeight: '800', color: '#8B8178' },
  completeStars:      { fontSize: 22, fontWeight: '900', color: '#FF9F43' },
  newBadgeRow:        { alignItems: 'center', backgroundColor: '#FFF0CC', borderRadius: 16, padding: 14, gap: 6, width: '100%' },
  newBadgeLabel:      { fontSize: 16, fontWeight: '900', color: '#3D3530' },
  newBadgeEmoji:      { fontSize: 48 },
  completeButtons:    { width: '100%', gap: 10 },
  completeBtn:        { borderRadius: 99, paddingVertical: 14, alignItems: 'center', width: '100%' },
  completeBtnText:    { color: '#fff', fontSize: 16, fontWeight: '900' },
  homeLink:           { alignItems: 'center', paddingVertical: 8 },
  homeLinkText:       { fontSize: 15, fontWeight: '800', color: '#8B8178' },

  // ── SHOP ─────────────────────────────────────────────────
  shopGrid:           { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12, justifyContent: 'space-between' },
  shopCard:           { width: (W - 44) / 2, backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  shopCardOwned:      { backgroundColor: '#F0FFF4', borderWidth: 2, borderColor: '#6BCB77' },
  shopItemEmoji:      { fontSize: 40 },
  shopItemName:       { fontSize: 13, fontWeight: '900', color: '#3D3530', textAlign: 'center' },
  shopItemCategory:   { fontSize: 10, fontWeight: '700', color: '#8B8178', textTransform: 'capitalize' },
  ownedBadge:         { backgroundColor: '#6BCB77', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  ownedBadgeText:     { color: '#fff', fontSize: 12, fontWeight: '900' },
  buyBtn:             { backgroundColor: '#FF9F43', borderRadius: 99, paddingHorizontal: 16, paddingVertical: 8 },
  buyBtnDimmed:       { backgroundColor: '#E0E0E0' },
  buyBtnText:         { color: '#fff', fontSize: 13, fontWeight: '900' },

  // ── STICKERS ─────────────────────────────────────────────
  stickersContent:    { padding: 16, gap: 16, paddingBottom: 36 },
  streakBadge:        { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#FFF3E0', borderRadius: 18, padding: 16, borderWidth: 2, borderColor: '#FF9F43' },
  streakBadgeEmoji:   { fontSize: 36 },
  streakBadgeText:    { fontSize: 20, fontWeight: '900', color: '#3D3530' },
  stickersLabel:      { fontSize: 12, fontWeight: '900', color: '#8B8178', letterSpacing: 1 },
  stickersGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  stickerSlot:        { width: (W - 44) / 2, alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 18, padding: 16, gap: 6 },
  stickerSlotEarned:  { backgroundColor: '#FFF9F0', borderWidth: 2, borderColor: '#FFD700', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 3 },
  stickerEmoji:       { fontSize: 48 },
  stickerLocked:      { opacity: 0.4 },
  stickerName:        { fontSize: 11, fontWeight: '800', color: '#3D3530', textAlign: 'center' },
  stickerLockedText:  { color: '#BDBDBD' },

  // ── EXPLORE ───────────────────────────────────────────────
  exploreGrid:        { padding: 16, gap: 12, paddingBottom: 36 },
  exploreHint:        { fontSize: 14, fontWeight: '700', color: '#8B8178', textAlign: 'center', marginBottom: 4 },
  exploreRoomCard:    { flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 18, borderWidth: 2, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  exploreRoomEmoji:   { fontSize: 40 },
  exploreRoomName:    { flex: 1, fontSize: 16, fontWeight: '900', color: '#3D3530' },
  exploreRoomObjects: { fontSize: 11, fontWeight: '700', color: '#8B8178' },
});
