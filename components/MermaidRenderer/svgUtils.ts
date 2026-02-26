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

    // Fix polygon (diamond) positioning by normalizing transform
    if (node.tagName === 'polygon') {
      const currentTransform = node.getAttribute('transform') || '';
      node.setAttribute('transform', `translate(0, 0) ${currentTransform}`);
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
 * Enhances edge label boxes across all diagram types:
 * - Flowcharts/state diagrams: Expands foreignObject so CSS padding isn't clipped
 * - Sequence diagrams: Creates background rects for .messageText elements
 */
export function enhanceEdgeLabelBoxes(svgElement: SVGSVGElement): void {
  const paddingX = 14;
  const paddingY = 6;
  const borderRadius = EDGE_LABEL_MIN_SIZE.borderRadius;

  // 1. Expand foreignObject elements inside edge labels so CSS padding isn't clipped
  const foreignObjects = svgElement.querySelectorAll('g.edgeLabel foreignObject');
  foreignObjects.forEach((fo) => {
    const currentWidth = parseFloat(fo.getAttribute('width') || '0');
    const currentHeight = parseFloat(fo.getAttribute('height') || '0');
    const extraW = paddingX * 2 + 2; // padding + border
    const extraH = paddingY * 2 + 2;
    fo.setAttribute('width', (currentWidth + extraW).toString());
    fo.setAttribute('height', (currentHeight + extraH).toString());
    // Re-center by shifting position
    const currentX = parseFloat(fo.getAttribute('x') || '0');
    const currentY = parseFloat(fo.getAttribute('y') || '0');
    fo.setAttribute('x', (currentX - extraW / 2).toString());
    fo.setAttribute('y', (currentY - extraH / 2).toString());
    (fo as SVGForeignObjectElement).style.overflow = 'visible';
  });

  // 2. Create background rects for sequence diagram message labels (.messageText)
  const messageTexts = svgElement.querySelectorAll('.messageText');
  messageTexts.forEach((textEl) => {
    try {
      // Skip if we already added a background
      if (textEl.previousElementSibling?.classList.contains('message-label-bg')) return;

      const bbox = (textEl as SVGTextElement).getBBox();
      if (bbox.width === 0 || bbox.height === 0) return;

      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', (bbox.x - paddingX).toString());
      rect.setAttribute('y', (bbox.y - paddingY).toString());
      rect.setAttribute('width', (bbox.width + paddingX * 2).toString());
      rect.setAttribute('height', (bbox.height + paddingY * 2).toString());
      rect.setAttribute('rx', borderRadius.toString());
      rect.setAttribute('ry', borderRadius.toString());
      rect.setAttribute('fill', '#FFFFFF');
      rect.setAttribute('stroke', '#D1D5DB');
      rect.setAttribute('stroke-width', '1');
      rect.classList.add('message-label-bg');

      textEl.parentNode?.insertBefore(rect, textEl);
    } catch {
      // getBBox can throw if element isn't rendered yet
    }
  });
}

/**
 * Finds edge paths using multiple selector strategies
 * Mermaid uses different class names for different diagram types
 */
export function findEdgePaths(svgElement: SVGSVGElement): NodeListOf<Element> | Element[] {
  // Collect all matching edges from all selectors (don't stop at first match)
  const edgeSet = new Set<Element>();

  for (const selector of MERMAID_SELECTORS.edges) {
    const edges = svgElement.querySelectorAll(selector);
    edges.forEach(edge => edgeSet.add(edge));
  }

  // If we found edges using selectors, return them
  if (edgeSet.size > 0) {
    return Array.from(edgeSet);
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
