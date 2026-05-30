// The cozy room background with furniture
import React from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { ROOM_ITEMS } from '../data/items';

interface Props {
  unlockedItems: string[];
  sleeping:      boolean;
  bgColor?:      string;
}

export function PetRoom({ unlockedItems, sleeping, bgColor = '#FFF9F0' }: Props) {
  const dimAnim = React.useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(dimAnim, {
      toValue: sleeping ? 0.15 : 1,
      duration: 1200,
      useNativeDriver: false,
    }).start();
  }, [sleeping]);

  const visibleItems = ROOM_ITEMS.filter(item => unlockedItems.includes(item.id));

  return (
    <Animated.View style={[styles.room, { backgroundColor: bgColor, opacity: dimAnim }]}>
      {/* Wallpaper pattern */}
      <View style={styles.wallpaper}>
        {['🌸','⭐','🌸','⭐','🌸'].map((e, i) => (
          <Text key={i} style={styles.wallpaperEmoji}>{e}</Text>
        ))}
      </View>

      {/* Floor */}
      <View style={styles.floor} />

      {/* Room items */}
      {visibleItems.map((item) => (
        <View
          key={item.id}
          style={[styles.item, { left: `${item.x}%`, top: `${item.y}%` }]}
        >
          <Text style={styles.itemEmoji}>{item.emoji}</Text>
        </View>
      ))}

      {/* Window with view */}
      <View style={styles.windowView}>
        <Text style={styles.windowEmoji}>🌤️</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  room:          { position: 'absolute', inset: 0, overflow: 'hidden' },
  wallpaper:     { position: 'absolute', top: 0, left: 0, right: 0, height: '50%', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingHorizontal: 20, opacity: 0.15 },
  wallpaperEmoji:{ fontSize: 18 },
  floor:         { position: 'absolute', bottom: 0, left: 0, right: 0, height: '30%', backgroundColor: '#E8D5B0', borderTopWidth: 3, borderTopColor: '#D4B896', opacity: 0.4 },
  item:          { position: 'absolute' },
  itemEmoji:     { fontSize: 34 },
  windowView:    { position: 'absolute', top: '8%', left: '38%', fontSize: 38, alignItems: 'center', justifyContent: 'center' },
  windowEmoji:   { fontSize: 36 },
});
