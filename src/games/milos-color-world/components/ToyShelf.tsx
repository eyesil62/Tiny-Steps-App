import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { TOYS } from '../data/rewards';

interface Props { unlockedToys: string[]; onClose: () => void; }

export function ToyShelf({ unlockedToys, onClose }: Props) {
  const shelves = ['animals','vehicles','dinos','ocean','space','food'];
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🧸 Toy Shelf</Text>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sub}>{unlockedToys.length} / {TOYS.length} toys collected</Text>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {shelves.map(shelf => {
          const shelfToys = TOYS.filter(t => t.shelf === shelf);
          if (!shelfToys.length) return null;
          return (
            <View key={shelf} style={styles.shelfSection}>
              <View style={styles.shelfLabel}>
                <Text style={styles.shelfName}>{shelf.charAt(0).toUpperCase() + shelf.slice(1)}</Text>
              </View>
              <View style={styles.shelfRow}>
                <View style={styles.shelfWood} />
                {shelfToys.map(toy => {
                  const earned = unlockedToys.includes(toy.id);
                  return (
                    <View key={toy.id} style={[styles.toyItem, !earned && styles.toyLocked]}>
                      <Text style={styles.toyEmoji}>{earned ? toy.emoji : '❔'}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1, backgroundColor: '#FFF3E0' },
  header:       { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 24 },
  title:        { flex: 1, fontSize: 22, fontWeight: '900', color: '#3D3530' },
  closeBtn:     { width: 32, height: 32, backgroundColor: '#F5EDD8', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  closeText:    { fontSize: 14, fontWeight: '900', color: '#8B8178' },
  sub:          { paddingHorizontal: 16, fontSize: 13, color: '#8B8178', fontWeight: '700', marginBottom: 8 },
  scroll:       { padding: 16, gap: 24, paddingBottom: 32 },
  shelfSection: { gap: 4 },
  shelfLabel:   { paddingHorizontal: 4 },
  shelfName:    { fontSize: 12, fontWeight: '800', color: '#8B8178', letterSpacing: 0.5 },
  shelfRow:     { backgroundColor: '#fff', borderRadius: 12, padding: 12, flexDirection: 'row', gap: 10, alignItems: 'flex-end', position: 'relative', borderBottomWidth: 4, borderBottomColor: '#DEB887' },
  shelfWood:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: 6, backgroundColor: '#DEB887', borderRadius: 4 },
  toyItem:      { alignItems: 'center', justifyContent: 'flex-end' },
  toyLocked:    { opacity: 0.35 },
  toyEmoji:     { fontSize: 38 },
});
