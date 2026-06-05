// ============================================================
// TinyTown Adventures — Ages 2–6
// Open-ended pretend play with daily missions & unlock system
// Original game: all code, names, concepts original to TinySteps
// ============================================================
import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  StyleSheet, Dimensions, ScrollView, Modal,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width: W, height: H } = Dimensions.get('window');
const STORE_KEY = 'tinytownadv_v1';

// ── Safe speech ────────────────────────────────────────────
function say(text: string, rate = 0.82, pitch = 1.1) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 140);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} }, 140));
}

// ── Scene definitions ──────────────────────────────────────
interface TownObject {
  id: string;
  emoji: string;
  label: string;
  x: number; y: number;   // % of scene
  size: number;
  animType: 'bounce' | 'wiggle' | 'spin' | 'pulse' | 'slide';
  speech: string;
  reaction: string;
  toggle?: { on: string; off: string; speechOn: string; speechOff: string };
  zIndex?: number;
}

interface Scene {
  id: string;
  name: string;
  emoji: string;
  skyColor: string;
  groundColor: string;
  unlockStars: number;
  objects: TownObject[];
  mission: string;
  missionEmoji: string;
  missionObject: string; // id of object that completes mission
}

const SCENES: Scene[] = [
  // ── HOUSE ────────────────────────────────────────────────
  {
    id: 'house', name: 'Home Street', emoji: '🏠',
    skyColor: '#87CEEB', groundColor: '#8BC34A', unlockStars: 0,
    mission: 'Ring the doorbell!', missionEmoji: '🔔', missionObject: 'doorbell',
    objects: [
      { id: 'sun',      emoji: '☀️', label: 'Sun',       x: 75, y: 3,  size: 48, animType: 'spin',   speech: 'The warm sun shines on TinyTown!', reaction: '✨' },
      { id: 'cloud1',   emoji: '☁️', label: 'Cloud',     x: 8,  y: 7,  size: 40, animType: 'wiggle', speech: 'Fluffy white cloud drifting by!', reaction: '💨' },
      { id: 'house1',   emoji: '🏠', label: 'House',     x: 15, y: 25, size: 66, animType: 'pulse',  speech: 'A cosy house where a family lives!', reaction: '❤️' },
      { id: 'doorbell', emoji: '🔔', label: 'Doorbell',  x: 32, y: 50, size: 36, animType: 'wiggle', speech: 'Ding dong! Someone is at the door!', reaction: '🔔' },
      {
        id: 'light', emoji: '💡', label: 'Light',
        x: 58, y: 30, size: 38, animType: 'pulse',
        speech: 'Click! The lights are on!', reaction: '💡',
        toggle: { on: '💡', off: '🔦', speechOn: 'Lights on! So bright!', speechOff: 'Lights off. Night night!' },
      },
      { id: 'cat',      emoji: '🐱', label: 'Cat',       x: 44, y: 58, size: 38, animType: 'bounce', speech: 'Meow! The house cat is sunbathing!', reaction: '😸' },
      { id: 'mailbox',  emoji: '📬', label: 'Mailbox',   x: 6,  y: 60, size: 38, animType: 'wiggle', speech: 'The mailbox has a letter! Someone sent mail!', reaction: '📧' },
      { id: 'flowers',  emoji: '🌷', label: 'Flowers',   x: 72, y: 58, size: 36, animType: 'wiggle', speech: 'Pretty flowers in the garden!', reaction: '🌸' },
      { id: 'tree',     emoji: '🌳', label: 'Tree',      x: 83, y: 28, size: 54, animType: 'wiggle', speech: 'A big oak tree! Birds nest in it!', reaction: '🐦' },
      { id: 'bird',     emoji: '🐦', label: 'Bird',      x: 50, y: 18, size: 30, animType: 'spin',   speech: 'Tweet tweet! A bird flying home!', reaction: '🎵' },
      { id: 'dog',      emoji: '🐕', label: 'Dog',       x: 22, y: 68, size: 40, animType: 'bounce', speech: 'Woof woof! The dog guards the house!', reaction: '🦴' },
      { id: 'car',      emoji: '🚗', label: 'Car',       x: 60, y: 65, size: 44, animType: 'slide',  speech: 'Vroom! The family car is in the drive!', reaction: '💨' },
    ],
  },

  // ── PARK ─────────────────────────────────────────────────
  {
    id: 'park', name: 'Sunshine Park', emoji: '🌳',
    skyColor: '#C8E6FF', groundColor: '#4CAF50', unlockStars: 0,
    mission: 'Feed the birds!', missionEmoji: '🐦', missionObject: 'seeds',
    objects: [
      { id: 'rainbow',  emoji: '🌈', label: 'Rainbow',   x: 25, y: 2,  size: 80, animType: 'pulse',  speech: 'A beautiful rainbow! Red, orange, yellow, green, blue, violet!', reaction: '✨' },
      { id: 'slide',    emoji: '🛝', label: 'Slide',     x: 5,  y: 28, size: 62, animType: 'bounce', speech: 'Wheeeee! The slide is so much fun!', reaction: '😄' },
      { id: 'swing',    emoji: '🎠', label: 'Swings',    x: 30, y: 30, size: 56, animType: 'wiggle', speech: 'Swings go up up up and back again!', reaction: '🎉' },
      { id: 'seeds',    emoji: '🌾', label: 'Bird Seeds',x: 55, y: 60, size: 40, animType: 'bounce', speech: 'Bird seeds! The pigeons love these!', reaction: '🐦' },
      { id: 'duck-pond',emoji: '🦆', label: 'Duck Pond', x: 70, y: 45, size: 52, animType: 'wiggle', speech: 'Quack quack! Ducks swimming in the pond!', reaction: '💦' },
      { id: 'bench',    emoji: '🪑', label: 'Bench',     x: 42, y: 55, size: 40, animType: 'pulse',  speech: 'A park bench for resting on!', reaction: '😌' },
      { id: 'balloon',  emoji: '🎈', label: 'Balloon',   x: 82, y: 20, size: 38, animType: 'bounce', speech: 'A red balloon floating up up up!', reaction: '🎊' },
      { id: 'butterfly',emoji: '🦋', label: 'Butterfly', x: 48, y: 22, size: 36, animType: 'spin',   speech: 'A beautiful butterfly dancing!', reaction: '🌸' },
      { id: 'icecream', emoji: '🍦', label: 'Ice Cream', x: 60, y: 28, size: 40, animType: 'wiggle', speech: 'Ice cream van! What flavour would you like?', reaction: '😋' },
      { id: 'kite',     emoji: '🪁', label: 'Kite',      x: 85, y: 8,  size: 40, animType: 'wiggle', speech: 'A kite dancing in the breeze!', reaction: '💨' },
      { id: 'squirrel', emoji: '🐿️', label: 'Squirrel', x: 18, y: 52, size: 36, animType: 'bounce', speech: 'A squirrel collecting nuts for winter!', reaction: '🌰' },
    ],
  },

  // ── BAKERY ────────────────────────────────────────────────
  {
    id: 'bakery', name: 'Honey Bakery', emoji: '🥐',
    skyColor: '#FFF3E0', groundColor: '#A0522D', unlockStars: 5,
    mission: 'Ring the shop bell!', missionEmoji: '🛎️', missionObject: 'shop-bell',
    objects: [
      { id: 'bakery-sign',emoji: '🥐', label: 'Bakery',    x: 30, y: 10, size: 60, animType: 'pulse',  speech: 'Welcome to Honey Bakery! Fresh bread every morning!', reaction: '🍞' },
      { id: 'shop-bell', emoji: '🛎️', label: 'Shop Bell', x: 55, y: 28, size: 42, animType: 'wiggle', speech: 'Ding! Welcome to the bakery!', reaction: '🔔' },
      { id: 'bread',     emoji: '🍞', label: 'Bread',      x: 8,  y: 40, size: 44, animType: 'bounce', speech: 'Fresh warm bread! It smells amazing!', reaction: '😋' },
      { id: 'croissant', emoji: '🥐', label: 'Croissant',  x: 24, y: 40, size: 44, animType: 'wiggle', speech: 'A buttery croissant! C R O I S S A N T!', reaction: '🧈' },
      { id: 'cake',      emoji: '🎂', label: 'Cake',       x: 42, y: 38, size: 48, animType: 'pulse',  speech: 'A birthday cake! Somebody is celebrating!', reaction: '🎉' },
      { id: 'cookies',   emoji: '🍪', label: 'Cookies',    x: 62, y: 42, size: 44, animType: 'bounce', speech: 'Chocolate chip cookies! Still warm!', reaction: '🍫' },
      { id: 'oven',      emoji: '🫕', label: 'Oven',       x: 76, y: 35, size: 48, animType: 'pulse',  speech: 'The oven is baking! I can smell cinnamon!', reaction: '🔥' },
      { id: 'chef',      emoji: '👨‍🍳', label: 'Chef',      x: 12, y: 55, size: 46, animType: 'wiggle', speech: 'Hello! I am Chef Marco! What would you like?', reaction: '👋' },
      { id: 'cupcakes',  emoji: '🧁', label: 'Cupcakes',   x: 52, y: 58, size: 40, animType: 'bounce', speech: 'Pink frosted cupcakes! My favourite!', reaction: '💗' },
      { id: 'honey',     emoji: '🍯', label: 'Honey',      x: 80, y: 55, size: 38, animType: 'wiggle', speech: 'Golden honey from our bees!', reaction: '🐝' },
    ],
  },

  // ── FIRE STATION ─────────────────────────────────────────
  {
    id: 'firestation', name: 'Brave Fire Station', emoji: '🚒',
    skyColor: '#FFE0E0', groundColor: '#696969', unlockStars: 10,
    mission: 'Ring the alarm bell!', missionEmoji: '🔔', missionObject: 'alarm',
    objects: [
      { id: 'station',  emoji: '🏚️', label: 'Station',    x: 20, y: 20, size: 70, animType: 'pulse',  speech: 'TinyTown Fire Station! Heroes live here!', reaction: '⭐' },
      { id: 'firetruck',emoji: '🚒', label: 'Fire Truck', x: 5,  y: 55, size: 60, animType: 'bounce', speech: 'Nee naw nee naw! Fire truck to the rescue!', reaction: '🔥' },
      { id: 'alarm',    emoji: '🔔', label: 'Alarm Bell', x: 52, y: 35, size: 44, animType: 'wiggle', speech: 'RING RING! Emergency alert! Everyone to the truck!', reaction: '🚨', zIndex: 20 },
      { id: 'hose',     emoji: '🚿', label: 'Hose',       x: 68, y: 50, size: 42, animType: 'wiggle', speech: 'Whoosh! The fire hose sprays water!', reaction: '💦' },
      { id: 'ladder',   emoji: '🪜', label: 'Ladder',     x: 38, y: 42, size: 52, animType: 'pulse',  speech: 'The tall ladder reaches the roof!', reaction: '⬆️' },
      { id: 'helmet',   emoji: '⛑️', label: 'Helmet',     x: 78, y: 40, size: 44, animType: 'bounce', speech: 'A firefighter\'s helmet keeps them safe!', reaction: '💪' },
      { id: 'firefighter',emoji:'👨‍🚒',label:'Firefighter', x: 52, y: 58, size: 46, animType: 'wiggle', speech: 'I am Firefighter Sam! I help keep TinyTown safe!', reaction: '🦸' },
      { id: 'dalmatian',emoji: '🐕', label: 'Station Dog', x: 22, y: 65, size: 40, animType: 'bounce', speech: 'Woof! That\'s Spotty the station dog!', reaction: '❤️' },
      {
        id: 'siren', emoji: '🔴', label: 'Siren',
        x: 82, y: 25, size: 36, animType: 'pulse',
        speech: 'The siren is on!', reaction: '🚨',
        toggle: { on: '🔴', off: '🔵', speechOn: 'Wee woo wee woo! Emergency!', speechOff: 'All clear! The siren is off.' },
      },
    ],
  },

  // ── DOCTOR CLINIC ────────────────────────────────────────
  {
    id: 'clinic', name: 'Happy Health Clinic', emoji: '🏥',
    skyColor: '#E8F5E9', groundColor: '#78909C', unlockStars: 15,
    mission: 'Find the stethoscope!', missionEmoji: '🩺', missionObject: 'stethoscope',
    objects: [
      { id: 'clinic',    emoji: '🏥', label: 'Clinic',     x: 22, y: 18, size: 68, animType: 'pulse',  speech: 'Happy Health Clinic! Doctors help people here!', reaction: '💊' },
      { id: 'doctor',    emoji: '👩‍⚕️',label: 'Doctor',    x: 8,  y: 50, size: 52, animType: 'wiggle', speech: 'Hello! I am Doctor Patel. How can I help you today?', reaction: '😊' },
      { id: 'stethoscope',emoji:'🩺',label:'Stethoscope',  x: 50, y: 38, size: 46, animType: 'bounce', speech: 'A stethoscope! Doctors use it to hear your heartbeat! Ba-bump ba-bump!', reaction: '❤️' },
      { id: 'bandage',   emoji: '🩹', label: 'Bandage',    x: 68, y: 42, size: 40, animType: 'wiggle', speech: 'A plaster! It helps small cuts heal!', reaction: '💊' },
      { id: 'medicine',  emoji: '💊', label: 'Medicine',   x: 36, y: 52, size: 40, animType: 'pulse',  speech: 'Medicine helps us feel better when we are sick!', reaction: '🌡️' },
      { id: 'ambulance', emoji: '🚑', label: 'Ambulance',  x: 72, y: 60, size: 56, animType: 'bounce', speech: 'Wee woo! The ambulance helps people quickly!', reaction: '⚡' },
      { id: 'apple',     emoji: '🍎', label: 'Apple',      x: 14, y: 68, size: 36, animType: 'bounce', speech: 'An apple a day keeps the doctor away! But it is nice to visit!', reaction: '😄' },
      { id: 'nurse',     emoji: '👨‍⚕️',label:'Nurse',       x: 55, y: 58, size: 48, animType: 'wiggle', speech: 'Hello! I am Nurse Leo! I help patients feel comfortable.', reaction: '💉' },
      { id: 'x-ray',     emoji: '🦴', label: 'X-Ray',      x: 84, y: 32, size: 44, animType: 'pulse',  speech: 'An X-ray shows the bones inside your body!', reaction: '💡' },
    ],
  },

  // ── GROCERY STORE ─────────────────────────────────────────
  {
    id: 'grocery', name: 'Rainbow Grocery', emoji: '🛒',
    skyColor: '#F3E5F5', groundColor: '#5D4037', unlockStars: 20,
    mission: 'Put fruit in the basket!', missionEmoji: '🍎', missionObject: 'basket',
    objects: [
      { id: 'store',    emoji: '🏪', label: 'Store',       x: 20, y: 15, size: 68, animType: 'pulse',  speech: 'Welcome to Rainbow Grocery! Fresh food every day!', reaction: '🌈' },
      { id: 'basket',   emoji: '🧺', label: 'Basket',      x: 55, y: 50, size: 48, animType: 'bounce', speech: 'A shopping basket! Let\'s fill it up with yummy food!', reaction: '🛒' },
      { id: 'apple2',   emoji: '🍎', label: 'Apple',       x: 8,  y: 42, size: 40, animType: 'bounce', speech: 'Red apples! Crunchy and sweet!', reaction: '😋' },
      { id: 'banana',   emoji: '🍌', label: 'Banana',      x: 22, y: 42, size: 40, animType: 'wiggle', speech: 'Yellow bananas! Monkeys love these!', reaction: '🐒' },
      { id: 'broccoli', emoji: '🥦', label: 'Broccoli',    x: 36, y: 42, size: 40, animType: 'wiggle', speech: 'Broccoli! It makes you strong!', reaction: '💪' },
      { id: 'milk',     emoji: '🥛', label: 'Milk',        x: 68, y: 38, size: 40, animType: 'pulse',  speech: 'Cold milk! Great for strong bones!', reaction: '🦴' },
      { id: 'bread2',   emoji: '🍞', label: 'Bread',       x: 80, y: 42, size: 40, animType: 'bounce', speech: 'A loaf of bread! For sandwiches!', reaction: '🥪' },
      { id: 'cashier',  emoji: '👩', label: 'Cashier',     x: 12, y: 60, size: 48, animType: 'wiggle', speech: 'Hello! I am Maria the cashier! Did you find everything?', reaction: '👋' },
      { id: 'scales',   emoji: '⚖️', label: 'Scales',      x: 46, y: 60, size: 42, animType: 'pulse',  speech: 'Scales weigh the fruit and vegetables!', reaction: '📊' },
      { id: 'strawberry',emoji:'🍓', label: 'Strawberry',  x: 70, y: 58, size: 38, animType: 'bounce', speech: 'Juicy red strawberries!', reaction: '❤️' },
    ],
  },

  // ── BUS STOP ─────────────────────────────────────────────
  {
    id: 'busstop', name: 'TinyTown Bus Stop', emoji: '🚌',
    skyColor: '#E3F2FD', groundColor: '#546E7A', unlockStars: 25,
    mission: 'Wave to the bus driver!', missionEmoji: '👋', missionObject: 'bus-driver',
    objects: [
      { id: 'bus-stop-sign',emoji:'🚏',label:'Bus Stop',    x: 20, y: 22, size: 52, animType: 'pulse',  speech: 'Bus Stop Number 7! The bus comes every 10 minutes!', reaction: '🕐' },
      { id: 'bus',      emoji: '🚌', label: 'Big Bus',     x: 45, y: 40, size: 72, animType: 'bounce', speech: 'Honk honk! The TinyTown bus is here! Hop on!', reaction: '🎉' },
      { id: 'bus-driver',emoji:'👨', label: 'Bus Driver',  x: 52, y: 38, size: 36, animType: 'wiggle', speech: 'Hello! I am Driver Tom! Hold on tight, we are off!', reaction: '👋', zIndex: 20 },
      { id: 'old-lady', emoji: '👵', label: 'Passenger',   x: 8,  y: 55, size: 46, animType: 'wiggle', speech: 'Excuse me, is this the bus to the park?', reaction: '🙏' },
      { id: 'child-traveller',emoji:'🧒',label:'Child',    x: 26, y: 58, size: 40, animType: 'bounce', speech: 'I am going to visit my grandma! So excited!', reaction: '😄' },
      { id: 'map',      emoji: '🗺️', label: 'Route Map',  x: 72, y: 30, size: 46, animType: 'pulse',  speech: 'The route map shows all the bus stops!', reaction: '📍' },
      { id: 'rain-cloud',emoji:'🌧️', label: 'Rain Cloud', x: 82, y: 8,  size: 42, animType: 'wiggle', speech: 'Oh no! It is raining! Good thing there is a shelter here!', reaction: '☂️' },
      { id: 'umbrella', emoji: '☂️', label: 'Umbrella',   x: 6,  y: 38, size: 42, animType: 'bounce', speech: 'An umbrella keeps you dry in the rain!', reaction: '💧' },
      { id: 'pigeon',   emoji: '🕊️', label: 'Pigeon',     x: 62, y: 65, size: 36, animType: 'wiggle', speech: 'Coo coo! A pigeon waiting for the bus too!', reaction: '😄' },
    ],
  },
];

