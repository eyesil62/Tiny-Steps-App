// Avatar picker — child taps to choose their character
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { colors, radius, shadow } from '../../theme';

export const AVATARS = [
  { id: 'owl',        emoji: '🦉', label: 'Milo'    },
  { id: 'fox',        emoji: '🦊', label: 'Finn'    },
  { id: 'bear',       emoji: '🐻', label: 'Benny'   },
  { id: 'bunny',      emoji: '🐰', label: 'Bella'   },
  { id: 'lion',       emoji: '🦁', label: 'Leo'     },
  { id: 'penguin',    emoji: '🐧', label: 'Pip'     },
  { id: 'elephant',   emoji: '🐘', label: 'Ellie'   },
  { id: 'unicorn',    emoji: '🦄', label: 'Una'     },
  { id: 'dinosaur',   emoji: '🦕', label: 'Dino'    },
  { id: 'cat',        emoji: '🐱', label: 'Cleo'    },
  { id: 'dog',        emoji: '🐶', label: 'Duke'    },
  { id: 'panda',      emoji: '🐼', label: 'Pan'     },
];

interface Props {
  selected: string;
  onSelect: (id: string) => void;
}

export function AvatarPicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>Choose your character</Text>
      <View style={styles.grid}>
        {AVATARS.map((avatar) => {
          const isSelected = selected === avatar.id;
          return (
            <TouchableOpacity
              key={avatar.id}
              onPress={() => onSelect(avatar.id)}
              activeOpacity={0.8}
              style={[styles.item, isSelected && styles.itemSelected]}
            >
              <Text style={styles.emoji}>{avatar.emoji}</Text>
              <Text style={[styles.name, isSelected && styles.nameSelected]}>
                {avatar.label}
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
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  item: {
    width: 72, height: 80,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 2.5,
    borderColor: colors.sand,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    ...shadow.sm,
  },
  itemSelected: { borderColor: colors.coral, backgroundColor: colors.coralLight },
  emoji:        { fontSize: 30 },
  name:         { fontSize: 10, fontWeight: '800', color: colors.warmGray },
  nameSelected: { color: colors.coral },
});
