// ============================================================
// 🍕 Restaurant Tycoon Junior — Ages 6–8
// Take orders, cook, serve, earn coins, upgrade restaurant
// Teaches: math (change), sequences, food names, patience
// ============================================================
import React, { useState, useCallback, useRef } from 'react';
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
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate: 0.84, pitch: 1.0 }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 130);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate: 0.84, pitch: 1.0 }); } catch {} }, 130));
}

const MENU_ITEMS = [
  { id: 'pizza',     emoji: '🍕', name: 'Pizza',      price: 5,  cookTime: 3, ingredients: ['🫓','🧅','🧀'], color: '#FF6B6B' },
  { id: 'burger',    emoji: '🍔', name: 'Burger',     price: 4,  cookTime: 2, ingredients: ['🫓','🥩','🥬'], color: '#FF9F43' },
  { id: 'soup',      emoji: '🍲', name: 'Soup',       price: 3,  cookTime: 2, ingredients: ['🫙','🥕','🌿'], color: '#6BCB77' },
  { id: 'pasta',     emoji: '🍝', name: 'Pasta',      price: 4,  cookTime: 2, ingredients: ['🍝','🫙','🧄'], color: '#FFD93D' },
  { id: 'cake',      emoji: '🎂', name: 'Cake',       price: 6,  cookTime: 4, ingredients: ['🌾','🥚','🍬'], color: '#C77DFF' },
  { id: 'juice',     emoji: '🧃', name: 'Juice',      price: 2,  cookTime: 1, ingredients: ['🍊','💧'],       color: '#4D96FF' },
];

const CUSTOMERS = [
  { id: 'c1', emoji: '👦', name: 'Tommy',   mood: 3, patience: 5 },
  { id: 'c2', emoji: '👧', name: 'Sophie',  mood: 3, patience: 4 },
  { id: 'c3', emoji: '👨', name: 'Mr. Lee', mood: 3, patience: 3 },
  { id: 'c4', emoji: '👩', name: 'Mrs. Kim',mood: 3, patience: 4 },
  { id: 'c5', emoji: '🧒', name: 'Lily',    mood: 3, patience: 5 },
];

type GamePhase = 'menu' | 'order' | 'cook' | 'serve' | 'upgrade';

const UPGRADES = [
  { id: 'table',   emoji: '🪑', name: 'New Tables',      cost: 20, benefit: '+1 customer at a time' },
  { id: 'oven',    emoji: '🔥', name: 'Faster Oven',     cost: 30, benefit: 'Cook 2x faster' },
  { id: 'decor',   emoji: '🌸', name: 'Decoration',      cost: 15, benefit: 'Customers happier' },
  { id: 'sign',    emoji: '📺', name: 'Big Menu Sign',   cost: 25, benefit: 'More customers come' },
];

