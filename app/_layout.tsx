import { useEffect, useState } from 'react';
import { Slot, router } from 'expo-router';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSession } from '../src/hooks/useSession';
import { useAppStore } from '../src/stores/useAppStore';
import { childService } from '../src/lib/children';
import { colors, fontSize, fontWeight } from '../src/theme';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

// ── Splash/Loading Screen ─────────────────────────────────────
function SplashScreen() {
  const scale  = new Animated.Value(0.8);
  const opacity = new Animated.Value(0);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, tension: 60, friction: 8, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={splash.container}>
      <Animated.View style={[splash.content, { transform: [{ scale }], opacity }]}>
        <View style={splash.mascotCircle}>
          <Text style={splash.mascotEmoji}>🦉</Text>
        </View>
        <Text style={splash.appName}>TinySteps</Text>
        <Text style={splash.tagline}>Every little step is a big adventure</Text>
        <View style={splash.dotsRow}>
          {[0, 1, 2].map((i) => (
            <BounceDot key={i} delay={i * 200} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

function BounceDot({ delay }: { delay: number }) {
  const y = new Animated.Value(0);
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(y, { toValue: -10, duration: 350, useNativeDriver: true }),
        Animated.timing(y, { toValue: 0,   duration: 350, useNativeDriver: true }),
        Animated.delay(400),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <Animated.View style={[splash.dot, { transform: [{ translateY: y }] }]} />
  );
}

const splash = StyleSheet.create({
  container:    { flex: 1, backgroundColor: colors.cream, alignItems: 'center', justifyContent: 'center' },
  content:      { alignItems: 'center', gap: 16 },
  mascotCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: colors.sunLight, alignItems: 'center', justifyContent: 'center' },
  mascotEmoji:  { fontSize: 64 },
  appName:      { fontSize: 42, fontWeight: fontWeight.heavy, color: colors.coral },
  tagline:      { fontSize: 15, fontWeight: fontWeight.bold, color: colors.warmGray, textAlign: 'center' },
  dotsRow:      { flexDirection: 'row', gap: 10, marginTop: 20 },
  dot:          { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.coral },
});

// ── Root Navigator ────────────────────────────────────────────
function RootNavigator() {
  useSession();
  const isLoggedIn     = useAppStore((s) => s.isLoggedIn);
  const userId         = useAppStore((s) => s.userId);
  const setChildren    = useAppStore((s) => s.setChildren);
  const setActiveChild = useAppStore((s) => s.setActiveChild);
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    // Show splash for minimum 1.5s so it doesn't flash
    const minTimer = setTimeout(() => setAppReady(true), 1500);
    return () => clearTimeout(minTimer);
  }, []);

  // Load children when logged in
  useEffect(() => {
    if (!isLoggedIn || !userId) return;
    childService.getAll(userId).then(({ data }) => {
      if (data && data.length > 0) {
        setChildren(data);
        setActiveChild(data[0]);
      }
    });
  }, [isLoggedIn, userId]);

  // Navigate once app is ready
  useEffect(() => {
    if (!appReady) return;
    if (isLoggedIn) {
      childService.getAll(userId!).then(({ data }) => {
        if (data && data.length > 0) {
          router.replace('/(app)/(tabs)/home');
        } else {
          router.replace('/(auth)/child-setup');
        }
      }).catch(() => router.replace('/(auth)/child-setup'));
    } else {
      router.replace('/(auth)/welcome');
    }
  }, [appReady, isLoggedIn]);

  if (!appReady) return <SplashScreen />;
  return <Slot />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.cream }}>
      <QueryClientProvider client={queryClient}>
        <RootNavigator />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
