import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Input } from '../../src/components/ui/Input';
import { supabase } from '../../src/lib/supabase';
import { colors, spacing, fontSize, fontWeight, radius, shadow } from '../../src/theme';

export default function SignupScreen() {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  async function handleSignup() {
    if (!email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    setError('');
    const { error: err } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (err) { setError(err.message); return; }
    // After signup → setup child profile
    router.replace('/(auth)/child-setup');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.emoji}>🌟</Text>
        <Text style={styles.title}>Create account</Text>
        <Text style={styles.sub}>Parent account — set up children inside</Text>
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            🔒 We never collect data from children directly. COPPA compliant.
          </Text>
        </View>
        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="parent@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min 8 characters"
            secureTextEntry
            error={error}
          />
          <TouchableOpacity
            style={[styles.btn, { backgroundColor: loading ? colors.warmGray : colors.mint }]}
            onPress={handleSignup}
            disabled={loading}
            activeOpacity={0.85}
          >
            <Text style={styles.btnText}>{loading ? 'Creating...' : 'Create Account'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.switchText}>
              Have an account? <Text style={{ color: colors.coral }}>Log in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.cream },
  container:  { flex: 1, padding: spacing.xl, gap: spacing.md },
  backText:   { fontSize: fontSize.md, color: colors.coral, fontWeight: fontWeight.heavy },
  emoji:      { fontSize: 56, textAlign: 'center' },
  title:      { fontSize: fontSize.xxl, fontWeight: fontWeight.heavy, color: colors.dark, textAlign: 'center' },
  sub:        { fontSize: fontSize.md, color: colors.warmGray, textAlign: 'center' },
  notice:     { backgroundColor: colors.skyLight, borderRadius: 12, padding: 12 },
  noticeText: { fontSize: fontSize.sm, color: colors.sky, fontWeight: fontWeight.bold },
  form:       { gap: spacing.lg },
  btn:        { paddingVertical: 16, borderRadius: radius.full, alignItems: 'center', ...shadow.md },
  btnText:    { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.heavy },
  switchText: { textAlign: 'center', fontSize: fontSize.sm, color: colors.warmGray, fontWeight: fontWeight.bold },
});
