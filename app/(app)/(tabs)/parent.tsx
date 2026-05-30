import React, { useState, useRef, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { supabase } from '../../../src/lib/supabase';
import { useAppStore } from '../../../src/stores/useAppStore';
import { BADGES, LEVELS, getCurrentLevel, getNextLevel } from '../../../src/data/rewardsData';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../../src/theme';

// ── Parental Gate ─────────────────────────────────────────────
function ParentalGate({ onUnlock, onBack }: { onUnlock: () => void; onBack: () => void }) {
  // Generate stable math question using useMemo — never changes on re-render
  const { a, b } = useMemo(() => ({
    a: Math.floor(Math.random() * 8) + 1,
    b: Math.floor(Math.random() * 8) + 1,
  }), []); // empty deps = only generated once

  const [answer, setAnswer] = useState('');
  const [shake,  setShake]  = useState(false);

  function handleChange(text: string) {
    // Only allow digits, max 2 chars
    const cleaned = text.replace(/[^0-9]/g, '').slice(0, 2);
    setAnswer(cleaned);
  }

  function checkAnswer() {
    const correct = a + b;
    if (parseInt(answer, 10) === correct) {
      onUnlock();
    } else {
      setShake(true);
      setAnswer('');
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <View style={gate.overlay}>
      <View style={gate.box}>
        {/* Back button */}
        <TouchableOpacity style={gate.backRow} onPress={onBack} activeOpacity={0.8}>
          <Text style={gate.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={gate.emoji}>👨‍👩‍👧</Text>
        <Text style={gate.title}>Parent Area</Text>
        <Text style={gate.sub}>Solve this to continue:</Text>

        <View style={gate.mathBox}>
          <Text style={gate.mathText}>{a} + {b} = ?</Text>
        </View>

        <TextInput
          style={[gate.input, shake && gate.inputError]}
          value={answer}
          onChangeText={handleChange}
          keyboardType="number-pad"
          placeholder="?"
          placeholderTextColor={colors.warmGray}
          maxLength={2}
          autoFocus
          returnKeyType="done"
          onSubmitEditing={checkAnswer}
        />

        {shake && (
          <Text style={gate.errorText}>Not quite! Try again 🙂</Text>
        )}

        <TouchableOpacity
          style={[gate.btn, !answer && gate.btnDisabled]}
          onPress={checkAnswer}
          disabled={!answer}
          activeOpacity={0.85}
        >
          <Text style={gate.btnText}>Enter ✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const gate = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center', padding: 24 },
  box:        { backgroundColor: colors.white, borderRadius: radius.xl, padding: 32, width: '100%', alignItems: 'center', gap: 14, ...shadow.md },
  backRow:    { alignSelf: 'flex-start', marginBottom: 4 },
  backText:   { fontSize: fontSize.md, color: colors.coral, fontWeight: fontWeight.heavy },
  emoji:      { fontSize: 56 },
  title:      { fontSize: fontSize.xxl, fontWeight: fontWeight.heavy, color: colors.dark },
  sub:        { fontSize: fontSize.md, color: colors.warmGray, fontWeight: fontWeight.bold },
  mathBox:    { backgroundColor: colors.coralLight, borderRadius: radius.lg, paddingHorizontal: 32, paddingVertical: 16 },
  mathText:   { fontSize: 40, fontWeight: fontWeight.heavy, color: colors.coral },
  input:      { width: '100%', borderWidth: 2.5, borderColor: colors.sand, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: 36, textAlign: 'center', fontWeight: fontWeight.heavy, color: colors.dark, backgroundColor: colors.cream },
  inputError: { borderColor: colors.error, backgroundColor: '#fff0f0' },
  errorText:  { color: colors.error, fontWeight: fontWeight.heavy, fontSize: fontSize.md },
  btn:        { backgroundColor: colors.coral, borderRadius: radius.full, paddingHorizontal: 40, paddingVertical: 14, width: '100%', alignItems: 'center', ...shadow.md },
  btnDisabled:{ backgroundColor: colors.warmGray },
  btnText:    { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.heavy },
});

// ── Main Parent Screen ─────────────────────────────────────────
export default function ParentScreen() {
  const [unlocked, setUnlocked]   = useState(false);
  const [activeTab, setActiveTab] = useState<'overview'|'progress'|'settings'>('overview');
  const activeChild    = useAppStore((s) => s.activeChild);
  const children       = useAppStore((s) => s.children);
  const setActiveChild = useAppStore((s) => s.setActiveChild);
  const isPremium      = useAppStore((s) => s.isPremium);

  const stars        = 30;
  const streak       = 5;
  const level        = getCurrentLevel(stars);
  const nextLevel    = getNextLevel(stars);
  const earnedBadges = BADGES.filter(b => b.requirement <= stars);

  async function handleSignOut() {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out', style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  if (!unlocked) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
        <ParentalGate
          onUnlock={() => setUnlocked(true)}
          onBack={() => router.back()}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.cream }}>
      {/* Header with back button */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Parent Dashboard 👨‍👩‍👧</Text>
          <Text style={styles.sub}>Manage your family</Text>
        </View>
        <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut} activeOpacity={0.8}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      {/* Child switcher */}
      {children.length > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}
          style={{ maxHeight: 70 }} contentContainerStyle={styles.childBarContent}>
          {children.map((child) => (
            <TouchableOpacity
              key={child.id}
              style={[styles.childChip, activeChild?.id === child.id && styles.childChipActive]}
              onPress={() => setActiveChild(child)}
              activeOpacity={0.8}
            >
              <Text style={styles.childChipEmoji}>
                {['🦉','🦊','🐻','🐰','🦁','🐧','🐘','🦄','🦕','🐱','🐶','🐼']
                  [['owl','fox','bear','bunny','lion','penguin','elephant','unicorn',
                    'dinosaur','cat','dog','panda'].indexOf(child.avatar_id)] ?? '🦉'}
              </Text>
              <Text style={[styles.childChipName, activeChild?.id === child.id && { color: colors.white }]}>
                {child.name}
              </Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addChildBtn}
            onPress={() => router.push('/(auth)/child-setup')} activeOpacity={0.8}>
            <Text style={styles.addChildText}>+ Add</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['overview','progress','settings'] as const).map((tab) => (
          <TouchableOpacity key={tab} style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)} activeOpacity={0.8}>
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'overview' ? '📊' : tab === 'progress' ? '🏆' : '⚙️'} {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {activeTab === 'overview' && (
          <>
            <View style={styles.statsGrid}>
              {[
                { emoji: '⭐', label: 'Stars',   value: stars.toString(),              color: colors.sun      },
                { emoji: '🔥', label: 'Streak',  value: `${streak} days`,              color: colors.orange   },
                { emoji: '🏅', label: 'Badges',  value: `${earnedBadges.length}/${BADGES.length}`, color: colors.lavender },
                { emoji: '📈', label: 'Level',   value: level.title,                   color: colors.mint     },
              ].map((s) => (
                <View key={s.label} style={[styles.statCard, { borderColor: s.color }]}>
                  <Text style={styles.statEmoji}>{s.emoji}</Text>
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={styles.cardTitle}>Current Level</Text>
                <View style={[styles.levelBadge, { backgroundColor: level.color }]}>
                  <Text style={{ fontSize: 16 }}>{level.emoji}</Text>
                  <Text style={styles.levelName}>{level.title}</Text>
                </View>
              </View>
              {nextLevel && (
                <>
                  <View style={styles.levelBar}>
                    <View style={[styles.levelFill, {
                      width: `${Math.min(100, ((stars - level.minStars) / (nextLevel.minStars - level.minStars)) * 100)}%`,
                      backgroundColor: level.color,
                    }]} />
                  </View>
                  <Text style={styles.levelHint}>{nextLevel.minStars - stars} stars to {nextLevel.emoji} {nextLevel.title}</Text>
                </>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Today's Activity</Text>
              {[
                { label: 'Habits completed', value: '3 / 8',   emoji: '✅' },
                { label: 'Learning time',    value: '12 min',  emoji: '📚' },
                { label: 'Games played',     value: '2 games', emoji: '🎮' },
                { label: 'Stories read',     value: '1 story', emoji: '📖' },
              ].map((item) => (
                <View key={item.label} style={styles.activityRow}>
                  <Text style={{ fontSize: 20, width: 28 }}>{item.emoji}</Text>
                  <Text style={styles.activityLabel}>{item.label}</Text>
                  <Text style={styles.activityValue}>{item.value}</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Recent Badges 🏅</Text>
              <View style={styles.badgeRow}>
                {earnedBadges.slice(0, 6).map((badge) => (
                  <View key={badge.id} style={[styles.badgeItem, { backgroundColor: badge.colorLight }]}>
                    <Text style={{ fontSize: 28 }}>{badge.emoji}</Text>
                    <Text style={styles.badgeTitle}>{badge.title}</Text>
                  </View>
                ))}
              </View>
            </View>
          </>
        )}

        {activeTab === 'progress' && (
          <>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>This Week ⭐</Text>
              <View style={styles.weekChart}>
                {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map((day, i) => {
                  const h = [8,12,6,15,10,4,3][i];
                  return (
                    <View key={day} style={styles.dayCol}>
                      <View style={[styles.dayBar, { height: Math.max(4, h * 3) }]} />
                      <Text style={styles.dayLabel}>{day}</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Learning Progress 📚</Text>
              {[
                { label: 'Alphabet',  pct: 80,  color: colors.sky      },
                { label: 'Numbers',   pct: 60,  color: colors.coral    },
                { label: 'Colors',    pct: 100, color: colors.lavender },
                { label: 'Animals',   pct: 30,  color: colors.mint     },
              ].map((subject) => (
                <View key={subject.label} style={styles.subjectRow}>
                  <Text style={styles.subjectLabel}>{subject.label}</Text>
                  <View style={styles.subjectBar}>
                    <View style={[styles.subjectFill, { width: `${subject.pct}%`, backgroundColor: subject.color }]} />
                  </View>
                  <Text style={styles.subjectPct}>{subject.pct}%</Text>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>All Badges 🏅</Text>
              <View style={styles.badgeGrid}>
                {BADGES.map((badge) => {
                  const earned = badge.requirement <= stars;
                  return (
                    <View key={badge.id} style={[styles.badgeGridItem, !earned && styles.badgeLocked]}>
                      <Text style={[{ fontSize: 26 }, !earned && { opacity: 0.3 }]}>{badge.emoji}</Text>
                      <Text style={[styles.badgeGridTitle, !earned && { color: colors.warmGray }]}>{badge.title}</Text>
                      {!earned && <Text style={styles.badgeReq}>⭐{badge.requirement}</Text>}
                    </View>
                  );
                })}
              </View>
            </View>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            {activeChild && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Child Profile</Text>
                {[
                  { label: 'Name',       value: activeChild.name         },
                  { label: 'Age Group',  value: `Ages ${activeChild.age_group}` },
                  { label: 'Language',   value: activeChild.language.toUpperCase() },
                ].map((row) => (
                  <View key={row.label} style={styles.settingRow}>
                    <Text style={styles.settingLabel}>{row.label}</Text>
                    <Text style={styles.settingValue}>{row.value}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={[styles.card, { borderWidth: 2, borderColor: colors.sun }]}>
              <Text style={styles.cardTitle}>Subscription</Text>
              <View style={[styles.planBadge, { backgroundColor: isPremium ? colors.mintLight : colors.sand }]}>
                <Text style={{ fontSize: 32 }}>{isPremium ? '👑' : '🌱'}</Text>
                <View>
                  <Text style={styles.planName}>{isPremium ? 'Premium' : 'Free Plan'}</Text>
                  <Text style={styles.planDesc}>{isPremium ? 'All features unlocked' : '3 modules, 3 games, 3 stories'}</Text>
                </View>
              </View>
              {!isPremium && (
                <TouchableOpacity style={[styles.upgradeBtn]} activeOpacity={0.85}>
                  <Text style={styles.upgradeBtnText}>Upgrade to Premium 🚀</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.card}>
              <Text style={styles.cardTitle}>Privacy & Safety</Text>
              {[
                '🔒 COPPA Compliant — no child data collected',
                '🚫 No ads, ever',
                '🛡️ All data encrypted on device',
                '🗑️ Full data deletion available on request',
              ].map((item) => (
                <Text key={item} style={styles.privacyItem}>{item}</Text>
              ))}
            </View>

            <TouchableOpacity style={styles.signOutBig} onPress={handleSignOut} activeOpacity={0.85}>
              <Text style={styles.signOutBigText}>Sign Out</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header:          { padding: spacing.lg, paddingTop: spacing.xl, backgroundColor: colors.mint, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title:           { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.white },
  sub:             { fontSize: fontSize.sm, color: 'rgba(255,255,255,0.8)', fontWeight: fontWeight.bold },
  signOutBtn:      { backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  signOutText:     { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.white },
  childBarContent: { padding: spacing.md, gap: 8, flexDirection: 'row', alignItems: 'center' },
  childChip:       { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.white, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 8, borderWidth: 2, borderColor: colors.sand, ...shadow.sm },
  childChipActive: { backgroundColor: colors.mint, borderColor: colors.mint },
  childChipEmoji:  { fontSize: 20 },
  childChipName:   { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.dark },
  addChildBtn:     { backgroundColor: colors.sand, borderRadius: radius.full, paddingHorizontal: 14, paddingVertical: 8 },
  addChildText:    { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.coral },
  tabs:            { flexDirection: 'row', gap: 6, padding: spacing.md },
  tab:             { flex: 1, paddingVertical: 10, borderRadius: radius.full, backgroundColor: colors.white, alignItems: 'center', ...shadow.sm },
  tabActive:       { backgroundColor: colors.mint },
  tabText:         { fontSize: 11, fontWeight: fontWeight.heavy, color: colors.warmGray },
  tabTextActive:   { color: colors.white },
  scroll:          { padding: spacing.lg, gap: spacing.md, paddingBottom: 40 },
  statsGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statCard:        { width: '47%', backgroundColor: colors.white, borderRadius: radius.lg, padding: 14, alignItems: 'center', gap: 4, borderWidth: 2, ...shadow.sm },
  statEmoji:       { fontSize: 28 },
  statValue:       { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center' },
  statLabel:       { fontSize: fontSize.xs, color: colors.warmGray, fontWeight: fontWeight.heavy },
  card:            { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, gap: 12, ...shadow.sm },
  cardTitle:       { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.dark },
  levelBadge:      { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 6 },
  levelName:       { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.white },
  levelBar:        { height: 10, backgroundColor: colors.sand, borderRadius: radius.full, overflow: 'hidden' },
  levelFill:       { height: '100%', borderRadius: radius.full },
  levelHint:       { fontSize: fontSize.xs, color: colors.warmGray, fontWeight: fontWeight.bold },
  activityRow:     { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.sand },
  activityLabel:   { flex: 1, fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.dark },
  activityValue:   { fontSize: fontSize.sm, fontWeight: fontWeight.heavy, color: colors.coral },
  badgeRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeItem:       { alignItems: 'center', borderRadius: radius.md, padding: 10, gap: 4, minWidth: 70 },
  badgeTitle:      { fontSize: 10, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center' },
  weekChart:       { flexDirection: 'row', alignItems: 'flex-end', gap: 8, height: 80, justifyContent: 'space-around' },
  dayCol:          { alignItems: 'center', gap: 4, flex: 1 },
  dayBar:          { width: '80%', backgroundColor: colors.mint, borderRadius: 4 },
  dayLabel:        { fontSize: 10, fontWeight: fontWeight.heavy, color: colors.warmGray },
  subjectRow:      { flexDirection: 'row', alignItems: 'center', gap: 10 },
  subjectLabel:    { width: 70, fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.dark },
  subjectBar:      { flex: 1, height: 10, backgroundColor: colors.sand, borderRadius: radius.full, overflow: 'hidden' },
  subjectFill:     { height: '100%', borderRadius: radius.full },
  subjectPct:      { width: 36, fontSize: fontSize.xs, fontWeight: fontWeight.heavy, color: colors.warmGray, textAlign: 'right' },
  badgeGrid:       { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badgeGridItem:   { width: '30%', alignItems: 'center', borderRadius: radius.md, padding: 10, gap: 4, backgroundColor: colors.cream },
  badgeLocked:     { opacity: 0.6 },
  badgeGridTitle:  { fontSize: 9, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center' },
  badgeReq:        { fontSize: 9, color: colors.warmGray, fontWeight: fontWeight.bold },
  settingRow:      { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.sand },
  settingLabel:    { fontSize: fontSize.md, fontWeight: fontWeight.bold, color: colors.dark },
  settingValue:    { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.coral },
  planBadge:       { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.lg, padding: 14 },
  planName:        { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.dark },
  planDesc:        { fontSize: fontSize.sm, color: colors.warmGray, fontWeight: fontWeight.bold },
  upgradeBtn:      { backgroundColor: colors.coral, borderRadius: radius.full, paddingVertical: 14, alignItems: 'center', ...shadow.md },
  upgradeBtnText:  { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.white },
  privacyItem:     { fontSize: fontSize.sm, fontWeight: fontWeight.bold, color: colors.dark, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.sand },
  signOutBig:      { backgroundColor: colors.error, borderRadius: radius.full, paddingVertical: 16, alignItems: 'center', ...shadow.md },
  signOutBigText:  { fontSize: fontSize.lg, fontWeight: fontWeight.heavy, color: colors.white },
});
