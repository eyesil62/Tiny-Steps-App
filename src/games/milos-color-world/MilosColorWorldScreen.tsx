// ============================================================
// Milo's Color World — Main Game Screen
// Premium kids coloring game with collect/display/build loop
// Original TinySteps game
// ============================================================
import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  StyleSheet, ScrollView, Dimensions, Modal, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';

import { useColorWorldStore }   from './store/useColorWorldStore';
import { ColoringCanvas }       from './components/ColoringCanvas';
import { ColorPalette }         from './components/ColorPalette';
import { ToolBar }              from './components/ToolBar';
import { RewardModal }          from './components/RewardModal';
import { StickerBook }          from './components/StickerBook';
import { ToyShelf }             from './components/ToyShelf';

import { COLORING_PAGES, CATEGORIES, getPagesByCategory, ColoringPage } from './data/coloringPages';
import { STICKERS, TOYS, getArtistLevel }                               from './data/rewards';

const { width: W } = Dimensions.get('window');

type Screen = 'home' | 'categories' | 'pages' | 'coloring' | 'stickers' | 'toys';

function say(text: string) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate: 0.85, pitch: 1.1 }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 120);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate: 0.85, pitch: 1.1 }); } catch {} }, 120));
}

// ── Home Screen ──────────────────────────────────────────
function HomeScreen({ onStart, onStickers, onToys, store }: any) {
  const completed   = store.completedPages.length;
  const artistLevel = getArtistLevel(completed);

  return (
    <ScrollView contentContainerStyle={styles.homeScroll}>
      {/* Milo greeting */}
      <View style={styles.miloRow}>
        <Text style={styles.miloHomeEmoji}>🦉</Text>
        <View style={styles.miloBubble}>
          <Text style={styles.miloText}>
            Welcome to Color World! Let's paint something amazing today! 🎨
          </Text>
        </View>
      </View>

      {/* Artist level */}
      <View style={styles.levelCard}>
        <Text style={{ fontSize: 44 }}>{artistLevel.emoji}</Text>
        <View>
          <Text style={styles.levelTitle}>{artistLevel.title}</Text>
          <Text style={styles.levelSub}>{completed} pages colored · ⭐{store.totalStars} stars</Text>
        </View>
      </View>

      {/* Main action */}
      <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.88}>
        <Text style={styles.startBtnEmoji}>🎨</Text>
        <Text style={styles.startBtnText}>Color a Picture!</Text>
      </TouchableOpacity>

      {/* Collections */}
      <Text style={styles.homeSection}>My Collections</Text>
      <View style={styles.collectRow}>
        <TouchableOpacity style={styles.collectCard} onPress={onStickers} activeOpacity={0.85}>
          <Text style={{ fontSize: 36 }}>📒</Text>
          <Text style={styles.collectLabel}>Sticker Book</Text>
          <Text style={styles.collectCount}>{store.unlockedStickers.length}/{STICKERS.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.collectCard} onPress={onToys} activeOpacity={0.85}>
          <Text style={{ fontSize: 36 }}>🧸</Text>
          <Text style={styles.collectLabel}>Toy Shelf</Text>
          <Text style={styles.collectCount}>{store.unlockedToys.length}/{TOYS.length}</Text>
        </TouchableOpacity>
      </View>

      {/* Recent completions */}
      {store.completedPages.length > 0 && (
        <>
          <Text style={styles.homeSection}>Recently Colored</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recentRow}>
            {store.completedPages.slice(-6).reverse().map((pageId: string) => {
              const page = COLORING_PAGES.find(p => p.id === pageId);
              return page ? (
                <View key={pageId} style={styles.recentItem}>
                  <Text style={{ fontSize: 36 }}>{page.emoji}</Text>
                  <Text style={styles.recentName}>{page.title}</Text>
                </View>
              ) : null;
            })}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

// ── Category Selection ───────────────────────────────────
function CategoryScreen({ onSelect, completedPages }: { onSelect: (cat: string) => void; completedPages: string[] }) {
  return (
    <ScrollView contentContainerStyle={styles.categoryScroll}>
      <Text style={styles.categoryTitle}>What do you want to color?</Text>
      <View style={styles.categoryGrid}>
        {CATEGORIES.map(cat => {
          const pages    = getPagesByCategory(cat.id);
          const done     = pages.filter(p => completedPages.includes(p.id)).length;
          const locked   = completedPages.length < cat.unlockAt;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.catCard, { borderColor: cat.color }, locked && styles.catLocked]}
              onPress={() => !locked && onSelect(cat.id)}
              activeOpacity={locked ? 0.5 : 0.88}
            >
              <View style={[styles.catBanner, { backgroundColor: cat.color }]}>
                <Text style={styles.catEmoji}>{locked ? '🔒' : cat.emoji}</Text>
              </View>
              <View style={styles.catInfo}>
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catProgress}>{done}/{pages.length} colored</Text>
                {locked && <Text style={styles.catLockText}>{cat.unlockAt} pages to unlock</Text>}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── Page Selection ───────────────────────────────────────
function PageSelectScreen({ category, onSelect, completedPages, pageColorings }: any) {
  const pages    = getPagesByCategory(category);
  const cat      = CATEGORIES.find(c => c.id === category);

  return (
    <ScrollView contentContainerStyle={styles.pageScroll}>
      <Text style={styles.pageSectionTitle}>{cat?.emoji} {cat?.name}</Text>
      <View style={styles.pageGrid}>
        {pages.map(page => {
          const done       = completedPages.includes(page.id);
          const inProgress = pageColorings[page.id] && Object.keys(pageColorings[page.id]).length > 0;
          return (
            <TouchableOpacity
              key={page.id}
              style={[styles.pageCard, done && styles.pageCardDone]}
              onPress={() => onSelect(page)}
              activeOpacity={0.88}
            >
              <View style={[styles.pagePreview, done && { backgroundColor: '#E5F7E7' }]}>
                <Text style={styles.pageEmoji}>{page.emoji}</Text>
                {done && <Text style={styles.pageCheck}>✓</Text>}
                {inProgress && !done && <View style={styles.pageProgressDot} />}
              </View>
              <Text style={styles.pageTitle}>{page.title}</Text>
              <Text style={styles.pageDiff}>
                {'⭐'.repeat(page.difficulty)}
                {'☆'.repeat(5 - page.difficulty)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ── Coloring Screen ──────────────────────────────────────
function ColoringScreen({ page, colorings, selectedColor, unlockedColors, onPaint, onUndo, onRedo, canUndo, canRedo, onClear, progress, onBack }: any) {
  return (
    <View style={styles.coloringScreen}>
      {/* Canvas area */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.canvasScroll}
        style={styles.canvasArea}
      >
        <View style={styles.canvasPaper}>
          <Text style={styles.canvasTitle}>{page.emoji} {page.title}</Text>
          <ColoringCanvas
            page={page}
            colorings={colorings}
            selectedColor={selectedColor}
            onPaint={onPaint}
          />
        </View>
      </ScrollView>

      {/* Tools */}
      <ToolBar
        canUndo={canUndo}
        canRedo={canRedo}
        onUndo={onUndo}
        onRedo={onRedo}
        onClear={() => Alert.alert('Clear Page?', 'This will erase all your coloring!', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: onClear },
        ])}
        progress={progress}
      />

      {/* Color palette */}
      <ColorPalette
        selected={selectedColor}
        unlockedColors={unlockedColors}
        onSelect={(id) => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }}
      />
    </View>
  );
}

// ── Main Entry ────────────────────────────────────────────
export default function MilosColorWorldScreen() {
  const store       = useColorWorldStore();
  const [screen,    setScreen]    = useState<Screen>('home');
  const [category,  setCategory]  = useState('');
  const [currentPage, setCurrentPage] = useState<ColoringPage | null>(null);
  const [showReward,  setShowReward]  = useState(false);

  useEffect(() => { store.loadState(); }, []);

  const currentColorings = currentPage ? (store.pageColorings[currentPage.id] ?? {}) : {};

  // Calculate coloring progress
  const progress = currentPage
    ? (Object.keys(currentColorings).length / currentPage.regions.length) * 100
    : 0;

  // Check if page is complete
  useEffect(() => {
    if (!currentPage || showReward) return;
    const colored = Object.keys(currentColorings).length;
    const total   = currentPage.regions.length;
    if (colored >= total && total > 0) {
      setTimeout(() => {
        setShowReward(true);
        store.completePage(
          currentPage.id,
          currentPage.stickerId,
          currentPage.toyId,
          currentPage.worldContribution.world,
          currentPage.worldContribution.buildingId,
        );
      }, 600);
    }
  }, [currentColorings, currentPage]);

  const handlePaint = useCallback((regionId: string, colorId: string) => {
    if (!currentPage) return;
    store.paintRegion(currentPage.id, regionId, colorId);
  }, [currentPage, store]);

  const handleSelectPage = (page: ColoringPage) => {
    store.setCurrentPage(page.id);
    store.setColor('red');
    setCurrentPage(page);
    setScreen('coloring');
    say(`Let's color the ${page.title}! Pick a color and tap the shapes!`);
  };

  const sticker = currentPage ? STICKERS.find(s => s.id === currentPage.stickerId) : null;
  const toy     = currentPage ? TOYS.find(t => t.id === currentPage.toyId) : null;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={[styles.header, {
        backgroundColor: screen === 'coloring' ? '#C77DFF' :
                         screen === 'categories' || screen === 'pages' ? '#6BCB77' : '#FF9F43',
      }]}>
        <TouchableOpacity
          onPress={() => {
            if (screen === 'coloring') { setCurrentPage(null); setScreen('pages'); }
            else if (screen === 'pages') setScreen('categories');
            else if (screen === 'categories') setScreen('home');
            else if (screen === 'stickers' || screen === 'toys') setScreen('home');
            else router.back();
          }}
          style={styles.backBtn}
        >
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {screen === 'home'       ? '🎨 Milo\'s Color World' :
           screen === 'categories' ? '🎨 Choose Category' :
           screen === 'pages'      ? '🎨 Choose a Picture' :
           screen === 'coloring'   ? `🎨 ${currentPage?.title ?? 'Coloring'}` :
           screen === 'stickers'   ? '📒 Sticker Book' :
           '🧸 Toy Shelf'}
        </Text>

        <View style={styles.starsBadge}>
          <Text style={styles.starsText}>⭐{store.totalStars}</Text>
        </View>
      </View>

      {/* Screens */}
      {screen === 'home' && (
        <HomeScreen
          store={store}
          onStart={() => setScreen('categories')}
          onStickers={() => setScreen('stickers')}
          onToys={() => setScreen('toys')}
        />
      )}

      {screen === 'categories' && (
        <CategoryScreen
          completedPages={store.completedPages}
          onSelect={(cat: string) => { setCategory(cat); setScreen('pages'); }}
        />
      )}

      {screen === 'pages' && (
        <PageSelectScreen
          category={category}
          completedPages={store.completedPages}
          pageColorings={store.pageColorings}
          onSelect={handleSelectPage}
        />
      )}

      {screen === 'coloring' && currentPage && (
        <>
          <ColoringScreen
            page={currentPage}
            colorings={currentColorings}
            selectedColor={store.selectedColorId}
            unlockedColors={store.unlockedColors}
            onPaint={handlePaint}
            onUndo={store.undoLastAction}
            onRedo={store.redoLastAction}
            canUndo={store.undoStack.length > 0}
            canRedo={store.redoStack.length > 0}
            onClear={() => store.clearPage(currentPage.id)}
            progress={progress}
          />
          {/* Color selection */}
          <ColorPalette
            selected={store.selectedColorId}
            unlockedColors={store.unlockedColors}
            onSelect={store.setColor}
          />
        </>
      )}

      {screen === 'stickers' && (
        <StickerBook unlockedStickers={store.unlockedStickers} onClose={() => setScreen('home')} />
      )}

      {screen === 'toys' && (
        <ToyShelf unlockedToys={store.unlockedToys} onClose={() => setScreen('home')} />
      )}

      {/* Reward modal */}
      <RewardModal
        visible={showReward && !!currentPage}
        pageEmoji={currentPage?.emoji ?? ''}
        pageTitle={currentPage?.title ?? ''}
        speech={currentPage?.completionSpeech ?? 'Amazing coloring!'}
        animation={currentPage?.completionAnimation ?? 'bounce'}
        sticker={sticker ?? { emoji: '⭐', name: 'Sticker' }}
        toy={toy ?? { emoji: '🧸', name: 'Toy' }}
        stars={10}
        onContinue={() => {
          setShowReward(false);
          setScreen('home');
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:              { flex: 1, backgroundColor: '#FFF9F0' },
  header:            { flexDirection: 'row', alignItems: 'center', padding: 12 },
  backBtn:           { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:          { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerTitle:       { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '900', color: '#fff' },
  starsBadge:        { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 5 },
  starsText:         { fontSize: 13, fontWeight: '900', color: '#fff' },
  // Home
  homeScroll:        { padding: 16, gap: 16, paddingBottom: 32 },
  miloRow:           { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  miloHomeEmoji:     { fontSize: 52 },
  miloBubble:        { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  miloText:          { fontSize: 13, fontWeight: '700', color: '#3D3530', lineHeight: 20 },
  levelCard:         { backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  levelTitle:        { fontSize: 18, fontWeight: '900', color: '#3D3530' },
  levelSub:          { fontSize: 12, color: '#8B8178', fontWeight: '700', marginTop: 2 },
  startBtn:          { backgroundColor: '#C77DFF', borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 5 },
  startBtnEmoji:     { fontSize: 40 },
  startBtnText:      { fontSize: 22, fontWeight: '900', color: '#fff' },
  homeSection:       { fontSize: 13, fontWeight: '800', color: '#8B8178', letterSpacing: 0.5 },
  collectRow:        { flexDirection: 'row', gap: 12 },
  collectCard:       { flex: 1, backgroundColor: '#fff', borderRadius: 18, padding: 16, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 6, elevation: 2 },
  collectLabel:      { fontSize: 13, fontWeight: '900', color: '#3D3530' },
  collectCount:      { fontSize: 11, color: '#8B8178', fontWeight: '700' },
  recentRow:         { gap: 10, paddingBottom: 4 },
  recentItem:        { backgroundColor: '#fff', borderRadius: 14, padding: 10, alignItems: 'center', gap: 4, width: 76, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 1 },
  recentName:        { fontSize: 9, fontWeight: '700', color: '#8B8178', textAlign: 'center' },
  // Category
  categoryScroll:    { padding: 16, gap: 14, paddingBottom: 32 },
  categoryTitle:     { fontSize: 22, fontWeight: '900', color: '#3D3530', textAlign: 'center' },
  categoryGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard:           { width: '47%', backgroundColor: '#fff', borderRadius: 18, borderWidth: 2, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  catLocked:         { opacity: 0.6 },
  catBanner:         { height: 66, alignItems: 'center', justifyContent: 'center' },
  catEmoji:          { fontSize: 38 },
  catInfo:           { padding: 10, gap: 2 },
  catName:           { fontSize: 14, fontWeight: '900', color: '#3D3530' },
  catProgress:       { fontSize: 11, color: '#8B8178', fontWeight: '700' },
  catLockText:       { fontSize: 10, color: '#FF9F43', fontWeight: '800' },
  // Page select
  pageScroll:        { padding: 16, gap: 14, paddingBottom: 32 },
  pageSectionTitle:  { fontSize: 20, fontWeight: '900', color: '#3D3530' },
  pageGrid:          { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  pageCard:          { width: '30%', backgroundColor: '#fff', borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2 },
  pageCardDone:      { borderWidth: 2, borderColor: '#6BCB77' },
  pagePreview:       { height: 72, backgroundColor: '#F5EDD8', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  pageEmoji:         { fontSize: 40 },
  pageCheck:         { position: 'absolute', top: 4, right: 6, fontSize: 16, color: '#6BCB77', fontWeight: '900' },
  pageProgressDot:   { position: 'absolute', top: 4, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF9F43' },
  pageTitle:         { padding: 6, fontSize: 10, fontWeight: '800', color: '#3D3530', textAlign: 'center' },
  pageDiff:          { paddingBottom: 6, fontSize: 9, textAlign: 'center', color: '#FFD93D' },
  // Coloring screen
  coloringScreen:    { flex: 1 },
  canvasArea:        { flex: 1, backgroundColor: '#FAFAFA' },
  canvasScroll:      { padding: 16, alignItems: 'center', paddingBottom: 20 },
  canvasPaper:       { backgroundColor: '#fff', borderRadius: 20, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, alignItems: 'center', gap: 10 },
  canvasTitle:       { fontSize: 16, fontWeight: '900', color: '#3D3530' },
});
