import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Modal, Dimensions } from 'react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width: W } = Dimensions.get('window');

interface Props {
  visible:    boolean;
  pageEmoji:  string;
  pageTitle:  string;
  speech:     string;
  animation:  string;
  sticker:    { emoji: string; name: string };
  toy:        { emoji: string; name: string };
  stars:      number;
  onContinue: () => void;
}

export function RewardModal({ visible, pageEmoji, pageTitle, speech, sticker, toy, stars, onContinue }: Props) {
  const scaleAnim  = useRef(new Animated.Value(0.5)).current;
  const starAnims  = useRef(Array.from({ length: 6 }, () => ({
    x: new Animated.Value(0), y: new Animated.Value(0), opacity: new Animated.Value(0),
  }))).current;

  useEffect(() => {
    if (!visible) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Card entrance
    Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();

    // Stars fly
    starAnims.forEach((a, i) => {
      Animated.sequence([
        Animated.delay(i * 100),
        Animated.parallel([
          Animated.timing(a.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(a.y,       { toValue: -80 - Math.random() * 40, duration: 700, useNativeDriver: true }),
          Animated.timing(a.x,       { toValue: (Math.random() - 0.5) * 100, duration: 700, useNativeDriver: true }),
        ]),
        Animated.timing(a.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });

    // Speech
    setTimeout(() => {
      try {
        Speech.isSpeakingAsync().then(s => {
          const go = () => Speech.speak(speech, { language: 'en-US', rate: 0.84, pitch: 1.1 });
          if (s) Speech.stop().then(go).catch(go);
          else go();
        });
      } catch {}
    }, 500);
  }, [visible]);

  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        {/* Flying stars */}
        {starAnims.map((a, i) => (
          <Animated.View key={i} style={[styles.flyingStar, { opacity: a.opacity, transform: [{ translateX: a.x }, { translateY: a.y }] }]}>
            <Text style={{ fontSize: 28 }}>⭐</Text>
          </Animated.View>
        ))}

        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
          {/* Celebration emoji */}
          <Text style={styles.celebEmoji}>🎉</Text>
          <Text style={styles.title}>Coloring Complete!</Text>
          <Text style={styles.pageTitle}>{pageEmoji} {pageTitle}</Text>

          {/* Stars earned */}
          <View style={styles.starsRow}>
            {[1,2,3].map(i => <Text key={i} style={styles.star}>⭐</Text>)}
          </View>
          <Text style={styles.starsCount}>+10 stars!</Text>

          {/* Rewards */}
          <View style={styles.rewards}>
            <View style={styles.rewardItem}>
              <Text style={styles.rewardEmoji}>{sticker.emoji}</Text>
              <Text style={styles.rewardLabel}>New Sticker!</Text>
              <Text style={styles.rewardName}>{sticker.name}</Text>
            </View>
            <View style={styles.rewardDivider} />
            <View style={styles.rewardItem}>
              <Text style={styles.rewardEmoji}>{toy.emoji}</Text>
              <Text style={styles.rewardLabel}>New Toy!</Text>
              <Text style={styles.rewardName}>{toy.name}</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.continueBtn} onPress={onContinue} activeOpacity={0.88}>
            <Text style={styles.continueBtnText}>Keep Coloring! 🎨</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center' },
  flyingStar:   { position: 'absolute', bottom: '35%' },
  card:         { backgroundColor: '#FFF9F0', borderRadius: 28, padding: 28, alignItems: 'center', gap: 12, width: W * 0.85, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 20, elevation: 10 },
  celebEmoji:   { fontSize: 64 },
  title:        { fontSize: 26, fontWeight: '900', color: '#3D3530' },
  pageTitle:    { fontSize: 17, fontWeight: '800', color: '#8B8178' },
  starsRow:     { flexDirection: 'row', gap: 8 },
  star:         { fontSize: 34 },
  starsCount:   { fontSize: 22, fontWeight: '900', color: '#FF9F43' },
  rewards:      { flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#FFF3E0', borderRadius: 20, padding: 16, width: '100%' },
  rewardItem:   { flex: 1, alignItems: 'center', gap: 4 },
  rewardEmoji:  { fontSize: 44 },
  rewardLabel:  { fontSize: 11, fontWeight: '900', color: '#FF9F43' },
  rewardName:   { fontSize: 12, fontWeight: '700', color: '#8B8178', textAlign: 'center' },
  rewardDivider:{ width: 1, height: 60, backgroundColor: '#F5EDD8' },
  continueBtn:  { backgroundColor: '#6BCB77', borderRadius: 99, paddingHorizontal: 32, paddingVertical: 14, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.12, shadowRadius: 8, elevation: 4 },
  continueBtnText:{ color: '#fff', fontSize: 17, fontWeight: '900' },
});
