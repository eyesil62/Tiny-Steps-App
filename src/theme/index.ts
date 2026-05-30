export const colors = {
  coral:         '#FF6B6B',
  coralLight:    '#FFE5E5',
  mint:          '#6BCB77',
  mintLight:     '#E5F7E7',
  sky:           '#4D96FF',
  skyLight:      '#E5EFFE',
  sun:           '#FFD93D',
  sunLight:      '#FFF8DC',
  lavender:      '#C77DFF',
  lavenderLight: '#F3E5FF',
  cream:         '#FFF9F0',
  sand:          '#F5EDD8',
  warmGray:      '#8B8178',
  dark:          '#3D3530',
  white:         '#FFFFFF',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius  = { sm: 8, md: 14, lg: 20, xl: 28, full: 9999 } as const;
export const fontSize = { xs: 11, sm: 13, md: 15, lg: 18, xl: 22, xxl: 28, xxxl: 36 } as const;
export const fontWeight = { regular: '400' as const, bold: '700' as const, heavy: '900' as const };
export const shadow = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6,  elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
} as const;

const theme = { colors, spacing, radius, fontSize, fontWeight, shadow };
export default theme;
