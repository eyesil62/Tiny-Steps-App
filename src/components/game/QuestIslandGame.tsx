// ============================================================
// 🗺️ Quest Island — Ages 6–8
// RPG-lite: explore map, collect gems, help characters, solve puzzles
// ============================================================
import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  Animated, Dimensions, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width: W } = Dimensions.get('window');

function safeSpeak(text: string) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate: 0.82, pitch: 1.05 }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 130);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate: 0.82, pitch: 1.05 }); } catch {} }, 130));
}

interface MapArea {
  id:          string;
  emoji:       string;
  label:       string;
  x:           number;
  y:           number;
  color:       string;
  locked:      boolean;
  unlockCost:  number;
  description: string;
  quest:       Quest;
}

interface Quest {
  title:       string;
  steps:       QuestStep[];
}

interface QuestStep {
  id:          string;
  prompt:      string;
  options:     { text: string; correct: boolean; emoji: string }[];
  speech:      string;
}

const MAP_AREAS: MapArea[] = [
  {
    id: 'forest', emoji: '🌲', label: 'Mystic Forest', x: 12, y: 30, color: '#6BCB77', locked: false, unlockCost: 0,
    description: 'A magical forest full of talking animals!',
    quest: {
      title: 'Help the Lost Fox',
      steps: [
        { id: 'q1', prompt: 'The fox is hungry. What does a fox eat?', speech: 'A hungry fox! What should we feed it?',
          options: [{ text: '🍎 Apple', correct: false, emoji: '🍎' }, { text: '🐭 Mouse', correct: true, emoji: '🐭' }, { text: '🌸 Flower', correct: false, emoji: '🌸' }] },
        { id: 'q2', prompt: 'The fox needs to cross the river. How?', speech: 'Now the fox needs to cross the river!',
          options: [{ text: '🤿 Swim', correct: false, emoji: '🤿' }, { text: '🌉 Bridge', correct: true, emoji: '🌉' }, { text: '✈️ Fly', correct: false, emoji: '✈️' }] },
        { id: 'q3', prompt: 'The fox found its family! What do they do?', speech: 'The fox found its family! What should they do?',
          options: [{ text: '😴 Sleep', correct: false, emoji: '😴' }, { text: '🎉 Celebrate!', correct: true, emoji: '🎉' }, { text: '🏃 Run away', correct: false, emoji: '🏃' }] },
      ],
    },
  },
  {
    id: 'beach', emoji: '🏖️', label: 'Crystal Beach', x: 58, y: 55, color: '#4D96FF', locked: false, unlockCost: 0,
    description: 'Golden sands and sparkling ocean!',
    quest: {
      title: 'Save the Sea Turtle',
      steps: [
        { id: 'b1', prompt: 'A turtle is tangled in plastic. What do we do?', speech: 'Oh no! A turtle needs our help!',
          options: [{ text: '🏊 Swim away', correct: false, emoji: '🏊' }, { text: '✂️ Cut it free', correct: true, emoji: '✂️' }, { text: '📸 Take photo', correct: false, emoji: '📸' }] },
        { id: 'b2', prompt: 'The turtle is tired. What does it need?', speech: 'The turtle is exhausted!',
          options: [{ text: '💧 Water', correct: false, emoji: '💧' }, { text: '😴 Rest', correct: true, emoji: '😴' }, { text: '🍕 Pizza', correct: false, emoji: '🍕' }] },
        { id: 'b3', prompt: 'Time to release the turtle. Where does it go?', speech: 'Where should the turtle go now?',
          options: [{ text: '🏠 Home', correct: false, emoji: '🏠' }, { text: '🌊 Ocean', correct: true, emoji: '🌊' }, { text: '🌲 Forest', correct: false, emoji: '🌲' }] },
      ],
    },
  },
  {
    id: 'volcano', emoji: '🌋', label: 'Fire Mountain', x: 30, y: 10, color: '#FF6B6B', locked: true, unlockCost: 5,
    description: 'A dangerous but exciting volcano!',
    quest: {
      title: 'Cool the Lava',
      steps: [
        { id: 'v1', prompt: 'Lava is flowing! What do scientists call melted rock?', speech: 'The volcano is erupting!',
          options: [{ text: '🧃 Juice', correct: false, emoji: '🧃' }, { text: '🌋 Magma', correct: true, emoji: '🌋' }, { text: '💧 Water', correct: false, emoji: '💧' }] },
        { id: 'v2', prompt: 'Which material can withstand extreme heat?', speech: 'We need something heat-proof!',
          options: [{ text: '🧊 Ice', correct: false, emoji: '🧊' }, { text: '🪨 Rock', correct: true, emoji: '🪨' }, { text: '🧸 Teddy', correct: false, emoji: '🧸' }] },
        { id: 'v3', prompt: 'The volcano is calm. What did lava become?', speech: 'The lava cooled down! What is it now?',
          options: [{ text: '💎 Diamond', correct: false, emoji: '💎' }, { text: '🪨 Rock', correct: true, emoji: '🪨' }, { text: '🌊 Water', correct: false, emoji: '🌊' }] },
      ],
    },
  },
  {
    id: 'castle', emoji: '🏰', label: 'Ancient Castle', x: 68, y: 15, color: '#C77DFF', locked: true, unlockCost: 10,
    description: 'A mysterious castle with hidden treasures!',
    quest: {
      title: 'Unlock the Castle',
      steps: [
        { id: 'c1', prompt: 'There is a riddle on the door: I have hands but cannot clap. What am I?', speech: 'Solve the riddle to unlock the castle!',
          options: [{ text: '🤖 Robot', correct: false, emoji: '🤖' }, { text: '🕐 Clock', correct: true, emoji: '🕐' }, { text: '🌊 Wave', correct: false, emoji: '🌊' }] },
        { id: 'c2', prompt: 'Inside there are 3 chests. Each has 4 gems. How many gems total?', speech: 'Count the gems in all the chests!',
          options: [{ text: '💎 7', correct: false, emoji: '7️⃣' }, { text: '💎 12', correct: true, emoji: '🔢' }, { text: '💎 10', correct: false, emoji: '🔟' }] },
        { id: 'c3', prompt: 'You find the royal treasure! What is the most valuable?', speech: 'You found the treasure!',
          options: [{ text: '🍬 Sweets', correct: false, emoji: '🍬' }, { text: '👑 Crown', correct: true, emoji: '👑' }, { text: '📺 TV', correct: false, emoji: '📺' }] },
      ],
    },
  },
  {
    id: 'space', emoji: '🚀', label: 'Space Station', x: 45, y: 5, color: '#1a2a6c', locked: true, unlockCost: 15,
    description: 'Blast off to the stars!',
    quest: {
      title: 'Fix the Space Station',
      steps: [
        { id: 's1', prompt: 'The station is broken. What do you use to tighten bolts?', speech: 'The space station needs fixing!',
          options: [{ text: '🍴 Fork', correct: false, emoji: '🍴' }, { text: '🔧 Wrench', correct: true, emoji: '🔧' }, { text: '✏️ Pencil', correct: false, emoji: '✏️' }] },
        { id: 's2', prompt: 'You see Earth from space. What colour is most of it?', speech: 'Look down at Earth from space!',
          options: [{ text: '🔴 Red', correct: false, emoji: '🔴' }, { text: '🔵 Blue', correct: true, emoji: '🔵' }, { text: '🟡 Yellow', correct: false, emoji: '🟡' }] },
        { id: 's3', prompt: 'The station is fixed! How many planets in our solar system?', speech: 'Well done! One last question!',
          options: [{ text: '5️⃣ Five', correct: false, emoji: '5️⃣' }, { text: '8️⃣ Eight', correct: true, emoji: '8️⃣' }, { text: '🔟 Ten', correct: false, emoji: '🔟' }] },
      ],
    },
  },
];

