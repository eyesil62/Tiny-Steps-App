import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../src/theme';

const { width } = Dimensions.get('window');

const FEATURES = [
  { emoji: '🎮', text: 'Fun learning games',    color: colors.coralLight    },
  { emoji: '📚', text: 'Bedtime stories',        color: colors.lavenderLight },
  { emoji: '🌍', text: '7 languages supported',  color: colors.skyLight      },
  { emoji: '👨‍👩‍👧', text: 'Parent dashboard',       color: colors.mintLight     },
];

export default function WelcomeScreen() {
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const mascotY   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 50, friction: 8, useNativeDriver: true }),
    ]).start();

    // Mascot float loop
    const float = Animated.loop(
      Animated.sequence([
        Animated.timing(mascotY, { toValue: -12, duration: 1800, useNativeDriver: true }),
        Animated.timing(mascotY, { toValue: 0,   duration: 1800, useNativeDriver: true }),
      ])
    );
    float.start();
    return () => float.stop();
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Background blobs */}
      <View style={[styles.blob, styles.blob1]} />
      <View style={[styles.blob, styles.blob2]} />

      <Animated.View style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

        {/* Mascot */}
        <Animated.View style={[styles.mascotWrap, { transform: [{ translateY: mascotY }] }]}>
          <View style={styles.mascotCircle}>
            <Text style={styles.mascotEmoji}>🦉</Text>
          </View>
          {/* Stars around mascot */}
          <Text style={styles.star1}>⭐</Text>
          <Text style={styles.star2}>✨</Text>
          <Text style={styles.star3}>🌟</Text>
        </Animated.View>

        <Text style={styles.appName}>TinySteps</Text>
        <Text style={styles.tagline}>Every little step is a big adventure</Text>

        {/* Feature pills */}
        <View style={styles.features}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.text}
              style={[
                styles.featurePill,
                { backgroundColor: f.color },
                { opacity: fadeAnim },
              ]}
            >
              <Text style={styles.featureEmoji}>{f.emoji}</Text>
              <Text style={styles.featureText}>{f.text}</Text>
            </Animated.View>
          ))}
        </View>

        {/* CTA Buttons */}
        <View style={styles.buttons}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => router.push('/(auth)/signup')}
            activeOpacity={0.88}
          >
            <Text style={styles.primaryBtnText}>Get Started 🚀</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>
              I already have an account — <Text style={{ color: colors.coral }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.legal}>🔒 Safe for kids · No ads · COPPA compliant</Text>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:           { flex: 1, backgroundColor: colors.cream },
  blob1:          { top: -80, right: -80, backgroundColor: colors.coralLight },
  blob2:          { bottom: -60, left: -60, backgroundColor: colors.mintLight },
  blob:           { position: 'absolute', width: 200, height: 200, borderRadius: 100, opacity: 0.6 },
  container:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.lg },
  mascotWrap:     { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  mascotCircle:   { width: 130, height: 130, borderRadius: 65, backgroundColor: colors.sunLight, alignItems: 'center', justifyContent: 'center', ...shadow.md },
  mascotEmoji:    { fontSize: 70 },
  star1:          { position: 'absolute', top: -8,   right: 0,  fontSize: 20 },
  star2:          { position: 'absolute', bottom: 0, right: -12, fontSize: 16 },
  star3:          { position: 'absolute', top: 10,   left: -8,  fontSize: 18 },
  appName:        { fontSize: 44, fontWeight: fontWeight.heavy, color: colors.coral, letterSpacing: 0.5 },
  tagline:        { fontSize: fontSize.md, color: colors.warmGray, fontWeight: fontWeight.bold, textAlign: 'center' },
  features:       { width: '100%', gap: spacing.sm },
  featurePill:    { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 16, ...shadow.sm },
  featureEmoji:   { fontSize: 22 },
  featureText:    { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark },
  buttons:        { width: '100%', gap: spacing.md, alignItems: 'center' },
  primaryBtn:     { width: '100%', backgroundColor: colors.coral, borderRadius: radius.full, paddingVertical: 18, alignItems: 'center', ...shadow.md },
  primaryBtnText: { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.heavy },
  secondaryBtn:   { paddingVertical: 8 },
  secondaryBtnText:{ fontSize: fontSize.sm, color: colors.warmGray, fontWeight: fontWeight.bold, textAlign: 'center' },
  legal:          { fontSize: fontSize.xs, color: colors.warmGray, fontWeight: fontWeight.bold, textAlign: 'center' },
});
