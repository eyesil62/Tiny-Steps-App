// ============================================================
// TinySteps — Touch World Engine
// Reusable engine for ALL mini-world games
// Busy Town, Pet Care, Bath Time, Magic Kitchen all use this
// ============================================================

import React, { useRef, useCallback, useState } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  StyleSheet, Dimensions, ScrollView,
} from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width: W, height: H } = Dimensions.get('window');

// ── Types ────────────────────────────────────────────────────

export type AnimationType =
  | 'bounce'   // jumps up and comes back
  | 'spin'     // rotates 360
  | 'wiggle'   // shakes left/right
  | 'pulse'    // grows/shrinks
  | 'flash'    // flickers
  | 'slide-up' // moves up briefly
  | 'none';

export interface WorldObject {
  id:          string;
  emoji:       string;
  x:           number; // % of scene width (0–100)
  y:           number; // % of scene height (0–100)
  size:        number; // emoji font size
  speech:      string; // what to say when tapped
  reaction:    string; // emoji popup on tap (e.g. "💦" for water splash)
  animation:   AnimationType;
  label?:      string; // optional label under object
  zIndex?:     number;
  // Optional: toggle state (e.g. light on/off)
  toggle?:     { off: string; on: string; speechOn: string; speechOff: string };
}

export interface WorldScene {
  id:         string;
  title:      string;
  bg:         string; // background colour
  bgEmoji?:   string; // large background decoration
  objects:    WorldObject[];
  // Optional sky/ground colours
  skyColor?:  string;
  groundColor?: string;
  groundHeight?: number;
}

export interface TouchWorldConfig {
  title:       string;
  emoji:       string;
  color:       string;
  scenes:      WorldScene[];
  onStarEarned?: (stars: number) => void;
}

// ── Per-object animated state ─────────────────────────────────

interface ObjState {
  anim:        Animated.Value;
  rotateAnim:  Animated.Value;
  scaleAnim:   Animated.Value;
  reaction:    string | null;
  toggleOn:    boolean;
}

function createObjState(): ObjState {
  return {
    anim:       new Animated.Value(0),
    rotateAnim: new Animated.Value(0),
    scaleAnim:  new Animated.Value(1),
    reaction:   null,
    toggleOn:   false,
  };
}

// ── Animation runners ────────────────────────────────────────

function runAnimation(type: AnimationType, state: ObjState) {
  const { anim, rotateAnim, scaleAnim } = state;

  switch (type) {
    case 'bounce':
      Animated.sequence([
        Animated.timing(anim, { toValue: -22, duration: 180, useNativeDriver: true }),
        Animated.spring(anim, { toValue: 0, tension: 120, friction: 5, useNativeDriver: true }),
      ]).start();
      break;

    case 'spin':
      Animated.timing(rotateAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => {
        rotateAnim.setValue(0);
      });
      break;

    case 'wiggle':
      Animated.sequence([
        Animated.timing(anim, { toValue: 10,  duration: 70, useNativeDriver: true }),
        Animated.timing(anim, { toValue: -10, duration: 70, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 8,   duration: 70, useNativeDriver: true }),
        Animated.timing(anim, { toValue: -8,  duration: 70, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0,   duration: 70, useNativeDriver: true }),
      ]).start();
      break;

    case 'pulse':
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.35, duration: 160, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1,    tension: 100, friction: 4, useNativeDriver: true }),
      ]).start();
      break;

    case 'slide-up':
      Animated.sequence([
        Animated.timing(anim, { toValue: -18, duration: 200, useNativeDriver: true }),
        Animated.spring(anim,  { toValue: 0,  tension: 80,  friction: 6, useNativeDriver: true }),
      ]).start();
      break;

    case 'flash':
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.1, duration: 100, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1.0, duration: 100, useNativeDriver: true }),
      ]).start();
      break;
  }
}

// ── Safe speech ───────────────────────────────────────────────

function safeSpeak(text: string) {
  Speech.isSpeakingAsync().then(speaking => {
    const doSpeak = () => {
      try {
        Speech.speak(text, {
          language: 'en-US',
          rate:  0.78,
          pitch: 1.15,
        });
      } catch {}
    };
    if (speaking) {
      Speech.stop().then(doSpeak).catch(doSpeak);
    } else {
      setTimeout(doSpeak, 120);
    }
  }).catch(() => {
    setTimeout(() => {
      try { Speech.speak(text, { language: 'en-US', rate: 0.78, pitch: 1.15 }); } catch {}
    }, 120);
  });
}

// ── Main Engine Component ─────────────────────────────────────

interface Props {
  config:   TouchWorldConfig;
  onBack:   () => void;
}

