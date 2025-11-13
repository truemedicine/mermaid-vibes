'use client';

/**
 * MermaidRenderer Component
 *
 * A React component that renders Mermaid diagrams with beautiful animations:
 * - Glowing borders on nodes with pulsing effects
 * - Animated arrows with color transitions
 * - Light particles traveling along arrow paths
 * - Modern dark theme with gradient backgrounds
 *
 * @example
 * ```tsx
 * <MermaidRenderer chart={`
 *   graph TD
 *     A[Start] --> B[End]
 * `} />
 * ```
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import mermaid from 'mermaid';
import { MermaidRendererProps, ParticleAnimation, NodeEventData, EdgeEventData } from './types';
import { MERMAID_CONFIG, DIAGRAM_ID } from './constants';
import { enhanceSVG } from './svgUtils';
import { createParticlesForPath, startParticleAnimation } from './particleUtils';
import { PRIMARY } from './theme';
import './styles.css';

/**
 * Initializes Mermaid.js with custom theme configuration
 */
function initializeMermaid(): void {
  mermaid.initialize(MERMAID_CONFIG);
}

/**
 * Preprocesses chart string to extract image references and clean for Mermaid
 * Returns cleaned chart and image mappings
 */
function preprocessChart(chart: string): { cleanedChart: string; imageMappings: Map<string, string> } {
  const imageMappings = new Map<string, string>();

  // Extract and remove img: references from participant definitions
  const cleanedChart = chart.replace(/participant\s+img:([^\s]+)\s+([^\n]+)/g, (match, imgPath, actorName) => {
    const trimmedName = actorName.trim();
    imageMappings.set(trimmedName, imgPath);
    return `participant ${actorName}`;
  });

  return { cleanedChart, imageMappings };
}

/**
 * Adds images to actor boxes based on mappings
 */
function addActorImages(svgElement: SVGSVGElement, imageMappings: Map<string, string>): void {
  if (imageMappings.size === 0) {
    return;
  }

  const allGroups = svgElement.querySelectorAll('g');

  // Try to find actor groups by their content
  const actorCandidates = Array.from(allGroups).filter(g => {
    const hasRect = g.querySelector('rect') !== null;
    const hasText = g.querySelector('text') !== null;
    const className = g.getAttribute('class') || '';
    return hasRect && hasText && (className.includes('actor') || g.querySelector('line'));
  });

  actorCandidates.forEach((actor) => {
    // Look for text anywhere in the actor (not just direct children)
    const textElement = actor.querySelector('text');
    // Look for rect anywhere in the actor
    const rect = actor.querySelector('rect');

    if (!textElement || !rect) {
      return;
    }

    const actorName = textElement.textContent?.trim() || '';
    const imgPath = imageMappings.get(actorName);

    if (imgPath) {
      // Get the rect dimensions and position
      const x = parseFloat(rect.getAttribute('x') || '0');
      const y = parseFloat(rect.getAttribute('y') || '0');
      const height = parseFloat(rect.getAttribute('height') || '0');

      const logoSize = 48;
      const padding = 20;
      const imageX = x + padding;
      const imageY = y + (height - logoSize) / 2;
      const borderRadius = 8;

      // Create a unique ID for this clip path
      const clipPathId = `actor-logo-clip-${Math.random().toString(36).substr(2, 9)}`;

      // Create clip path with rounded rectangle
      const defs = svgElement.querySelector('defs') || svgElement.insertBefore(
        document.createElementNS('http://www.w3.org/2000/svg', 'defs'),
        svgElement.firstChild
      );

      const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clipPath.setAttribute('id', clipPathId);

      const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      clipRect.setAttribute('x', imageX.toString());
      clipRect.setAttribute('y', imageY.toString());
      clipRect.setAttribute('width', logoSize.toString());
      clipRect.setAttribute('height', logoSize.toString());
      clipRect.setAttribute('rx', borderRadius.toString());
      clipRect.setAttribute('ry', borderRadius.toString());

      clipPath.appendChild(clipRect);
      defs.appendChild(clipPath);

      // Create image element
      const image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      image.setAttribute('href', imgPath);
      image.setAttribute('x', imageX.toString());
      image.setAttribute('y', imageY.toString());
      image.setAttribute('width', logoSize.toString());
      image.setAttribute('height', logoSize.toString());
      image.setAttribute('class', 'actor-logo');
      image.setAttribute('clip-path', `url(#${clipPathId})`);

      // Adjust text position to make room for logo (tighter spacing)
      const textX = parseFloat(textElement.getAttribute('x') || '0');
      const textShift = logoSize + 4; // Logo width plus 4px gap
      textElement.setAttribute('x', (textX + textShift / 2).toString());

      // Insert the image into the actor group
      actor.appendChild(image);
    }
  });
}

