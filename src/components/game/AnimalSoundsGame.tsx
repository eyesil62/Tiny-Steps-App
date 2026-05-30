import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { GameShell } from './GameShell';

const { width } = Dimensions.get('window');
const CARD = (width - 60) / 2;

const ANIMALS = [
  { id: 'lion',     name: 'Lion',     emoji: '🦁', sound: 'ROAR',    speech: 'Roar!  Roar!'           },
  { id: 'cow',      name: 'Cow',      emoji: '🐄', sound: 'MOO',     speech: 'Moo!  Moo!'             },
  { id: 'dog',      name: 'Dog',      emoji: '🐶', sound: 'WOOF',    speech: 'Woof!  Woof!'           },
  { id: 'cat',      name: 'Cat',      emoji: '🐱', sound: 'MEOW',    speech: 'Meow!  Meow!'           },
  { id: 'duck',     name: 'Duck',     emoji: '🦆', sound: 'QUACK',   speech: 'Quack!  Quack!'         },
  { id: 'elephant', name: 'Elephant', emoji: '🐘', sound: 'PAWOO',   speech: 'Pawoo!  Pawoo!'         },
  { id: 'frog',     name: 'Frog',     emoji: '🐸', sound: 'RIBBIT',  speech: 'Ribbit!  Ribbit!'       },
  { id: 'horse',    name: 'Horse',    emoji: '🐴', sound: 'NEIGH',   speech: 'Neigh!  Neigh!'         },
  { id: 'sheep',    name: 'Sheep',    emoji: '🐑', sound: 'BAA',     speech: 'Baa!  Baa!'             },
  { id: 'pig',      name: 'Pig',      emoji: '🐷', sound: 'OINK',    speech: 'Oink!  Oink!'           },
];

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

function safeSpeak(text: string, opts?: Speech.SpeechOptions) {
  Speech.isSpeakingAsync().then(speaking => {
    if (speaking) {
      Speech.stop().then(() => {
        setTimeout(() => Speech.speak(text, {
          language: 'en-US', rate: 0.72, pitch: 1.25, ...opts,
        }), 200);
      }).catch(() => {
        setTimeout(() => Speech.speak(text, {
          language: 'en-US', rate: 0.72, pitch: 1.25, ...opts,
        }), 200);
      });
    } else {
      setTimeout(() => Speech.speak(text, {
        language: 'en-US', rate: 0.72, pitch: 1.25, ...opts,
      }), 150);
    }
  }).catch(() => {
    setTimeout(() => Speech.speak(text, {
      language: 'en-US', rate: 0.72, pitch: 1.25, ...opts,
    }), 150);
  });
}

