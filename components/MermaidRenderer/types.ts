/**
 * Type definitions for the Mermaid Renderer component
 */

/**
 * Custom theme configuration for the renderer
 */
export interface CustomTheme {
  /** Primary color for nodes and edges */
  primaryColor?: string;
  /** Secondary/hover color */
  secondaryColor?: string;
  /** Background color or gradient */
  backgroundColor?: string;
  /** Text color */
  textColor?: string;
  /** Particle color */
  particleColor?: string;
  /** Stroke width for nodes and edges */
  strokeWidth?: number;
  /** Font size for labels */
  fontSize?: number;
}

/**
 * Event data for node interactions
 */
export interface NodeEventData {
  /** The SVG element that was interacted with */
  element: SVGElement;
  /** Node label text (if available) */
  label?: string;
  /** Bounding box of the node */
  bounds: DOMRect;
}

/**
 * Event data for edge interactions
 */
export interface EdgeEventData {
  /** The SVG path element */
  element: SVGPathElement;
  /** Edge label text (if available) */
  label?: string;
}

/**
 * Props for the MermaidRenderer component
 */
export interface MermaidRendererProps {
  /** Mermaid diagram syntax as a string */
  chart: string;

  /** Optional custom theme to override default colors and styles */
  theme?: CustomTheme;

  /** Optional CSS class name for the container */
  className?: string;

  /** Disable all animations (particles, glows, pulses) */
  disableAnimations?: boolean;

  /** Disable particle effects only */
  disableParticles?: boolean;

  /** Callback when a node is clicked */
  onNodeClick?: (data: NodeEventData) => void;

  /** Callback when a node is hovered */
  onNodeHover?: (data: NodeEventData | null) => void;

  /** Callback when an edge is clicked */
  onEdgeClick?: (data: EdgeEventData) => void;

  /** Callback when an edge is hovered */
  onEdgeHover?: (data: EdgeEventData | null) => void;
}

/**
 * Configuration for particle animation
 * Particles run sequentially through edges
 */
export interface ParticleConfig {
  /** Number of particles per arrow path */
  particleCount: number;
  /** Minimum animation duration in milliseconds */
  minDuration: number;
  /** Maximum animation duration in milliseconds */
  maxDuration: number;
  /** Duration multiplier based on path length */
  durationMultiplier: number;
}

/**
 * Data structure for tracking individual particle animations
 */
export interface ParticleAnimation {
  /** The main particle circle element */
  element: SVGCircleElement;
  /** The inner glow circle element */
  glowElement: SVGCircleElement;
  /** The path along which the particle travels */
  path: SVGPathElement;
  /** Total length of the path */
  pathLength: number;
  /** Animation duration in milliseconds */
  duration: number;
  /** Time offset for staggering (0-1) */
  offset: number;
  /** Timestamp when animation should start */
  startTime: number;
}

/**
 * Configuration for particle visual appearance
 */
export interface ParticleStyle {
  outerGlow: {
    radius: number;
    fill: string;
    opacity: number;
  };
  core: {
    radius: number;
    fill: string;
    opacity: number;
  };
  innerGlow: {
    radius: number;
    fill: string;
    opacity: number;
  };
}

/**
 * Mermaid initialization configuration
 */
export interface MermaidConfig {
  startOnLoad: boolean;
  theme: string;
  themeVariables: {
    primaryColor: string;
    primaryTextColor: string;
    primaryBorderColor: string;
    lineColor: string;
    secondaryColor: string;
    tertiaryColor: string;
    background?: string;
    mainBkg?: string;
    nodeBorder?: string;
    clusterBkg?: string;
    clusterBorder?: string;
    actorBkg?: string;
    actorBorder?: string;
    actorTextColor?: string;
    actorLineColor?: string;
    signalColor?: string;
    signalTextColor?: string;
  };
  sequence?: {
    diagramMarginX?: number;
    diagramMarginY?: number;
    actorMargin?: number;
    width?: number;
    height?: number;
    boxMargin?: number;
    boxTextMargin?: number;
    noteMargin?: number;
    messageMargin?: number;
    mirrorActors?: boolean;
    useMaxWidth?: boolean;
  };
}
