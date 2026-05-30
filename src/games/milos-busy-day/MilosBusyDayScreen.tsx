// ============================================================
// Milo's Busy Day — Main Game Screen
// Routine + discovery mini-world for ages 3–6
// Original TinySteps game
// ============================================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  StyleSheet, Dimensions, ScrollView, Modal,
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

function say(text: string, rate = 0.82, pitch = 1.12) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 140);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} }, 140));
}

// ── Object animation state ─────────────────────────────────
interface ObjAnim { y: Animated.Value; x: Animated.Value; scale: Animated.Value; rotate: Animated.Value; reaction: string | null; toggleOn: boolean; done: boolean; }
function makeAnim(): ObjAnim { return { y: new Animated.Value(0), x: new Animated.Value(0), scale: new Animated.Value(1), rotate: new Animated.Value(0), reaction: null, toggleOn: false, done: false }; }

function triggerAnim(type: AnimType, a: ObjAnim) {
  switch (type) {
    case 'bounce': Animated.sequence([Animated.spring(a.y, { toValue: -20, tension: 200, friction: 4, useNativeDriver: true }), Animated.spring(a.y, { toValue: 0, tension: 120, friction: 6, useNativeDriver: true })]).start(); break;
    case 'wiggle': Animated.sequence([Animated.timing(a.x, { toValue: 10, duration: 60, useNativeDriver: true }), Animated.timing(a.x, { toValue: -10, duration: 60, useNativeDriver: true }), Animated.timing(a.x, { toValue: 6, duration: 60, useNativeDriver: true }), Animated.timing(a.x, { toValue: -6, duration: 60, useNativeDriver: true }), Animated.timing(a.x, { toValue: 0, duration: 60, useNativeDriver: true })]).start(); break;
    case 'pulse': Animated.sequence([Animated.timing(a.scale, { toValue: 1.3, duration: 140, useNativeDriver: true }), Animated.spring(a.scale, { toValue: 1, tension: 100, friction: 4, useNativeDriver: true })]).start(); break;
    case 'spin': Animated.timing(a.rotate, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => a.rotate.setValue(0)); break;
    case 'pop': Animated.sequence([Animated.timing(a.scale, { toValue: 1.4, duration: 100, useNativeDriver: true }), Animated.timing(a.scale, { toValue: 0.9, duration: 80, useNativeDriver: true }), Animated.spring(a.scale, { toValue: 1, tension: 100, friction: 4, useNativeDriver: true })]).start(); break;
    case 'slide': Animated.sequence([Animated.timing(a.x, { toValue: 18, duration: 180, useNativeDriver: true }), Animated.spring(a.x, { toValue: 0, tension: 80, friction: 6, useNativeDriver: true })]).start(); break;
  }
}

// ── Milo Guide Character ──────────────────────────────────
function MiloGuide({ speech, visible }: { speech: string; visible: boolean }) {
  const breatheY = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breatheY, { toValue: -5, duration: 1400, useNativeDriver: true }),
      Animated.timing(breatheY, { toValue: 0,  duration: 1400, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: visible ? 1 : 0, duration: 300, useNativeDriver: true }).start();
  }, [visible]);

  return (
    <Animated.View style={[styles.miloWrap, { opacity: fadeAnim }]}>
      <Animated.Text style={[styles.miloEmoji, { transform: [{ translateY: breatheY }] }]}>🦉</Animated.Text>
      {speech.length > 0 && (
        <View style={styles.miloBubble}>
          <Text style={styles.miloSpeech}>{speech}</Text>
        </View>
      )}
    </Animated.View>
  );
}

// ── Star Counter ──────────────────────────────────────────
function StarCounter({ total, routine, helper, focus }: { total: number; routine: number; helper: number; focus: number }) {
  return (
    <View style={styles.starCounter}>
      <Text style={styles.starTotal}>⭐{total}</Text>
      <View style={styles.starBreakdown}>
        <Text style={styles.starType}>📋{routine}</Text>
        <Text style={styles.starType}>🤝{helper}</Text>
        <Text style={styles.starType}>🎯{focus}</Text>
      </View>
    </View>
  );
}