export default function AnimalSoundsGame() {
  const [score,    setScore]    = useState(0);
  const [lives,    setLives]    = useState(3);
  const [round,    setRound]    = useState(1);
  const [isWon,    setIsWon]    = useState(false);
  const [isOver,   setIsOver]   = useState(false);
  const [options,  setOptions]  = useState<typeof ANIMALS>([]);
  const [target,   setTarget]   = useState<typeof ANIMALS[0] | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const ROUNDS = 8;

  const playAnimalSound = useCallback((animal: typeof ANIMALS[0]) => {
    setSpeaking(true);
    safeSpeak(animal.speech, {
      rate: 0.70,
      pitch: 1.3,
      onDone:  () => setSpeaking(false),
      onError: () => setSpeaking(false),
    });
  }, []);

  const nextRound = useCallback((roundNum: number) => {
    setSelected(null);
    setFeedback(null);
    // Use more animals as rounds progress
    const poolSize = Math.min(4 + Math.floor(roundNum / 3), ANIMALS.length);
    const pool     = shuffle(ANIMALS).slice(0, poolSize);
    const pick     = pool[0];
    const opts     = shuffle([pick, ...shuffle(pool.slice(1)).slice(0, 3)]);
    setTarget(pick);
    setOptions(opts);
    setTimeout(() => playAnimalSound(pick), 700);
  }, [playAnimalSound]);

  const restart = useCallback(() => {
    setScore(0); setLives(3); setRound(1);
    setIsWon(false); setIsOver(false);
    nextRound(1);
  }, [nextRound]);

  React.useEffect(() => { nextRound(1); }, []);

  const handleTap = (animal: typeof ANIMALS[0]) => {
    if (selected || !target) return;
    setSelected(animal.id);

    if (animal.id === target.id) {
      setFeedback('correct');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      safeSpeak(`Yes! ${animal.name}! Amazing!`, { rate: 0.88, pitch: 1.15 });
      setScore(s => s + 15);
      setTimeout(() => {
        const next = round + 1;
        if (next > ROUNDS) setIsWon(true);
        else { setRound(next); nextRound(next); }
      }, 1500);
    } else {
      setFeedback('wrong');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      safeSpeak('Try again! Listen carefully!', { rate: 0.9 });
      const newLives = lives - 1;
      setLives(newLives);
      setTimeout(() => {
        if (newLives <= 0) { setIsOver(true); }
        else {
          setSelected(null);
          setFeedback(null);
          setTimeout(() => target && playAnimalSound(target), 600);
        }
      }, 1200);
    }
  };

  return (
    <GameShell
      title="Animal Sounds" emoji="🦁" color="#6BCB77"
      score={score} lives={lives} maxLives={3}
      round={round} maxRounds={ROUNDS}
      onRestart={restart} isWon={isWon} isOver={isOver}
    >
      <View style={styles.container}>
        {/* Sound card */}
        <TouchableOpacity
          style={[styles.soundCard, speaking && styles.soundCardActive]}
          onPress={() => target && playAnimalSound(target)}
          activeOpacity={0.8}
        >
          <Text style={styles.speakerIcon}>{speaking ? '🔊' : '🔈'}</Text>
          <Text style={styles.soundWord}>{target?.sound ?? '...'}</Text>
          <Text style={styles.soundHint}>
            {speaking ? 'Listening...' : 'Tap to hear again'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.question}>Which animal makes this sound?</Text>

        <View style={styles.grid}>
          {options.map((animal) => {
            const isSelected = selected === animal.id;
            const isCorrect  = isSelected && feedback === 'correct';
            const isWrong    = isSelected && feedback === 'wrong';
            return (
              <TouchableOpacity
                key={animal.id}
                onPress={() => handleTap(animal)}
                activeOpacity={0.85}
                style={[
                  styles.card,
                  isCorrect && styles.cardCorrect,
                  isWrong   && styles.cardWrong,
                ]}
              >
                <Text style={styles.animalEmoji}>{animal.emoji}</Text>
                <Text style={styles.animalName}>{animal.name}</Text>
                {isCorrect && <Text style={styles.tick}>✓</Text>}
                {isWrong   && <Text style={styles.cross}>✗</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </GameShell>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, padding: 16, gap: 12, alignItems: 'center' },
  soundCard:      { backgroundColor: '#E5F7E7', borderRadius: 20, borderWidth: 3, borderColor: '#6BCB77', padding: 16, alignItems: 'center', width: '100%', gap: 4 },
  soundCardActive:{ backgroundColor: '#D0F0D8', borderColor: '#3A9946' },
  speakerIcon:    { fontSize: 34 },
  soundWord:      { fontSize: 34, fontWeight: '900', color: '#3D3530', letterSpacing: 2 },
  soundHint:      { fontSize: 12, fontWeight: '700', color: '#8B8178' },
  question:       { fontSize: 16, fontWeight: '800', color: '#3D3530' },
  grid:           { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  card:           { width: CARD, height: CARD * 0.82, backgroundColor: '#fff', borderRadius: 16, borderWidth: 2.5, borderColor: '#F5EDD8', alignItems: 'center', justifyContent: 'center', gap: 5, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, position: 'relative' },
  cardCorrect:    { borderColor: '#6BCB77', backgroundColor: '#E5F7E7' },
  cardWrong:      { borderColor: '#FF6B6B', backgroundColor: '#FFE5E5' },
  animalEmoji:    { fontSize: 44 },
  animalName:     { fontSize: 14, fontWeight: '800', color: '#3D3530' },
  tick:           { position: 'absolute', top: 6, right: 10, fontSize: 20, color: '#6BCB77', fontWeight: '900' },
  cross:          { position: 'absolute', top: 6, right: 10, fontSize: 20, color: '#FF6B6B', fontWeight: '900' },
});
