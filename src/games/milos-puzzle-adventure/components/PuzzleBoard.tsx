// ============================================================
// Milo's Puzzle Adventure — Puzzle Board with drag & snap
// Toddler-friendly: pieces snap into place when dropped near slot
// ============================================================
import React, { useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, Animated, PanResponder,
  Dimensions, TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import * as Speech from 'expo-speech';
import { Puzzle, PuzzlePiece } from '../data/puzzles';

const { width: W } = Dimensions.get('window');
const BOARD_SIZE = Math.min(W - 48, 320);

function say(text: string, rate = 0.9, pitch = 1.2) {
  Speech.isSpeakingAsync().then(s => {
    const go = () => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} };
    if (s) Speech.stop().then(go).catch(go);
    else setTimeout(go, 100);
  }).catch(() => setTimeout(() => { try { Speech.speak(text, { language: 'en-US', rate, pitch }); } catch {} }, 100));
}

interface Props {
  puzzle:     Puzzle;
  onComplete: () => void;
}

interface DraggablePieceProps {
  piece:      PuzzlePiece;
  slotSize:   number;
  cols:       number;
  boardLayout:{ x: number; y: number } | null;
  placed:     boolean;
  onPlaced:   (pieceId: string) => void;
  trayIndex:  number;
}

function DraggablePiece({ piece, slotSize, cols, boardLayout, placed, onPlaced, trayIndex }: DraggablePieceProps) {
  const pan = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [isPlaced, setIsPlaced] = useState(placed);

  // target slot position (relative to board)
  const slotRow = Math.floor(piece.correctSlot / cols);
  const slotCol = piece.correctSlot % cols;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isPlaced,
      onMoveShouldSetPanResponder:  () => !isPlaced,
      onPanResponderGrant: () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        Animated.spring(scale, { toValue: 1.15, useNativeDriver: false, tension: 200, friction: 6 }).start();
        pan.setOffset({ x: (pan.x as any)._value, y: (pan.y as any)._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (_, gesture) => {
        pan.flattenOffset();
        Animated.spring(scale, { toValue: 1, useNativeDriver: false, tension: 200, friction: 6 }).start();

        if (!boardLayout) return;

        // Calculate where the piece was dropped (absolute)
        const dropX = gesture.moveX;
        const dropY = gesture.moveY;

        // Target slot absolute position (center)
        const targetX = boardLayout.x + slotCol * slotSize + slotSize / 2;
        const targetY = boardLayout.y + slotRow * slotSize + slotSize / 2;

        const dist = Math.hypot(dropX - targetX, dropY - targetY);

        // Generous snap radius for toddlers
        if (dist < slotSize * 0.75) {
          // SNAP! Correct placement
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          setIsPlaced(true);
          say('Yes! Perfect fit!', 0.95, 1.25);
          onPlaced(piece.id);
        } else {
          // Spring back to tray
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false, tension: 80, friction: 8 }).start();
        }
      },
    })
  ).current;

  if (isPlaced) {
    // Render in correct slot
    return (
      <View style={[styles.placedPiece, {
        width: slotSize - 4, height: slotSize - 4,
        left: slotCol * slotSize + 2,
        top:  slotRow * slotSize + 2,
        backgroundColor: piece.bgColor,
      }]}>
        <Text style={{ fontSize: slotSize * 0.4 }}>{piece.emoji}</Text>
      </View>
    );
  }

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.trayPiece,
        {
          width: slotSize - 8, height: slotSize - 8,
          backgroundColor: piece.bgColor,
          transform: [{ translateX: pan.x }, { translateY: pan.y }, { scale }],
        },
      ]}
    >
      <Text style={{ fontSize: slotSize * 0.38 }}>{piece.emoji}</Text>
    </Animated.View>
  );
}

