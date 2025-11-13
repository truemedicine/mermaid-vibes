/**
 * Utilities for enhancing SVG elements with custom styles and animations
 */

import { MERMAID_SELECTORS, EDGE_LABEL_MIN_SIZE } from './constants';

/**
 * Adds animated styles to all node elements (boxes, circles, etc.)
 */
export function enhanceNodes(svgElement: SVGSVGElement): void {
  const nodes = svgElement.querySelectorAll(MERMAID_SELECTORS.nodes);
  nodes.forEach((node) => {
    node.classList.add('animated-node');

    // Add rounded corners to rectangles
    if (node.tagName === 'rect') {
      node.setAttribute('rx', '10');
      node.setAttribute('ry', '10');
    }
  });
}

/**
 * Adds animated styles to all label elements
 */
export function enhanceLabels(svgElement: SVGSVGElement): void {
  const nodeLabels = svgElement.querySelectorAll(MERMAID_SELECTORS.nodeLabels);
  const edgeLabels = svgElement.querySelectorAll(MERMAID_SELECTORS.edgeLabels);

  [...nodeLabels, ...edgeLabels].forEach((label) => {
    label.classList.add('animated-label');
  });
}

/**
 * Enforces minimum dimensions and rounded corners on edge label boxes
 * (e.g., "Yes" and "No" labels on decision branches)
 */
export function enhanceEdgeLabelBoxes(svgElement: SVGSVGElement): void {
  const edgeLabelRects = svgElement.querySelectorAll(MERMAID_SELECTORS.edgeLabelRects);
  const { width: minWidth, height: minHeight, borderRadius } = EDGE_LABEL_MIN_SIZE;

  edgeLabelRects.forEach((rect) => {
    const width = parseFloat(rect.getAttribute('width') || '0');
    const height = parseFloat(rect.getAttribute('height') || '0');

    // Add padding to the dimensions
    const paddedMinWidth = minWidth + 20;
    const paddedMinHeight = minHeight + 10;

    // Always enforce minimum width with padding
    const newWidth = Math.max(width, paddedMinWidth);
    if (newWidth !== width) {
      rect.setAttribute('width', newWidth.toString());
      const x = parseFloat(rect.getAttribute('x') || '0');
      rect.setAttribute('x', (x - (newWidth - width) / 2).toString());
    }

    // Always enforce minimum height with padding
    const newHeight = Math.max(height, paddedMinHeight);
    if (newHeight !== height) {
      rect.setAttribute('height', newHeight.toString());
      const y = parseFloat(rect.getAttribute('y') || '0');
      rect.setAttribute('y', (y - (newHeight - height) / 2).toString());
    }

    // Add rounded corners
    rect.setAttribute('rx', borderRadius.toString());
    rect.setAttribute('ry', borderRadius.toString());
  });
}

/**
 * Finds edge paths using multiple selector strategies
 * Mermaid uses different class names for different diagram types
 */
export function findEdgePaths(svgElement: SVGSVGElement): NodeListOf<Element> | Element[] {
  // Try each selector in order of priority
  for (const selector of MERMAID_SELECTORS.edges) {
    const edges = svgElement.querySelectorAll(selector);
    if (edges.length > 0) {
      return edges;
    }
  }

  // Fallback: find all paths that are NOT part of nodes or markers
  const allPaths = svgElement.querySelectorAll('path');
  return Array.from(allPaths).filter((path) => {
    const parent = path.parentElement;
    const isNotNode = !parent?.classList.contains('node');
    const isNotMarker = parent?.tagName?.toLowerCase() !== 'marker';
    return isNotNode && isNotMarker;
  });
}

/**
 * Adds animated styles to edge paths (arrows)
 */
export function enhanceEdges(svgElement: SVGSVGElement): NodeListOf<Element> | Element[] {
  const edges = findEdgePaths(svgElement);

  edges.forEach((edge) => {
    edge.classList.add('animated-edge');
  });

  return edges;
}

/**
 * Creates a dedicated group for particle elements
 * This ensures particles render on top of all other SVG elements
 */
export function createParticleLayer(svgElement: SVGSVGElement): SVGGElement {
  const particleGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  particleGroup.setAttribute('class', 'particle-layer');
  svgElement.appendChild(particleGroup);
  return particleGroup;
}

/**
 * Fixes arrow markers to prevent line from extending past arrowhead
 */
export function fixArrowMarkers(svgElement: SVGSVGElement): void {
  // Find all marker elements (arrowheads)
  const markers = svgElement.querySelectorAll('marker');

  markers.forEach((marker) => {
    const id = marker.getAttribute('id');

    // Only fix arrowhead markers (not other marker types)
    if (id && (id.includes('arrowhead') || id.includes('flowchart') || id.includes('arrow'))) {
      // Adjust refX to position the marker so the path ends at the base of the arrowhead
      // This prevents the line from extending past the arrowhead
      const currentRefX = parseFloat(marker.getAttribute('refX') || '5');

      // Reduce refX slightly so the line stops right where the arrowhead begins
      // The amount to reduce depends on the stroke width (currently 4-5px)
      const adjustedRefX = currentRefX - 2.5; // Pull back by 2.5 units

      marker.setAttribute('refX', adjustedRefX.toString());
    }
  });
}

/**
 * Configures SVG rendering optimizations
 */
export function configureSVGRendering(svgElement: SVGSVGElement): void {
  // Remove any inline overflow styles that might interfere
  svgElement.style.removeProperty('overflow');
}

/**
 * Applies all SVG enhancements in the correct order
 */
export function enhanceSVG(svgElement: SVGSVGElement): {
  edges: NodeListOf<Element> | Element[];
  particleGroup: SVGGElement;
} {
  configureSVGRendering(svgElement);
  enhanceNodes(svgElement);
  enhanceLabels(svgElement);
  enhanceEdgeLabelBoxes(svgElement);
  const edges = enhanceEdges(svgElement);
  fixArrowMarkers(svgElement);
  const particleGroup = createParticleLayer(svgElement);

  return { edges, particleGroup };
}
