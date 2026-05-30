import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Animated, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useHappyPetStore } from '../store/useHappyPetStore';
import { PETS } from '../data/pets';

export default function PetNamingScreen() {
  const petId   = useHappyPetStore(s => s.petId);
  const namePet = useHappyPetStore(s => s.namePet);
  const pet     = PETS.find(p => p.id === petId) ?? PETS[0];

  const [inputName, setInputName] = useState('');
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const bounceY   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(bounceY, { toValue: -8, duration: 1200, useNativeDriver: true }),
      Animated.timing(bounceY, { toValue: 0,  duration: 1200, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  const handleConfirm = () => {
    const finalName = inputName.trim() || pet.name;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    namePet(finalName);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.container}>
          {/* Pet preview */}
          <Animated.View style={[
            styles.petPreview,
            { backgroundColor: pet.colorLight, transform: [{ scale: scaleAnim }, { translateY: bounceY }] },
          ]}>
            <Text style={styles.petEmoji}>{pet.emoji}</Text>
          </Animated.View>

          <Text style={styles.heading}>Give your {pet.name} a name!</Text>
          <Text style={styles.sub}>This will be their name forever 💕</Text>

          {/* Name input */}
          <View style={styles.inputWrap}>
            <TextInput
              style={[styles.input, { borderColor: pet.color }]}
              value={inputName}
              onChangeText={setInputName}
              placeholder={`e.g. "${pet.name}"`}
              placeholderTextColor="#C0B5AE"
              maxLength={16}
              autoCapitalize="words"
              autoFocus
            />
            {inputName.length === 0 && (
              <Text style={styles.defaultHint}>
                Leave blank to use "{pet.name}"
              </Text>
            )}
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, { backgroundColor: pet.color }]}
            onPress={handleConfirm}
            activeOpacity={0.88}
          >
            <Text style={styles.confirmText}>
              Welcome home, {inputName || pet.name}! 🏠
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1, backgroundColor: '#FFF9F0' },
  container:   { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 20 },
  petPreview:  { width: 160, height: 160, borderRadius: 80, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 6 },
  petEmoji:    { fontSize: 90 },
  heading:     { fontSize: 26, fontWeight: '900', color: '#3D3530', textAlign: 'center' },
  sub:         { fontSize: 14, fontWeight: '700', color: '#8B8178', textAlign: 'center' },
  inputWrap:   { width: '100%', gap: 6 },
  input:       { backgroundColor: '#fff', borderRadius: 16, borderWidth: 3, paddingHorizontal: 20, paddingVertical: 16, fontSize: 22, fontWeight: '800', color: '#3D3530', textAlign: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  defaultHint: { fontSize: 12, color: '#C0B5AE', fontWeight: '700', textAlign: 'center' },
  confirmBtn:  { width: '100%', borderRadius: 99, paddingVertical: 18, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 5 },
  confirmText: { color: '#fff', fontSize: 18, fontWeight: '900' },
});
