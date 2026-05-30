// Animated stars that fly up when earned
import React, { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';

interface Props { count: number; visible: boolean; onDone?: () => void; }

function FlyingStar({ delay, onDone }: { delay: number; onDone?: () => void }) {
  const y      = useRef(new Animated.Value(0)).current;
  const x      = useRef(new Animated.Value((Math.random() - 0.5) * 80)).current;
  const opacity= useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.spring(scale,   { toValue: 1.4, tension: 120, friction: 5, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(y,       { toValue: -90, duration: 700, useNativeDriver: true }),
        Animated.timing(x,       { toValue: x._value + (Math.random() - 0.5) * 40, duration: 700, useNativeDriver: true }),
        Animated.timing(scale,   { toValue: 0.6, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,   duration: 600, useNativeDriver: true }),
      ]),
    ]).start(onDone);
  }, []);

  return (
    <Animated.View style={[styles.star, { transform: [{ translateY: y }, { translateX: x }, { scale }], opacity }]}>
      <Text style={styles.starEmoji}>⭐</Text>
    </Animated.View>
  );
}

export function RewardStars({ count, visible, onDone }: Props) {
  if (!visible || count === 0) return null;
  return (
    <View style={styles.container} pointerEvents="none">
      {Array.from({ length: Math.min(count, 6) }).map((_, i) => (
        <FlyingStar key={i} delay={i * 120} onDone={i === 0 ? onDone : undefined} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: '30%', left: '45%', zIndex: 200 },
  star:      { position: 'absolute' },
  starEmoji: { fontSize: 28 },
});
