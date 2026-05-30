import type { AgeGroup } from '../types';

export interface StoryPage {
  text:  string;
  emoji: string; // main visual
  bg:    string; // background color
}

export interface Story {
  id:        string;
  title:     string;
  emoji:     string;
  theme:     string;
  color:     string;
  colorLight:string;
  ageGroups: AgeGroup[];
  isPremium: boolean;
  isBedtime: boolean;
  duration:  number; // minutes
  pages:     StoryPage[];
}

export const STORIES: Story[] = [
  // ── FREE STORIES ──────────────────────────────────────────
  {
    id: 'brave-little-owl', title: 'The Brave Little Owl',
    emoji: '🦉', theme: 'courage', color: '#C77DFF', colorLight: '#F3E5FF',
    ageGroups: ['2-4', '5-7'], isPremium: false, isBedtime: true, duration: 3,
    pages: [
      { emoji: '🌙', bg: '#1a1040', text: 'Once upon a time, deep in a magical forest, lived a little owl named Milo.' },
      { emoji: '🦉', bg: '#2d1b69', text: 'Milo was small, but he had the biggest, roundest eyes in the whole forest.' },
      { emoji: '⭐', bg: '#1a2a6c', text: 'Every night, the other animals would ask Milo to watch over them while they slept.' },
      { emoji: '🌲', bg: '#1b4332', text: 'One dark night, Milo heard a strange sound coming from the big old tree.' },
      { emoji: '😨', bg: '#2d3a4a', text: '"I am scared," whispered Milo. His feathers trembled. His heart beat fast.' },
      { emoji: '💪', bg: '#1b4332', text: 'But Milo took a deep breath. "I must be brave," he said. "My friends need me."' },
      { emoji: '🐿️', bg: '#3d2b1f', text: 'He flew to the tree and found a tiny squirrel who was lost and crying.' },
      { emoji: '🤝', bg: '#1b4332', text: '"Don\'t worry," said Milo. "I will take you home." And he did!' },
      { emoji: '🌟', bg: '#1a2a6c', text: 'The squirrel\'s family was so happy. They all cheered for brave little Milo.' },
      { emoji: '🦉💫', bg: '#1a1040', text: 'That night, Milo learned something important: being brave means helping others, even when you are scared. The End. 🌙' },
    ],
  },
  {
    id: 'brush-your-teeth', title: 'Sparky Saves the Day',
    emoji: '🦷', theme: 'health', color: '#4D96FF', colorLight: '#E5EFFE',
    ageGroups: ['2-4', '5-7'], isPremium: false, isBedtime: false, duration: 2,
    pages: [
      { emoji: '😬', bg: '#E5EFFE', text: 'Sparky the tooth lived in Leo\'s mouth. He loved being shiny and white!' },
      { emoji: '🍭', bg: '#FFE5E5', text: 'One day, Leo ate lots of sweets — candy, cake, and fizzy drinks!' },
      { emoji: '🦠', bg: '#FFD93D', text: 'The sugar monsters came! They were sticky and wanted to make Sparky unhappy.' },
      { emoji: '😰', bg: '#FFE5E5', text: '"Help! Help!" cried Sparky. "The sugar monsters are attacking!"' },
      { emoji: '🪥', bg: '#E5EFFE', text: 'But Leo remembered what Mum said. He grabbed his toothbrush — a magic wand!' },
      { emoji: '✨', bg: '#E5F7E7', text: 'Brush brush brush! The toothbrush swept all the sugar monsters away.' },
      { emoji: '🦷✨', bg: '#E5EFFE', text: 'Sparky was clean and sparkling again! "Thank you Leo!" he cheered.' },
      { emoji: '😄', bg: '#FFF8DC', text: 'Brush your teeth twice a day and your teeth will always be happy! The End. 🦷' },
    ],
  },
  {
    id: 'rainbow-garden', title: 'The Rainbow Garden',
    emoji: '🌈', theme: 'nature', color: '#6BCB77', colorLight: '#E5F7E7',
    ageGroups: ['2-4', '5-7', '8-10'], isPremium: false, isBedtime: false, duration: 3,
    pages: [
      { emoji: '🌱', bg: '#E5F7E7', text: 'Sofia loved her garden. She planted seeds every single morning.' },
      { emoji: '☀️', bg: '#FFF8DC', text: 'She gave them sunshine, water, and lots of love.' },
      { emoji: '🌧️', bg: '#E5EFFE', text: 'One day it rained. Sofia was sad. "My seeds will get too wet!"' },
      { emoji: '🌸', bg: '#FFE5E8', text: 'But the next morning, something magical had happened overnight.' },
      { emoji: '🌹', bg: '#FFE5E5', text: 'A red rose had bloomed! And beside it, an orange marigold!' },
      { emoji: '🌻', bg: '#FFF8DC', text: 'A yellow sunflower reached up to the sky. It was enormous!' },
      { emoji: '🌿', bg: '#E5F7E7', text: 'Green leaves and purple lavender filled every corner of the garden.' },
      { emoji: '🌈', bg: '#F0E6FF', text: 'Sofia looked at her garden. All the colors of the rainbow were there!' },
      { emoji: '🦋', bg: '#E5EFFE', text: 'Butterflies danced. Bees buzzed. Birds sang. The whole garden celebrated!' },
      { emoji: '💚', bg: '#E5F7E7', text: 'Sofia smiled. "When you give love and care, beautiful things grow." The End. 🌸' },
    ],
  },

  // ── PREMIUM STORIES ────────────────────────────────────────
  {
    id: 'stars-adventure', title: 'A Journey to the Stars',
    emoji: '🚀', theme: 'adventure', color: '#FF6B6B', colorLight: '#FFE5E5',
    ageGroups: ['5-7', '8-10'], isPremium: true, isBedtime: true, duration: 4,
    pages: [
      { emoji: '🚀', bg: '#0d1b2a', text: 'Captain Zara climbed into her rocket ship. Tonight she would visit the stars.' },
      { emoji: '🌍', bg: '#1a2a6c', text: 'Three! Two! One! Blast off! Earth grew smaller and smaller below her.' },
      { emoji: '⭐', bg: '#0d1b2a', text: 'The first star she met was old and wise. "Hello, Zara," it twinkled.' },
      { emoji: '🌙', bg: '#1a1040', text: 'The moon waved as she flew past. "Come visit again soon!" it called.' },
      { emoji: '🪐', bg: '#2d1b69', text: 'Saturn\'s rings were made of sparkling ice. Zara did a loop around them.' },
      { emoji: '🌌', bg: '#0a0a1a', text: 'The Milky Way stretched like a river of diamonds across the sky.' },
      { emoji: '👽', bg: '#1b3a1b', text: 'A friendly alien waved from a distant planet. They shared star-shaped cookies.' },
      { emoji: '🏠', bg: '#1a2a6c', text: 'As night grew late, Zara turned her rocket towards home. Earth glowed blue and beautiful.' },
      { emoji: '😴', bg: '#1a1040', text: 'She landed softly and climbed into bed. The stars outside twinkled goodnight.' },
      { emoji: '💫', bg: '#0d1b2a', text: 'Dream big, little explorer. The whole universe is waiting for you. The End. ✨' },
    ],
  },
  {
    id: 'kind-elephant', title: 'Ellie\'s Kindness',
    emoji: '🐘', theme: 'kindness', color: '#FF9F43', colorLight: '#FFF0DC',
    ageGroups: ['2-4', '5-7'], isPremium: true, isBedtime: false, duration: 3,
    pages: [
      { emoji: '🐘', bg: '#FFF0DC', text: 'Ellie the elephant had a very long trunk — the longest in the savanna!' },
      { emoji: '🌊', bg: '#E5EFFE', text: 'She used it to spray water on hot days. All the animals loved this!' },
      { emoji: '🦁', bg: '#FFF0DC', text: 'But one day, Leo the lion was sad. "I have no food," he cried.' },
      { emoji: '🍃', bg: '#E5F7E7', text: 'Ellie reached her long trunk up to the tallest tree and pulled down fresh leaves.' },
      { emoji: '🦒', bg: '#FFF0DC', text: 'Giraffe was stuck. Her neck was caught in a vine. Ellie gently freed her.' },
      { emoji: '🐦', bg: '#E5EFFE', text: 'A little bird had fallen from its nest. Ellie lifted it back up, so carefully.' },
      { emoji: '🌅', bg: '#FFE5D0', text: 'That evening, all the animals gathered around Ellie.' },
      { emoji: '💛', bg: '#FFF8DC', text: '"You are the kindest of us all," they said. Ellie blushed under her grey skin.' },
      { emoji: '🐘✨', bg: '#FFF0DC', text: 'Kindness is the greatest gift you can give. The End. 🧡' },
    ],
  },
];

export const getFreeStories    = () => STORIES.filter(s => !s.isPremium);
export const getBedtimeStories = () => STORIES.filter(s => s.isBedtime);
export const getStoryById      = (id: string) => STORIES.find(s => s.id === id);
export const getStoriesForAge  = (age: AgeGroup) => STORIES.filter(s => s.ageGroups.includes(age));
