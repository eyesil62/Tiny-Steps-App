import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Haptics from 'expo-haptics';
import { speak } from '../../lib/speech';
import { GameShell } from '../../components/game/GameShell';

const { width } = Dimensions.get('window');

const ITEMS = [
  { emoji: '🍎', name: 'apples'      },
  { emoji: '⭐', name: 'stars'       },
  { emoji: '🐶', name: 'dogs'        },
  { emoji: '🌸', name: 'flowers'     },
  { emoji: '🎈', name: 'balloons'    },
  { emoji: '🦋', name: 'butterflies' },
  { emoji: '🍭', name: 'lollipops'   },
  { emoji: '🐟', name: 'fish'        },
];

function getOptions(correct: number): number[] {
  const opts = new Set<number>([correct]);
  const candidates = Array.from({ length: 10 }, (_, i) => i + 1).filter(n => n !== correct);
  candidates.sort(() => Math.random() - 0.5);
  for (const n of candidates) {
    if (opts.size >= 4) break;
    opts.add(n);
  }
  return [...opts].sort(() => Math.random() - 0.5);
}

export default function CountTapGame() {
  const [score,    setScore]    = useState(0);
  const [lives,    setLives]    = useState(3);
  const [round,    setRound]    = useState(1);
  const [isWon,    setIsWon]    = useState(false);
  const [isOver,   setIsOver]   = useState(false);
  const [item,     setItem]     = useState(ITEMS[0]);
  const [count,    setCount]    = useState(3);
  const [options,  setOptions]  = useState<number[]>([1, 2, 3, 4]);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const ROUNDS = 6;

  const nextRound = useCallback((roundNum: number) => {
    setSelected(null);
    setFeedback(null);
    const newItem  = ITEMS[Math.floor(Math.random() * ITEMS.length)];
    const maxCount = roundNum <= 2 ? 4 : roundNum <= 4 ? 6 : 8;
    const newCount = 1 + Math.floor(Math.random() * maxCount);
    setItem(newItem);
    setCount(newCount);
    setOptions(getOptions(newCount));
    setTimeout(() => speak(`Count the ${newItem.name}!`), 600);
  }, []);

  const restart = useCallback(() => {
    setScore(0); setLives(3); setRound(1);
    setIsWon(false); setIsOver(false);
    nextRound(1);
  }, [nextRound]);

  React.useEffect(() => { nextRound(1); }, []);

  const handleTap = (num: number) => {
    if (selected !== null) return;
    setSelected(num);
    if (num === count) {
      setFeedback('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      speak(`${count}! Correct! Well done!`, { pitch: 1.1 });
      setScore(s => s + 15);
      setTimeout(() => {
        const next = round + 1;
        if (next > ROUNDS) setIsWon(true);
        else { setRound(next); nextRound(next); }
      }, 1400);
    } else {
      setFeedback('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      speak(`Count again! There are ${count}.`);
      const newLives = lives - 1;
      setLives(newLives);
      setTimeout(() => {
        if (newLives <= 0) setIsOver(true);
        else { setSelected(null); setFeedback(null); }
      }, 1400);
    }
  };

  const rows: string[][] = [];
  for (let i = 0; i < count; i += 4) {
    rows.push(Array(Math.min(4, count - i)).fill(item.emoji));
  }

  return (
    <GameShell
      title="Count & Tap" emoji="🔢" color="#4D96FF"
      score={score} lives={lives} maxLives={3}
      round={round} maxRounds={ROUNDS}
      onRestart={restart} isWon={isWon} isOver={isOver}
    >
      <View style={styles.container}>
        <Text style={styles.question}>How many {item.name}?</Text>
        <View style={styles.emojiBox}>
          {rows.map((row, ri) => (
            <View key={ri} style={styles.emojiRow}>
              {row.map((e, i) => <Text key={`${ri}-${i}`} style={styles.countEmoji}>{e}</Text>)}
            </View>
          ))}
        </View>
        <Text style={styles.pickLabel}>Pick the right number:</Text>
        <View style={styles.optionsGrid}>
          {options.map((num) => {
            const isSelected = selected === num;
            const isCorrect  = isSelected && feedback === 'correct';
            const isWrong    = isSelected && feedback === 'wrong';
            return (
              <TouchableOpacity key={num} onPress={() => handleTap(num)} activeOpacity={0.85}
                style={[styles.numBtn, isCorrect && styles.numCorrect, isWrong && styles.numWrong]}>
                <Text style={[styles.numText, (isCorrect || isWrong) && { color: '#fff' }]}>{num}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container:   { flex: 1, padding: 16, alignItems: 'center', gap: 14 },
  question:    { fontSize: 20, fontWeight: '800', color: '#3D3530', textAlign: 'center' },
  emojiBox:    { backgroundColor: '#E5EFFE', borderRadius: 20, borderWidth: 3, borderColor: '#4D96FF', padding: 16, gap: 8, alignItems: 'center', width: '100%', minHeight: 100, justifyContent: 'center' },
  emojiRow:    { flexDirection: 'row', gap: 6, justifyContent: 'center' },
  countEmoji:  { fontSize: 34 },
  pickLabel:   { fontSize: 15, fontWeight: '800', color: '#8B8178' },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  numBtn:      { width: (width - 80) / 4, height: (width - 80) / 4, backgroundColor: '#fff', borderRadius: 16, borderWidth: 3, borderColor: '#4D96FF', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },
  numCorrect:  { backgroundColor: '#6BCB77', borderColor: '#6BCB77' },
  numWrong:    { backgroundColor: '#FF6B6B', borderColor: '#FF6B6B' },
  numText:     { fontSize: 28, fontWeight: '900', color: '#3D3530' },
});
