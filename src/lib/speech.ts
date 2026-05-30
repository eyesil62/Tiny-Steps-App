import * as Speech from 'expo-speech';

export async function speak(text: string, options?: Speech.SpeechOptions) {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) await Speech.stop();
  } catch {}
  
  // Small delay ensures previous speech is fully stopped
  setTimeout(() => {
    try {
      Speech.speak(text, {
        language: 'en-US',
        rate:  0.82,
        pitch: 1.05,
        ...options,
      });
    } catch (e) {
      console.warn('Speech error:', e);
    }
  }, 180);
}

export async function stopSpeech() {
  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) await Speech.stop();
  } catch {}
}
