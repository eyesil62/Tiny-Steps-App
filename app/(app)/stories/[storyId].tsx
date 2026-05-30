import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { speak, stopSpeech } from '../../../src/lib/speech';
import { getStoryById } from '../../../src/data/storiesData';
import { colors, fontSize, fontWeight, radius, shadow, spacing } from '../../../src/theme';

const { width } = Dimensions.get('window');

export default function StoryReader() {
  const { storyId }     = useLocalSearchParams<{ storyId: string }>();
  const story           = getStoryById(storyId);
  const [page, setPage] = useState(0);
  const [isReading, setIsReading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(1)).current;

  if (!story) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 48 }}>📖</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.coral, fontWeight: fontWeight.heavy }}>← Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const currentPage = story.pages[page];
  const isBedtime   = story.isBedtime;

  const changePage = useCallback((newPage: number) => {
    stopSpeech();
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      setPage(newPage);
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  }, [fadeAnim]);

  const readPage = useCallback((text: string) => {
    setIsReading(true);
    speak(text, {
      rate:  isBedtime ? 0.72 : 0.82,
      pitch: isBedtime ? 0.88 : 1.0,
      onDone:  () => setIsReading(false),
      onError: () => setIsReading(false),
    });
  }, [isBedtime]);

  useEffect(() => {
    if (currentPage) setTimeout(() => readPage(currentPage.text), 400);
    return () => stopSpeech();
  }, [page]);

  const goNext = () => {
    stopSpeech();
    if (page < story.pages.length - 1) changePage(page + 1);
    else setIsComplete(true);
  };

  const goPrev = () => {
    if (page > 0) changePage(page - 1);
  };

  return (
    <View style={[styles.root, { backgroundColor: isBedtime ? '#0d1040' : colors.cream }]}>
      <SafeAreaView>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { stopSpeech(); router.back(); }} style={styles.backBtn}>
            <Text style={[styles.backText, isBedtime && { color: 'rgba(255,255,255,0.8)' }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isBedtime && { color: colors.white }]} numberOfLines={1}>
            {story.title}
          </Text>
          <TouchableOpacity onPress={() => readPage(currentPage.text)} style={styles.speakerBtn}>
            <Text style={styles.speakerEmoji}>{isReading ? '🔊' : '🔈'}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.dots}>
          {story.pages.map((_, i) => (
            <View key={i} style={[
              styles.dot,
              i === page && [styles.dotActive, { backgroundColor: story.color }],
              i < page  && styles.dotDone,
            ]} />
          ))}
        </View>
      </SafeAreaView>

      <Animated.View style={[styles.pageArea, { opacity: fadeAnim }]}>
        <View style={[styles.illustration, { backgroundColor: currentPage.bg }]}>
          <Text style={styles.illustrationEmoji}>{currentPage.emoji}</Text>
          {isBedtime && <>
            <Text style={styles.star1}>⭐</Text>
            <Text style={styles.star2}>✨</Text>
            <Text style={styles.star3}>⭐</Text>
          </>}
        </View>
        <View style={[styles.textBox, isBedtime && styles.textBoxDark]}>
          <Text style={[styles.pageText, isBedtime && styles.pageTextDark]}>
            {currentPage.text}
          </Text>
        </View>
      </Animated.View>

      <SafeAreaView>
        <View style={styles.nav}>
          <TouchableOpacity onPress={goPrev} disabled={page === 0}
            style={[styles.navBtn, page === 0 && styles.navBtnDisabled]} activeOpacity={0.8}>
            <Text style={styles.navBtnText}>‹ Back</Text>
          </TouchableOpacity>
          <Text style={[styles.pageNum, isBedtime && { color: 'rgba(255,255,255,0.5)' }]}>
            {page + 1} / {story.pages.length}
          </Text>
          <TouchableOpacity onPress={goNext} style={[styles.navBtn, { backgroundColor: story.color }]} activeOpacity={0.85}>
            <Text style={[styles.navBtnText, { color: colors.white }]}>
              {page === story.pages.length - 1 ? 'Finish ✓' : 'Next ›'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {isComplete && (
        <View style={styles.overlay}>
          <Text style={styles.overlayEmoji}>🌟</Text>
          <Text style={styles.overlayTitle}>The End!</Text>
          <Text style={styles.overlaySub}>{story.title}</Text>
          <TouchableOpacity style={[styles.overlayBtn, { backgroundColor: story.color }]}
            onPress={() => { setIsComplete(false); changePage(0); }}>
            <Text style={styles.overlayBtnText}>Read Again 📖</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={[styles.overlayBackText, { color: story.color }]}>Back to Stories</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root:              { flex: 1 },
  header:            { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  backBtn:           { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:          { fontSize: 24, fontWeight: fontWeight.heavy, color: colors.dark },
  headerTitle:       { flex: 1, textAlign: 'center', fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark },
  speakerBtn:        { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  speakerEmoji:      { fontSize: 22 },
  dots:              { flexDirection: 'row', justifyContent: 'center', gap: 6, paddingBottom: spacing.sm },
  dot:               { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.sand },
  dotActive:         { width: 20 },
  dotDone:           { backgroundColor: colors.warmGray },
  pageArea:          { flex: 1, paddingHorizontal: spacing.lg, gap: spacing.md },
  illustration:      { flex: 1, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', minHeight: 200, position: 'relative', overflow: 'hidden' },
  illustrationEmoji: { fontSize: 100 },
  star1: { position: 'absolute', top: 20,  left: 20,  fontSize: 20, opacity: 0.6 },
  star2: { position: 'absolute', top: 40,  right: 30, fontSize: 16, opacity: 0.5 },
  star3: { position: 'absolute', bottom: 30, left: 40, fontSize: 18, opacity: 0.6 },
  textBox:           { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, ...shadow.md, marginBottom: spacing.sm },
  textBoxDark:       { backgroundColor: 'rgba(255,255,255,0.1)' },
  pageText:          { fontSize: fontSize.lg, color: colors.dark, fontWeight: fontWeight.bold, lineHeight: 28, textAlign: 'center' },
  pageTextDark:      { color: colors.white },
  nav:               { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  navBtn:            { borderRadius: radius.full, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: colors.sand },
  navBtnDisabled:    { opacity: 0.3 },
  navBtnText:        { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark },
  pageNum:           { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.warmGray },
  overlay:           { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', alignItems: 'center', justifyContent: 'center', gap: 16, zIndex: 99 },
  overlayEmoji:      { fontSize: 80 },
  overlayTitle:      { fontSize: 40, fontWeight: fontWeight.heavy, color: colors.white },
  overlaySub:        { fontSize: fontSize.md, color: 'rgba(255,255,255,0.7)', fontWeight: fontWeight.bold },
  overlayBtn:        { borderRadius: radius.full, paddingHorizontal: 40, paddingVertical: 16, marginTop: 8 },
  overlayBtnText:    { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.white },
  overlayBackText:   { fontSize: fontSize.md, fontWeight: fontWeight.heavy, marginTop: 8 },
});
