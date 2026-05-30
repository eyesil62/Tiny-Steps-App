import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { getNeedColor, getNeedEmoji, getNeedLabel, NeedKey } from '../utils/petNeeds';

interface Props { needKey: NeedKey; value: number; }

export function NeedBar({ needKey, value }: Props) {
  const anim = useRef(new Animated.Value(value)).current;

  useEffect(() => {
    Animated.timing(anim, { toValue: value, duration: 600, useNativeDriver: false }).start();
  }, [value]);

  const color = getNeedColor(value);

  return (
    <View style={styles.row}>
      <Text style={styles.emoji}>{getNeedEmoji(needKey)}</Text>
      <View style={styles.barBg}>
        <Animated.View style={[
          styles.barFill,
          {
            width: anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] }),
            backgroundColor: color,
          },
        ]} />
      </View>
      <Text style={[styles.val, { color }]}>{Math.round(value)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row:    { flexDirection: 'row', alignItems: 'center', gap: 8 },
  emoji:  { fontSize: 18, width: 26 },
  barBg:  { flex: 1, height: 10, backgroundColor: '#F5EDD8', borderRadius: 5, overflow: 'hidden' },
  barFill:{ height: '100%', borderRadius: 5 },
  val:    { fontSize: 12, fontWeight: '800', width: 28, textAlign: 'right' },
});