export default function QuestIslandGame() {
  const [gems,         setGems]         = useState(0);
  const [activeArea,   setActiveArea]   = useState<MapArea | null>(null);
  const [questStep,    setQuestStep]    = useState(0);
  const [questDone,    setQuestDone]    = useState<Set<string>>(new Set());
  const [feedback,     setFeedback]     = useState<{ text: string; correct: boolean } | null>(null);
  const [unlockedAreas,setUnlockedAreas]= useState<Set<string>>(new Set(['forest', 'beach']));

  const handleAreaTap = (area: MapArea) => {
    if (!unlockedAreas.has(area.id)) {
      if (gems >= area.unlockCost) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        safeSpeak(`You unlocked ${area.label}! ${area.description}`);
        setGems(g => g - area.unlockCost);
        setUnlockedAreas(prev => new Set([...prev, area.id]));
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        safeSpeak(`You need ${area.unlockCost} gems to unlock ${area.label}!`);
      }
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeSpeak(area.description);
    setActiveArea(area);
    setQuestStep(0);
    setFeedback(null);
    setTimeout(() => safeSpeak(area.quest.steps[0].speech), 1000);
  };

  const handleAnswer = useCallback((correct: boolean, optionText: string) => {
    if (!activeArea) return;
    Haptics.impactAsync(correct ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);

    if (correct) {
      safeSpeak('Correct! Excellent thinking!');
      setFeedback({ text: '✅ Correct! +3 gems', correct: true });
      setGems(g => g + 3);

      setTimeout(() => {
        setFeedback(null);
        const nextStep = questStep + 1;
        if (nextStep >= activeArea.quest.steps.length) {
          // Quest complete
          safeSpeak(`Amazing! You completed the ${activeArea.quest.title} quest!`);
          setQuestDone(prev => new Set([...prev, activeArea.id]));
          setGems(g => g + 5); // bonus gems
          setTimeout(() => setActiveArea(null), 2000);
        } else {
          setQuestStep(nextStep);
          setTimeout(() => safeSpeak(activeArea.quest.steps[nextStep].speech), 600);
        }
      }, 1200);
    } else {
      safeSpeak('Not quite! Try again!');
      setFeedback({ text: '❌ Try again!', correct: false });
      setTimeout(() => setFeedback(null), 1000);
    }
  }, [activeArea, questStep]);

  const currentQuestStep = activeArea?.quest.steps[questStep];

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => activeArea ? setActiveArea(null) : router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🗺️ Quest Island</Text>
        <View style={styles.gemsBadge}><Text style={styles.gemsText}>💎{gems}</Text></View>
      </View>

      {!activeArea ? (
        // ── MAP VIEW ──
        <View style={styles.mapContainer}>
          <View style={styles.mapBg}>
            {/* Ocean background */}
            <Text style={styles.mapDecor1}>🌊</Text>
            <Text style={styles.mapDecor2}>🐋</Text>
            <Text style={styles.mapDecor3}>⛵</Text>
            <Text style={styles.mapDecor4}>🐬</Text>

            {/* Map areas */}
            {MAP_AREAS.map((area) => {
              const isUnlocked = unlockedAreas.has(area.id);
              const isDone     = questDone.has(area.id);
              return (
                <TouchableOpacity
                  key={area.id}
                  style={[
                    styles.mapArea,
                    { left: `${area.x}%`, top: `${area.y}%`, backgroundColor: area.color + (isUnlocked ? 'EE' : '66') },
                    isDone && styles.mapAreaDone,
                  ]}
                  onPress={() => handleAreaTap(area)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.mapAreaEmoji}>{area.emoji}</Text>
                  <Text style={styles.mapAreaLabel}>{area.label}</Text>
                  {!isUnlocked && (
                    <View style={styles.lockBadge}>
                      <Text style={styles.lockText}>🔒 {area.unlockCost}💎</Text>
                    </View>
                  )}
                  {isDone && <Text style={styles.doneStamp}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.mapLegend}>
            <Text style={styles.mapLegendText}>💎 Collect gems by answering quests! Unlock new areas!</Text>
          </View>
        </View>

      ) : (
        // ── QUEST VIEW ──
        <View style={styles.questContainer}>
          {/* Quest header */}
          <View style={[styles.questHeader, { backgroundColor: activeArea.color }]}>
            <Text style={styles.questAreaEmoji}>{activeArea.emoji}</Text>
            <View>
              <Text style={styles.questAreaName}>{activeArea.label}</Text>
              <Text style={styles.questTitle}>{activeArea.quest.title}</Text>
            </View>
            <Text style={styles.questProgress}>{questStep + 1}/{activeArea.quest.steps.length}</Text>
          </View>

          {/* Step progress dots */}
          <View style={styles.stepDots}>
            {activeArea.quest.steps.map((_, i) => (
              <View key={i} style={[
                styles.stepDot,
                i <= questStep && { backgroundColor: activeArea.color },
                i < questStep  && styles.stepDotDone,
              ]} />
            ))}
          </View>

          {currentQuestStep && (
            <View style={styles.questBody}>
              {/* Question */}
              <View style={styles.questionCard}>
                <Text style={styles.questionText}>{currentQuestStep.prompt}</Text>
              </View>

              {/* Feedback */}
              {feedback && (
                <View style={[styles.feedbackBubble, feedback.correct ? styles.feedbackCorrect : styles.feedbackWrong]}>
                  <Text style={styles.feedbackText}>{feedback.text}</Text>
                </View>
              )}

              {/* Options */}
              <View style={styles.options}>
                {currentQuestStep.options.map((opt, i) => (
                  <TouchableOpacity
                    key={i}
                    style={[styles.optionBtn, { borderColor: activeArea.color }]}
                    onPress={() => handleAnswer(opt.correct, opt.text)}
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
  safe:             { flex: 1, backgroundColor: '#0d2137' },
  header:           { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#1a3a5c' },
  backBtn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:         { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerTitle:      { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#fff' },
  gemsBadge:        { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  gemsText:         { fontSize: 15, fontWeight: '900', color: '#FFD93D' },
  mapContainer:     { flex: 1 },
  mapBg:            { flex: 1, backgroundColor: '#1a6b9a', position: 'relative', overflow: 'hidden' },
  mapDecor1:        { position: 'absolute', bottom: 20, left: 5,  fontSize: 32, opacity: 0.4 },
  mapDecor2:        { position: 'absolute', bottom: 40, right: 10, fontSize: 36, opacity: 0.3 },
  mapDecor3:        { position: 'absolute', top: 60, right: '40%', fontSize: 28, opacity: 0.4 },
  mapDecor4:        { position: 'absolute', bottom: 80, left: '45%', fontSize: 30, opacity: 0.35 },
  mapArea:          { position: 'absolute', borderRadius: 16, padding: 12, alignItems: 'center', gap: 4, minWidth: 90, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 },
  mapAreaDone:      { borderWidth: 3, borderColor: '#FFD93D' },
  mapAreaEmoji:     { fontSize: 32 },
  mapAreaLabel:     { fontSize: 10, fontWeight: '900', color: '#fff', textAlign: 'center' },
  lockBadge:        { backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  lockText:         { fontSize: 10, fontWeight: '900', color: '#fff' },
  doneStamp:        { position: 'absolute', top: -6, right: -6, backgroundColor: '#FFD93D', borderRadius: 99, width: 22, height: 22, alignItems: 'center', justifyContent: 'center', fontSize: 12 },
  mapLegend:        { backgroundColor: 'rgba(0,0,0,0.5)', padding: 10 },
  mapLegendText:    { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  questContainer:   { flex: 1, backgroundColor: '#FFF9F0' },
  questHeader:      { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  questAreaEmoji:   { fontSize: 40 },
  questAreaName:    { fontSize: 13, fontWeight: '800', color: 'rgba(255,255,255,0.8)' },
  questTitle:       { fontSize: 17, fontWeight: '900', color: '#fff' },
  questProgress:    { marginLeft: 'auto', fontSize: 16, fontWeight: '900', color: 'rgba(255,255,255,0.8)' },
  stepDots:         { flexDirection: 'row', justifyContent: 'center', gap: 8, padding: 12 },
  stepDot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: '#E0E0E0' },
  stepDotDone:      { width: 20 },
  questBody:        { flex: 1, padding: 16, gap: 16 },
  questionCard:     { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  questionText:     { fontSize: 17, fontWeight: '800', color: '#3D3530', lineHeight: 26, textAlign: 'center' },
  feedbackBubble:   { borderRadius: 16, padding: 12, alignItems: 'center' },
  feedbackCorrect:  { backgroundColor: '#E5F7E7' },
  feedbackWrong:    { backgroundColor: '#FFE5E5' },
  feedbackText:     { fontSize: 16, fontWeight: '900' },
  options:          { gap: 10 },
  optionBtn:        { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 2.5, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  optionEmoji:      { fontSize: 30 },
  optionText:       { fontSize: 16, fontWeight: '800', color: '#3D3530', flex: 1 },
});
