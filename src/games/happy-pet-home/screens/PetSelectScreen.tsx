import React, { useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, ScrollView, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { PETS, PetId } from '../data/pets';
import { useHappyPetStore } from '../store/useHappyPetStore';

const { width: W } = Dimensions.get('window');

function PetCard({ pet, onSelect }: { pet: typeof PETS[0]; onSelect: () => void }) {
  const scale   = useRef(new Animated.Value(1)).current;
  const breathe = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(breathe, { toValue: -5, duration: 1400, useNativeDriver: true }),
      Animated.timing(breathe, { toValue: 0,  duration: 1400, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, tension: 120, friction: 5, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      Speech.isSpeakingAsync().then(s => {
        const go = () => Speech.speak(pet.sounds.greet, { language: 'en-US', rate: 0.82, pitch: 1.2 });
        if (s) Speech.stop().then(go).catch(go);
        else setTimeout(go, 100);
      });
    } catch {}
    onSelect();
  };

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.cardTouch}>
      <Animated.View style={[
        styles.card,
        { borderColor: pet.color, transform: [{ scale }] },
      ]}>
        <View style={[styles.cardBg, { backgroundColor: pet.colorLight }]}>
          <Animated.Text style={[styles.petEmoji, { transform: [{ translateY: breathe }] }]}>
            {pet.emoji}
          </Animated.Text>
        </View>
        <View style={styles.cardInfo}>
          <Text style={[styles.cardName, { color: pet.color }]}>{pet.name}</Text>
          <Text style={styles.cardDesc}>{pet.description}</Text>
          <View style={[styles.adoptBtn, { backgroundColor: pet.color }]}>
            <Text style={styles.adoptBtnText}>Adopt {pet.name} 💕</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function PetSelectScreen() {
  const adoptPet = useHappyPetStore(s => s.adoptPet);
  const headerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(headerAnim, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }).start();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <Animated.View style={[styles.titleWrap, {
        opacity: headerAnim,
        transform: [{ translateY: headerAnim.interpolate({ inputRange: [0,1], outputRange: [30,0] }) }],
      }]}>
        <Text style={styles.titleEmoji}>🏠</Text>
        <Text style={styles.title}>Happy Pet Home</Text>
        <Text style={styles.subtitle}>Choose your pet to adopt!</Text>
      </Animated.View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {PETS.map((pet) => (
          <PetCard key={pet.id} pet={pet} onSelect={() => adoptPet(pet.id)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#FFF9F0' },
  header:      { paddingHorizontal: 16, paddingTop: 8 },
  backBtn:     {},
  backText:    { fontSize: 15, fontWeight: '800', color: '#FF9F43' },
  titleWrap:   { alignItems: 'center', gap: 6, paddingVertical: 16 },
  titleEmoji:  { fontSize: 50 },
  title:       { fontSize: 32, fontWeight: '900', color: '#3D3530' },
  subtitle:    { fontSize: 15, fontWeight: '700', color: '#8B8178' },
  scroll:      { padding: 16, gap: 16, paddingBottom: 32 },
  cardTouch:   {},
  card:        { backgroundColor: '#fff', borderRadius: 24, borderWidth: 3, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6 },
  cardBg:      { height: 140, alignItems: 'center', justifyContent: 'center' },
  petEmoji:    { fontSize: 90 },
  cardInfo:    { padding: 16, gap: 8 },
  cardName:    { fontSize: 22, fontWeight: '900' },
  cardDesc:    { fontSize: 14, color: '#8B8178', fontWeight: '600', lineHeight: 20 },
  adoptBtn:    { borderRadius: 99, paddingVertical: 12, alignItems: 'center', marginTop: 4 },
  adoptBtnText:{ color: '#fff', fontSize: 15, fontWeight: '900' },
});
