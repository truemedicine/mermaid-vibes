/**
 * Configuration constants for the Mermaid Renderer
 */

import { MermaidConfig, ParticleConfig, ParticleStyle } from './types';
import { PRIMARY, ACCENT, BACKGROUND, TEXT, hexToRgba } from './theme';

/**
 * Mermaid.js initialization configuration
 */
export const MERMAID_CONFIG: MermaidConfig = {
  startOnLoad: false,
  theme: 'base',
  themeVariables: {
    primaryColor: PRIMARY.teal,
    primaryTextColor: TEXT.body,
    primaryBorderColor: PRIMARY.tealLight,
    lineColor: PRIMARY.teal,
    secondaryColor: PRIMARY.tealLight,
    tertiaryColor: ACCENT.cyanLight,
    background: BACKGROUND.white,
    mainBkg: BACKGROUND.white,
    nodeBorder: PRIMARY.teal,
    clusterBkg: ACCENT.cyanSoft,
    clusterBorder: PRIMARY.tealLight,
    // Sequence diagram specific
    actorBkg: BACKGROUND.white,
    actorBorder: PRIMARY.teal,
    actorTextColor: TEXT.body,
    actorLineColor: PRIMARY.teal,
    signalColor: TEXT.body,
    signalTextColor: TEXT.body,
  },
  sequence: {
    diagramMarginX: 100,
    diagramMarginY: 80,
    actorMargin: 150,
    width: 300,
    height: 120,
    boxMargin: 25,
    boxTextMargin: 15,
    noteMargin: 25,
    messageMargin: 80,
    mirrorActors: true,
    useMaxWidth: true,
  },
};

/**
 * Configuration for particle animations
 * Particles now run sequentially through edges
 */
export const PARTICLE_CONFIG: ParticleConfig = {
  particleCount: 1,
  minDuration: 2000,
  maxDuration: 3500,
  durationMultiplier: 15,
};

/**
 * Visual styling for particles
 */
export const PARTICLE_STYLE: ParticleStyle = {
  outerGlow: {
    radius: 8,
    fill: ACCENT.cyanLight,
    opacity: 0.15,
  },
  core: {
    radius: 3,
    fill: PRIMARY.teal,
    opacity: 0.5,
  },
  innerGlow: {
    radius: 1.5,
    fill: PRIMARY.tealLight,
    opacity: 0.4,
  },
};

/**
 * CSS class names used by Mermaid for different diagram elements
 */
export const MERMAID_SELECTORS = {
  // Node selectors
  nodes: '.node rect, .node polygon, .node circle, .node ellipse',
  nodeLabels: '.nodeLabel',

  // Edge selectors (in order of priority)
  edges: [
    '.flowchart-link',
    '.messageLine0',
    '.messageLine1',
    '.messageLine0.dashed',
    '.messageLine1.dashed',
    '.edgePath path',
    'path.edge',
    'path.relation',
  ],
  edgeLabels: '.edgeLabel',
  edgeLabelRects: '.edgeLabel rect',

  // Marker selectors
  markers: 'marker',
};

/**
 * Minimum dimensions for edge label boxes (Yes/No labels)
 */
export const EDGE_LABEL_MIN_SIZE = {
  width: 90,
  height: 50,
  borderRadius: 12,
};

/**
 * Unique ID for the rendered Mermaid diagram
 */
export const DIAGRAM_ID = 'mermaid-diagram';