/**
 * Renders a Mermaid diagram from text syntax
 */
async function renderDiagram(chart: string): Promise<{ svg: string; imageMappings: Map<string, string> }> {
  try {
    const { cleanedChart, imageMappings } = preprocessChart(chart);
    const { svg } = await mermaid.render(DIAGRAM_ID, cleanedChart);
    return { svg, imageMappings };
  } catch (error) {
    console.error('Mermaid rendering error:', error);
    throw error;
  }
}

/**
 * Sets up particle animations for all edges in the SVG
 * Particles run sequentially, one completing before the next begins
 */
function setupParticleAnimations(
  svgElement: SVGSVGElement
): () => void {
  const { edges, particleGroup } = enhanceSVG(svgElement);
  const animations: ParticleAnimation[] = [];

  // Create particles sequentially - each starts after the previous one completes
  let cumulativeStartTime = Date.now();

  edges.forEach((edge) => {
    const pathElement = edge as SVGPathElement;
    const result = createParticlesForPath(
      pathElement,
      cumulativeStartTime,
      particleGroup
    );
    animations.push(...result.animations);
    cumulativeStartTime = result.nextStartTime;
  });

  // Start the animation loop and return cleanup function
  return startParticleAnimation(animations);
}

/**
 * Main MermaidVibes Component
 */
