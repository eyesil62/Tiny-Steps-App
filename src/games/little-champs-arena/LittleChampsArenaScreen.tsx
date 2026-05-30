// ============================================================
// Little Champs Arena — Ages 4–8
// Soccer, Basketball, Baseball mini-games
// Original TinySteps premium sports game
// ============================================================
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, Animated,
  StyleSheet, Dimensions, PanResponder, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import { useLittleChampsStore, Sport } from './store/useLittleChampsStore';
import { GEAR, FIELDS } from './data/gear';

const { width: W, height: H } = Dimensions.get('window');

function say(text: string, rate = 0.88, pitch = 1.05) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 120);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} }, 120));
}

const SPORT_FEEDBACK = {
  great:  ['Amazing shot!', 'Incredible!', 'Superstar!', 'Fantastic!', 'Wow!'],
  good:   ['Great kick!', 'Nice shot!', 'Well done!', 'Good one!', 'Keep it up!'],
  miss:   ['Nice try!', 'So close!', 'Try again!', 'You are getting better!', 'Almost!'],
};

function randomFeedback(type: keyof typeof SPORT_FEEDBACK) {
  const arr = SPORT_FEEDBACK[type];
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Score Board ──────────────────────────────────────────
function ScoreBoard({ score, best, shots, maxShots, sport, streak }: any) {
  return (
    <View style={styles.scoreBoard}>
      <View style={styles.scoreStat}><Text style={styles.scoreStatValue}>{score}</Text><Text style={styles.scoreStatLabel}>Score</Text></View>
      <View style={styles.scoreStat}><Text style={styles.scoreStatValue}>{shots}/{maxShots}</Text><Text style={styles.scoreStatLabel}>Shots</Text></View>
      <View style={styles.scoreStat}><Text style={styles.scoreStatValue}>{streak}</Text><Text style={styles.scoreStatLabel}>Streak 🔥</Text></View>
      <View style={styles.scoreStat}><Text style={styles.scoreStatValue}>{best}</Text><Text style={styles.scoreStatLabel}>Best</Text></View>
    </View>
  );
}

// ── Soccer Shootout ───────────────────────────────────────
function SoccerShootout({ onDone, ballEmoji }: { onDone: (score: number) => void; ballEmoji: string }) {
  const SHOTS = 5;
  const [score,    setScore]    = useState(0);
  const [shotsLeft,setShotsLeft]= useState(SHOTS);
  const [streak,   setStreak]   = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [shooting, setShooting] = useState(false);
  const ballX   = useRef(new Animated.Value(W / 2 - 25)).current;
  const ballY   = useRef(new Animated.Value(H * 0.65)).current;
  const ballScale = useRef(new Animated.Value(1)).current;
  const netShake  = useRef(new Animated.Value(0)).current;
  const goalierX  = useRef(new Animated.Value(W / 2 - 30)).current;
  const startPos  = useRef({ x: 0, y: 0 });
  const isDragging= useRef(false);

  // Goalie moves back and forth
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(goalierX, { toValue: W * 0.25, duration: 1200, useNativeDriver: true }),
      Animated.timing(goalierX, { toValue: W * 0.55, duration: 1200, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => !shooting && shotsLeft > 0,
    onMoveShouldSetPanResponder:  () => !shooting,
    onPanResponderGrant: (_, gs) => {
      isDragging.current = true;
      startPos.current = { x: gs.x0, y: gs.y0 };
    },
    onPanResponderRelease: (_, gs) => {
      if (!isDragging.current) return;
      isDragging.current = false;

      // Calculate shot direction
      const dx = gs.x0 - startPos.current.x;
      const dy = gs.y0 - startPos.current.y;

      if (Math.abs(dy) < 5) return; // not a proper swipe up

      const targetX = W / 2 + dx * 1.5;
      const isGoal  = targetX > W * 0.15 && targetX < W * 0.85;

      setShooting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Ball arc animation
      Animated.parallel([
        Animated.timing(ballX, { toValue: targetX - 25, duration: 600, useNativeDriver: true }),
        Animated.timing(ballY, { toValue: H * 0.18,     duration: 600, useNativeDriver: true }),
        Animated.timing(ballScale, { toValue: 0.5, duration: 600, useNativeDriver: true }),
      ]).start(() => {
        if (isGoal) {
          // GOAL!
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          // Net shake
          Animated.sequence([
            Animated.timing(netShake, { toValue: 10, duration: 60, useNativeDriver: true }),
            Animated.timing(netShake, { toValue: -10,duration: 60, useNativeDriver: true }),
            Animated.timing(netShake, { toValue: 0,  duration: 60, useNativeDriver: true }),
          ]).start();
          const newStreak = streak + 1;
          const bonus     = newStreak >= 3 ? 10 : 0;
          const pts       = 10 + bonus;
          const newScore  = score + pts;
          setStreak(newStreak);
          setScore(newScore);
          const fb = newStreak >= 3 ? `🔥 STREAK! +${pts}` : `⚽ GOAL! +${pts}`;
          setFeedback({ text: fb, color: '#6BCB77' });
          say(randomFeedback('great'), 0.9, 1.2);
        } else {
          setStreak(0);
          setFeedback({ text: randomFeedback('miss'), color: '#FF9F43' });
          say(randomFeedback('miss'), 0.88, 1.0);
        }
        setTimeout(() => {
          setFeedback(null);
          const newShots = shotsLeft - 1;
          setShotsLeft(newShots);
          setShooting(false);
          // Reset ball
          ballX.setValue(W / 2 - 25);
          ballY.setValue(H * 0.65);
          ballScale.setValue(1);
          if (newShots <= 0) {
            setTimeout(() => onDone(isGoal ? score + 10 : score), 800);
          }
        }, 1000);
      });
    },
  });

  return (
    <View style={styles.soccerField}>
      {/* Grass */}
      <View style={styles.grassLines}>
        {[0,1,2].map(i => <View key={i} style={[styles.grassLine, { left: `${20 + i*30}%` }]} />)}
      </View>

      {/* Goal net */}
      <Animated.View style={[styles.goal, { transform: [{ translateX: netShake }] }]}>
        <Text style={styles.goalPost}>🥅</Text>
      </Animated.View>

      {/* Goalie */}
      <Animated.View style={[styles.goalie, { transform: [{ translateX: goalierX }] }]}>
        <Text style={styles.goalieEmoji}>🧤</Text>
      </Animated.View>

      {/* Target zones */}
      {[W*0.2, W*0.5, W*0.75].map((tx, i) => (
        <View key={i} style={[styles.targetZone, { left: tx - 18, top: H * 0.22 }]}>
          <Text style={styles.targetEmoji}>🎯</Text>
        </View>
      ))}

      {/* Ball with pan responder */}
      <Animated.View
        style={[styles.ball, { transform: [{ translateX: ballX }, { translateY: ballY }, { scale: ballScale }] }]}
        {...panResponder.panHandlers}
      >
        <Text style={styles.ballEmoji}>{ballEmoji}</Text>
        {!shooting && <Text style={styles.ballHint}>Drag & release!</Text>}
      </Animated.View>

      {/* Feedback */}
      {feedback && (
        <View style={[styles.sportFeedback, { backgroundColor: feedback.color }]}>
          <Text style={styles.sportFeedbackText}>{feedback.text}</Text>
        </View>
      )}
    </View>
  );
}

// ── Basketball Hoops ──────────────────────────────────────
function BasketballHoops({ onDone, ballEmoji }: { onDone: (score: number) => void; ballEmoji: string }) {
  const SHOTS = 5;
  const [score,    setScore]    = useState(0);
  const [shotsLeft,setShotsLeft]= useState(SHOTS);
  const [streak,   setStreak]   = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [charging, setCharging] = useState(false);
  const [shooting, setShooting] = useState(false);
  const ballY    = useRef(new Animated.Value(H * 0.62)).current;
  const ballX    = useRef(new Animated.Value(W / 2 - 25)).current;
  const ballScale= useRef(new Animated.Value(1)).current;
  const hoopX    = useRef(new Animated.Value(W / 2 - 30)).current;
  const powerAnim= useRef(new Animated.Value(0)).current;
  const chargeRef= useRef(false);
  const chargeTimer = useRef<any>(null);

  // Moving hoop after level 2
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(hoopX, { toValue: W * 0.2, duration: 1500, useNativeDriver: true }),
      Animated.timing(hoopX, { toValue: W * 0.55, duration: 1500, useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, []);

  const handlePressIn = () => {
    setCharging(true);
    chargeRef.current = true;
    Animated.timing(powerAnim, { toValue: 1, duration: 1200, useNativeDriver: false }).start();
  };

  const handlePressOut = useCallback(() => {
    if (!chargeRef.current || shooting) return;
    chargeRef.current = false;
    setCharging(false);
    const power = (powerAnim as any)._value;
    powerAnim.stopAnimation();
    powerAnim.setValue(0);

    setShooting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Good power is 0.5–0.85
    const isBasket = power >= 0.45 && power <= 0.88;

    Animated.parallel([
      Animated.timing(ballY, { toValue: H * 0.18, duration: 550, useNativeDriver: true }),
      Animated.timing(ballX, { toValue: (hoopX as any)._value, duration: 550, useNativeDriver: true }),
      Animated.timing(ballScale, { toValue: 0.55, duration: 550, useNativeDriver: true }),
    ]).start(() => {
      if (isBasket) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        const newStreak = streak + 1;
        const bonus = newStreak >= 3 ? 10 : power > 0.7 ? 5 : 0;
        const pts = 10 + bonus;
        setStreak(newStreak);
        setScore(s => s + pts);
        setFeedback({ text: newStreak >= 3 ? `🔥 ON FIRE! +${pts}` : `🏀 BASKET! +${pts}`, color: '#FF9F43' });
        say(randomFeedback('great'), 0.9, 1.2);
      } else {
        setStreak(0);
        setFeedback({ text: randomFeedback('miss'), color: '#4D96FF' });
        say(randomFeedback('miss'), 0.88, 1.0);
      }
      setTimeout(() => {
        setFeedback(null);
        const newShots = shotsLeft - 1;
        setShotsLeft(newShots);
        setShooting(false);
        ballY.setValue(H * 0.62);
        ballX.setValue(W / 2 - 25);
        ballScale.setValue(1);
        if (newShots <= 0) setTimeout(() => onDone(score), 800);
      }, 1000);
    });
  }, [streak, shotsLeft, score, shooting]);

  const powerBarWidth = powerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const powerColor    = powerAnim.interpolate({ inputRange: [0, 0.5, 0.88, 1], outputRange: ['#6BCB77', '#FFD93D', '#FF6B6B', '#FF0000'] });

  return (
    <View style={styles.courtArea}>
      {/* Court lines */}
      <View style={styles.courtCenter} />
      <View style={styles.courtArc} />

      {/* Hoop */}
      <Animated.View style={[styles.hoop, { transform: [{ translateX: hoopX }] }]}>
        <Text style={styles.hoopEmoji}>🏀</Text>
        <View style={styles.hoopRing} />
      </Animated.View>

      {/* Ball */}
      <Animated.View style={[styles.ball, { transform: [{ translateX: ballX }, { translateY: ballY }, { scale: ballScale }] }]}>
        <Text style={styles.ballEmoji}>{ballEmoji}</Text>
      </Animated.View>

      {/* Feedback */}
      {feedback && (
        <View style={[styles.sportFeedback, { backgroundColor: feedback.color }]}>
          <Text style={styles.sportFeedbackText}>{feedback.text}</Text>
        </View>
      )}

      {/* Power bar + shoot button */}
      <View style={styles.shootArea}>
        <View style={styles.powerBarWrap}>
          <Animated.View style={[styles.powerBarFill, { width: powerBarWidth, backgroundColor: powerColor }]} />
        </View>
        <TouchableOpacity
          style={[styles.shootBtn, charging && styles.shootBtnCharge]}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={shooting}
          activeOpacity={0.85}
        >
          <Text style={styles.shootBtnText}>{charging ? '🏀 Release!' : '🏀 Hold & Release!'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Baseball Hit Zone ─────────────────────────────────────
function BaseballHitZone({ onDone, batEmoji }: { onDone: (score: number) => void; batEmoji: string }) {
  const PITCHES = 5;
  const [score,    setScore]    = useState(0);
  const [pitches,  setPitches]  = useState(PITCHES);
  const [streak,   setStreak]   = useState(0);
  const [feedback, setFeedback] = useState<{ text: string; color: string } | null>(null);
  const [pitching, setPitching] = useState(false);
  const [inZone,   setInZone]   = useState(false);
  const ballX    = useRef(new Animated.Value(-50)).current;
  const ballY    = useRef(new Animated.Value(H * 0.4)).current;
  const batAnim  = useRef(new Animated.Value(0)).current;
  const batSwing = useRef(false);
  const hitRef   = useRef(false);

  const throwBall = useCallback(() => {
    if (pitching) return;
    setPitching(true);
    hitRef.current = false;
    setInZone(false);
    ballX.setValue(-50);

    Animated.timing(ballX, { toValue: W + 50, duration: 1600, useNativeDriver: true }).start(({ finished }) => {
      if (finished && !hitRef.current) {
        setStreak(0);
        setFeedback({ text: 'Miss! Try again!', color: '#FF6B6B' });
        setTimeout(() => {
          setFeedback(null);
          setPitching(false);
          const newP = pitches - 1;
          setPitches(newP);
          if (newP <= 0) setTimeout(() => onDone(score), 800);
        }, 1000);
      }
    });

    // Zone indicator: ball is "hittable" when it crosses W*0.35 to W*0.55
    const zoneTimer = setInterval(() => {
      const val = (ballX as any)._value;
      if (val >= W * 0.35 && val <= W * 0.55) {
        setInZone(true);
      } else {
        setInZone(false);
      }
    }, 40);
    setTimeout(() => clearInterval(zoneTimer), 1700);
  }, [pitching, pitches, score]);

  const swingBat = useCallback(() => {
    if (!pitching || batSwing.current) return;
    batSwing.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const ballVal = (ballX as any)._value;
    const isHit   = ballVal >= W * 0.28 && ballVal <= W * 0.62;

    Animated.sequence([
      Animated.timing(batAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(batAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();

    if (isHit) {
      hitRef.current = true;
      ballX.stopAnimation();
      Animated.timing(ballX, { toValue: W * 0.85, duration: 300, useNativeDriver: true }).start();
      const timing = ballVal >= W * 0.42 && ballVal <= W * 0.52;
      const isHomeRun = timing && streak >= 2;
      const pts = isHomeRun ? 20 : timing ? 15 : 10;
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(s => s + pts);
      setFeedback({ text: isHomeRun ? `🏆 HOME RUN! +${pts}` : timing ? `⚡ GREAT HIT! +${pts}` : `⚾ HIT! +${pts}`, color: isHomeRun ? '#FFD93D' : '#6BCB77' });
      say(isHomeRun ? 'HOME RUN! Amazing!' : randomFeedback('great'), 0.9, 1.15);

      setTimeout(() => {
        setFeedback(null);
        setPitching(false);
        batSwing.current = false;
        const newP = pitches - 1;
        setPitches(newP);
        if (newP <= 0) setTimeout(() => onDone(score + pts), 800);
        else throwBall();
      }, 1200);
    } else {
      setStreak(0);
      setFeedback({ text: randomFeedback('miss'), color: '#FF9F43' });
      setTimeout(() => { setFeedback(null); batSwing.current = false; }, 800);
    }
  }, [pitching, streak, pitches, score, throwBall]);

  const batRotate = batAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '-45deg'] });

  return (
    <View style={styles.baseballField}>
      {/* Diamond */}
      <View style={styles.diamond} />

      {/* Pitch zone indicator */}
      <View style={[styles.hitZone, inZone && styles.hitZoneActive]}>
        <Text style={styles.hitZoneText}>{inZone ? 'HIT NOW!' : 'Wait...'}</Text>
      </View>

      {/* Ball */}
      <Animated.View style={[styles.baseBall, { transform: [{ translateX: ballX }, { translateY: ballY }] }]}>
        <Text style={{ fontSize: 28 }}>⚾</Text>
      </Animated.View>

      {/* Bat */}
      <Animated.View style={[styles.bat, { transform: [{ rotate: batRotate }] }]}>
        <Text style={{ fontSize: 44 }}>{batEmoji}</Text>
      </Animated.View>

      {/* Feedback */}
      {feedback && (
        <View style={[styles.sportFeedback, { backgroundColor: feedback.color }]}>
          <Text style={styles.sportFeedbackText}>{feedback.text}</Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.baseballControls}>
        {!pitching ? (
          <TouchableOpacity style={styles.pitchBtn} onPress={throwBall} activeOpacity={0.85}>
            <Text style={styles.pitchBtnText}>⚾ Throw Ball!</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.swingBtn, inZone && styles.swingBtnActive]} onPress={swingBat} activeOpacity={0.85}>
            <Text style={styles.swingBtnText}>{inZone ? '🏏 SWING NOW!' : '🏏 Swing!'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ── Sports Park Hub ───────────────────────────────────────
function SportsParkHub({ onSelectSport, totalStars, bestScores }: any) {
  const hubAnims = useRef(
    ['soccer', 'basketball', 'baseball'].map(() => new Animated.Value(1))
  ).current;

  const tapItem = (index: number, text: string) => {
    Animated.sequence([
      Animated.spring(hubAnims[index], { toValue: 1.2, tension: 180, friction: 4, useNativeDriver: true }),
      Animated.spring(hubAnims[index], { toValue: 1,   tension: 100, friction: 5, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    say(text, 0.85, 1.1);
  };

  const SPORTS = [
    { id: 'soccer',     emoji: '⚽', name: 'Soccer Shootout',  color: '#6BCB77', light: '#E5F7E7', desc: 'Drag and score goals!',      best: bestScores.soccer     },
    { id: 'basketball', emoji: '🏀', name: 'Basketball Hoops', color: '#FF9F43', light: '#FFF0DC', desc: 'Hold and release to shoot!', best: bestScores.basketball },
    { id: 'baseball',   emoji: '⚾', name: 'Baseball Hit Zone',color: '#4D96FF', light: '#E5EFFE', desc: 'Tap to swing at the ball!',  best: bestScores.baseball   },
  ];

  return (
    <ScrollView contentContainerStyle={styles.hubScroll}>
      {/* Milo coach */}
      <View style={styles.hubCoach}>
        <Text style={styles.hubCoachEmoji}>🦉</Text>
        <View style={styles.hubCoachBubble}>
          <Text style={styles.hubCoachText}>
            Welcome to the Little Champs Arena! Pick your sport, little champion!
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.hubStats}>
        <View style={styles.hubStat}><Text style={styles.hubStatEmoji}>⭐</Text><Text style={styles.hubStatValue}>{totalStars}</Text><Text style={styles.hubStatLabel}>Stars</Text></View>
      </View>

      {/* Sports selection */}
      <Text style={styles.hubSectionTitle}>Choose your sport:</Text>
      {SPORTS.map((sport, i) => (
        <TouchableOpacity key={sport.id} onPress={() => onSelectSport(sport.id as Sport)} activeOpacity={0.88}
          style={[styles.sportCard, { borderColor: sport.color }]}>
          <Animated.View style={[styles.sportCardIcon, { backgroundColor: sport.color, transform: [{ scale: hubAnims[i] }] }]}>
            <Text style={styles.sportCardEmoji}>{sport.emoji}</Text>
          </Animated.View>
          <View style={styles.sportCardInfo}>
            <Text style={styles.sportCardName}>{sport.name}</Text>
            <Text style={styles.sportCardDesc}>{sport.desc}</Text>
            <Text style={styles.sportCardBest}>🏆 Best: {sport.best}</Text>
          </View>
          <Text style={styles.sportCardArrow}>▶</Text>
        </TouchableOpacity>
      ))}

      {/* Interactive hub objects */}
      <Text style={styles.hubSectionTitle}>Sports Park:</Text>
      <View style={styles.hubPark}>
        {[
          { emoji: '⚽', label: 'Soccer ball', speech: 'Kick kick kick! Soccer is so fun!' },
          { emoji: '🏆', label: 'Trophy',      speech: 'That\'s the champion trophy! Can you win it?' },
          { emoji: '🎽', label: 'Locker',      speech: 'Change into your kit! Time to play!' },
          { emoji: '📣', label: 'Crowd',        speech: 'The crowd is cheering for you!' },
          { emoji: '🥊', label: 'Scoreboard',  speech: 'The scoreboard shows who is winning!' },
          { emoji: '🌟', label: 'Mystery box', speech: 'A mystery box! Keep playing to unlock it!' },
        ].map((item, i) => (
          <TouchableOpacity key={i} style={styles.hubItem}
            onPress={() => { tapItem(0, item.speech); say(item.speech); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
            activeOpacity={0.8}>
            <Text style={styles.hubItemEmoji}>{item.emoji}</Text>
            <Text style={styles.hubItemLabel}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}

// ── Round Complete Screen ────────────────────────────────
function RoundComplete({ sport, score, best, onReplay, onHub }: any) {
  const stars = score >= 80 ? 3 : score >= 50 ? 2 : 1;
  const scaleA = useRef(new Animated.Value(0.6)).current;
  useEffect(() => {
    Animated.spring(scaleA, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }).start();
    say(`Great game! You scored ${score} points! ${stars === 3 ? '3 stars! You are a champion!' : stars === 2 ? '2 stars! Really well done!' : 'Keep practising!'}`, 0.87, 1.05);
  }, []);
  const sportEmoji = { soccer: '⚽', basketball: '🏀', baseball: '⚾' }[sport] ?? '🏆';
  return (
    <View style={styles.roundComplete}>
      <Animated.View style={[styles.roundCompleteCard, { transform: [{ scale: scaleA }] }]}>
        <Text style={{ fontSize: 72 }}>{sportEmoji}</Text>
        <Text style={styles.rcTitle}>Round Over!</Text>
        <Text style={styles.rcScore}>{score} points</Text>
        <View style={styles.rcStars}>
          {[1,2,3].map(i => <Text key={i} style={[styles.rcStar, { opacity: i <= stars ? 1 : 0.2 }]}>⭐</Text>)}
        </View>
        {score > best && <Text style={styles.rcNewBest}>🏆 New Best!</Text>}
        <TouchableOpacity style={[styles.rcBtn, { backgroundColor: '#FF9F43' }]} onPress={onReplay} activeOpacity={0.88}>
          <Text style={styles.rcBtnText}>Play Again! 🎮</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.rcBtn, { backgroundColor: '#4D96FF' }]} onPress={onHub} activeOpacity={0.88}>
          <Text style={styles.rcBtnText}>Sports Park 🏟️</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

// ── Main Entry ────────────────────────────────────────────
export default function LittleChampsArenaScreen() {
  const store = useLittleChampsStore();
  const [screen,    setScreen]    = useState<'hub'|'soccer'|'basketball'|'baseball'|'complete'>('hub');
  const [sport,     setSport]     = useState<Sport>('soccer');
  const [lastScore, setLastScore] = useState(0);
  const [key,       setKey]       = useState(0); // force remount

  useEffect(() => { store.loadState(); }, []);

  const handleSportSelect = (s: Sport) => {
    setSport(s);
    setKey(k => k + 1);
    setScreen(s);
  };

  const handleGameDone = (score: number) => {
    setLastScore(score);
    store.addScore(sport, score);
    setScreen('complete');
  };

  const sportColors: Record<Sport, string> = {
    soccer: '#6BCB77', basketball: '#FF9F43', baseball: '#4D96FF',
  };
  const headerColor = screen === 'hub' ? '#FF6B6B' : sportColors[sport] ?? '#FF6B6B';
  const activeBall = {
    soccer:     store.selectedBall.soccer,
    basketball: store.selectedBall.basketball,
    baseball:   store.selectedBall.baseball,
  };
  const ballEmoji = GEAR.find(g => g.id === activeBall[sport])?.emoji ?? '⚽';
  const batEmoji  = GEAR.find(g => g.id === 'wood-bat')?.emoji ?? '🏏';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.header, { backgroundColor: headerColor }]}>
        <TouchableOpacity onPress={() => screen === 'hub' ? router.back() : setScreen('hub')} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {screen === 'hub' ? '🏆 Little Champs Arena' :
           screen === 'soccer' ? '⚽ Soccer Shootout' :
           screen === 'basketball' ? '🏀 Basketball Hoops' :
           screen === 'baseball' ? '⚾ Baseball Hit Zone' : '🏆 Result'}
        </Text>
        <View style={styles.starsHeaderBadge}><Text style={styles.starsHeaderText}>⭐{store.totalStars}</Text></View>
      </View>

      {screen === 'hub' && (
        <SportsParkHub onSelectSport={handleSportSelect} totalStars={store.totalStars} bestScores={store.bestScores} />
      )}

      {(screen === 'soccer' || screen === 'basketball' || screen === 'baseball') && (
        <>
          <ScoreBoard score={0} best={store.bestScores[sport]} shots={0} maxShots={5} sport={sport} streak={0} />
          {screen === 'soccer'     && <SoccerShootout      key={key} onDone={handleGameDone} ballEmoji={ballEmoji} />}
          {screen === 'basketball' && <BasketballHoops     key={key} onDone={handleGameDone} ballEmoji={ballEmoji} />}
          {screen === 'baseball'   && <BaseballHitZone     key={key} onDone={handleGameDone} batEmoji={batEmoji}   />}
        </>
      )}

      {screen === 'complete' && (
        <RoundComplete
          sport={sport} score={lastScore} best={store.bestScores[sport]}
          onReplay={() => { setKey(k => k + 1); setScreen(sport); }}
          onHub={() => setScreen('hub')}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: '#FFF9F0' },
  header:             { flexDirection: 'row', alignItems: 'center', padding: 12 },
  backBtn:            { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  backText:           { fontSize: 22, color: '#fff', fontWeight: '900' },
  headerTitle:        { flex: 1, textAlign: 'center', fontSize: 16, fontWeight: '900', color: '#fff' },
  starsHeaderBadge:   { backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  starsHeaderText:    { fontSize: 14, fontWeight: '900', color: '#fff' },
  // Score board
  scoreBoard:         { flexDirection: 'row', backgroundColor: '#fff', padding: 10, justifyContent: 'space-around', borderBottomWidth: 1, borderBottomColor: '#F5EDD8' },
  scoreStat:          { alignItems: 'center', gap: 2 },
  scoreStatValue:     { fontSize: 20, fontWeight: '900', color: '#3D3530' },
  scoreStatLabel:     { fontSize: 10, color: '#8B8178', fontWeight: '700' },
  // Soccer
  soccerField:        { flex: 1, backgroundColor: '#4CAF50', position: 'relative', overflow: 'hidden' },
  grassLines:         { position: 'absolute', inset: 0 },
  grassLine:          { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(255,255,255,0.15)' },
  goal:               { position: 'absolute', top: H * 0.08, alignSelf: 'center', alignItems: 'center' },
  goalPost:           { fontSize: 70 },
  goalie:             { position: 'absolute', top: H * 0.2 },
  goalieEmoji:        { fontSize: 44 },
  targetZone:         { position: 'absolute' },
  targetEmoji:        { fontSize: 30, opacity: 0.6 },
  ball:               { position: 'absolute', alignItems: 'center' },
  ballEmoji:          { fontSize: 48 },
  ballHint:           { fontSize: 10, fontWeight: '800', color: '#fff', textShadowColor: '#000', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  sportFeedback:      { position: 'absolute', top: '35%', alignSelf: 'center', borderRadius: 20, paddingHorizontal: 20, paddingVertical: 12 },
  sportFeedbackText:  { fontSize: 20, fontWeight: '900', color: '#fff' },
  // Basketball
  courtArea:          { flex: 1, backgroundColor: '#DEB887', position: 'relative', overflow: 'hidden' },
  courtCenter:        { position: 'absolute', top: '40%', left: '20%', right: '20%', height: 2, backgroundColor: 'rgba(255,255,255,0.3)' },
  courtArc:           { position: 'absolute', top: '45%', left: '30%', right: '30%', height: 60, borderRadius: 60, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', borderBottomWidth: 0 },
  hoop:               { position: 'absolute', top: H * 0.12, alignItems: 'center' },
  hoopEmoji:          { fontSize: 50 },
  hoopRing:           { width: 50, height: 8, borderRadius: 4, backgroundColor: '#FF6600', opacity: 0.6 },
  shootArea:          { position: 'absolute', bottom: 20, left: 16, right: 16, gap: 8 },
  powerBarWrap:       { height: 12, backgroundColor: 'rgba(255,255,255,0.4)', borderRadius: 6, overflow: 'hidden' },
  powerBarFill:       { height: '100%', borderRadius: 6 },
  shootBtn:           { backgroundColor: '#FF9F43', borderRadius: 99, paddingVertical: 16, alignItems: 'center' },
  shootBtnCharge:     { backgroundColor: '#FF6B6B' },
  shootBtnText:       { fontSize: 16, fontWeight: '900', color: '#fff' },
  // Baseball
  baseballField:      { flex: 1, backgroundColor: '#8BC34A', position: 'relative', overflow: 'hidden' },
  diamond:            { position: 'absolute', top: '20%', left: '30%', width: 100, height: 100, backgroundColor: '#D4C04E', transform: [{ rotate: '45deg' }], opacity: 0.5 },
  hitZone:            { position: 'absolute', top: '35%', left: '28%', right: '28%', height: 50, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  hitZoneActive:      { backgroundColor: 'rgba(255,215,0,0.4)', borderColor: '#FFD93D' },
  hitZoneText:        { fontSize: 13, fontWeight: '900', color: '#fff' },
  baseBall:           { position: 'absolute' },
  bat:                { position: 'absolute', bottom: '22%', right: '25%' },
  baseballControls:   { position: 'absolute', bottom: 20, left: 16, right: 16 },
  pitchBtn:           { backgroundColor: '#4D96FF', borderRadius: 99, paddingVertical: 16, alignItems: 'center' },
  pitchBtnText:       { fontSize: 16, fontWeight: '900', color: '#fff' },
  swingBtn:           { backgroundColor: '#FF9F43', borderRadius: 99, paddingVertical: 16, alignItems: 'center' },
  swingBtnActive:     { backgroundColor: '#FF6B6B' },
  swingBtnText:       { fontSize: 16, fontWeight: '900', color: '#fff' },
  // Hub
  hubScroll:          { padding: 16, gap: 14, paddingBottom: 32 },
  hubCoach:           { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
  hubCoachEmoji:      { fontSize: 52 },
  hubCoachBubble:     { flex: 1, backgroundColor: '#fff', borderRadius: 16, borderBottomLeftRadius: 4, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  hubCoachText:       { fontSize: 13, fontWeight: '700', color: '#3D3530', lineHeight: 20 },
  hubStats:           { flexDirection: 'row', justifyContent: 'center' },
  hubStat:            { alignItems: 'center', gap: 4 },
  hubStatEmoji:       { fontSize: 32 },
  hubStatValue:       { fontSize: 24, fontWeight: '900', color: '#3D3530' },
  hubStatLabel:       { fontSize: 12, color: '#8B8178', fontWeight: '700' },
  hubSectionTitle:    { fontSize: 13, fontWeight: '800', color: '#8B8178', letterSpacing: 1 },
  sportCard:          { backgroundColor: '#fff', borderRadius: 18, borderWidth: 2, flexDirection: 'row', alignItems: 'center', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 8, elevation: 3 },
  sportCardIcon:      { width: 82, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  sportCardEmoji:     { fontSize: 42 },
  sportCardInfo:      { flex: 1, padding: 12, gap: 2 },
  sportCardName:      { fontSize: 16, fontWeight: '900', color: '#3D3530' },
  sportCardDesc:      { fontSize: 12, color: '#8B8178', fontWeight: '700' },
  sportCardBest:      { fontSize: 11, color: '#FF9F43', fontWeight: '800', marginTop: 2 },
  sportCardArrow:     { fontSize: 16, color: '#C0B5AE', paddingRight: 12 },
  hubPark:            { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  hubItem:            { backgroundColor: '#fff', borderRadius: 14, padding: 10, alignItems: 'center', gap: 4, width: '30%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4, elevation: 2 },
  hubItemEmoji:       { fontSize: 32 },
  hubItemLabel:       { fontSize: 9, fontWeight: '800', color: '#8B8178', textAlign: 'center' },
  // Round complete
  roundComplete:      { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  roundCompleteCard:  { backgroundColor: '#FFF9F0', borderRadius: 28, padding: 28, alignItems: 'center', gap: 14, width: '100%' },
  rcTitle:            { fontSize: 28, fontWeight: '900', color: '#3D3530' },
  rcScore:            { fontSize: 36, fontWeight: '900', color: '#FF9F43' },
  rcStars:            { flexDirection: 'row', gap: 8 },
  rcStar:             { fontSize: 36 },
  rcNewBest:          { fontSize: 18, fontWeight: '900', color: '#FFD93D' },
  rcBtn:              { width: '100%', borderRadius: 99, paddingVertical: 14, alignItems: 'center' },
  rcBtnText:          { color: '#fff', fontSize: 16, fontWeight: '900' },
});
