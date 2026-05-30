// ============================================================
// Builder Buddies — Ages 3–6
// Original TinySteps game — construction trucks & building
// ============================================================
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  StyleSheet, Dimensions, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width: W } = Dimensions.get('window');
const STORE_KEY = 'builderbuddies_v1';

function say(text: string, rate = 0.82, pitch = 1.05) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 140);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} }, 140));
}

interface Truck {
  id:       string;
  name:     string;
  emoji:    string;
  color:    string;
  sound:    string;
  action:   string;
  unlockAt: number;
}

interface BuildStep {
  id:         string;
  truckNeeded:string;
  label:      string;
  emoji:      string;
  speech:     string;
  effect:     string;
}

const TRUCKS: Truck[] = [
  { id: 'digger',  name: 'Digger Dan',     emoji: '🚜', color: '#FFD93D', sound: 'Rumble rumble! Digger Dan digs deep!',          action: 'Dig!',    unlockAt: 0  },
  { id: 'dump',    name: 'Dumper Dave',    emoji: '🚛', color: '#FF9F43', sound: 'Beep beep! Dumper Dave moves the rubble!',       action: 'Dump!',   unlockAt: 0  },
  { id: 'crane',   name: 'Cranky Crane',   emoji: '🏗️', color: '#FF6B6B', sound: 'Whirrrr! Cranky Crane lifts it high!',           action: 'Lift!',   unlockAt: 10 },
  { id: 'mixer',   name: 'Mixer Molly',    emoji: '🚚', color: '#6BCB77', sound: 'Swoosh swoosh! Mixer Molly mixes cement!',       action: 'Mix!',    unlockAt: 20 },
  { id: 'dozer',   name: 'Bulldozer Bob',  emoji: '🛻', color: '#4D96FF', sound: 'Vrroom! Bulldozer Bob pushes it all flat!',      action: 'Push!',   unlockAt: 35 },
  { id: 'roller',  name: 'Roller Rosa',    emoji: '🛞', color: '#C77DFF', sound: 'Rollll! Roller Rosa smooths the road flat!',     action: 'Roll!',   unlockAt: 50 },
];

const BUILD_PROJECTS = [
  {
    id: 'bridge',
    title: '🌉 Build the Bridge',
    description: 'TinyTown needs a bridge to cross the river!',
    steps: [
      { id: 's1', truckNeeded: 'digger', label: 'Dig the foundations', emoji: '⛏️', speech: 'Dig dig dig! Making the holes for the pillars!', effect: '💨' },
      { id: 's2', truckNeeded: 'dump',   label: 'Remove the rubble',   emoji: '🪨', speech: 'Beep beep! Loading the rocks onto the truck!',   effect: '🪨' },
      { id: 's3', truckNeeded: 'crane',  label: 'Lift the beams',      emoji: '🔩', speech: 'Up up up! The steel beams are so heavy!',        effect: '⬆️' },
      { id: 's4', truckNeeded: 'mixer',  label: 'Pour the concrete',   emoji: '🫙', speech: 'Swoosh! Warm concrete fills every gap!',         effect: '🌊' },
      { id: 's5', truckNeeded: 'dozer',  label: 'Level the road',      emoji: '🛣️', speech: 'Pushing the gravel flat for the bridge road!',   effect: '🏔️' },
      { id: 's6', truckNeeded: 'roller', label: 'Smooth the surface',  emoji: '⬜', speech: 'Rolling it smooth! Cars will love this road!',   effect: '✨' },
    ] as BuildStep[],
  },
  {
    id: 'playground',
    title: '🎠 Build the Playground',
    description: 'The children of TinyTown need a playground!',
    steps: [
      { id: 'p1', truckNeeded: 'dozer',  label: 'Clear the ground',    emoji: '🌿', speech: 'Push push push! Clearing space for the playground!', effect: '💨' },
      { id: 'p2', truckNeeded: 'digger', label: 'Dig the base',        emoji: '⛏️', speech: 'Digging the safety base for the slide!',            effect: '🟤' },
      { id: 'p3', truckNeeded: 'dump',   label: 'Deliver the wood',    emoji: '🪵', speech: 'Delivering the wooden planks!',                      effect: '🪵' },
      { id: 'p4', truckNeeded: 'crane',  label: 'Lift the frame',      emoji: '🏗️', speech: 'Up goes the swing frame! Nearly there!',             effect: '⬆️' },
      { id: 'p5', truckNeeded: 'mixer',  label: 'Set the concrete',    emoji: '🫙', speech: 'Concrete around the posts to hold them firm!',       effect: '💪' },
      { id: 'p6', truckNeeded: 'roller', label: 'Pave the path',       emoji: '🛤️', speech: 'A smooth path around the playground!',              effect: '🎉' },
    ] as BuildStep[],
  },
];