export function TouchWorldEngine({ config, onBack }: Props) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [stars,      setStars]      = useState(0);
  const [taps,       setTaps]       = useState(0);
  // Per-object state stored in ref map
  const objStates = useRef<Map<string, ObjState>>(new Map());
  const [, forceUpdate] = useState(0);

  const scene = config.scenes[sceneIndex];

  function getObjState(id: string): ObjState {
    if (!objStates.current.has(id)) {
      objStates.current.set(id, createObjState());
    }
    return objStates.current.get(id)!;
  }

  const handleTap = useCallback((obj: WorldObject) => {
    const state = getObjState(obj.id);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Handle toggle objects (e.g. light switch)
    let speech = obj.speech;
    if (obj.toggle) {
      state.toggleOn = !state.toggleOn;
      speech = state.toggleOn ? obj.toggle.speechOn : obj.toggle.speechOff;
    }

    // Play sound
    safeSpeak(speech);

    // Run animation
    runAnimation(obj.animation, state);

    // Show reaction emoji
    state.reaction = obj.reaction;
    forceUpdate(n => n + 1);
    setTimeout(() => {
      state.reaction = null;
      forceUpdate(n => n + 1);
    }, 1200);

    // Award star every 5 taps
    const newTaps = taps + 1;
    setTaps(newTaps);
    if (newTaps % 5 === 0) {
      setStars(s => s + 1);
      config.onStarEarned?.(stars + 1);
    }
  }, [taps, stars, config]);

  const goScene = (dir: 1 | -1) => {
    const next = sceneIndex + dir;
    if (next >= 0 && next < config.scenes.length) {
      setSceneIndex(next);
    }
  };

  const groundH = scene.groundHeight ?? 80;

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: config.color }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.8}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerEmoji}>{config.emoji}</Text>
          <Text style={styles.headerTitle}>{scene.title}</Text>
        </View>
        <View style={styles.starsBadge}>
          <Text style={styles.starsText}>⭐{stars}</Text>
        </View>
      </View>

      {/* Scene */}
      <View style={[styles.scene, { backgroundColor: scene.skyColor ?? scene.bg }]}>

        {/* Background decoration */}
        {scene.bgEmoji && (
          <Text style={styles.bgEmoji}>{scene.bgEmoji}</Text>
        )}

        {/* Objects */}
        {scene.objects.map((obj) => {
          const state = getObjState(obj.id);
          const rotate = state.rotateAnim.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          });
          const isToggleOn = obj.toggle && state.toggleOn;
          const displayEmoji = isToggleOn ? obj.toggle!.on : obj.emoji;

          return (
            <TouchableOpacity
              key={obj.id}
              onPress={() => handleTap(obj)}
              activeOpacity={0.75}
              style={[
                styles.objWrap,
                {
                  left:   `${obj.x}%`,
                  top:    `${obj.y}%`,
                  zIndex: obj.zIndex ?? 10,
                },
              ]}
            >
              <Animated.View style={{
                transform: [
                  { translateY: state.anim },
                  { translateX: obj.animation === 'wiggle' ? state.anim : 0 },
                  { rotate },
                  { scale: state.scaleAnim },
                ],
              }}>
                <Text style={[styles.objEmoji, { fontSize: obj.size }]}>
                  {displayEmoji}
                </Text>
              </Animated.View>

              {/* Reaction popup */}
              {state.reaction && (
                <View style={styles.reactionBubble}>
                  <Text style={styles.reactionEmoji}>{state.reaction}</Text>
                </View>
              )}

              {/* Label */}
              {obj.label && (
                <Text style={styles.objLabel}>{obj.label}</Text>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Ground strip */}
        <View style={[styles.ground, { height: groundH, backgroundColor: scene.groundColor ?? '#8BC34A' }]}>
          <View style={[styles.groundTop, { backgroundColor: scene.groundColor ? `${scene.groundColor}BB` : '#7CB342' }]} />
        </View>
      </View>

      {/* Scene navigation */}
      {config.scenes.length > 1 && (
        <View style={styles.sceneNav}>
          <TouchableOpacity
            onPress={() => goScene(-1)}
            style={[styles.navBtn, sceneIndex === 0 && styles.navBtnDisabled]}
            disabled={sceneIndex === 0}
            activeOpacity={0.8}
          >
            <Text style={styles.navBtnText}>◀</Text>
          </TouchableOpacity>

          {/* Scene dots */}
          <View style={styles.sceneDots}>
            {config.scenes.map((_, i) => (
              <TouchableOpacity key={i} onPress={() => setSceneIndex(i)}>
                <View style={[styles.dot, i === sceneIndex && { backgroundColor: config.color, width: 20 }]} />
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => goScene(1)}
            style={[styles.navBtn, sceneIndex === config.scenes.length - 1 && styles.navBtnDisabled]}
            disabled={sceneIndex === config.scenes.length - 1}
            activeOpacity={0.8}
          >
            <Text style={styles.navBtnText}>▶</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Hint */}
      <Text style={styles.hint}>👆 Tap everything!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root:          { flex: 1, backgroundColor: '#87CEEB' },
  header:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, paddingTop: 20 },
  backBtn:       { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:      { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerCenter:  { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  headerEmoji:   { fontSize: 24 },
  headerTitle:   { fontSize: 17, fontWeight: '900', color: '#fff' },
  starsBadge:    { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  starsText:     { fontSize: 15, fontWeight: '900', color: '#fff' },
  scene:         { flex: 1, position: 'relative', overflow: 'hidden' },
  bgEmoji:       { position: 'absolute', fontSize: 160, opacity: 0.06, alignSelf: 'center', top: '10%' },
  objWrap:       { position: 'absolute', alignItems: 'center' },
  objEmoji:      { textAlign: 'center' },
  reactionBubble:{ position: 'absolute', top: -30, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, zIndex: 99 },
  reactionEmoji: { fontSize: 22 },
  objLabel:      { fontSize: 10, fontWeight: '800', color: '#3D3530', textAlign: 'center', marginTop: 2, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 8, paddingHorizontal: 4 },
  ground:        { position: 'absolute', bottom: 0, left: 0, right: 0 },
  groundTop:     { height: 10, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  sceneNav:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'rgba(255,255,255,0.95)' },
  navBtn:        { backgroundColor: '#fff', borderRadius: 20, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  navBtnDisabled:{ opacity: 0.3 },
  navBtnText:    { fontSize: 18, fontWeight: '900', color: '#3D3530' },
  sceneDots:     { flexDirection: 'row', gap: 8, alignItems: 'center' },
  dot:           { width: 8, height: 8, borderRadius: 4, backgroundColor: '#C0B5AE' },
  hint:          { textAlign: 'center', fontSize: 12, fontWeight: '700', color: '#8B8178', paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.95)' },
});
