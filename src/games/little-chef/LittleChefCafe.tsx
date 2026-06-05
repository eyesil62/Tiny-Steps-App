// ============================================================
// Little Chef Cafe — Ages 4–8
// Original TinySteps game — run your own cute cafe
// Take orders, cook, serve, unlock recipes, decorate cafe
// ============================================================
import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  StyleSheet, ScrollView, Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';

const { width: W } = Dimensions.get('window');
const STORE_KEY = 'littlechefcafe_v1';

function say(text: string, rate = 0.84, pitch = 1.0) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 130);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} }, 130));
}

// ── Menu items ────────────────────────────────────────────
interface MenuItem {
  id:          string;
  name:        string;
  emoji:       string;
  price:       number;
  cookTime:    number;  // seconds simulation (taps needed)
  ingredients: { emoji: string; name: string }[];
  unlockCoins: number;
  color:       string;
}

const MENU: MenuItem[] = [
  {
    id: 'pancakes', name: 'Fluffy Pancakes', emoji: '🥞', price: 3, cookTime: 2, unlockCoins: 0, color: '#FF9F43',
    ingredients: [{ emoji: '🥚', name: 'Egg' }, { emoji: '🥛', name: 'Milk' }, { emoji: '🌾', name: 'Flour' }],
  },
  {
    id: 'soup', name: 'Tomato Soup', emoji: '🍲', price: 4, cookTime: 3, unlockCoins: 0, color: '#FF6B6B',
    ingredients: [{ emoji: '🍅', name: 'Tomato' }, { emoji: '🧅', name: 'Onion' }, { emoji: '🌿', name: 'Herbs' }],
  },
  {
    id: 'pizza', name: 'Mini Pizza', emoji: '🍕', price: 5, cookTime: 3, unlockCoins: 20, color: '#FF9F43',
    ingredients: [{ emoji: '🫓', name: 'Dough' }, { emoji: '🧅', name: 'Sauce' }, { emoji: '🧀', name: 'Cheese' }],
  },
  {
    id: 'sandwich', name: 'Club Sandwich', emoji: '🥪', price: 3, cookTime: 1, unlockCoins: 10, color: '#6BCB77',
    ingredients: [{ emoji: '🍞', name: 'Bread' }, { emoji: '🥬', name: 'Lettuce' }, { emoji: '🧀', name: 'Cheese' }],
  },
  {
    id: 'cupcake', name: 'Rainbow Cupcake', emoji: '🧁', price: 4, cookTime: 3, unlockCoins: 35, color: '#C77DFF',
    ingredients: [{ emoji: '🌾', name: 'Flour' }, { emoji: '🥚', name: 'Egg' }, { emoji: '🍬', name: 'Sugar' }],
  },
  {
    id: 'juice', name: 'Fresh Juice', emoji: '🍹', price: 2, cookTime: 1, unlockCoins: 0, color: '#FFD93D',
    ingredients: [{ emoji: '🍊', name: 'Orange' }, { emoji: '💧', name: 'Water' }],
  },
  {
    id: 'pasta', name: 'Creamy Pasta', emoji: '🍝', price: 5, cookTime: 3, unlockCoins: 50, color: '#FFD93D',
    ingredients: [{ emoji: '🍝', name: 'Pasta' }, { emoji: '🧀', name: 'Cheese' }, { emoji: '🧅', name: 'Garlic' }],
  },
  {
    id: 'smoothie', name: 'Berry Smoothie', emoji: '🥤', price: 3, cookTime: 1, unlockCoins: 15, color: '#C77DFF',
    ingredients: [{ emoji: '🍓', name: 'Berries' }, { emoji: '🍌', name: 'Banana' }, { emoji: '🥛', name: 'Milk' }],
  },
];

// ── Customers ────────────────────────────────────────────
const CUSTOMERS = [
  { id: 'lily',    emoji: '👧', name: 'Lily',    speech: 'Oh yum! That smells delicious! Thank you so much!' },
  { id: 'omar',    emoji: '👦', name: 'Omar',    speech: 'Wow that is perfect! You are an amazing chef!' },
  { id: 'gran',    emoji: '👵', name: 'Gran',    speech: 'Oh my! This reminds me of my own cooking! Wonderful!' },
  { id: 'teacher', emoji: '👩', name: 'Miss Chen', speech: 'Mmm! Five stars from me! Absolutely delicious!' },
  { id: 'twins',   emoji: '👫', name: 'The Twins', speech: 'We both love it! You are the best chef ever!' },
];

