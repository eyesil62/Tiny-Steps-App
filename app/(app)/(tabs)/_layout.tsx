import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, radius, shadow } from '../../../src/theme';

interface TabIconProps {
  emoji:   string;
  label:   string;
  focused: boolean;
  color:   string;
}

function TabIcon({ emoji, label, focused, color }: TabIconProps) {
  return (
    <View style={[styles.iconWrap, focused && { backgroundColor: `${color}20` }]}>
      <Text style={[styles.emoji, focused && styles.emojiFocused]}>{emoji}</Text>
      <Text style={[styles.label, focused && { color }]}>{label}</Text>
    </View>
  );
}

const NAVY = '#2D5BE3';

const TAB_CONFIG = [
  { name: 'home',    emoji: '🏠', label: 'Home',    color: NAVY            },
  { name: 'learn',   emoji: '📚', label: 'Learn',   color: colors.sky      },
  { name: 'games',   emoji: '🎮', label: 'Games',   color: NAVY            },
  { name: 'stories', emoji: '📖', label: 'Stories', color: colors.lavender },
  { name: 'habits',  emoji: '⭐', label: 'Habits',  color: colors.sun      },
  { name: 'parent',  emoji: '👪', label: 'Parent',  color: colors.mint     },
];

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown:     false,
        tabBarShowLabel: false,
        tabBarStyle:     styles.bar,
      }}
    >
      {TAB_CONFIG.map(({ name, emoji, label, color }) => (
        <Tabs.Screen
          key={name}
          name={name}
          options={{
            tabBarIcon: ({ focused }) => (
              <TabIcon emoji={emoji} label={label} focused={focused} color={color} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor:  colors.white,
    borderTopWidth:   0,
    height:           Platform.OS === 'ios' ? 82 : 68,
    paddingBottom:    Platform.OS === 'ios' ? 20 : 8,
    paddingTop:       6,
    shadowColor:      '#2D5BE3',
    shadowOffset:     { width: 0, height: -3 },
    shadowOpacity:    0.1,
    shadowRadius:     16,
    elevation:        14,
  },
  iconWrap: {
    alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: radius.md, gap: 2, minWidth: 50,
  },
  emoji:        { fontSize: 22 },
  emojiFocused: { transform: [{ scale: 1.12 }] },
  label:        { fontSize: 9, fontWeight: '700', color: colors.warmGray },
});
