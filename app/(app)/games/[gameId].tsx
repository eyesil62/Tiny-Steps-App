import { useLocalSearchParams } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, fontSize, fontWeight } from '../../../src/theme';

// Premium mini-world games
import TinyTownGame        from '../../../src/games/tiny-town/TinyTownGame';
import BuilderBuddiesGame  from '../../../src/games/builder-buddies/BuilderBuddiesGame';
import HappyPetHomeScreen  from '../../../src/games/happy-pet-home/HappyPetHomeScreen';
import MilosQuestIsland    from '../../../src/games/quest-island/MilosQuestIsland';
import LittleChefCafe      from '../../../src/games/little-chef/LittleChefCafe';
import MilosBusyDayScreen  from '../../../src/games/milos-busy-day/MilosBusyDayScreen';
import MilosPuzzleAdventureScreen from '../../../src/games/milos-puzzle-adventure/MilosPuzzleAdventureScreen';
import MilosColorWorldScreen from '../../../src/games/milos-color-world/MilosColorWorldScreen';
import LittleChampsArenaScreen from '../../../src/games/little-champs-arena/LittleChampsArenaScreen';

// Classic learning games
import BalloonPopGame   from '../../../src/components/game/BalloonPopGame';
import AnimalSoundsGame from '../../../src/components/game/AnimalSoundsGame';
import CountTapGame     from '../../../src/components/game/CountTapGame';

export default function GameScreen() {
  const { gameId } = useLocalSearchParams<{ gameId: string }>();

  switch (gameId) {
    // Premium worlds
    case 'milos-color-world': return <MilosColorWorldScreen />;
    case 'milos-puzzle': return <MilosPuzzleAdventureScreen />;
    case 'tiny-town':       return <TinyTownGame />;
    case 'builder-buddies': return <BuilderBuddiesGame />;
    case 'happy-pet-home':  return <HappyPetHomeScreen />;
    case 'milos-quest':     return <MilosQuestIsland />;
    case 'little-chef':     return <LittleChefCafe />;
    case 'milos-busy-day':  return <MilosBusyDayScreen />;
    case 'little-champs':   return <LittleChampsArenaScreen />;
    // Classic
    case 'balloon-pop':     return <BalloonPopGame />;
    case 'animal-sounds':   return <AnimalSoundsGame />;
    case 'number-count':    return <CountTapGame />;
    default:
      return (
        <View style={styles.center}>
          <Text style={{ fontSize: 64 }}>🎮</Text>
          <Text style={styles.text}>Coming soon!</Text>
        </View>
      );
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.cream, gap: 12 },
  text:   { fontSize: fontSize.xl, fontWeight: fontWeight.heavy, color: colors.dark },
});