export const MermaidVibes: React.FC<MermaidRendererProps> = ({
  chart,
  theme,
  className = '',
  disableAnimations = false,
  disableParticles = false,
  onNodeClick,
  onNodeHover,
  onEdgeClick,
  onEdgeHover,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svgContent, setSvgContent] = useState<string>('');
  const [imageMappings, setImageMappings] = useState<Map<string, string>>(new Map());

  // Initialize Mermaid and render diagram when chart changes
  useEffect(() => {
    initializeMermaid();

    const renderChart = async () => {
      const { svg, imageMappings } = await renderDiagram(chart);
      setSvgContent(svg);
      setImageMappings(imageMappings);
    };

    renderChart();
  }, [chart]);

  // Setup event listeners for node and edge interactions
  const setupInteractivity = useCallback(
    (svgElement: SVGSVGElement) => {
      // Helper to find the label for a node
      const findNodeLabel = (element: Element): string | undefined => {
        // If we clicked on a rect, image, or other shape, look in the parent group for text
        const searchElement = element.tagName === 'rect' || element.tagName === 'circle' || element.tagName === 'path' || element.tagName === 'image'
          ? element.parentElement
          : element;

        if (!searchElement) return undefined;

        // Strategy 1: Look for text in common Mermaid label elements (descendants)
        const labelSelectors = [
          'text',           // Direct text element (actors, basic nodes)
          '.nodeLabel',     // Flowchart node labels
          '.label',         // Generic labels
          'tspan',          // Text spans inside text elements
          'foreignObject'   // HTML labels
        ];

        for (const selector of labelSelectors) {
          const labelElement = searchElement.querySelector(selector);
          if (labelElement) {
            const text = (labelElement.textContent || '').trim();
            // Return if we found meaningful text (not empty, not too long)
            if (text && text.length > 0 && text.length < 200) {
              return text;
            }
          }
        }

        // Strategy 2: Get all text content from search element as fallback
        // Split by newline and take first non-empty line
        const allText = (searchElement.textContent || '').trim();
        const firstLine = allText.split('\n').find(line => line.trim().length > 0);
        if (firstLine && firstLine.length < 200) {
          return firstLine.trim();
        }

        return undefined;
      };

      // Node interactions
      if (onNodeClick || onNodeHover) {
        const nodes = svgElement.querySelectorAll('.node, .actor, .stateGroup, .classGroup');

        nodes.forEach((node) => {
          const element = node as SVGElement;

          if (onNodeClick) {
            element.style.cursor = 'pointer';
            element.addEventListener('click', (e) => {
              e.stopPropagation(); // Prevent event bubbling that causes re-renders
              const label = findNodeLabel(element);
              const data: NodeEventData = {
                element,
                label,
                bounds: element.getBoundingClientRect(),
              };
              onNodeClick(data);
            });
          }

          if (onNodeHover) {
            element.addEventListener('mouseenter', () => {
              const label = findNodeLabel(element);
              const data: NodeEventData = {
                element,
                label,
                bounds: element.getBoundingClientRect(),
              };
              onNodeHover(data);
            });

            element.addEventListener('mouseleave', () => {
              onNodeHover(null);
            });
          }
        });
      }

      // Edge interactions
      if (onEdgeClick || onEdgeHover) {
        const edges = svgElement.querySelectorAll(
          '.flowchart-link, .messageLine0, .messageLine1, .edgePath path, path.edge'
        );

        // Helper to find the label for an edge
        const findEdgeLabel = (element: Element): string | undefined => {
          // Strategy 1: Look for label in the immediate parent element only
          const immediateParent = element.parentElement;
          if (immediateParent) {
            // Check if the parent is a small group containing just this edge and its label
            const labelsInParent = immediateParent.querySelectorAll('.edgeLabel text, .messageText');
            const pathsInParent = immediateParent.querySelectorAll('path');

            // If there's only one label and one path in this parent, they belong together
            if (labelsInParent.length === 1 && pathsInParent.length === 1) {
              const text = labelsInParent[0].textContent?.trim();
              if (text) return text;
            }
          }

          // Strategy 2: Look for label in sibling elements at the same level
          if (immediateParent) {
            // Get all children of the parent
            const siblings = Array.from(immediateParent.children);

            // Find the index of the current element
            const currentIndex = siblings.indexOf(element);

            // Look for edge label siblings near this element (before or after)
            for (let i = Math.max(0, currentIndex - 2); i < Math.min(siblings.length, currentIndex + 3); i++) {
              const sibling = siblings[i];
              if (sibling.classList.contains('edgeLabel')) {
                const text = sibling.querySelector('text')?.textContent?.trim();
                if (text) return text;
              }
            }
          }

          // Strategy 3: Find the closest edge label by position
          const edgeBBox = element.getBoundingClientRect();
          const allLabels = svgElement.querySelectorAll('.edgeLabel, .messageText');

          let closestLabel: Element | null = null;
          let closestDistance = Infinity;

          allLabels.forEach((label) => {
            const labelBBox = label.getBoundingClientRect();
            // Calculate distance between edge and label centers
            const edgeCenterX = edgeBBox.left + edgeBBox.width / 2;
            const edgeCenterY = edgeBBox.top + edgeBBox.height / 2;
            const labelCenterX = labelBBox.left + labelBBox.width / 2;
            const labelCenterY = labelBBox.top + labelBBox.height / 2;

            const distance = Math.sqrt(
              Math.pow(edgeCenterX - labelCenterX, 2) +
              Math.pow(edgeCenterY - labelCenterY, 2)
            );

            if (distance < closestDistance && distance < 200) { // Within 200px
              closestDistance = distance;
              closestLabel = label;
            }
          });

          if (closestLabel) {
            const text = closestLabel.textContent?.trim();
            if (text) return text;
          }

          return undefined;
        };

        // Handle edge path clicks
        edges.forEach((edge) => {
          const pathElement = edge as SVGPathElement;

          if (onEdgeClick) {
            pathElement.style.cursor = 'pointer';
            pathElement.addEventListener('click', () => {
              const label = findEdgeLabel(pathElement);
              const data: EdgeEventData = {
                element: pathElement,
                label,
              };
              onEdgeClick(data);
            });
          }

          if (onEdgeHover) {
            pathElement.addEventListener('mouseenter', () => {
              const label = findEdgeLabel(pathElement);
              const data: EdgeEventData = {
                element: pathElement,
                label,
              };
              onEdgeHover(data);
            });

            pathElement.addEventListener('mouseleave', () => {
              onEdgeHover(null);
            });
          }
        });

        // Also handle edge label clicks
        const edgeLabels = svgElement.querySelectorAll('.edgeLabel, .messageText');
        edgeLabels.forEach((labelElement) => {
          const label = labelElement.textContent?.trim();

          if (onEdgeClick) {
            (labelElement as HTMLElement).style.cursor = 'pointer';
            labelElement.addEventListener('click', (e) => {
              e.stopPropagation(); // Prevent bubbling to the path

              // Find the associated path element
              const parent = labelElement.closest('g');
              const pathElement = parent?.querySelector('.flowchart-link, .messageLine0, .messageLine1, path') as SVGPathElement;

              const data: EdgeEventData = {
                element: pathElement || (labelElement as any),
                label,
              };
              onEdgeClick(data);
            });
          }

          if (onEdgeHover) {
            labelElement.addEventListener('mouseenter', (e) => {
              const parent = labelElement.closest('g');
              const pathElement = parent?.querySelector('.flowchart-link, .messageLine0, .messageLine1, path') as SVGPathElement;

              const data: EdgeEventData = {
                element: pathElement || (labelElement as any),
                label,
              };
              onEdgeHover(data);
            });

            labelElement.addEventListener('mouseleave', () => {
              onEdgeHover(null);
            });
          }
        });
      }
    },
    [onNodeClick, onNodeHover, onEdgeClick, onEdgeHover]
  );

  // Apply custom theme
  const applyCustomTheme = useCallback(
    (svgElement: SVGSVGElement) => {
      if (!theme) return;

      const styleElement = document.createElement('style');
      let customStyles = '';

      if (theme.primaryColor) {
        customStyles += `
          .animated-node { stroke: ${theme.primaryColor} !important; }
          .animated-edge { stroke: ${theme.primaryColor} !important; }
          .actor { stroke: ${theme.primaryColor} !important; }
          .messageLine0, .messageLine1 { stroke: ${theme.primaryColor} !important; }
        `;
      }

      if (theme.strokeWidth) {
        customStyles += `
          .animated-node { stroke-width: ${theme.strokeWidth} !important; }
          .animated-edge { stroke-width: ${theme.strokeWidth} !important; }
        `;
      }

      if (theme.textColor) {
        customStyles += `
          .nodeLabel, .edgeLabel, .actor text, .messageText { fill: ${theme.textColor} !important; }
        `;
      }

      if (theme.fontSize) {
        customStyles += `
          .nodeLabel, .edgeLabel text, .actor text { font-size: ${theme.fontSize}px !important; }
        `;
      }

      if (customStyles) {
        styleElement.textContent = customStyles;
        svgElement.appendChild(styleElement);
      }
    },
    [theme]
  );

  // Set up animations and images after SVG is rendered
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;

    const svgElement = containerRef.current.querySelector('svg');
    if (!svgElement) return;

    // Add actor images if there are any mappings
    addActorImages(svgElement, imageMappings);

    // Apply custom theme
    applyCustomTheme(svgElement);

    // Setup interactivity
    setupInteractivity(svgElement);

    // Disable animations if requested
    if (disableAnimations) {
      const animatedElements = svgElement.querySelectorAll('.animated-node, .animated-edge');
      animatedElements.forEach((el) => {
        (el as HTMLElement).style.animation = 'none';
      });
    }

    // Setup particle animations unless disabled
    let cleanup: (() => void) | undefined;
    if (!disableParticles && !disableAnimations) {
      cleanup = setupParticleAnimations(svgElement);
    }

    // Cleanup animation loop on unmount or re-render
    return cleanup;
  }, [svgContent, imageMappings, disableAnimations, disableParticles, applyCustomTheme, setupInteractivity]);

  // Compute container styles
  const containerStyles: React.CSSProperties = {
    ...(theme?.backgroundColor && { background: theme.backgroundColor }),
  };

  return (
    <div
      className={`mermaid-container ${className} ${disableAnimations ? 'no-animations' : ''}`}
      style={containerStyles}
    >
      <div
        ref={containerRef}
        className="mermaid-renderer"
        dangerouslySetInnerHTML={{ __html: svgContent }}
      />
    </div>
  );
};

// Export types for external use
export type { MermaidRendererProps, CustomTheme, NodeEventData, EdgeEventData } from './types';

// Export utility functions
export { exportAsPNG, exportAsJPG, exportAsSVG } from './exportUtils';