// ── Reminder bubble ───────────────────────────────────────
function ReminderBubble({ text, visible }: { text: string; visible: boolean }) {
  const slideY = useRef(new Animated.Value(-60)).current;
  useEffect(() => {
    Animated.timing(slideY, { toValue: visible ? 0 : -60, duration: 350, useNativeDriver: true }).start();
  }, [visible]);
  return (
    <Animated.View style={[styles.reminder, { transform: [{ translateY: slideY }] }]}>
      <Text style={styles.reminderEmoji}>🦉</Text>
      <Text style={styles.reminderText}>{text}</Text>
    </Animated.View>
  );
}

// ── Main Room Scene ───────────────────────────────────────
function RoomScene({ roomId, onComplete }: { roomId: string; onComplete: () => void }) {
  const room = ROOMS.find(r => r.id === roomId) ?? ROOMS[0];
  const store = useMilosBusyDayStore();
  const animMap = useRef<Map<string, ObjAnim>>(new Map());
  const [, forceUpdate] = useState(0);
  const [miloSpeech,  setMiloSpeech]  = useState('');
  const [reminderText,setReminder]    = useState('');
  const [showReminder,setShowReminder]= useState(false);
  const [stepsDone,   setStepsDone]   = useState<string[]>([]);
  const [starFeedback,setStarFeedback]= useState<string | null>(null);
  const lastActionRef = useRef(Date.now());
  const mission = getDailyMission();
  const missionStep = mission.steps.find(s => s.room === roomId);

  // Idle reminder timer
  useEffect(() => {
    const interval = setInterval(() => {
      const idle = Date.now() - lastActionRef.current;
      if (idle > 25000 && missionStep && stepsDone.length < missionStep.objects.length) {
        const reminders = [
          `Let's keep going! ${missionStep.label} isn't done yet!`,
          `Great exploring! Now let's finish: ${missionStep.label}`,
          `Milo needs your help! ${missionStep.label} first!`,
        ];
        const r = reminders[Math.floor(Math.random() * reminders.length)];
        setReminder(r);
        setShowReminder(true);
        say(r, 0.82, 1.05);
        setTimeout(() => setShowReminder(false), 4000);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [stepsDone, missionStep]);

  // Initial speech
  useEffect(() => {
    if (missionStep) {
      setTimeout(() => {
        setMiloSpeech(missionStep.speech);
        say(missionStep.speech, 0.82, 1.1);
      }, 600);
    }
  }, [roomId]);

  function getAnim(id: string): ObjAnim {
    if (!animMap.current.has(id)) animMap.current.set(id, makeAnim());
    return animMap.current.get(id)!;
  }

  const handleTap = useCallback((obj: RoomObject) => {
    const anim = getAnim(obj.id);
    lastActionRef.current = Date.now();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let speech = obj.speech;
    if (obj.toggle) {
      anim.toggleOn = !anim.toggleOn;
      speech = anim.toggleOn ? obj.toggle.speechOn : obj.toggle.speechOff;
    }
    say(speech);
    triggerAnim(obj.animType, anim);

    anim.reaction = obj.reaction;
    forceUpdate(n => n + 1);
    setTimeout(() => { anim.reaction = null; forceUpdate(n => n + 1); }, 1200);

    // Give helper stars
    if (obj.isHelper && obj.helperStars > 0) {
      store.addStars('helper', obj.helperStars);
      setStarFeedback(`+${obj.helperStars} 🤝`);
      setTimeout(() => setStarFeedback(null), 1000);
    }

    // Mission item
    if (obj.isMissionItem && obj.missionStep && !stepsDone.includes(obj.missionStep)) {
      anim.done = true;
      const newDone = [...stepsDone, obj.missionStep];
      setStepsDone(newDone);
      store.addStars('routine', 5);
      setStarFeedback(`+5 📋`);
      setTimeout(() => setStarFeedback(null), 1000);

      // Check if all mission objects in this room are done
      if (missionStep && newDone.length >= missionStep.objects.length) {
        store.completeStep(missionStep.id);
        setTimeout(() => {
          say(room.completionSpeech, 0.85, 1.1);
          setMiloSpeech(room.completionSpeech);
          setTimeout(() => onComplete(), 2500);
        }, 600);
      }
    }

    store.tapObject(obj.id, obj.isMissionItem, obj.isHelper ? obj.helperStars : 0, obj.missionStep);
  }, [stepsDone, missionStep, store, room, onComplete]);

  const missionObjects = missionStep ? missionStep.objects : [];
  const progress = missionObjects.length > 0 ? stepsDone.filter(s => missionObjects.includes(s)).length / missionObjects.length * 100 : 0;

  return (
    <View style={[styles.roomScene, { backgroundColor: room.bgColor }]}>
      {/* Room objects */}
      {room.objects.map((obj) => {
        const anim = getAnim(obj.id);
        const rotate = anim.rotate.interpolate({ inputRange: [0,1], outputRange: ['0deg','360deg'] });
        const display = obj.toggle ? (anim.toggleOn ? obj.toggle.on : obj.toggle.off) : obj.emoji;
        const isDone  = anim.done;
        return (
          <TouchableOpacity
            key={obj.id}
            onPress={() => handleTap(obj)}
            activeOpacity={0.78}
            style={[styles.roomObj, { left: `${obj.x}%`, top: `${obj.y}%`, zIndex: obj.isMissionItem ? 20 : 10 }]}
          >
            <Animated.View style={{ transform: [{ translateY: anim.y }, { translateX: anim.x }, { scale: anim.scale }, { rotate }] }}>
              <Text style={[styles.objEmoji, { fontSize: obj.size }, isDone && styles.objDone]}>{display}</Text>
              {/* Mission indicator */}
              {obj.isMissionItem && !isDone && (
                <View style={styles.missionDot} />
              )}
              {isDone && <Text style={styles.doneCheck}>✓</Text>}
            </Animated.View>
            {anim.reaction && (
              <View style={styles.reactionBubble}>
                <Text style={styles.reactionText}>{anim.reaction}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}

      {/* Floor */}
      <View style={[styles.floor, { backgroundColor: room.floorColor }]} />

      {/* Progress bar */}
      <View style={styles.roomProgress}>
        <View style={[styles.roomProgressFill, { width: `${progress}%` }]} />
      </View>

      {/* Star feedback */}
      {starFeedback && (
        <View style={styles.starFeedback}>
          <Text style={styles.starFeedbackText}>{starFeedback}</Text>
        </View>
      )}

      {/* Milo guide */}
      <MiloGuide speech={miloSpeech} visible={miloSpeech.length > 0} />

      {/* Reminder */}
      <ReminderBubble text={reminderText} visible={showReminder} />
    </View>
  );
}

// ── Mission Select Screen ─────────────────────────────────
function MissionSelectScreen({ onStart }: { onStart: (missionId: string) => void }) {
  const { totalStars, streak } = useMilosBusyDayStore();
  const dailyMission = getDailyMission();

  return (
    <View style={styles.missionSelect}>
      {/* Header */}
      <View style={styles.msHeader}>
        <Text style={styles.msTitle}>Milo's Busy Day 🦉</Text>
        <Text style={styles.msSub}>What are we doing today?</Text>
      </View>

      {/* Stats */}
      <View style={styles.msStats}>
        <View style={styles.msStat}><Text style={styles.msStatEmoji}>⭐</Text><Text style={styles.msStatValue}>{totalStars}</Text><Text style={styles.msStatLabel}>Stars</Text></View>
        <View style={styles.msStat}><Text style={styles.msStatEmoji}>🔥</Text><Text style={styles.msStatValue}>{streak}</Text><Text style={styles.msStatLabel}>Streak</Text></View>
      </View>

      {/* Daily mission */}
      <View style={styles.dailyMissionCard}>
        <View style={styles.dailyBadge}><Text style={styles.dailyBadgeText}>TODAY'S MISSION</Text></View>
        <Text style={{ fontSize: 52, marginTop: 8 }}>{dailyMission.emoji}</Text>
        <Text style={styles.missionTitle}>{dailyMission.title}</Text>
        <Text style={styles.missionDesc}>{dailyMission.description}</Text>
        <View style={styles.missionSteps}>
          {dailyMission.steps.map((step, i) => (
            <View key={step.id} style={styles.missionStepRow}>
              <Text style={styles.missionStepNum}>{i + 1}</Text>
              <Text style={styles.missionStepEmoji}>{step.emoji}</Text>
              <Text style={styles.missionStepLabel}>{step.label}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[styles.startBtn, { backgroundColor: dailyMission.color }]} onPress={() => onStart(dailyMission.id)} activeOpacity={0.88}>
          <Text style={styles.startBtnText}>Start Mission! 🚀</Text>
        </TouchableOpacity>
      </View>

      {/* All missions */}
      <Text style={styles.allMissionsLabel}>All Missions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.allMissionsRow}>
        {MISSIONS.map(m => (
          <TouchableOpacity key={m.id} style={[styles.missionChip, { backgroundColor: m.color + '30', borderColor: m.color }]} onPress={() => onStart(m.id)} activeOpacity={0.85}>
            <Text style={{ fontSize: 28 }}>{m.emoji}</Text>
            <Text style={styles.missionChipLabel}>{m.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// ── Completion Screen ────────────────────────────────────
function CompletionScreen({ stars, onRestart, onHome }: { stars: number; onRestart: () => void; onHome: () => void }) {
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();
    say('Amazing! You completed all the tasks! Milo is so proud of you!', 0.85, 1.1);
  }, []);
  return (
    <View style={styles.completionScreen}>
      <Animated.View style={[styles.completionCard, { transform: [{ scale: scaleAnim }] }]}>
        <Text style={styles.completionEmoji}>🎉</Text>
        <Text style={styles.completionTitle}>Mission Complete!</Text>
        <Text style={styles.completionEmoji2}>🦉</Text>
        <Text style={styles.completionScore}>⭐ {stars} stars earned!</Text>
        <TouchableOpacity style={styles.completionBtn} onPress={onRestart} activeOpacity={0.88}>
          <Text style={styles.completionBtnText}>Play Again! 🚀</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onHome} style={{ marginTop: 12 }}>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '800' }}>Back to games</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Main Entry ────────────────────────────────────────────
export default function MilosBusyDayScreen() {
  const store = useMilosBusyDayStore();
  const [screen,      setScreen]      = useState<'select'|'room'|'complete'>('select');
  const [missionId,   setMissionId]   = useState(getDailyMission().id);
  const [roomIndex,   setRoomIndex]   = useState(0);

  useEffect(() => { store.loadState(); }, []);

  const mission = MISSIONS.find(m => m.id === missionId) ?? MISSIONS[0];
  const currentStep = mission.steps[roomIndex];

  const handleMissionStart = (id: string) => {
    setMissionId(id);
    setRoomIndex(0);
    store.resetDay();
    setScreen('room');
    say(`Let\'s start! ${MISSIONS.find(m => m.id === id)?.description ?? ''}`, 0.84, 1.05);
  };

  const handleRoomComplete = () => {
    const nextIndex = roomIndex + 1;
    if (nextIndex >= mission.steps.length) {
      setScreen('complete');
    } else {
      setRoomIndex(nextIndex);
    }
  };

  if (screen === 'select') {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Milo's Busy Day</Text>
          <StarCounter total={store.totalStars} routine={store.routineStars} helper={store.helperStars} focus={store.focusStars} />
        </View>
        <ScrollView><MissionSelectScreen onStart={handleMissionStart} /></ScrollView>
      </SafeAreaView>
    );
  }

  if (screen === 'complete') {
    return (
      <SafeAreaView style={styles.safe}>
        <CompletionScreen
          stars={store.totalStars}
          onRestart={() => { setRoomIndex(0); setScreen('room'); store.resetDay(); }}
          onHome={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: mission.color }]}>
        <TouchableOpacity onPress={() => setScreen('select')} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerRoomName}>{currentStep?.emoji} {currentStep?.label}</Text>
          <Text style={styles.headerProgress}>{roomIndex + 1} / {mission.steps.length}</Text>
        </View>
        <StarCounter total={store.totalStars} routine={store.routineStars} helper={store.helperStars} focus={store.focusStars} />
      </View>

      {/* Step dots */}
      <View style={styles.stepDots}>
        {mission.steps.map((s, i) => (
          <View key={s.id} style={[styles.stepDot, i <= roomIndex && { backgroundColor: mission.color }, i < roomIndex && { width: 20 }]} />
        ))}
      </View>

      {/* Room scene */}
      <View style={styles.sceneArea}>
        <RoomScene
          key={currentStep?.room}
          roomId={currentStep?.room ?? 'bedroom'}
          onComplete={handleRoomComplete}
        />
      </View>

      {/* Room name badge */}
      <View style={[styles.roomNameBadge, { backgroundColor: mission.color + 'CC' }]}>
        <Text style={styles.roomNameText}>
          {ROOMS.find(r => r.id === currentStep?.room)?.emoji} {ROOMS.find(r => r.id === currentStep?.room)?.name}
        </Text>
        <Text style={styles.roomHint}>👆 Tap everything!</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#FFF9F0' },
  header:            { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FF9F43' },
  backBtn:           { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:          { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerTitle:       { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '900', color: '#fff' },
  headerCenter:      { flex: 1, alignItems: 'center' },
  headerRoomName:    { fontSize: 15, fontWeight: '900', color: '#fff' },
  headerProgress:    { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  starCounter:       { alignItems: 'center' },
  starTotal:         { fontSize: 16, fontWeight: '900', color: '#fff' },
  starBreakdown:     { flexDirection: 'row', gap: 4 },
  starType:          { fontSize: 9, fontWeight: '800', color: 'rgba(255,255,255,0.8)' },
  stepDots:          { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingVertical: 6, backgroundColor: '#fff' },
  stepDot:           { width: 8, height: 8, borderRadius: 4, backgroundColor: '#E0E0E0' },
  sceneArea:         { flex: 1 },
  roomScene:         { flex: 1, position: 'relative', overflow: 'hidden' },
  roomObj:           { position: 'absolute', alignItems: 'center' },
  objEmoji:          { textAlign: 'center' },
  objDone:           { opacity: 0.7 },
  missionDot:        { position: 'absolute', top: -4, right: -4, width: 10, height: 10, borderRadius: 5, backgroundColor: '#FF6B6B' },
  doneCheck:         { position: 'absolute', top: -8, right: -8, fontSize: 18, color: '#6BCB77', fontWeight: '900' },
  reactionBubble:    { position: 'absolute', top: -28, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 14, paddingHorizontal: 8, paddingVertical: 3, zIndex: 99 },
  reactionText:      { fontSize: 20 },
  floor:             { position: 'absolute', bottom: 0, left: 0, right: 0, height: 55, opacity: 0.5 },
  roomProgress:      { position: 'absolute', bottom: 55, left: 0, height: 6, backgroundColor: '#6BCB77', borderRadius: 3 },
  roomProgressFill:  { height: '100%', backgroundColor: '#6BCB77', borderRadius: 3 },
  starFeedback:      { position: 'absolute', top: 20, right: 16, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  starFeedbackText:  { color: '#FFD93D', fontWeight: '900', fontSize: 16 },
  miloWrap:          { position: 'absolute', bottom: 60, left: 8, flexDirection: 'row', alignItems: 'flex-end', gap: 8, maxWidth: '80%' },
  miloEmoji:         { fontSize: 44 },
  miloBubble:        { backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14, borderBottomLeftRadius: 4, padding: 10, maxWidth: W * 0.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  miloSpeech:        { fontSize: 12, fontWeight: '700', color: '#3D3530', lineHeight: 18 },
  reminder:          { position: 'absolute', top: 0, left: 12, right: 12, backgroundColor: '#FFF3E0', borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 8, padding: 10, borderWidth: 1.5, borderColor: '#FF9F43', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 4 },
  reminderEmoji:     { fontSize: 22 },
  reminderText:      { flex: 1, fontSize: 13, fontWeight: '800', color: '#3D3530' },
  roomNameBadge:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 8 },
  roomNameText:      { fontSize: 13, fontWeight: '900', color: '#fff' },
  roomHint:          { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)' },
  // Mission Select
  missionSelect:     { padding: 16, gap: 16, paddingBottom: 32 },
  msHeader:          { alignItems: 'center', gap: 4 },
  msTitle:           { fontSize: 28, fontWeight: '900', color: '#3D3530' },
  msSub:             { fontSize: 14, color: '#8B8178', fontWeight: '700' },
  msStats:           { flexDirection: 'row', justifyContent: 'center', gap: 24 },
  msStat:            { alignItems: 'center', gap: 2 },
  msStatEmoji:       { fontSize: 28 },
  msStatValue:       { fontSize: 22, fontWeight: '900', color: '#3D3530' },
  msStatLabel:       { fontSize: 11, color: '#8B8178', fontWeight: '700' },
  dailyMissionCard:  { backgroundColor: '#fff', borderRadius: 24, padding: 20, alignItems: 'center', gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  dailyBadge:        { backgroundColor: '#FF9F43', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 4 },
  dailyBadgeText:    { fontSize: 10, fontWeight: '900', color: '#fff', letterSpacing: 1 },
  missionTitle:      { fontSize: 24, fontWeight: '900', color: '#3D3530' },
  missionDesc:       { fontSize: 14, color: '#8B8178', fontWeight: '700', textAlign: 'center' },
  missionSteps:      { width: '100%', gap: 6 },
  missionStepRow:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, backgroundColor: '#FFF9F0', borderRadius: 12 },
  missionStepNum:    { width: 22, height: 22, borderRadius: 11, backgroundColor: '#FF9F43', textAlign: 'center', lineHeight: 22, fontSize: 12, fontWeight: '900', color: '#fff' },
  missionStepEmoji:  { fontSize: 22 },
  missionStepLabel:  { fontSize: 14, fontWeight: '800', color: '#3D3530', flex: 1 },
  startBtn:          { width: '100%', borderRadius: 99, paddingVertical: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 4 },
  startBtnText:      { color: '#fff', fontSize: 17, fontWeight: '900' },
  allMissionsLabel:  { fontSize: 13, fontWeight: '800', color: '#8B8178' },
  allMissionsRow:    { gap: 10, paddingBottom: 4 },
  missionChip:       { alignItems: 'center', borderRadius: 16, borderWidth: 2, paddingHorizontal: 16, paddingVertical: 12, gap: 6, minWidth: 90 },
  missionChipLabel:  { fontSize: 11, fontWeight: '900', color: '#3D3530', textAlign: 'center' },
  // Completion
  completionScreen:  { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  completionCard:    { backgroundColor: '#FFF9F0', borderRadius: 28, padding: 32, alignItems: 'center', gap: 14, width: '100%' },
  completionEmoji:   { fontSize: 72 },
  completionEmoji2:  { fontSize: 56 },
  completionTitle:   { fontSize: 32, fontWeight: '900', color: '#3D3530' },
  completionScore:   { fontSize: 22, fontWeight: '900', color: '#FF9F43' },
  completionBtn:     { backgroundColor: '#FF9F43', borderRadius: 99, paddingHorizontal: 40, paddingVertical: 16 },
  completionBtnText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
