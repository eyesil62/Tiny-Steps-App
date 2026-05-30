// ============================================================
// Milo's Color World — Coloring Canvas
// Grid-based tap-to-fill coloring with animations
// ============================================================
import React, { useRef, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { ColoringPage, ColorRegion } from '../data/coloringPages';
import { getColorById, getDisplayColor } from '../data/colors';

const { width: W } = Dimensions.get('window');
const CANVAS_W   = W - 32;
const GRID_COLS  = 4;
const CELL_SIZE  = Math.floor(CANVAS_W / GRID_COLS);

interface Props {
  page:         ColoringPage;
  colorings:    Record<string, string>;  // regionId -> colorId
  selectedColor:string;
  onPaint:      (regionId: string, colorId: string) => void;
}

function RegionCell({ region, colorId, selectedColor, onPaint }: {
  region: ColorRegion; colorId: string | null; selectedColor: string; onPaint: () => void;
}) {
  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const glowAnim   = useRef(new Animated.Value(0)).current;

  const baseColor = colorId ? getColorById(colorId) : null;
  const displayBg = baseColor ? getDisplayColor(baseColor) : '#F5F5F5';
  const isColored = !!colorId;

  const colSpan = region.colSpan ?? 1;
  const rowSpan = region.rowSpan ?? 1;
  const cellW   = CELL_SIZE * colSpan - 6;
  const cellH   = CELL_SIZE * rowSpan - 6;

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Splash fill animation
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.12, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, tension: 180, friction: 5, useNativeDriver: true }),
    ]).start();
    // Glow flash
    Animated.sequence([
      Animated.timing(glowAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(glowAnim, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start();
    onPaint();
  }, [onPaint]);

  const glowOpacity = glowAnim.interpolate({ inputRange: [0,1], outputRange: [0, 0.4] });

  // Size variants
  const sizeStyle = {
    sm: { borderRadius: 8 },
    md: { borderRadius: 12 },
    lg: { borderRadius: 16 },
    xl: { borderRadius: 20 },
  }[region.size];

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.85}
      style={[styles.cellTouch, {
        left:   region.col * CELL_SIZE + 3,
        top:    region.row * CELL_SIZE + 3,
        width:  cellW,
        height: cellH,
      }]}>
      <Animated.View style={[
        styles.cell,
        sizeStyle,
        { backgroundColor: displayBg },
        !isColored && styles.cellUncolored,
        { transform: [{ scale: scaleAnim }] },
      ]}>
        {/* Glow overlay */}
        <Animated.View style={[styles.glow, { opacity: glowOpacity }]} />

        {/* Content */}
        {!isColored ? (
          <View style={styles.hintContent}>
            <Text style={styles.hintEmoji}>{region.emoji}</Text>
            <Text style={styles.hintLabel}>{region.label}</Text>
          </View>
        ) : (
          <View style={styles.coloredContent}>
            <Text style={styles.coloredEmoji}>{region.emoji}</Text>
            {baseColor?.isSpecial && (
              <Text style={styles.specialOverlay}>✨</Text>
            )}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export function ColoringCanvas({ page, colorings, selectedColor, onPaint }: Props) {
  // Calculate canvas height from grid rows
  const maxRow   = Math.max(...page.regions.map(r => r.row + (r.rowSpan ?? 1)));
  const canvasH  = maxRow * CELL_SIZE + 12;

  const handlePaint = useCallback((region: ColorRegion) => {
    onPaint(region.id, selectedColor);
  }, [selectedColor, onPaint]);

  return (
    <View style={[styles.canvas, { height: canvasH }]}>
      {page.regions.map(region => (
        <RegionCell
          key={region.id}
          region={region}
          colorId={colorings[region.id] ?? null}
          selectedColor={selectedColor}
          onPaint={() => handlePaint(region)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas:         { width: CANVAS_W, position: 'relative' },
  cellTouch:      { position: 'absolute' },
  cell:           { flex: 1, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(0,0,0,0.12)' },
  cellUncolored:  { borderWidth: 2, borderColor: 'rgba(0,0,0,0.15)', borderStyle: 'dashed' },
  glow:           { ...StyleSheet.absoluteFillObject, backgroundColor: '#fff', borderRadius: 16 },
  hintContent:    { alignItems: 'center', gap: 2 },
  hintEmoji:      { fontSize: 24, opacity: 0.5 },
  hintLabel:      { fontSize: 9, fontWeight: '700', color: 'rgba(0,0,0,0.3)', textAlign: 'center' },
  coloredContent: { alignItems: 'center', justifyContent: 'center', position: 'relative' },
  coloredEmoji:   { fontSize: 20, opacity: 0.6 },
  specialOverlay: { position: 'absolute', fontSize: 16, top: -4, right: -4 },
});
