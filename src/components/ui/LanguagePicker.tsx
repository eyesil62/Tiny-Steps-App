// Language picker — parent selects child's language
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, radius, shadow } from '../../theme';
import type { Language } from '../../types';

export const LANGUAGES = [
  { code: 'en' as Language, flag: '🇺🇸', name: 'English'    },
  { code: 'ar' as Language, flag: '🇸🇦', name: 'العربية'    },
  { code: 'es' as Language, flag: '🇪🇸', name: 'Español'    },
  { code: 'fr' as Language, flag: '🇫🇷', name: 'Français'   },
  { code: 'de' as Language, flag: '🇩🇪', name: 'Deutsch'    },
  { code: 'tr' as Language, flag: '🇹🇷', name: 'Türkçe'     },
  { code: 'pt' as Language, flag: '🇵🇹', name: 'Português'  },
];

interface Props {
  selected: Language;
  onSelect: (lang: Language) => void;
}

export function LanguagePicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Learning language</Text>
      <View style={styles.grid}>
        {LANGUAGES.map((lang) => {
          const isSelected = selected === lang.code;
          return (
            <TouchableOpacity
              key={lang.code}
              onPress={() => onSelect(lang.code)}
              activeOpacity={0.8}
              style={[styles.item, isSelected && styles.itemSelected]}
            >
              <Text style={styles.flag}>{lang.flag}</Text>
              <Text style={[styles.name, isSelected && styles.nameSelected]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper:      { gap: 12 },
  label:        { fontSize: 15, fontWeight: '800', color: colors.dark, textAlign: 'center' },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  item: {
    paddingHorizontal: 14, paddingVertical: 10,
    backgroundColor: colors.white,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.sand,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    ...shadow.sm,
  },
  itemSelected: { borderColor: colors.mint, backgroundColor: colors.mintLight },
  flag:         { fontSize: 18 },
  name:         { fontSize: 13, fontWeight: '800', color: colors.warmGray },
  nameSelected: { color: colors.mint },
});
