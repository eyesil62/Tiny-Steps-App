import React from 'react';
import { ScrollView, View, KeyboardAvoidingView, Platform, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../../theme';

interface Props {
  children: React.ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
  bgColor?: string;
  padded?: boolean;
}

export function Screen({ children, scroll = false, style, bgColor = colors.cream, padded = true }: Props) {
  const inner = (
    <View style={[styles.inner, padded && styles.padded, style]}>
      {children}
    </View>
  );
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        {scroll
          ? <ScrollView style={styles.flex} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">{inner}</ScrollView>
          : inner
        }
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:   { flex: 1 },
  flex:   { flex: 1 },
  inner:  { flex: 1 },
  padded: { padding: 16 },
});
