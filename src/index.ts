/**
 * Mermaid Vibes
 *
 * Vibe-coded diagrams with buttery animations
 */

export {
  MermaidVibes,
  exportAsPNG,
  exportAsJPG,
  exportAsSVG,
  type MermaidRendererProps,
  type CustomTheme,
  type NodeEventData,
  type EdgeEventData,
} from '../components/MermaidRenderer';

// Re-export the theme constants for convenience
export { PRIMARY, ACCENT, BACKGROUND, TEXT } from '../components/MermaidRenderer/theme';