// ── Decor items ───────────────────────────────────────────
const DECOR_ITEMS = [
  { id: 'flowers',  emoji: '🌸', name: 'Flower Vase',    cost: 15 },
  { id: 'lights',   emoji: '🏮', name: 'Fairy Lights',   cost: 25 },
  { id: 'plant',    emoji: '🪴', name: 'Plant',          cost: 20 },
  { id: 'sign',     emoji: '🪧', name: 'Cafe Sign',      cost: 30 },
  { id: 'art',      emoji: '🖼️',  name: 'Wall Art',       cost: 40 },
];

type Phase = 'menu' | 'order' | 'cook' | 'serve' | 'decor';

export default function LittleChefCafe() {
  const [coins,       setCoins]       = useState(10);
  const [score,       setScore]       = useState(0);
  const [served,      setServed]      = useState(0);
  const [unlockedMenu,setUnlocked]    = useState<string[]>(['pancakes','soup','juice','sandwich']);
  const [ownedDecor,  setOwnedDecor]  = useState<string[]>([]);
  const [phase,       setPhase]       = useState<Phase>('order');
  const [order,       setOrder]       = useState<MenuItem>(MENU[0]);
  const [customer,    setCustomer]    = useState(CUSTOMERS[0]);
  const [addedIngs,   setAddedIngs]   = useState<string[]>([]);
  const [cookProgress,setCookProgress]= useState(0);
  const [cooking,     setCooking]     = useState(false);
  const [feedback,    setFeedback]    = useState<string | null>(null);
  const [happiness,   setHappiness]   = useState(5);
  const plateAnim      = useRef(new Animated.Value(0)).current;
  const customerAnim   = useRef(new Animated.Value(0)).current;
  const cookIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (cookIntervalRef.current) clearInterval(cookIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORE_KEY).then(raw => {
      if (!raw) return;
      const s = JSON.parse(raw);
      setCoins(s.coins ?? 10);
      setScore(s.score ?? 0);
      setServed(s.served ?? 0);
      setUnlocked(s.unlockedMenu ?? ['pancakes','soup','juice','sandwich']);
      setOwnedDecor(s.ownedDecor ?? []);
    });
    nextCustomer(['pancakes','soup','juice','sandwich']);
  }, []);

  const save = (c: number, sc: number, sv: number, u: string[], d: string[]) => {
    AsyncStorage.setItem(STORE_KEY, JSON.stringify({ coins: c, score: sc, served: sv, unlockedMenu: u, ownedDecor: d }));
  };

  function nextCustomer(menu: string[]) {
    const c    = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    const avail = MENU.filter(m => menu.includes(m.id));
    const item  = avail[Math.floor(Math.random() * avail.length)];
    setCustomer(c);
    setOrder(item);
    setPhase('order');
    setAddedIngs([]);
    setCookProgress(0);
    setCooking(false);
    customerAnim.setValue(W);
    Animated.spring(customerAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }).start();
    setTimeout(() => say(`Hello! I am ${c.name}! Can I please have ${item.name}?`, 0.88, 1.1), 500);
  }

  const startCooking = () => {
    setPhase('cook');
    setAddedIngs([]);
    say(`Let\'s make ${order.name}! Add the ingredients!`);
  };

  const addIngredient = (ing: { emoji: string; name: string }) => {
    if (addedIngs.includes(ing.name)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    say(`Adding ${ing.name}!`, 0.9, 1.1);
    const newAdded = [...addedIngs, ing.name];
    setAddedIngs(newAdded);

    if (newAdded.length >= order.ingredients.length) {
      // All ingredients in — start cook animation
      setCooking(true);
      if (cookIntervalRef.current) clearInterval(cookIntervalRef.current);
      let progress = 0;
      cookIntervalRef.current = setInterval(() => {
        progress += 25;
        setCookProgress(progress);
        if (progress >= 100) {
          clearInterval(cookIntervalRef.current!);
          cookIntervalRef.current = null;
          setCooking(false);
          setPhase('serve');
          say(`${order.name} is ready! Serve it to ${customer.name}!`);
          plateAnim.setValue(0);
          Animated.spring(plateAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();
        }
      }, 400);
    }
  };

  const serveCustomer = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    say(customer.speech);
    const earned    = order.price;
    const newCoins  = coins + earned;
    const newScore  = score + earned * 10;
    const newServed = served + 1;

    // Unlock menu items by coins
    const newUnlocked = [...unlockedMenu];
    MENU.forEach(m => {
      if (!newUnlocked.includes(m.id) && newCoins >= m.unlockCoins) newUnlocked.push(m.id);
    });

    setCoins(newCoins);
    setScore(newScore);
    setServed(newServed);
    setUnlocked(newUnlocked);
    setFeedback(`+${earned} 🪙`);
    setHappiness(Math.min(5, happiness + 1));
    save(newCoins, newScore, newServed, newUnlocked, ownedDecor);

    setTimeout(() => {
      setFeedback(null);
      nextCustomer(newUnlocked);
    }, 1800);
  };

  const buyDecor = (item: typeof DECOR_ITEMS[0]) => {
    if (coins < item.cost || ownedDecor.includes(item.id)) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    say(`You bought ${item.name}! The cafe looks wonderful!`);
    const newCoins = coins - item.cost;
    const newDecor = [...ownedDecor, item.id];
    setCoins(newCoins);
    setOwnedDecor(newDecor);
    save(newCoins, score, served, unlockedMenu, newDecor);
    setFeedback(`${item.emoji} Added!`);
    setTimeout(() => setFeedback(null), 1500);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>👨‍🍳 Little Chef Cafe</Text>
          <Text style={styles.headerSub}>⭐{score} · 🍽️{served} served</Text>
        </View>
        <TouchableOpacity onPress={() => setPhase('decor')} style={styles.decorBtn}>
          <Text style={styles.decorBtnText}>🏪</Text>
        </TouchableOpacity>
        <View style={styles.coinsBadge}><Text style={styles.coinsText}>🪙{coins}</Text></View>
      </View>

      {/* Feedback */}
      {feedback && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackBannerText}>{feedback}</Text>
        </View>
      )}

      {phase === 'decor' ? (
        // ── DECOR SHOP ────────────────────────────────────
        <ScrollView contentContainerStyle={styles.decorScroll}>
          <Text style={styles.decorTitle}>🏪 Decorate Your Cafe</Text>
          <Text style={styles.decorSub}>You have 🪙{coins} coins</Text>

          {/* Cafe preview */}
          <View style={styles.cafePreview}>
            <Text style={styles.cafeSignEmoji}>☕</Text>
            <Text style={styles.cafeName}>Little Chef Cafe</Text>
            <View style={styles.cafeDecorRow}>
              {ownedDecor.map(id => {
                const d = DECOR_ITEMS.find(i => i.id === id);
                return d ? <Text key={id} style={{ fontSize: 28 }}>{d.emoji}</Text> : null;
              })}
            </View>
            <View style={styles.happinessRow}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Text key={i} style={[styles.heart, { opacity: i < happiness ? 1 : 0.2 }]}>❤️</Text>
              ))}
            </View>
          </View>

          {DECOR_ITEMS.map((item) => {
            const owned  = ownedDecor.includes(item.id);
            const canBuy = coins >= item.cost;
            return (
              <TouchableOpacity key={item.id}
                style={[styles.decorCard, owned && styles.decorCardOwned, !canBuy && !owned && styles.decorCardDisabled]}
                onPress={() => !owned && buyDecor(item)} activeOpacity={owned ? 1 : 0.85}>
                <Text style={styles.decorEmoji}>{item.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.decorName}>{item.name}</Text>
                  <Text style={styles.decorEffect}>Makes customers happier!</Text>
                </View>
                <View style={[styles.decorCost, owned && { backgroundColor: '#6BCB77' }]}>
                  <Text style={styles.decorCostText}>{owned ? '✓ Owned' : `🪙${item.cost}`}</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity style={styles.backToCafe} onPress={() => setPhase('order')} activeOpacity={0.85}>
            <Text style={styles.backToCafeText}>← Back to Cafe</Text>
          </TouchableOpacity>
        </ScrollView>

      ) : (
        <View style={styles.gameArea}>
          {/* Customer zone */}
          <Animated.View style={[styles.customerZone, { transform: [{ translateX: customerAnim }] }]}>
            <View style={styles.customerBubble}>
              <Text style={styles.customerEmoji}>{customer.emoji}</Text>
              {order && (phase === 'order' || phase === 'cook') && (
                <View style={styles.orderSpeechBubble}>
                  <Text style={styles.orderSpeechText}>
                    {phase === 'order' ? `I'd love ${order.name}! ${order.emoji}` : 'I am waiting... 😊'}
                  </Text>
                </View>
              )}
              {phase === 'serve' && (
                <View style={[styles.orderSpeechBubble, { backgroundColor: '#E5F7E7' }]}>
                  <Text style={styles.orderSpeechText}>Ooh it looks amazing! 😍</Text>
                </View>
              )}
            </View>
          </Animated.View>

          {/* Kitchen area */}
          <View style={styles.kitchen}>

            {/* ORDER phase */}
            {phase === 'order' && order && (
              <View style={styles.phaseCard}>
                <Text style={styles.phaseBadge}>📋 New order!</Text>
                <View style={styles.orderItem}>
                  <Text style={{ fontSize: 72 }}>{order.emoji}</Text>
                  <Text style={styles.orderItemName}>{order.name}</Text>
                  <Text style={styles.orderItemPrice}>Worth 🪙{order.price}</Text>
                </View>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#FF9F43' }]} onPress={startCooking} activeOpacity={0.88}>
                  <Text style={styles.actionBtnText}>👨‍🍳 Start Cooking!</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* COOK phase */}
            {phase === 'cook' && order && (
              <View style={styles.phaseCard}>
                <Text style={styles.phaseBadge}>
                  {cooking ? '⏳ Cooking...' : `🧑‍🍳 Add ${order.ingredients.length - addedIngs.length} ingredients!`}
                </Text>
                {/* Cooking vessel */}
                <View style={styles.cookingPot}>
                  <Text style={{ fontSize: 56 }}>🫕</Text>
                  <View style={styles.potContents}>
                    {addedIngs.map((name, i) => {
                      const ing = order.ingredients.find(x => x.name === name);
                      return ing ? <Text key={i} style={{ fontSize: 22 }}>{ing.emoji}</Text> : null;
                    })}
                  </View>
                </View>
                {/* Cook progress */}
                {cooking && (
                  <View style={styles.progressBarWrap}>
                    <Animated.View style={[styles.progressBarFill, { width: `${cookProgress}%` }]} />
                  </View>
                )}
                {/* Ingredient buttons */}
                {!cooking && (
                  <View style={styles.ingredientsWrap}>
                    {order.ingredients.map((ing) => {
                      const added = addedIngs.includes(ing.name);
                      return (
                        <TouchableOpacity key={ing.name}
                          style={[styles.ingBtn, added && styles.ingBtnDone]}
                          onPress={() => addIngredient(ing)} disabled={added} activeOpacity={0.85}>
                          <Text style={styles.ingEmoji}>{ing.emoji}</Text>
                          <Text style={styles.ingName}>{ing.name}</Text>
                          {added && <Text style={styles.ingCheck}>✓</Text>}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
              </View>
            )}

            {/* SERVE phase */}
            {phase === 'serve' && order && (
              <View style={styles.phaseCard}>
                <Text style={styles.phaseBadge}>🍽️ Time to serve!</Text>
                <Animated.View style={{ alignItems: 'center', gap: 8, transform: [{ scale: plateAnim.interpolate({ inputRange: [0,1], outputRange: [0.5,1] }) }] }}>
                  <Text style={{ fontSize: 80 }}>{order.emoji}</Text>
                  <Text style={styles.readyLabel}>{order.name} is ready!</Text>
                </Animated.View>
                <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#6BCB77' }]} onPress={serveCustomer} activeOpacity={0.88}>
                  <Text style={styles.actionBtnText}>🍽️ Serve to {customer.name}!</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: '#FFF9F0' },
  header:           { flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: '#FF6B6B', gap: 8 },
  backBtn:          { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:         { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerCenter:     { flex: 1 },
  headerTitle:      { fontSize: 16, fontWeight: '900', color: '#fff' },
  headerSub:        { fontSize: 11, color: 'rgba(255,255,255,0.8)', fontWeight: '700' },
  decorBtn:         { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 12, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  decorBtnText:     { fontSize: 20 },
  coinsBadge:       { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  coinsText:        { fontSize: 14, fontWeight: '900', color: '#fff' },
  feedbackBanner:   { backgroundColor: '#FFD93D', padding: 8, alignItems: 'center' },
  feedbackBannerText:{ fontSize: 18, fontWeight: '900', color: '#3D3530' },
  gameArea:         { flex: 1 },
  customerZone:     { backgroundColor: '#E5EFFE', padding: 14, alignItems: 'center' },
  customerBubble:   { flexDirection: 'row', alignItems: 'center', gap: 10 },
  customerEmoji:    { fontSize: 52 },
  orderSpeechBubble:{ flex: 1, backgroundColor: '#fff', borderRadius: 16, borderBottomLeftRadius: 4, padding: 10 },
  orderSpeechText:  { fontSize: 14, fontWeight: '800', color: '#3D3530' },
  kitchen:          { flex: 1, padding: 14 },
  phaseCard:        { backgroundColor: '#fff', borderRadius: 20, padding: 18, gap: 14, alignItems: 'center', flex: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  phaseBadge:       { fontSize: 18, fontWeight: '900', color: '#3D3530' },
  orderItem:        { alignItems: 'center', gap: 6 },
  orderItemName:    { fontSize: 22, fontWeight: '900', color: '#3D3530' },
  orderItemPrice:   { fontSize: 14, color: '#FF9F43', fontWeight: '800' },
  actionBtn:        { borderRadius: 99, paddingHorizontal: 32, paddingVertical: 16, width: '100%', alignItems: 'center' },
  actionBtnText:    { color: '#fff', fontSize: 17, fontWeight: '900' },
  cookingPot:       { alignItems: 'center', position: 'relative' },
  potContents:      { flexDirection: 'row', gap: 4, marginTop: -18 },
  progressBarWrap:  { width: '100%', height: 14, backgroundColor: '#F5EDD8', borderRadius: 7, overflow: 'hidden' },
  progressBarFill:  { height: '100%', backgroundColor: '#6BCB77', borderRadius: 7 },
  ingredientsWrap:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  ingBtn:           { backgroundColor: '#FFF9F0', borderRadius: 14, padding: 12, borderWidth: 2, borderColor: '#F5EDD8', alignItems: 'center', gap: 4, width: 76, position: 'relative' },
  ingBtnDone:       { backgroundColor: '#E5F7E7', borderColor: '#6BCB77' },
  ingEmoji:         { fontSize: 32 },
  ingName:          { fontSize: 10, fontWeight: '800', color: '#3D3530' },
  ingCheck:         { position: 'absolute', top: 4, right: 4, fontSize: 13, color: '#6BCB77', fontWeight: '900' },
  readyLabel:       { fontSize: 18, fontWeight: '900', color: '#3D3530' },
  // Decor
  decorScroll:      { padding: 16, gap: 12, paddingBottom: 32 },
  decorTitle:       { fontSize: 26, fontWeight: '900', color: '#3D3530', textAlign: 'center' },
  decorSub:         { fontSize: 14, color: '#8B8178', fontWeight: '700', textAlign: 'center' },
  cafePreview:      { backgroundColor: '#FFF3E0', borderRadius: 20, padding: 20, alignItems: 'center', gap: 8, marginBottom: 8 },
  cafeSignEmoji:    { fontSize: 44 },
  cafeName:         { fontSize: 20, fontWeight: '900', color: '#3D3530' },
  cafeDecorRow:     { flexDirection: 'row', gap: 10, flexWrap: 'wrap', justifyContent: 'center', minHeight: 36 },
  happinessRow:     { flexDirection: 'row', gap: 4 },
  heart:            { fontSize: 20 },
  decorCard:        { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 16, padding: 14, borderWidth: 2, borderColor: '#F5EDD8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.07, shadowRadius: 5, elevation: 2 },
  decorCardOwned:   { backgroundColor: '#E5F7E7', borderColor: '#6BCB77' },
  decorCardDisabled:{ opacity: 0.5 },
  decorEmoji:       { fontSize: 36 },
  decorName:        { fontSize: 15, fontWeight: '900', color: '#3D3530' },
  decorEffect:      { fontSize: 12, color: '#8B8178', fontWeight: '700' },
  decorCost:        { backgroundColor: '#FF6B6B', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  decorCostText:    { fontSize: 12, fontWeight: '900', color: '#fff' },
  backToCafe:       { backgroundColor: '#FF6B6B', borderRadius: 99, paddingVertical: 14, alignItems: 'center' },
  backToCafeText:   { color: '#fff', fontSize: 15, fontWeight: '900' },
});