// ── Per-object animation state ─────────────────────────────

interface ObjAnim {
  y:        Animated.Value;
  x:        Animated.Value;
  scale:    Animated.Value;
  rotate:   Animated.Value;
  reaction: string | null;
  toggleOn: boolean;
}

function makeAnim(): ObjAnim {
  return { y: new Animated.Value(0), x: new Animated.Value(0), scale: new Animated.Value(1), rotate: new Animated.Value(0), reaction: null, toggleOn: false };
}

function triggerAnim(type: TownObject['animType'], anim: ObjAnim) {
  switch (type) {
    case 'bounce':
      Animated.sequence([
        Animated.spring(anim.y, { toValue: -18, tension: 200, friction: 4, useNativeDriver: true }),
        Animated.spring(anim.y, { toValue: 0,   tension: 120, friction: 6, useNativeDriver: true }),
      ]).start();
      break;
    case 'wiggle':
      Animated.sequence([
        Animated.timing(anim.x, { toValue: 10,  duration: 60, useNativeDriver: true }),
        Animated.timing(anim.x, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(anim.x, { toValue: 8,   duration: 60, useNativeDriver: true }),
        Animated.timing(anim.x, { toValue: -8,  duration: 60, useNativeDriver: true }),
        Animated.timing(anim.x, { toValue: 0,   duration: 60, useNativeDriver: true }),
      ]).start();
      break;
    case 'spin':
      Animated.timing(anim.rotate, { toValue: 1, duration: 500, useNativeDriver: true }).start(() => anim.rotate.setValue(0));
      break;
    case 'pulse':
      Animated.sequence([
        Animated.timing(anim.scale, { toValue: 1.3, duration: 150, useNativeDriver: true }),
        Animated.spring(anim.scale, { toValue: 1, tension: 100, friction: 4, useNativeDriver: true }),
      ]).start();
      break;
    case 'slide':
      Animated.sequence([
        Animated.timing(anim.x, { toValue: 20, duration: 200, useNativeDriver: true }),
        Animated.spring(anim.x, { toValue: 0, tension: 80, friction: 6, useNativeDriver: true }),
      ]).start();
      break;
  }
}

// ── Main Component ─────────────────────────────────────────

interface SavedState { stars: number; unlockedScenes: string[]; completedMissions: string[]; }

export default function TinyTownGame() {
  const [sceneIndex,    setSceneIndex]    = useState(0);
  const [stars,         setStars]         = useState(0);
  const [taps,          setTaps]          = useState(0);
  const [unlockedScenes,setUnlocked]      = useState<string[]>(['house','park']);
  const [completedMissions, setCompleted] = useState<string[]>([]);
  const [showMissionBanner, setShowMission] = useState(false);
  const [missionComplete,   setMissionComplete] = useState(false);
  const [feedback,      setFeedback]      = useState<string | null>(null);
  const [, forceUpdate]                   = useState(0);
  const animMap = useRef<Map<string, ObjAnim>>(new Map());
  const bannerY = useRef(new Animated.Value(-80)).current;

  // Load saved state
  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY).then(raw => {
      if (!raw) return;
      const s: SavedState = JSON.parse(raw);
      setStars(s.stars ?? 0);
      setUnlocked(s.unlockedScenes ?? ['house','park']);
      setCompleted(s.completedMissions ?? []);
    });
  }, []);

  const save = useCallback((s: number, u: string[], c: string[]) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify({ stars: s, unlockedScenes: u, completedMissions: c }));
  }, []);

  const scene = SCENES[sceneIndex];

  function getAnim(id: string): ObjAnim {
    if (!animMap.current.has(id)) animMap.current.set(id, makeAnim());
    return animMap.current.get(id)!;
  }

  // Show scene mission banner on scene change
  useEffect(() => {
    const missionDone = completedMissions.includes(`${scene.id}-mission`);
    if (!missionDone) {
      setShowMission(true);
      Animated.timing(bannerY, { toValue: 0, duration: 400, useNativeDriver: true }).start();
      setTimeout(() => {
        Animated.timing(bannerY, { toValue: -80, duration: 400, useNativeDriver: true }).start(() => setShowMission(false));
      }, 3000);
    }
  }, [sceneIndex]);

  const handleTap = useCallback((obj: TownObject) => {
    const anim = getAnim(obj.id);
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

    // Stars per 3 taps
    const newTaps = taps + 1;
    setTaps(newTaps);
    const newStars = newTaps % 3 === 0 ? stars + 1 : stars;
    if (newTaps % 3 === 0) {
      setStars(newStars);
      setFeedback('+1 ⭐');
      setTimeout(() => setFeedback(null), 900);
    }

    // Mission completion check
    const missionKey = `${scene.id}-mission`;
    if (obj.id === scene.missionObject && !completedMissions.includes(missionKey)) {
      const newCompleted = [...completedMissions, missionKey];
      const bonusStars   = newStars + 5;
      setCompleted(newCompleted);
      setMissionComplete(true);
      setStars(bonusStars);
      say('Mission complete! Well done! You earned 5 stars!');
      setTimeout(() => setMissionComplete(false), 3000);

      // Unlock next scene
      const nextScene = SCENES[sceneIndex + 1];
      if (nextScene && !unlockedScenes.includes(nextScene.id) && bonusStars >= nextScene.unlockStars) {
        const newUnlocked = [...unlockedScenes, nextScene.id];
        setUnlocked(newUnlocked);
        save(bonusStars, newUnlocked, newCompleted);
      } else {
        save(bonusStars, unlockedScenes, newCompleted);
      }
    } else {
      save(newStars, unlockedScenes, completedMissions);
    }
  }, [taps, stars, scene, completedMissions, unlockedScenes, sceneIndex]);

  const goScene = (dir: 1 | -1) => {
    const next = sceneIndex + dir;
    if (next >= 0 && next < SCENES.length && unlockedScenes.includes(SCENES[next].id)) {
      setSceneIndex(next);
    } else if (dir === 1 && next < SCENES.length) {
      say(`Earn more stars to unlock ${SCENES[next].name}!`);
    }
  };

  const missionDone = completedMissions.includes(`${scene.id}-mission`);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#FF6B6B' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.sceneName}>{scene.emoji} {scene.name}</Text>
        </View>
        <View style={styles.starsBadge}><Text style={styles.starsText}>⭐{stars}</Text></View>
      </View>

      {/* Mission banner */}
      {showMissionBanner && (
        <Animated.View style={[styles.missionBanner, { transform: [{ translateY: bannerY }] }]}>
          <Text style={styles.missionEmoji}>{scene.missionEmoji}</Text>
          <Text style={styles.missionText}>Mission: {scene.mission}</Text>
          {missionDone && <Text style={styles.missionDone}>✓ Done!</Text>}
        </Animated.View>
      )}

      {/* Mission complete flash */}
      {missionComplete && (
        <View style={styles.missionCompleteBanner}>
          <Text style={styles.missionCompleteText}>🎉 Mission Complete! +5 ⭐</Text>
        </View>
      )}

      {/* Feedback */}
      {feedback && (
        <View style={styles.feedbackFloat}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* Scene */}
      <View style={[styles.scene, { backgroundColor: scene.skyColor }]}>
        {/* Objects */}
        {scene.objects.map((obj) => {
          const anim = getAnim(obj.id);
          const rotate = anim.rotate.interpolate({ inputRange: [0,1], outputRange: ['0deg','360deg'] });
          const display = obj.toggle ? (anim.toggleOn ? obj.toggle.on : obj.toggle.off) : obj.emoji;
          return (
            <TouchableOpacity
              key={obj.id}
              onPress={() => handleTap(obj)}
              activeOpacity={0.78}
              style={[styles.obj, { left: `${obj.x}%`, top: `${obj.y}%`, zIndex: obj.zIndex ?? 10 }]}
            >
              <Animated.View style={{ transform: [
                { translateY: anim.y },
                { translateX: anim.x },
                { scale: anim.scale },
                { rotate },
              ]}}>
                <Text style={{ fontSize: obj.size }}>{display}</Text>
              </Animated.View>
              {anim.reaction && (
                <View style={styles.reactionPop}>
                  <Text style={styles.reactionText}>{anim.reaction}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Ground */}
        <View style={[styles.ground, { backgroundColor: scene.groundColor }]} />
      </View>

      {/* Scene navigation */}
      <View style={styles.nav}>
        <TouchableOpacity onPress={() => goScene(-1)} disabled={sceneIndex === 0} style={[styles.navBtn, sceneIndex === 0 && styles.navBtnOff]} activeOpacity={0.8}>
          <Text style={styles.navBtnText}>◀</Text>
        </TouchableOpacity>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sceneDots}>
          {SCENES.map((s, i) => {
            const locked   = !unlockedScenes.includes(s.id);
            const isCurrent = i === sceneIndex;
            return (
              <TouchableOpacity key={s.id} onPress={() => !locked && setSceneIndex(i)} activeOpacity={0.8}>
                <View style={[styles.dot, isCurrent && styles.dotActive, locked && styles.dotLocked]}>
                  <Text style={styles.dotEmoji}>{locked ? '🔒' : s.emoji}</Text>
                  {locked && <Text style={styles.dotCost}>{s.unlockStars}⭐</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          onPress={() => goScene(1)}
          disabled={sceneIndex === SCENES.length - 1}
          style={[styles.navBtn, sceneIndex === SCENES.length - 1 && styles.navBtnOff]}
          activeOpacity={0.8}
        >
          <Text style={styles.navBtnText}>▶</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>👆 Tap everything to discover TinyTown!</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:                 { flex: 1, backgroundColor: '#87CEEB' },
  header:               { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn:              { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:             { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerCenter:         { flex: 1, alignItems: 'center' },
  sceneName:            { fontSize: 17, fontWeight: '900', color: '#fff' },
  starsBadge:           { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  starsText:            { fontSize: 14, fontWeight: '900', color: '#fff' },
  missionBanner:        { position: 'absolute', top: 56, left: 12, right: 12, zIndex: 50, backgroundColor: '#FFF9F0', borderRadius: 16, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 10, elevation: 6 },
  missionEmoji:         { fontSize: 26 },
  missionText:          { flex: 1, fontSize: 14, fontWeight: '800', color: '#3D3530' },
  missionDone:          { fontSize: 18, color: '#6BCB77', fontWeight: '900' },
  missionCompleteBanner:{ position: 'absolute', top: 100, alignSelf: 'center', zIndex: 60, backgroundColor: '#FFD93D', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12 },
  missionCompleteText:  { fontSize: 18, fontWeight: '900', color: '#3D3530' },
  feedbackFloat:        { position: 'absolute', top: 110, right: 20, zIndex: 55, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  feedbackText:         { color: '#FFD93D', fontWeight: '900', fontSize: 16 },
  scene:                { flex: 1, position: 'relative', overflow: 'hidden' },
  obj:                  { position: 'absolute', alignItems: 'center' },
  reactionPop:          { position: 'absolute', top: -28, alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 16, paddingHorizontal: 8, paddingVertical: 3, zIndex: 99 },
  reactionText:         { fontSize: 20 },
  ground:               { position: 'absolute', bottom: 0, left: 0, right: 0, height: 65 },
  nav:                  { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.95)', paddingVertical: 8, paddingHorizontal: 10, gap: 8 },
  navBtn:               { backgroundColor: '#fff', borderRadius: 20, width: 38, height: 38, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  navBtnOff:            { opacity: 0.3 },
  navBtnText:           { fontSize: 16, fontWeight: '900', color: '#3D3530' },
  sceneDots:            { gap: 8, alignItems: 'center', paddingHorizontal: 4 },
  dot:                  { backgroundColor: '#fff', borderRadius: 12, padding: 6, alignItems: 'center', gap: 2, minWidth: 44, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  dotActive:            { borderWidth: 2, borderColor: '#FF6B6B' },
  dotLocked:            { backgroundColor: '#F5F5F5', opacity: 0.7 },
  dotEmoji:             { fontSize: 20 },
  dotCost:              { fontSize: 8, fontWeight: '900', color: '#FF9F43' },
  hint:                 { textAlign: 'center', fontSize: 11, fontWeight: '700', color: '#8B8178', paddingVertical: 5, backgroundColor: 'rgba(255,255,255,0.95)' },
});
