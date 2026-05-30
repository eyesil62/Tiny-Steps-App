import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { STICKERS } from '../data/rewards';

interface Props { unlockedStickers: string[]; onClose: () => void; }

export function StickerBook({ unlockedStickers, onClose }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎨 My Sticker Book</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sub}>{unlockedStickers.length} / {STICKERS.length} stickers collected</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.grid}>
        {STICKERS.map((sticker) => {
          const earned = unlockedStickers.includes(sticker.id);
          return (
            <View key={sticker.id} style={[styles.stickerSlot, earned && styles.stickerEarned]}>
              <Text style={[styles.stickerEmoji, !earned && styles.locked]}>{earned ? sticker.emoji : '❔'}</Text>
              <Text style={styles.stickerName}>{earned ? sticker.name : '???'}</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#FFF9F0' },
  header:       { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 24 },
  title:        { flex: 1, fontSize: 22, fontWeight: '900', color: '#3D3530' },
  closeBtn:     { width: 32, height: 32, backgroundColor: '#F5EDD8', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  closeText:    { fontSize: 14, fontWeight: '900', color: '#8B8178' },
  sub:          { paddingHorizontal: 16, fontSize: 13, color: '#8B8178', fontWeight: '700', marginBottom: 8 },
  grid:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 16, paddingBottom: 32 },
  stickerSlot:  { width: '28%', backgroundColor: '#F5EDD8', borderRadius: 16, padding: 12, alignItems: 'center', gap: 6, borderWidth: 2, borderColor: '#F5EDD8' },
  stickerEarned:{ backgroundColor: '#FFF3E0', borderColor: '#FF9F43' },
  stickerEmoji: { fontSize: 40 },
  locked:       { opacity: 0.3 },
  stickerName:  { fontSize: 10, fontWeight: '800', color: '#8B8178', textAlign: 'center' },
});
