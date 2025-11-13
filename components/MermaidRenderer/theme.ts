/**
 * Color Theme - Inspired by Truemed Design System
 *
 * A warm, organic aesthetic with a sustainable feel.
 * Sophisticated teals and cyans balanced with warm off-white backgrounds.
 */

/**
 * Primary brand colors
 */
export const PRIMARY = {
  teal: '#179895',
  tealLight: '#679b9a',
  cyanDark: '#183B43',
} as const;

/**
 * Accent colors for highlights and emphasis
 */
export const ACCENT = {
  yellow: '#FFF6A8',
  red: '#E43028',
  cyanLight: '#D9F5EA',
  cyanSoft: '#F4FFFB',
} as const;

/**
 * Background colors
 */
export const BACKGROUND = {
  primary: '#F7F6F2',
  white: '#FFFFFF',
  gray100: '#EDF2F7',
} as const;

/**
 * Text colors
 */
export const TEXT = {
  body: '#1A202C',
  subtle: '#4A5568',
  placeholder: '#718096',
} as const;

/**
 * Semantic color mappings for diagram elements
 */
export const DIAGRAM = {
  // Node styling
  nodeFill: 'rgba(23, 152, 149, 0.1)',
  nodeStroke: PRIMARY.teal,
  nodeStrokeHover: PRIMARY.tealLight,

  // Edge styling
  edgeStroke: PRIMARY.teal,
  edgeStrokeHover: PRIMARY.tealLight,

  // Particle colors
  particleCore: PRIMARY.teal,
  particleGlow: PRIMARY.tealLight,
  particleHalo: ACCENT.cyanLight,

  // Label styling
  labelText: TEXT.body,
  labelBackground: BACKGROUND.white,
  labelBorder: PRIMARY.teal,

  // Container
  containerBackground: `linear-gradient(135deg, ${BACKGROUND.primary} 0%, ${ACCENT.cyanSoft} 50%, ${BACKGROUND.primary} 100%)`,

  // Glow effects
  glowPrimary: PRIMARY.teal,
  glowSecondary: PRIMARY.tealLight,
} as const;

/**
 * Typography scale
 */
export const TYPOGRAPHY = {
  nodeLabelSize: '16px',
  edgeLabelSize: '15px',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", sans-serif',
  fontWeight: {
    normal: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

/**
 * Spacing and sizing
 */
export const SIZING = {
  strokeWidth: {
    node: 3,
    edge: 3,
    edgeLabel: 2.5,
  },
  borderRadius: {
    node: 12,
    edgeLabel: 10,
  },
  padding: {
    container: '6rem',
    edgeLabel: '12px 16px',
  },
  minSize: {
    edgeLabelWidth: 90,
    edgeLabelHeight: 50,
  },
} as const;

/**
 * Animation timings
 */
export const ANIMATION = {
  nodeGlow: '6s',
  edgePulse: '5s',
  particleDuration: {
    min: 2000,
    max: 3500,
  },
} as const;

/**
 * Helper function to convert hex to rgba
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
