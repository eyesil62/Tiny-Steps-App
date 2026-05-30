// ============================================================
// 🚜 Little Builder Trucks — Ages 2–4
// Drive digger, dump truck, crane — build a bridge step by step
// ============================================================
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width: W } = Dimensions.get('window');

function safeSpeak(text: string, rate = 0.8, pitch = 1.1) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 130);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} }, 130));
}

// Build steps — complete them in order
const BUILD_STEPS = [
  { id: 'dig',     truck: '🚜', label: 'Dig the ground',   speech: 'Dig dig dig! Moving the dirt!',          emoji: '🟫', effect: 'Digging...' },
  { id: 'dump',    truck: '🚛', label: 'Dump the rocks',   speech: 'Dump the heavy rocks! Crash!',            emoji: '🪨', effect: 'Dumping!' },
  { id: 'crane',   truck: '🏗️', label: 'Lift the beams',  speech: 'The crane lifts the heavy beams! Whirr!', emoji: '🔩', effect: 'Lifting!' },
  { id: 'mix',     truck: '🚚', label: 'Pour the cement',  speech: 'Swoosh! Cement fills the gaps!',          emoji: '🪣', effect: 'Pouring!' },
  { id: 'pave',    truck: '🚜', label: 'Pave the road',    speech: 'Smooth it out! Nice flat road!',          emoji: '🛣️', effect: 'Paving!' },
  { id: 'paint',   truck: '🖌️', label: 'Paint the lines',  speech: 'White lines! Cars know where to go!',     emoji: '⬜', effect: 'Painting!' },
  { id: 'finish',  truck: '🎉', label: 'Bridge complete!', speech: 'Hooray! The bridge is finished! Well done builder!', emoji: '🌉', effect: '🎉' },
];

const TRUCKS = [
  { id: 'digger',  emoji: '🚜', name: 'Digger',    sound: 'Rumble rumble! Digger digs deep holes!',  color: '#FFD93D' },
  { id: 'dump',    emoji: '🚛', name: 'Dump Truck', sound: 'Vrroom! Dump truck carries heavy rocks!', color: '#FF9F43' },
  { id: 'crane',   emoji: '🏗️', name: 'Crane',     sound: 'Whirr! Crane lifts heavy things up high!',color: '#FF6B6B' },
  { id: 'mixer',   emoji: '🚚', name: 'Mixer',     sound: 'Swoosh! Mixer mixes the cement!',         color: '#6BCB77' },
  { id: 'roller',  emoji: '🛞', name: 'Roller',    sound: 'Rrrroll! Roller makes the road smooth!',  color: '#4D96FF' },
];