export function PuzzleBoard({ puzzle, onComplete }: Props) {
  const cols     = puzzle.gridCols;
  const rows     = Math.ceil(puzzle.pieceCount / cols);
  const slotSize = BOARD_SIZE / cols;
  const boardRef = useRef<View>(null);
  const [boardLayout, setBoardLayout] = useState<{ x: number; y: number } | null>(null);
  const [placedPieces, setPlacedPieces] = useState<string[]>([]);
  const [shuffledTray] = useState(() => [...puzzle.pieces].sort(() => Math.random() - 0.5));

  const handlePlaced = useCallback((pieceId: string) => {
    setPlacedPieces(prev => {
      const next = [...prev, pieceId];
      if (next.length === puzzle.pieceCount) {
        setTimeout(() => onComplete(), 800);
      }
      return next;
    });
  }, [puzzle.pieceCount, onComplete]);

  const measureBoard = () => {
    boardRef.current?.measureInWindow((x, y) => setBoardLayout({ x, y }));
  };

  return (
    <View style={styles.container}>
      {/* Target preview (faded) */}
      <View style={styles.previewRow}>
        <Text style={styles.previewLabel}>Build this:</Text>
        <Text style={styles.previewEmoji}>{puzzle.emoji}</Text>
      </View>

      {/* Board with slots */}
      <View
        ref={boardRef}
        onLayout={measureBoard}
        style={[styles.board, { width: BOARD_SIZE, height: rows * slotSize, backgroundColor: puzzle.bgColor }]}
      >
        {/* Empty slot guides */}
        {puzzle.pieces.map((piece) => {
          const r = Math.floor(piece.correctSlot / cols);
          const c = piece.correctSlot % cols;
          const isFilled = placedPieces.includes(piece.id);
          return (
            <View key={`slot-${piece.id}`} style={[styles.slot, {
              width: slotSize - 4, height: slotSize - 4,
              left: c * slotSize + 2, top: r * slotSize + 2,
            }, isFilled && styles.slotFilled]}>
              {!isFilled && <Text style={styles.slotHint}>{piece.emoji}</Text>}
            </View>
          );
        })}

        {/* Placed pieces */}
        {shuffledTray.map((piece) => (
          placedPieces.includes(piece.id) ? (
            <DraggablePiece
              key={`placed-${piece.id}`}
              piece={piece}
              slotSize={slotSize}
              cols={cols}
              boardLayout={boardLayout}
              placed={true}
              onPlaced={handlePlaced}
              trayIndex={0}
            />
          ) : null
        ))}
      </View>

      {/* Piece tray */}
      <Text style={styles.trayLabel}>Drag the pieces! 👆</Text>
      <View style={styles.tray}>
        {shuffledTray.map((piece, i) => (
          placedPieces.includes(piece.id) ? null : (
            <DraggablePiece
              key={piece.id}
              piece={piece}
              slotSize={slotSize}
              cols={cols}
              boardLayout={boardLayout}
              placed={false}
              onPlaced={handlePlaced}
              trayIndex={i}
            />
          )
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:    { alignItems: 'center', gap: 16 },
  previewRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 2 },
  previewLabel: { fontSize: 14, fontWeight: '800', color: '#8B8178' },
  previewEmoji: { fontSize: 36 },
  board:        { borderRadius: 16, position: 'relative', borderWidth: 3, borderColor: 'rgba(0,0,0,0.1)', borderStyle: 'dashed' },
  slot:         { position: 'absolute', borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.4)', borderWidth: 2, borderColor: 'rgba(0,0,0,0.12)', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  slotFilled:   { borderStyle: 'solid', borderColor: '#6BCB77', backgroundColor: 'transparent' },
  slotHint:     { fontSize: 24, opacity: 0.25 },
  placedPiece:  { position: 'absolute', borderRadius: 10, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#6BCB77' },
  trayLabel:    { fontSize: 13, fontWeight: '800', color: '#8B8178' },
  tray:         { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', minHeight: 80, paddingHorizontal: 16 },
  trayPiece:    { borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(0,0,0,0.15)', shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 6, elevation: 4 },
});
