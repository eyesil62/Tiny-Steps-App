import { Stack } from 'expo-router';
export default function AppLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)"  />
      <Stack.Screen name="learn"   />
      <Stack.Screen name="games"   />
      <Stack.Screen name="stories" />
    </Stack>
  );
}