export default function BuilderBuddiesGame() {
  const [stars,         setStars]         = useState(0);
  const [unlockedTrucks,setUnlocked]      = useState<string[]>(['digger','dump']);
  const [projectIndex,  setProjectIndex]  = useState(0);
  const [currentStep,   setCurrentStep]   = useState(0);
  const [completedSteps,setDone]          = useState<Set<string>>(new Set());
  const [activeTruck,   setActiveTruck]   = useState<string>('digger');
  const [feedback,      setFeedback]      = useState<string | null>(null);
  const [showComplete,  setShowComplete]  = useState(false);
  const truckX    = useRef(new Animated.Value(-W)).current;
  const truckBounce = useRef(new Animated.Value(0)).current;
  const stepAnims = useRef(BUILD_PROJECTS.map(p => p.steps.map(() => new Animated.Value(0)))).current;
  const dustAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY).then(raw => {
      if (!raw) return;
      const s = JSON.parse(raw);
      setStars(s.stars ?? 0);
      setUnlocked(s.unlockedTrucks ?? ['digger','dump']);
      setCurrentStep(s.currentStep ?? 0);
      setDone(new Set(s.completedSteps ?? []));
      setProjectIndex(s.projectIndex ?? 0);
    });
  }, []);

  const save = (s: number, u: string[], step: number, done: string[], proj: number) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify({ stars: s, unlockedTrucks: u, currentStep: step, completedSteps: [...done], projectIndex: proj }));
  };

  const project = BUILD_PROJECTS[projectIndex];
  const step    = project.steps[currentStep];
  const allDone = currentStep >= project.steps.length;

  const tapTruck = (truck: Truck) => {
    if (!unlockedTrucks.includes(truck.id)) {
      say(`Earn ${truck.unlockAt} stars to unlock ${truck.name}!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    setActiveTruck(truck.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    say(truck.sound, 0.85, 1.0);
  };

  const doBuildAction = useCallback(() => {
    if (!step || completedSteps.has(step.id)) return;
    if (activeTruck !== step.truckNeeded) {
      const needed = TRUCKS.find(t => t.id === step.truckNeeded);
      say(`You need ${needed?.name ?? 'a different truck'} for this step!`);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setFeedback(`Need ${needed?.emoji ?? '🚜'}`);
      setTimeout(() => setFeedback(null), 1200);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    say(step.speech);
    setFeedback(step.effect);

    // Truck drives in
    truckX.setValue(-W * 0.6);
    Animated.sequence([
      Animated.timing(truckX, { toValue: W * 0.3, duration: 700, useNativeDriver: true }),
      Animated.spring(truckBounce, { toValue: -14, tension: 180, friction: 4, useNativeDriver: true }),
      Animated.spring(truckBounce, { toValue: 0, tension: 100, friction: 6, useNativeDriver: true }),
    ]).start();

    // Dust puff
    Animated.sequence([
      Animated.timing(dustAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.timing(dustAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();

    // Step block appears
    const anim = stepAnims[projectIndex][currentStep];
    Animated.spring(anim, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }).start();

    const newDone   = new Set([...completedSteps, step.id]);
    const newStars  = stars + 3;
    const newStep   = currentStep + 1;
    const newUnlocked = [...unlockedTrucks];

    // Unlock trucks by stars
    TRUCKS.forEach(t => {
      if (!newUnlocked.includes(t.id) && newStars >= t.unlockAt) newUnlocked.push(t.id);
    });

    setDone(newDone);
    setStars(newStars);
    setUnlocked(newUnlocked);
    setTimeout(() => {
      setFeedback(null);
      setCurrentStep(newStep);
      if (newStep >= project.steps.length) setShowComplete(true);
      save(newStars, newUnlocked, newStep, newDone, projectIndex);
    }, 1800);
  }, [step, activeTruck, completedSteps, stars, currentStep, unlockedTrucks, projectIndex]);

  const nextProject = () => {
    const next = (projectIndex + 1) % BUILD_PROJECTS.length;
    setProjectIndex(next);
    setCurrentStep(0);
    setDone(new Set());
    setShowComplete(false);
    stepAnims[next].forEach(a => a.setValue(0));
    save(stars, unlockedTrucks, 0, [], next);
  };

  const activeTruckObj = TRUCKS.find(t => t.id === activeTruck) ?? TRUCKS[0];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#FF9F43' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚜 Builder Buddies</Text>
        <View style={styles.starsBadge}><Text style={styles.starsText}>⭐{stars}</Text></View>
      </View>

      {/* Build site */}
      <View style={styles.site}>
        {/* Sky */}
        <View style={styles.sky}>
          <Text style={[styles.cloud, { left: '5%', top: 10 }]}>☁️</Text>
          <Text style={[styles.cloud, { left: '55%', top: 20 }]}>⛅</Text>
          <Text style={[styles.cloud, { left: '80%', top: 8, fontSize: 28 }]}>☁️</Text>
          <Text style={styles.sun}>☀️</Text>
        </View>

        {/* Built steps display */}
        <View style={styles.builtArea}>
          {project.steps.map((s, i) => (
            <Animated.View key={s.id} style={[styles.builtBlock, {
              transform: [{ scale: stepAnims[projectIndex][i] }],
              opacity:    stepAnims[projectIndex][i],
            }]}>
              <Text style={{ fontSize: 28 }}>{s.emoji}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Active truck driving */}
        <Animated.View style={[styles.movingTruck, {
          transform: [{ translateX: truckX }, { translateY: truckBounce }],
        }]}>
          <Text style={{ fontSize: 52 }}>{activeTruckObj.emoji}</Text>
          {/* Dust cloud */}
          <Animated.Text style={[styles.dust, { opacity: dustAnim }]}>💨</Animated.Text>
        </Animated.View>

        {/* Feedback */}
        {feedback && (
          <View style={styles.feedbackBubble}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {/* Ground + tracks */}
        <View style={styles.ground}>
          <View style={styles.tracks} />
        </View>
      </View>

      {/* Current mission card */}
      {!allDone && step && (
        <View style={[styles.missionCard, activeTruck === step.truckNeeded && styles.missionReady]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.missionMeta}>Step {currentStep + 1} / {project.steps.length} · {project.title}</Text>
            <Text style={styles.missionLabel}>{step.label}</Text>
            <Text style={styles.missionNeed}>
              Use: {TRUCKS.find(t => t.id === step.truckNeeded)?.emoji} {TRUCKS.find(t => t.id === step.truckNeeded)?.name}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.goBtn, { backgroundColor: activeTruck === step.truckNeeded ? '#6BCB77' : '#ccc' }]}
            onPress={doBuildAction}
            activeOpacity={0.85}
          >
            <Text style={styles.goBtnText}>{TRUCKS.find(t => t.id === activeTruck)?.action ?? 'GO!'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Truck garage */}
      <View style={styles.garage}>
        <Text style={styles.garageLabel}>Tap a truck to select it</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.truckRow}>
          {TRUCKS.map((truck) => {
            const locked  = !unlockedTrucks.includes(truck.id);
            const active  = activeTruck === truck.id;
            return (
              <TouchableOpacity key={truck.id} onPress={() => tapTruck(truck)} activeOpacity={0.85}
                style={[styles.truckCard, { backgroundColor: truck.color + '30', borderColor: active ? truck.color : '#F5EDD8', borderWidth: active ? 3 : 1.5, opacity: locked ? 0.5 : 1 }]}>
                <Text style={styles.truckEmoji}>{locked ? '🔒' : truck.emoji}</Text>
                <Text style={styles.truckName}>{locked ? `${truck.unlockAt}⭐` : truck.name}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Project complete overlay */}
      {showComplete && (
        <View style={styles.completeOverlay}>
          <Text style={{ fontSize: 80 }}>🎉</Text>
          <Text style={styles.completeTitle}>{project.title.split(' ').slice(1).join(' ')} Complete!</Text>
          <Text style={styles.completeScore}>⭐ {stars} stars earned!</Text>
          <TouchableOpacity style={styles.nextBtn} onPress={nextProject} activeOpacity={0.85}>
            <Text style={styles.nextBtnText}>Next Project! 🚜</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 12 }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Back to games</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#FFF9F0' },
  header:         { flexDirection: 'row', alignItems: 'center', padding: 14 },
  backBtn:        { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:       { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerTitle:    { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#fff' },
  starsBadge:     { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 },
  starsText:      { fontSize: 14, fontWeight: '900', color: '#fff' },
  site:           { flex: 1, position: 'relative', overflow: 'hidden' },
  sky:            { position: 'absolute', top: 0, left: 0, right: 0, height: '60%', backgroundColor: '#87CEEB' },
  cloud:          { position: 'absolute', fontSize: 36, opacity: 0.7 },
  sun:            { position: 'absolute', right: '8%', top: 6, fontSize: 44 },
  builtArea:      { position: 'absolute', bottom: 68, left: 12, flexDirection: 'row', gap: 6, flexWrap: 'wrap', maxWidth: W * 0.6 },
  builtBlock:     { backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 10, padding: 6 },
  movingTruck:    { position: 'absolute', bottom: 62, alignItems: 'center' },
  dust:           { position: 'absolute', right: -20, bottom: 0, fontSize: 24 },
  feedbackBubble: { position: 'absolute', top: '30%', alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8 },
  feedbackText:   { fontSize: 22, fontWeight: '900' },
  ground:         { position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, backgroundColor: '#8D6E63' },
  tracks:         { position: 'absolute', top: 4, left: 0, right: 0, height: 6, backgroundColor: 'rgba(0,0,0,0.15)', borderRadius: 3 },
  missionCard:    { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', margin: 10, borderRadius: 16, padding: 14, borderWidth: 2, borderColor: '#F5EDD8', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  missionReady:   { borderColor: '#6BCB77', backgroundColor: '#F0FFF4' },
  missionMeta:    { fontSize: 10, fontWeight: '800', color: '#8B8178' },
  missionLabel:   { fontSize: 15, fontWeight: '900', color: '#3D3530', marginTop: 2 },
  missionNeed:    { fontSize: 12, fontWeight: '700', color: '#FF9F43', marginTop: 2 },
  goBtn:          { borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12 },
  goBtnText:      { color: '#fff', fontWeight: '900', fontSize: 15 },
  garage:         { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: '#F5EDD8' },
  garageLabel:    { fontSize: 11, fontWeight: '800', color: '#8B8178', marginBottom: 8 },
  truckRow:       { gap: 10, paddingBottom: 4 },
  truckCard:      { alignItems: 'center', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 10, gap: 4, minWidth: 76 },
  truckEmoji:     { fontSize: 32 },
  truckName:      { fontSize: 9, fontWeight: '900', color: '#3D3530', textAlign: 'center' },
  completeOverlay:{ ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.82)', alignItems: 'center', justifyContent: 'center', gap: 14, zIndex: 99 },
  completeTitle:  { fontSize: 30, fontWeight: '900', color: '#fff', textAlign: 'center' },
  completeScore:  { fontSize: 22, color: '#FFD93D', fontWeight: '900' },
  nextBtn:        { backgroundColor: '#FF9F43', borderRadius: 99, paddingHorizontal: 40, paddingVertical: 16 },
  nextBtnText:    { color: '#fff', fontSize: 18, fontWeight: '900' },
});
