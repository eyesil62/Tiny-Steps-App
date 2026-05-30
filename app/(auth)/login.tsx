import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components/ui/Input';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../src/theme';

export default function LoginScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  async function handleLogin() {
    if (!email.trim() || !password) { setError('Please fill in all fields'); return; }
    setLoading(true); setError('');
    const { error: err } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), password,
    });
    setLoading(false);
    if (err) setError(err.message);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <TouchableOpacity onPress={() => router.back()} style={styles.back}>
              <Text style={styles.backText}>← Back</Text>
            </TouchableOpacity>

            <View style={styles.header}>
              <Text style={styles.emoji}>👋</Text>
              <Text style={styles.title}>Welcome back!</Text>
              <Text style={styles.sub}>Log in to your parent account</Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email address"
                value={email}
                onChangeText={(t) => { setEmail(t); setError(''); }}
                placeholder="parent@email.com"
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
              />
              <Input
                label="Password"
                value={password}
                onChangeText={(t) => { setPassword(t); setError(''); }}
                placeholder="Your password"
                secureTextEntry
                error={error}
                textContentType="password"
              />

              <TouchableOpacity
                style={[styles.btn, (loading || !email || !password) && styles.btnDisabled]}
                onPress={handleLogin}
                disabled={loading || !email || !password}
                activeOpacity={0.88}
              >
                <Text style={styles.btnText}>{loading ? 'Logging in...' : 'Log In'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => router.push('/(auth)/signup')} activeOpacity={0.8}>
                <Text style={styles.switchText}>
                  No account yet? <Text style={{ color: colors.coral, fontWeight: fontWeight.heavy }}>Sign up free</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.cream },
  scroll:     { flexGrow: 1 },
  container:  { flex: 1, padding: spacing.xl, gap: spacing.xl },
  back:       {},
  backText:   { fontSize: fontSize.md, color: colors.coral, fontWeight: fontWeight.heavy },
  header:     { alignItems: 'center', gap: spacing.sm },
  emoji:      { fontSize: 60 },
  title:      { fontSize: fontSize.xxl, fontWeight: fontWeight.heavy, color: colors.dark },
  sub:        { fontSize: fontSize.md, color: colors.warmGray, fontWeight: fontWeight.bold, textAlign: 'center' },
  form:       { gap: spacing.lg },
  btn:        { backgroundColor: colors.coral, borderRadius: radius.full, paddingVertical: 18, alignItems: 'center', ...shadow.md },
  btnDisabled:{ backgroundColor: colors.warmGray },
  btnText:    { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.heavy },
  switchText: { textAlign: 'center', fontSize: fontSize.sm, color: colors.warmGray, fontWeight: fontWeight.bold },
});