export default function LittleBuilderGame() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stars,       setStars]       = useState(0);
  const [completed,   setCompleted]   = useState<Set<string>>(new Set());
  const [activeTruck, setActiveTruck] = useState<string | null>(null);
  const [feedback,    setFeedback]    = useState<string | null>(null);

  // Animated values per step
  const stepAnims = useRef(BUILD_STEPS.map(() => new Animated.Value(0))).current;
  const truckX    = useRef(new Animated.Value(-60)).current;
  const truckBounce = useRef(new Animated.Value(0)).current;

  const step = BUILD_STEPS[currentStep];
  const isFinished = currentStep >= BUILD_STEPS.length - 1 && completed.has('finish');

  const driveIn = useCallback(() => {
    Animated.sequence([
      Animated.timing(truckX, { toValue: W / 2 - 60, duration: 800, useNativeDriver: true }),
      Animated.spring(truckBounce, { toValue: -12, tension: 120, friction: 5, useNativeDriver: true }),
      Animated.spring(truckBounce, { toValue: 0, tension: 80, friction: 6, useNativeDriver: true }),
    ]).start();
  }, []);

  const doBuildStep = useCallback(() => {
    if (completed.has(step.id)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    safeSpeak(step.speech);
    setActiveTruck(step.id);
    setFeedback(step.effect);

    // Animate the step building
    Animated.spring(stepAnims[currentStep], {
      toValue: 1, tension: 80, friction: 6, useNativeDriver: true,
    }).start();

    driveIn();

    setTimeout(() => {
      setCompleted(prev => new Set([...prev, step.id]));
      setStars(s => s + 3);
      setActiveTruck(null);
      setFeedback(null);

      if (currentStep < BUILD_STEPS.length - 1) {
        setTimeout(() => {
          setCurrentStep(n => n + 1);
          truckX.setValue(-60);
        }, 600);
      }
    }, 2000);
  }, [step, currentStep, completed, stepAnims, driveIn]);

  const tapTruck = (truck: typeof TRUCKS[0]) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    safeSpeak(truck.sound);
    setFeedback(truck.emoji);
    setTimeout(() => setFeedback(null), 1200);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🚜 Little Builder</Text>
        <View style={styles.starsBadge}><Text style={styles.starsText}>⭐{stars}</Text></View>
      </View>

      {/* Build site */}
      <View style={styles.buildSite}>
        {/* Sky */}
        <View style={styles.sky}>
          <Text style={styles.skyEmoji}>☁️</Text>
          <Text style={[styles.skyEmoji, { left: '55%', top: 20, fontSize: 32 }]}>⛅</Text>
          <Text style={[styles.skyEmoji, { left: '80%', top: 8, fontSize: 26 }]}>☁️</Text>
        </View>

        {/* Build progress — show completed steps */}
        <View style={styles.buildProgress}>
          {BUILD_STEPS.slice(0, currentStep + 1).map((s, i) => (
            <Animated.View
              key={s.id}
              style={[styles.buildBlock, { transform: [{ scale: stepAnims[i] }], opacity: stepAnims[i] }]}
            >
              <Text style={styles.buildBlockEmoji}>{s.emoji}</Text>
            </Animated.View>
          ))}
        </View>

        {/* Active truck driving across */}
        {activeTruck && (
          <Animated.View style={[styles.movingTruck, { transform: [{ translateX: truckX }, { translateY: truckBounce }] }]}>
            <Text style={{ fontSize: 48 }}>{step.truck}</Text>
            {feedback && (
              <View style={styles.truckBubble}>
                <Text style={styles.truckBubbleText}>{feedback}</Text>
              </View>
            )}
          </Animated.View>
        )}

        {/* Ground */}
        <View style={styles.ground} />
      </View>

      {/* Current mission */}
      <View style={[styles.missionCard, completed.has(step.id) && styles.missionDone]}>
        <Text style={styles.missionEmoji}>{step.truck}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.missionStep}>Step {currentStep + 1} of {BUILD_STEPS.length}</Text>
          <Text style={styles.missionLabel}>{step.label}</Text>
        </View>
        {!completed.has(step.id)
          ? (
            <TouchableOpacity style={styles.goBtn} onPress={doBuildStep} activeOpacity={0.85}>
              <Text style={styles.goBtnText}>GO! 🚀</Text>
            </TouchableOpacity>
          )
          : <Text style={styles.doneCheck}>✓</Text>
        }
      </View>

      {/* Truck parade — tap any truck to hear it */}
      <View style={styles.truckRow}>
        <Text style={styles.truckRowLabel}>Tap the trucks! 👆</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trucks}>
          {TRUCKS.map((truck) => (
            <TouchableOpacity
              key={truck.id}
              style={[styles.truckCard, { backgroundColor: truck.color + '30', borderColor: truck.color }]}
              onPress={() => tapTruck(truck)}
              activeOpacity={0.8}
            >
              <Text style={styles.truckEmoji}>{truck.emoji}</Text>
              <Text style={styles.truckName}>{truck.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Win screen overlay */}
      {isFinished && (
        <View style={styles.winOverlay}>
          <Text style={{ fontSize: 80 }}>🌉</Text>
          <Text style={styles.winTitle}>Bridge Built!</Text>
          <Text style={styles.winScore}>⭐ {stars} stars</Text>
          <TouchableOpacity style={styles.winBtn} onPress={() => {
            setCurrentStep(0); setCompleted(new Set()); setStars(0);
            truckX.setValue(-60); stepAnims.forEach(a => a.setValue(0));
          }}>
            <Text style={styles.winBtnText}>Build Again! 🚜</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 10 }}>
            <Text style={{ color: '#fff', fontWeight: '800' }}>Back to games</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: '#FFF9F0' },
  header:         { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#FF9F43' },
  backBtn:        { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:       { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerTitle:    { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#fff' },
  starsBadge:     { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 5 },
  starsText:      { fontSize: 14, fontWeight: '900', color: '#fff' },
  buildSite:      { flex: 1, position: 'relative', overflow: 'hidden' },
  sky:            { position: 'absolute', top: 0, left: 0, right: 0, height: '60%', backgroundColor: '#87CEEB' },
  skyEmoji:       { position: 'absolute', fontSize: 38, left: '5%', top: 12 },
  buildProgress:  { position: 'absolute', bottom: 70, left: 16, flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  buildBlock:     { backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 12, padding: 8 },
  buildBlockEmoji:{ fontSize: 32 },
  movingTruck:    { position: 'absolute', bottom: 62, alignItems: 'center' },
  truckBubble:    { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 4, marginTop: 4 },
  truckBubbleText:{ fontSize: 16, fontWeight: '900' },
  ground:         { position: 'absolute', bottom: 0, left: 0, right: 0, height: 60, backgroundColor: '#8BC34A' },
  missionCard:    { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', padding: 14, marginHorizontal: 12, borderRadius: 16, borderWidth: 2, borderColor: '#FF9F43', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  missionDone:    { borderColor: '#6BCB77', backgroundColor: '#E5F7E7' },
  missionEmoji:   { fontSize: 36 },
  missionStep:    { fontSize: 11, fontWeight: '800', color: '#8B8178' },
  missionLabel:   { fontSize: 15, fontWeight: '900', color: '#3D3530' },
  goBtn:          { backgroundColor: '#FF9F43', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 10 },
  goBtnText:      { color: '#fff', fontWeight: '900', fontSize: 15 },
  doneCheck:      { fontSize: 28, color: '#6BCB77', fontWeight: '900' },
  truckRow:       { backgroundColor: '#fff', paddingVertical: 10, paddingHorizontal: 12 },
  truckRowLabel:  { fontSize: 12, fontWeight: '800', color: '#8B8178', marginBottom: 8 },
  trucks:         { gap: 10, paddingBottom: 4 },
  truckCard:      { alignItems: 'center', borderRadius: 14, borderWidth: 2, paddingHorizontal: 14, paddingVertical: 10, gap: 4 },
  truckEmoji:     { fontSize: 34 },
  truckName:      { fontSize: 10, fontWeight: '900', color: '#3D3530' },
  winOverlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 99 },
  winTitle:       { fontSize: 38, fontWeight: '900', color: '#fff' },
  winScore:       { fontSize: 22, color: '#FFD93D', fontWeight: '900' },
  winBtn:         { backgroundColor: '#FF9F43', borderRadius: 99, paddingHorizontal: 40, paddingVertical: 16 },
  winBtnText:     { color: '#fff', fontSize: 18, fontWeight: '900' },
});
