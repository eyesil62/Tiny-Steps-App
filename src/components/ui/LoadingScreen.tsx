import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { colors } from '../../theme';

interface Props { message?: string; color?: string; }

export function LoadingScreen({ message = 'Loading...', color = colors.coral }: Props) {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const makeDot = (val: Animated.Value, delay: number) =>
      Animated.loop(Animated.sequence([
        Animated.delay(delay),
        Animated.timing(val, { toValue: -8, duration: 300, useNativeDriver: true }),
        Animated.timing(val, { toValue: 0,  duration: 300, useNativeDriver: true }),
        Animated.delay(500),
      ]));

    const a1 = makeDot(dot1, 0);
    const a2 = makeDot(dot2, 150);
    const a3 = makeDot(dot3, 300);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🦉</Text>
      <View style={styles.dots}>
        {[dot1, dot2, dot3].map((d, i) => (
          <Animated.View key={i} style={[styles.dot, { backgroundColor: color, transform: [{ translateY: d }] }]} />
        ))}
      </View>
      <Text style={[styles.message, { color }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream, gap: 16 },
  emoji:     { fontSize: 56 },
  dots:      { flexDirection: 'row', gap: 10 },
  dot:       { width: 10, height: 10, borderRadius: 5 },
  message:   { fontSize: 15, fontWeight: '700' },
});
