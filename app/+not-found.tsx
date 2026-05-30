import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, fontWeight, radius, shadow } from '../src/theme';

export default function NotFoundScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.emoji}>🦉</Text>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.desc}>This page doesn't exist. Let's go back!</Text>
        <TouchableOpacity
          style={styles.btn}
          onPress={() => router.replace('/(auth)/welcome')}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Go Home 🏠</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: colors.cream },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  emoji:     { fontSize: 80 },
  title:     { fontSize: 36, fontWeight: fontWeight.heavy, color: colors.coral },
  desc:      { fontSize: fontSize.lg, color: colors.warmGray, fontWeight: fontWeight.bold, textAlign: 'center' },
  btn:       { backgroundColor: colors.coral, borderRadius: radius.full, paddingHorizontal: 32, paddingVertical: 16, ...shadow.md },
  btnText:   { color: colors.white, fontSize: fontSize.lg, fontWeight: fontWeight.heavy },
});
