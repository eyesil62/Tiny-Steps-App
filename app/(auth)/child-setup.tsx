import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, ScrollView, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AvatarPicker } from '../../src/components/ui/AvatarPicker';
import { LanguagePicker } from '../../src/components/ui/LanguagePicker';
import { childService } from '../../src/lib/children';
import { useAppStore } from '../../src/stores/useAppStore';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../src/theme';
import type { AgeGroup, Language, ChildProfile } from '../../src/types';

const AGE_GROUPS: { value: AgeGroup; emoji: string; label: string; desc: string }[] = [
  { value: '2-4',  emoji: '🌱', label: 'Tiny Explorer',    desc: 'Ages 2–4'  },
  { value: '5-7',  emoji: '⭐', label: 'Junior Learner',   desc: 'Ages 5–7'  },
  { value: '8-10', emoji: '🚀', label: 'Smart Adventurer', desc: 'Ages 8–10' },
];

export default function ChildSetupScreen() {
  const userId         = useAppStore((s) => s.userId);
  const setChildren    = useAppStore((s) => s.setChildren);
  const setActiveChild = useAppStore((s) => s.setActiveChild);

  const [name,     setName]     = useState('');
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('2-4');
  const [avatarId, setAvatarId] = useState('owl');
  const [language, setLanguage] = useState<Language>('en');
  const [loading,  setLoading]  = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      Alert.alert('', "What's your child's name?");
      return;
    }

    setLoading(true);

    // Build profile object
    const profileData = {
      user_id:     userId ?? 'local',
      name:        name.trim(),
      age_group:   ageGroup,
      avatar_id:   avatarId,
      language,
      theme_color: '#FF6B6B',
    };

    // Try saving to Supabase
    let savedProfile: ChildProfile | null = null;

    if (userId) {
      try {
        const { data, error } = await childService.create(profileData);
        if (error) {
          console.warn('Supabase save failed, using local profile:', error.message);
        } else if (data) {
          savedProfile = data;
        }
      } catch (e) {
        console.warn('Supabase error:', e);
      }
    }

    // If Supabase failed or no userId, create local profile
    if (!savedProfile) {
      savedProfile = {
        ...profileData,
        id:         `local-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
    }

    setLoading(false);

    // Always navigate — even if DB failed
    setChildren([savedProfile]);
    setActiveChild(savedProfile);
    router.replace('/(app)/(tabs)/home');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.emoji}>👶</Text>
          <Text style={styles.title}>Set up your child's profile</Text>
          <Text style={styles.sub}>You can add more children later</Text>
        </View>

        {/* Name */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Child's name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter name..."
            placeholderTextColor={colors.warmGray}
            autoCapitalize="words"
            maxLength={20}
          />
        </View>

        {/* Age group */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Age group</Text>
          <View style={styles.ageRow}>
            {AGE_GROUPS.map((ag) => {
              const isSelected = ageGroup === ag.value;
              return (
                <TouchableOpacity
                  key={ag.value}
                  onPress={() => setAgeGroup(ag.value)}
                  activeOpacity={0.8}
                  style={[styles.ageCard, isSelected && styles.ageCardSelected]}
                >
                  <Text style={styles.ageEmoji}>{ag.emoji}</Text>
                  <Text style={[styles.ageLabel, isSelected && styles.ageLabelSelected]}>
                    {ag.label}
                  </Text>
                  <Text style={styles.ageDesc}>{ag.desc}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Avatar */}
        <View style={styles.section}>
          <AvatarPicker selected={avatarId} onSelect={setAvatarId} />
        </View>

        {/* Language */}
        <View style={styles.section}>
          <LanguagePicker selected={language} onSelect={setLanguage} />
        </View>

        {/* Preview */}
        {name.trim().length > 0 && (
          <View style={styles.preview}>
            <Text style={{ fontSize: 48 }}>
              {['🦉','🦊','🐻','🐰','🦁','🐧','🐘','🦄','🦕','🐱','🐶','🐼']
                [['owl','fox','bear','bunny','lion','penguin','elephant','unicorn',
                  'dinosaur','cat','dog','panda'].indexOf(avatarId)] ?? '🦉'}
            </Text>
            <View>
              <Text style={styles.previewName}>{name.trim()}</Text>
              <Text style={styles.previewAge}>
                {AGE_GROUPS.find(a => a.value === ageGroup)?.desc}
              </Text>
            </View>
          </View>
        )}

        {/* Button */}
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleCreate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>
            {loading ? 'Creating...' : "Let's go! 🚀"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1, backgroundColor: colors.cream },
  scroll:           { padding: spacing.lg, gap: spacing.xl, paddingBottom: 60 },
  header:           { alignItems: 'center', gap: spacing.sm },
  emoji:            { fontSize: 64 },
  title:            { fontSize: fontSize.xxl, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center' },
  sub:              { fontSize: fontSize.sm, color: colors.warmGray, fontWeight: fontWeight.bold },
  section:          { gap: spacing.md },
  sectionLabel:     { fontSize: fontSize.md, fontWeight: fontWeight.heavy, color: colors.dark },
  input:            { backgroundColor: colors.white, borderRadius: radius.md, paddingHorizontal: 16, paddingVertical: 14, fontSize: fontSize.lg, color: colors.dark, fontWeight: fontWeight.bold, borderWidth: 2, borderColor: colors.sand, ...shadow.sm },
  ageRow:           { flexDirection: 'row', gap: spacing.sm },
  ageCard:          { flex: 1, backgroundColor: colors.white, borderRadius: radius.lg, padding: 12, alignItems: 'center', gap: 4, borderWidth: 2.5, borderColor: colors.sand, ...shadow.sm },
  ageCardSelected:  { borderColor: colors.coral, backgroundColor: colors.coralLight },
  ageEmoji:         { fontSize: 28 },
  ageLabel:         { fontSize: 11, fontWeight: fontWeight.heavy, color: colors.warmGray, textAlign: 'center' },
  ageLabelSelected: { color: colors.coral },
  ageDesc:          { fontSize: 10, color: colors.warmGray, fontWeight: fontWeight.bold },
  preview:          { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md, ...shadow.md, borderWidth: 2, borderColor: colors.coralLight },
  previewName:      { fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: colors.dark },
  previewAge:       { fontSize: fontSize.sm, color: colors.warmGray, fontWeight: fontWeight.bold },
  btn:              { backgroundColor: colors.coral, borderRadius: radius.full, paddingVertical: 18, alignItems: 'center', ...shadow.md },
  btnText:          { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.heavy },
});
