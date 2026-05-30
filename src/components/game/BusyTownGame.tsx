// ============================================================
// 🏙️ Busy Town Touch World — Ages 2–4
// 4 scenes: Town Street, Farm, Park, Night Town
// Everything tappable, animated, speaks
// ============================================================

import React from 'react';
import { router } from 'expo-router';
import { TouchWorldEngine, TouchWorldConfig } from './engines/TouchWorldEngine';

const BUSY_TOWN_CONFIG: TouchWorldConfig = {
  title: 'Busy Town',
  emoji: '🏙️',
  color: '#FF6B6B',

  scenes: [

    // ── SCENE 1: Town Street ──────────────────────────────
    {
      id:          'street',
      title:       '🏙️ Town Street',
      bg:          '#87CEEB',
      skyColor:    '#87CEEB',
      groundColor: '#A0A0A0',
      groundHeight: 70,
      objects: [
        // Sun
        { id: 'sun',       emoji: '☀️',  x: 75, y: 4,  size: 50, animation: 'spin',     speech: 'The sun is warm and bright!',          reaction: '✨' },
        // Clouds
        { id: 'cloud1',    emoji: '☁️',  x: 5,  y: 8,  size: 44, animation: 'wiggle',   speech: 'Fluffy white cloud!',                  reaction: '💨' },
        { id: 'cloud2',    emoji: '⛅',  x: 40, y: 5,  size: 38, animation: 'wiggle',   speech: 'A little cloud!',                      reaction: '💨' },
        // Buildings
        { id: 'house1',    emoji: '🏠',  x: 2,  y: 28, size: 60, animation: 'pulse',    speech: 'A cozy house! Someone lives here.',    reaction: '❤️' },
        { id: 'shop',      emoji: '🏪',  x: 22, y: 25, size: 62, animation: 'bounce',   speech: 'A shop! You can buy things here.',     reaction: '🛍️' },
        { id: 'school',    emoji: '🏫',  x: 50, y: 22, size: 58, animation: 'pulse',    speech: 'School is where we learn!',            reaction: '📚' },
        { id: 'hospital',  emoji: '🏥',  x: 74, y: 24, size: 55, animation: 'flash',    speech: 'Hospital! Doctors help us here.',      reaction: '💊' },
        // Traffic light — toggle!
        {
          id: 'traffic',
          emoji: '🔴',
          x: 43, y: 52, size: 38,
          animation: 'flash',
          speech: 'Red light! Everyone stops!',
          reaction: '🛑',
          toggle: {
            off: '🔴', on: '🟢',
            speechOn:  'Green light! Everyone go!',
            speechOff: 'Red light! Everyone stops!',
          },
        },
        // Cars
        { id: 'car1',      emoji: '🚗',  x: 8,  y: 72, size: 44, animation: 'slide-up', speech: 'Vroom vroom! Red car going fast!',    reaction: '💨' },
        { id: 'car2',      emoji: '🚕',  x: 30, y: 68, size: 42, animation: 'slide-up', speech: 'Yellow taxi! Beep beep!',             reaction: '🚦' },
        { id: 'bus',       emoji: '🚌',  x: 55, y: 65, size: 52, animation: 'wiggle',   speech: 'Bus! It carries lots of people!',     reaction: '🚏' },
        { id: 'bike',      emoji: '🚲',  x: 80, y: 70, size: 40, animation: 'spin',     speech: 'Bicycle! Pedal pedal pedal!',         reaction: '🔄' },
        // Street items
        { id: 'tree1',     emoji: '🌳',  x: 14, y: 48, size: 46, animation: 'wiggle',   speech: 'A big tree! Birds live in trees.',    reaction: '🐦' },
        { id: 'tree2',     emoji: '🌲',  x: 60, y: 46, size: 42, animation: 'wiggle',   speech: 'A Christmas tree shape!',             reaction: '🌿' },
        { id: 'fire',      emoji: '🚒',  x: 2,  y: 65, size: 46, animation: 'bounce',   speech: 'Fire truck! Nee naw nee naw!',        reaction: '🔥', zIndex: 20 },
        { id: 'fountain',  emoji: '⛲',  x: 35, y: 48, size: 44, animation: 'pulse',    speech: 'A fountain! Water splashes up!',      reaction: '💦' },
        { id: 'balloon',   emoji: '🎈',  x: 85, y: 40, size: 36, animation: 'bounce',   speech: 'A red balloon! Don\'t let it go!',   reaction: '🎉' },
        // People
        { id: 'person1',   emoji: '👨',  x: 20, y: 62, size: 38, animation: 'bounce',   speech: 'Hello mister! Where are you going?', reaction: '👋' },
        { id: 'child',     emoji: '👦',  x: 70, y: 64, size: 34, animation: 'wiggle',   speech: 'A child walking to school!',         reaction: '🎒' },
        { id: 'dog',       emoji: '🐕',  x: 88, y: 66, size: 34, animation: 'bounce',   speech: 'Woof woof! A dog on a walk!',        reaction: '🦴' },
      ],
    },

    // ── SCENE 2: Farm ────────────────────────────────────
    {
      id:          'farm',
      title:       '🌾 Happy Farm',
      bg:          '#87CEEB',
      skyColor:    '#B8E0FF',
      groundColor: '#7CB342',
      groundHeight: 90,
      objects: [
        { id: 'sun2',     emoji: '🌤️', x: 72, y: 3,  size: 48, animation: 'spin',     speech: 'Sunny day on the farm!',              reaction: '☀️' },
        { id: 'barn',     emoji: '🏚️', x: 60, y: 22, size: 70, animation: 'pulse',    speech: 'The barn is where animals sleep!',    reaction: '🌙' },
        { id: 'tractor',  emoji: '🚜', x: 3,  y: 62, size: 56, animation: 'wiggle',   speech: 'Chugga chugga! The tractor ploughs!', reaction: '💨' },
        { id: 'cow',      emoji: '🐄', x: 4,  y: 42, size: 52, animation: 'wiggle',   speech: 'Moo! I give you milk!',               reaction: '🥛' },
        { id: 'pig',      emoji: '🐷', x: 25, y: 55, size: 46, animation: 'wiggle',   speech: 'Oink oink! I love mud!',              reaction: '🟤' },
        { id: 'chicken',  emoji: '🐔', x: 44, y: 58, size: 40, animation: 'bounce',   speech: 'Cluck cluck! I laid an egg!',         reaction: '🥚' },
        { id: 'horse',    emoji: '🐴', x: 55, y: 50, size: 50, animation: 'bounce',   speech: 'Neigh! I love to gallop!',            reaction: '🌾' },
        { id: 'sheep',    emoji: '🐑', x: 72, y: 54, size: 44, animation: 'wiggle',   speech: 'Baa baa! My wool is soft!',           reaction: '🧶' },
        { id: 'duck',     emoji: '🦆', x: 84, y: 60, size: 38, animation: 'bounce',   speech: 'Quack quack! I love the pond!',       reaction: '💦' },
        { id: 'pond',     emoji: '🏞️', x: 78, y: 38, size: 54, animation: 'pulse',    speech: 'A pond! Fish and ducks live here!',   reaction: '🐟' },
        { id: 'wheat',    emoji: '🌾', x: 14, y: 35, size: 44, animation: 'wiggle',   speech: 'Wheat grows into bread!',             reaction: '🍞' },
        { id: 'sunflower',emoji: '🌻', x: 28, y: 32, size: 48, animation: 'wiggle',   speech: 'Sunflower follows the sun!',          reaction: '☀️' },
        { id: 'apple',    emoji: '🍎', x: 40, y: 30, size: 44, animation: 'bounce',   speech: 'Red apple! So yummy and healthy!',    reaction: '😋' },
        { id: 'cat',      emoji: '🐱', x: 48, y: 36, size: 40, animation: 'wiggle',   speech: 'Meow! The farm cat catches mice!',    reaction: '🐭' },
        { id: 'bird1',    emoji: '🐦', x: 5,  y: 12, size: 32, animation: 'slide-up', speech: 'Tweet tweet! A bird!',               reaction: '🎵' },
        { id: 'bird2',    emoji: '🦅', x: 85, y: 10, size: 36, animation: 'wiggle',   speech: 'A big eagle flying high!',            reaction: '🌬️' },
        // Toggle: windmill on/off
        {
          id: 'windmill', emoji: '🌬️', x: 18, y: 18, size: 50,
          animation: 'spin',
          speech: 'The wind is blowing the windmill!',
          reaction: '💨',
          toggle: {
            off: '🌬️', on: '🌀',
            speechOn:  'Whoosh! The windmill is spinning fast!',
            speechOff: 'The wind is blowing the windmill!',
          },
        },
      ],
    },

    // ── SCENE 3: Park ────────────────────────────────────
    {
      id:          'park',
      title:       '🌳 Adventure Park',
      bg:          '#C8E6C9',
      skyColor:    '#DCEEFF',
      groundColor: '#4CAF50',
      groundHeight: 85,
      objects: [
        { id: 'rainbow',   emoji: '🌈', x: 20,  y: 3,   size: 80,  animation: 'pulse',    speech: 'A beautiful rainbow! Red, orange, yellow, green, blue, purple!', reaction: '✨' },
        { id: 'slide',     emoji: '🛝', x: 5,   y: 28,  size: 68,  animation: 'bounce',   speech: 'Wheee! The slide is so fun!',         reaction: '😄' },
        { id: 'swing',     emoji: '🎠', x: 32,  y: 30,  size: 60,  animation: 'wiggle',   speech: 'Swings go up and down!',              reaction: '🎉' },
        { id: 'seesaw',    emoji: '⚖️', x: 60,  y: 38,  size: 52,  animation: 'wiggle',   speech: 'Seesaw! Up and down we go!',          reaction: '⬆️' },
        { id: 'sandpit',   emoji: '🏖️', x: 78,  y: 50,  size: 56,  animation: 'pulse',    speech: 'Sandy sandpit! Let\'s build a castle!', reaction: '🏰' },
        { id: 'bigtree',   emoji: '🌳', x: 2,   y: 44,  size: 60,  animation: 'wiggle',   speech: 'A huge tree! Can you climb it?',      reaction: '🐿️' },
        { id: 'flowers',   emoji: '🌸', x: 22,  y: 60,  size: 44,  animation: 'wiggle',   speech: 'Pretty pink flowers!',                reaction: '🌸' },
        { id: 'butterfly', emoji: '🦋', x: 42,  y: 25,  size: 40,  animation: 'spin',     speech: 'A butterfly! It flies so gracefully!', reaction: '🌸' },
        { id: 'bee',       emoji: '🐝', x: 58,  y: 22,  size: 36,  animation: 'wiggle',   speech: 'Buzz buzz! Bees make honey!',         reaction: '🍯' },
        { id: 'picnic',    emoji: '🧺', x: 50,  y: 54,  size: 48,  animation: 'bounce',   speech: 'A picnic basket! Time for lunch!',    reaction: '🥪' },
        { id: 'balloon2',  emoji: '🎈', x: 70,  y: 18,  size: 42,  animation: 'bounce',   speech: 'Don\'t let the balloon fly away!',   reaction: '🎊' },
        { id: 'rabbit',    emoji: '🐰', x: 84,  y: 62,  size: 44,  animation: 'bounce',   speech: 'Hippity hop! A fluffy rabbit!',       reaction: '🥕' },
        { id: 'squirrel',  emoji: '🐿️', x: 8,   y: 52,  size: 38,  animation: 'wiggle',   speech: 'A squirrel collecting nuts!',         reaction: '🌰' },
        { id: 'fountain2', emoji: '⛲', x: 38,  y: 50,  size: 50,  animation: 'pulse',    speech: 'Splash splash! Beautiful fountain!',  reaction: '💦' },
        { id: 'kite',      emoji: '🪁', x: 88,  y: 8,   size: 44,  animation: 'wiggle',   speech: 'A kite flying high in the sky!',      reaction: '💨' },
        // Toggle: duck pond
        {
          id: 'duckpond',  emoji: '🦆', x: 64,  y: 58,  size: 46,
          animation: 'bounce',
          speech: 'Quack quack! Duck in the pond!',
          reaction: '💦',
          toggle: {
            off: '🦆', on: '🦆',
            speechOn:  'Quack quack! Baby ducks too!',
            speechOff: 'Quack quack! Duck in the pond!',
          },
        },
      ],
    },

    // ── SCENE 4: Night Town ──────────────────────────────
    {
      id:          'night',
      title:       '🌙 Night Time',
      bg:          '#0d1b2a',
      skyColor:    '#1a2a4a',
      groundColor: '#1b3a1b',
      groundHeight: 75,
      objects: [
        { id: 'moon',      emoji: '🌕',  x: 70, y: 5,   size: 60, animation: 'pulse',    speech: 'The full moon lights up the night!',  reaction: '✨' },
        { id: 'star1',     emoji: '⭐',  x: 10, y: 8,   size: 28, animation: 'flash',    speech: 'Twinkle twinkle little star!',        reaction: '💫' },
        { id: 'star2',     emoji: '🌟',  x: 30, y: 5,   size: 24, animation: 'flash',    speech: 'A bright shining star!',              reaction: '✨' },
        { id: 'star3',     emoji: '⭐',  x: 50, y: 10,  size: 22, animation: 'flash',    speech: 'So many stars in the sky!',           reaction: '🌌' },
        { id: 'star4',     emoji: '✨',  x: 88, y: 12,  size: 26, animation: 'spin',     speech: 'Stars twinkle all night long!',       reaction: '💫' },
        // Houses with lights on/off
        {
          id: 'house-n1',  emoji: '🏠',  x: 2,  y: 35,  size: 58,
          animation: 'pulse',
          speech: 'House with the lights on!',
          reaction: '💡',
          toggle: {
            off: '🏠', on: '🏡',
            speechOn:  'Light is on! Someone is awake!',
            speechOff: 'Lights off! Everyone is sleeping!',
          },
        },
        {
          id: 'house-n2',  emoji: '🏡',  x: 24, y: 32,  size: 60,
          animation: 'pulse',
          speech: 'Cozy house at night time!',
          reaction: '🌙',
          toggle: {
            off: '🏡', on: '🏠',
            speechOn:  'The window light is on!',
            speechOff: 'Going to sleep now. Goodnight!',
          },
        },
        { id: 'building',  emoji: '🏢',  x: 52, y: 25,  size: 65, animation: 'flash',    speech: 'A tall building with lights inside!', reaction: '💡' },
        { id: 'streetlamp',emoji: '🪔',  x: 44, y: 50,  size: 42, animation: 'flash',    speech: 'Street lamp lights the road!',        reaction: '💡' },
        { id: 'car-n',     emoji: '🚗',  x: 5,  y: 72,  size: 44, animation: 'slide-up', speech: 'A car driving at night!',             reaction: '💨' },
        { id: 'owl',       emoji: '🦉',  x: 70, y: 40,  size: 46, animation: 'wiggle',   speech: 'Hoot hoot! Owls come out at night!',  reaction: '🌙' },
        { id: 'bat',       emoji: '🦇',  x: 40, y: 20,  size: 36, animation: 'wiggle',   speech: 'Bats fly at night using sounds!',     reaction: '🌑' },
        { id: 'fox-n',     emoji: '🦊',  x: 80, y: 64,  size: 42, animation: 'wiggle',   speech: 'A fox sneaks out at night!',          reaction: '🌙' },
        { id: 'cat-n',     emoji: '🐱',  x: 58, y: 66,  size: 38, animation: 'bounce',   speech: 'Cats love exploring at night!',       reaction: '👀' },
        // Toggle: rocket launch
        {
          id: 'rocket',    emoji: '🚀',  x: 85, y: 28,  size: 42,
          animation: 'slide-up',
          speech: 'A rocket going to space!',
          reaction: '🔥',
          toggle: {
            off: '🚀', on: '🛸',
            speechOn:  'The rocket reached space! Zoom!',
            speechOff: 'Ready for launch! Three, two, one!',
          },
        },
        { id: 'moon2',     emoji: '🌙',  x: 15, y: 20,  size: 36, animation: 'spin',     speech: 'Crescent moon!',                      reaction: '⭐' },
        { id: 'hotel',     emoji: '🏨',  x: 26, y: 48,  size: 52, animation: 'pulse',    speech: 'Hotel! Guests sleep inside.',         reaction: '🛌' },
      ],
    },

  ],
};

export default function BusyTownGame() {
  return (
    <TouchWorldEngine
      config={BUSY_TOWN_CONFIG}
      onBack={() => router.back()}
    />
  );
}