export default function RestaurantGame() {
  const [coins,        setCoins]        = useState(10);
  const [score,        setScore]        = useState(0);
  const [phase,        setPhase]        = useState<GamePhase>('menu');
  const [customer,     setCustomer]     = useState(CUSTOMERS[0]);
  const [order,        setOrder]        = useState<typeof MENU_ITEMS[0] | null>(null);
  const [cooking,      setCooking]      = useState(false);
  const [cookProgress, setCookProgress] = useState(0);
  const [servedCount,  setServedCount]  = useState(0);
  const [feedback,     setFeedback]     = useState<string | null>(null);
  const [addedIngredients, setAddedIngredients] = useState<string[]>([]);
  const [purchased,    setPurchased]    = useState<Set<string>>(new Set());
  const cookTimer = useRef<any>(null);
  const plateAnim = useRef(new Animated.Value(0)).current;

  const nextCustomer = useCallback(() => {
    const next = CUSTOMERS[Math.floor(Math.random() * CUSTOMERS.length)];
    setCustomer(next);
    setPhase('order');
    setOrder(null);
    setAddedIngredients([]);
    setCookProgress(0);
    const randomItem = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
    setOrder(randomItem);
    setTimeout(() => safeSpeak(`${next.name} says: I would like a ${randomItem.name} please!`), 400);
  }, []);

  const startCooking = () => {
    if (!order) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    safeSpeak(`Let's cook the ${order.name}! Add the ingredients!`);
    setPhase('cook');
    setAddedIngredients([]);
  };

  const addIngredient = (ing: string) => {
    if (addedIngredients.includes(ing)) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newAdded = [...addedIngredients, ing];
    setAddedIngredients(newAdded);
    safeSpeak(`Added ${ing}!`);

    if (order && newAdded.length >= order.ingredients.length) {
      // All ingredients added — start cooking timer
      setCooking(true);
      let progress = 0;
      const interval = setInterval(() => {
        progress += 20;
        setCookProgress(progress);
        if (progress >= 100) {
          clearInterval(interval);
          setCooking(false);
          setPhase('serve');
          safeSpeak(`The ${order.name} is ready! Serve it to ${customer.name}!`);
          Animated.spring(plateAnim, { toValue: 1, tension: 60, friction: 6, useNativeDriver: true }).start();
        }
      }, 400);
      cookTimer.current = interval;
    }
  };

  const serveFood = () => {
    if (!order) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    safeSpeak(`${customer.name} loves the ${order.name}! That costs ${order.price} coins!`);
    setCoins(c => c + order.price);
    setScore(s => s + order.price * 10);
    setServedCount(n => n + 1);
    setFeedback(`+${order.price} 🪙`);
    plateAnim.setValue(0);
    setTimeout(() => {
      setFeedback(null);
      nextCustomer();
    }, 1800);
  };

  const buyUpgrade = (upgrade: typeof UPGRADES[0]) => {
    if (coins < upgrade.cost || purchased.has(upgrade.id)) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    safeSpeak(`You bought ${upgrade.name}! ${upgrade.benefit}`);
    setCoins(c => c - upgrade.cost);
    setPurchased(prev => new Set([...prev, upgrade.id]));
    setFeedback(`${upgrade.emoji} Upgraded!`);
    setTimeout(() => setFeedback(null), 2000);
  };

  // Start first customer if on menu
  React.useEffect(() => {
    if (phase === 'menu') setTimeout(() => nextCustomer(), 300);
    return () => { if (cookTimer.current) clearInterval(cookTimer.current); };
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🍕 My Restaurant</Text>
        <View style={styles.coins}><Text style={styles.coinsText}>🪙{coins}</Text></View>
      </View>

      {/* Restaurant stats bar */}
      <View style={styles.statsBar}>
        <Text style={styles.statItem}>⭐ Score: {score}</Text>
        <Text style={styles.statItem}>🍽️ Served: {servedCount}</Text>
        <TouchableOpacity onPress={() => setPhase(phase === 'upgrade' ? 'order' : 'upgrade')} style={styles.upgradeTabBtn}>
          <Text style={styles.upgradeTabText}>🏪 Upgrade</Text>
        </TouchableOpacity>
      </View>

      {/* Feedback flash */}
      {feedback && (
        <View style={styles.feedbackBanner}>
          <Text style={styles.feedbackText}>{feedback}</Text>
        </View>
      )}

      {/* UPGRADE SHOP */}
      {phase === 'upgrade' ? (
        <ScrollView contentContainerStyle={styles.upgradeScroll}>
          <Text style={styles.upgradeTitle}>🏪 Restaurant Upgrades</Text>
          <Text style={styles.upgradeSub}>You have 🪙{coins} coins</Text>
          {UPGRADES.map((upg) => {
            const bought = purchased.has(upg.id);
            const canBuy = coins >= upg.cost && !bought;
            return (
              <TouchableOpacity
                key={upg.id}
                style={[styles.upgradeCard, bought && styles.upgradeCardBought, !canBuy && !bought && styles.upgradeCardDisabled]}
                onPress={() => buyUpgrade(upg)}
                activeOpacity={canBuy ? 0.85 : 1}
              >
                <Text style={styles.upgradeEmoji}>{upg.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.upgradeName}>{upg.name}</Text>
                  <Text style={styles.upgradeBenefit}>{upg.benefit}</Text>
                </View>
                <View style={[styles.upgradeCostBadge, bought && { backgroundColor: '#6BCB77' }]}>
                  <Text style={styles.upgradeCostText}>{bought ? '✓ Owned' : `🪙${upg.cost}`}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

      ) : (
        <View style={styles.gameArea}>
          {/* Customer zone */}
          <View style={styles.customerZone}>
            <View style={styles.customerBubble}>
              <Text style={styles.customerEmoji}>{customer.emoji}</Text>
              {order && (
                <View style={styles.orderBubble}>
                  <Text style={styles.orderBubbleText}>{order.emoji} {order.name}</Text>
                  <Text style={styles.orderPrice}>🪙{order.price}</Text>
                </View>
              )}
            </View>
            <Text style={styles.customerName}>{customer.name}</Text>
          </View>

          {/* Kitchen / action zone */}
          <View style={styles.kitchen}>

            {/* ORDER phase */}
            {phase === 'order' && order && (
              <View style={styles.phaseCard}>
                <Text style={styles.phaseTitle}>📋 New Order!</Text>
                <View style={styles.orderDisplay}>
                  <Text style={{ fontSize: 64 }}>{order.emoji}</Text>
                  <Text style={styles.orderName}>{order.name}</Text>
                </View>
                <TouchableOpacity style={styles.cookBtn} onPress={startCooking} activeOpacity={0.85}>
                  <Text style={styles.cookBtnText}>Start Cooking 👨‍🍳</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* COOK phase */}
            {phase === 'cook' && order && (
              <View style={styles.phaseCard}>
                <Text style={styles.phaseTitle}>
                  {cooking ? '⏳ Cooking...' : '🥘 Add Ingredients!'}
                </Text>

                {/* Pot/pan */}
                <View style={styles.pot}>
                  <Text style={{ fontSize: 56 }}>🫕</Text>
                  <View style={styles.potIngredients}>
                    {addedIngredients.map((ing, i) => (
                      <Text key={i} style={{ fontSize: 20 }}>{ing}</Text>
                    ))}
                  </View>
                </View>

                {/* Cook progress bar */}
                {cooking && (
                  <View style={styles.cookBarWrap}>
                    <View style={[styles.cookBar, { width: `${cookProgress}%` }]} />
                  </View>
                )}

                {/* Ingredient buttons */}
                {!cooking && (
                  <View style={styles.ingredientsRow}>
                    {order.ingredients.map((ing) => {
                      const added = addedIngredients.includes(ing);
                      return (
                        <TouchableOpacity
                          key={ing}
                          style={[styles.ingBtn, added && styles.ingBtnAdded]}
                          onPress={() => addIngredient(ing)}
                          disabled={added}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.ingEmoji}>{ing}</Text>
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
                <Text style={styles.phaseTitle}>🍽️ Ready to serve!</Text>
                <Animated.View style={{ transform: [{ scale: plateAnim.interpolate({ inputRange: [0,1], outputRange: [0.5, 1] }) }], alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 80 }}>{order.emoji}</Text>
                  <Text style={styles.serveReadyText}>{order.name} is ready!</Text>
                </Animated.View>
                <TouchableOpacity style={styles.serveBtn} onPress={serveFood} activeOpacity={0.85}>
                  <Text style={styles.serveBtnText}>Serve to {customer.name}! 🍽️</Text>
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
  safe:              { flex: 1, backgroundColor: '#FFF9F0' },
  header:            { flexDirection: 'row', alignItems: 'center', padding: 14, backgroundColor: '#FF6B6B' },
  backBtn:           { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:          { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerTitle:       { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '900', color: '#fff' },
  coins:             { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  coinsText:         { fontSize: 15, fontWeight: '900', color: '#fff' },
  statsBar:          { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F5EDD8' },
  statItem:          { fontSize: 13, fontWeight: '800', color: '#3D3530', flex: 1 },
  upgradeTabBtn:     { backgroundColor: '#FF9F43', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6 },
  upgradeTabText:    { fontSize: 12, fontWeight: '900', color: '#fff' },
  feedbackBanner:    { backgroundColor: '#FFD93D', padding: 10, alignItems: 'center' },
  feedbackText:      { fontSize: 18, fontWeight: '900', color: '#3D3530' },
  gameArea:          { flex: 1, flexDirection: 'column' },
  customerZone:      { backgroundColor: '#E5EFFE', padding: 16, alignItems: 'center', gap: 8 },
  customerBubble:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  customerEmoji:     { fontSize: 52 },
  orderBubble:       { backgroundColor: '#fff', borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 2 },
  orderBubbleText:   { fontSize: 18, fontWeight: '900', color: '#3D3530' },
  orderPrice:        { fontSize: 13, fontWeight: '800', color: '#FF9F43' },
  customerName:      { fontSize: 13, fontWeight: '800', color: '#3D3530' },
  kitchen:           { flex: 1, padding: 16 },
  phaseCard:         { backgroundColor: '#fff', borderRadius: 20, padding: 20, gap: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4, flex: 1 },
  phaseTitle:        { fontSize: 20, fontWeight: '900', color: '#3D3530' },
  orderDisplay:      { alignItems: 'center', gap: 8 },
  orderName:         { fontSize: 22, fontWeight: '900', color: '#3D3530' },
  cookBtn:           { backgroundColor: '#FF9F43', borderRadius: 99, paddingHorizontal: 32, paddingVertical: 14, width: '100%', alignItems: 'center' },
  cookBtnText:       { color: '#fff', fontSize: 17, fontWeight: '900' },
  pot:               { alignItems: 'center', position: 'relative' },
  potIngredients:    { flexDirection: 'row', gap: 4, marginTop: -20 },
  cookBarWrap:       { width: '100%', height: 16, backgroundColor: '#F5EDD8', borderRadius: 8, overflow: 'hidden' },
  cookBar:           { height: '100%', backgroundColor: '#6BCB77', borderRadius: 8 },
  ingredientsRow:    { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  ingBtn:            { backgroundColor: '#FFF9F0', borderRadius: 16, padding: 14, borderWidth: 2, borderColor: '#F5EDD8', alignItems: 'center', gap: 4, position: 'relative' },
  ingBtnAdded:       { backgroundColor: '#E5F7E7', borderColor: '#6BCB77' },
  ingEmoji:          { fontSize: 34 },
  ingCheck:          { position: 'absolute', top: 4, right: 4, fontSize: 14, color: '#6BCB77', fontWeight: '900' },
  serveBtn:          { backgroundColor: '#6BCB77', borderRadius: 99, paddingHorizontal: 32, paddingVertical: 14, width: '100%', alignItems: 'center' },
  serveBtnText:      { color: '#fff', fontSize: 17, fontWeight: '900' },
  serveReadyText:    { fontSize: 18, fontWeight: '900', color: '#3D3530' },
  upgradeScroll:     { padding: 16, gap: 12 },
  upgradeTitle:      { fontSize: 24, fontWeight: '900', color: '#3D3530', textAlign: 'center' },
  upgradeSub:        { fontSize: 15, fontWeight: '700', color: '#8B8178', textAlign: 'center', marginBottom: 8 },
  upgradeCard:       { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#fff', borderRadius: 16, padding: 16, borderWidth: 2, borderColor: '#F5EDD8', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  upgradeCardBought: { backgroundColor: '#E5F7E7', borderColor: '#6BCB77' },
  upgradeCardDisabled:{ opacity: 0.5 },
  upgradeEmoji:      { fontSize: 36 },
  upgradeName:       { fontSize: 16, fontWeight: '900', color: '#3D3530' },
  upgradeBenefit:    { fontSize: 13, color: '#8B8178', fontWeight: '700' },
  upgradeCostBadge:  { backgroundColor: '#FF9F43', borderRadius: 16, paddingHorizontal: 12, paddingVertical: 6 },
  upgradeCostText:   { fontSize: 13, fontWeight: '900', color: '#fff' },
});
