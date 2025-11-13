import { useRef, useState, useEffect, useCallback } from 'react';
import mermaid from 'mermaid';
import { jsx } from 'react/jsx-runtime';

var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// components/MermaidRenderer/theme.ts
var PRIMARY = {
  teal: "#179895",
  tealLight: "#679b9a",
  cyanDark: "#183B43"
};
var ACCENT = {
  yellow: "#FFF6A8",
  red: "#E43028",
  cyanLight: "#D9F5EA",
  cyanSoft: "#F4FFFB"
};
var BACKGROUND = {
  primary: "#F7F6F2",
  white: "#FFFFFF",
  gray100: "#EDF2F7"
};
var TEXT = {
  body: "#1A202C",
  subtle: "#4A5568",
  placeholder: "#718096"
};
({
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
  glowSecondary: PRIMARY.tealLight
});

// components/MermaidRenderer/constants.ts
var MERMAID_CONFIG = {
  startOnLoad: false,
  theme: "base",
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
    signalTextColor: TEXT.body
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
    useMaxWidth: true
  }
};
var PARTICLE_CONFIG = {
  particleCount: 1,
  minDuration: 2e3,
  maxDuration: 3500,
  durationMultiplier: 15
};
var PARTICLE_STYLE = {
  outerGlow: {
    radius: 8,
    fill: ACCENT.cyanLight,
    opacity: 0.15
  },
  core: {
    radius: 3,
    fill: PRIMARY.teal,
    opacity: 0.5
  },
  innerGlow: {
    radius: 1.5,
    fill: PRIMARY.tealLight,
    opacity: 0.4
  }
};
var MERMAID_SELECTORS = {
  // Node selectors
  nodes: ".node rect, .node polygon, .node circle, .node ellipse",
  nodeLabels: ".nodeLabel",
  // Edge selectors (in order of priority)
  edges: [
    ".flowchart-link",
    ".messageLine0",
    ".messageLine1",
    ".edgePath path",
    "path.edge"
  ],
  edgeLabels: ".edgeLabel",
  edgeLabelRects: ".edgeLabel rect"};
var EDGE_LABEL_MIN_SIZE = {
  width: 90,
  height: 50,
  borderRadius: 12
};
var DIAGRAM_ID = "mermaid-diagram";

// components/MermaidRenderer/svgUtils.ts
function enhanceNodes(svgElement) {
  const nodes = svgElement.querySelectorAll(MERMAID_SELECTORS.nodes);
  nodes.forEach((node) => {
    node.classList.add("animated-node");
    if (node.tagName === "rect") {
      node.setAttribute("rx", "10");
      node.setAttribute("ry", "10");
    }
  });
}
function enhanceLabels(svgElement) {
  const nodeLabels = svgElement.querySelectorAll(MERMAID_SELECTORS.nodeLabels);
  const edgeLabels = svgElement.querySelectorAll(MERMAID_SELECTORS.edgeLabels);
  [...nodeLabels, ...edgeLabels].forEach((label) => {
    label.classList.add("animated-label");
  });
}
function enhanceEdgeLabelBoxes(svgElement) {
  const edgeLabelRects = svgElement.querySelectorAll(MERMAID_SELECTORS.edgeLabelRects);
  const { width: minWidth, height: minHeight, borderRadius } = EDGE_LABEL_MIN_SIZE;
  edgeLabelRects.forEach((rect) => {
    const width = parseFloat(rect.getAttribute("width") || "0");
    const height = parseFloat(rect.getAttribute("height") || "0");
    const paddedMinWidth = minWidth + 20;
    const paddedMinHeight = minHeight + 10;
    const newWidth = Math.max(width, paddedMinWidth);
    if (newWidth !== width) {
      rect.setAttribute("width", newWidth.toString());
      const x = parseFloat(rect.getAttribute("x") || "0");
      rect.setAttribute("x", (x - (newWidth - width) / 2).toString());
    }
    const newHeight = Math.max(height, paddedMinHeight);
    if (newHeight !== height) {
      rect.setAttribute("height", newHeight.toString());
      const y = parseFloat(rect.getAttribute("y") || "0");
      rect.setAttribute("y", (y - (newHeight - height) / 2).toString());
    }
    rect.setAttribute("rx", borderRadius.toString());
    rect.setAttribute("ry", borderRadius.toString());
  });
}
function findEdgePaths(svgElement) {
  for (const selector of MERMAID_SELECTORS.edges) {
    const edges = svgElement.querySelectorAll(selector);
    if (edges.length > 0) {
      return edges;
    }
  }
  const allPaths = svgElement.querySelectorAll("path");
  return Array.from(allPaths).filter((path) => {
    var _a;
    const parent = path.parentElement;
    const isNotNode = !(parent == null ? void 0 : parent.classList.contains("node"));
    const isNotMarker = ((_a = parent == null ? void 0 : parent.tagName) == null ? void 0 : _a.toLowerCase()) !== "marker";
    return isNotNode && isNotMarker;
  });
}
function enhanceEdges(svgElement) {
  const edges = findEdgePaths(svgElement);
  edges.forEach((edge) => {
    edge.classList.add("animated-edge");
  });
  return edges;
}
function createParticleLayer(svgElement) {
  const particleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  particleGroup.setAttribute("class", "particle-layer");
  svgElement.appendChild(particleGroup);
  return particleGroup;
}
function fixArrowMarkers(svgElement) {
  const markers = svgElement.querySelectorAll("marker");
  markers.forEach((marker) => {
    const id = marker.getAttribute("id");
    if (id && (id.includes("arrowhead") || id.includes("flowchart") || id.includes("arrow"))) {
      const currentRefX = parseFloat(marker.getAttribute("refX") || "5");
      const adjustedRefX = currentRefX - 2.5;
      marker.setAttribute("refX", adjustedRefX.toString());
    }
  });
}
function configureSVGRendering(svgElement) {
  svgElement.style.removeProperty("overflow");
}
function enhanceSVG(svgElement) {
  configureSVGRendering(svgElement);
  enhanceNodes(svgElement);
  enhanceLabels(svgElement);
  enhanceEdgeLabelBoxes(svgElement);
  const edges = enhanceEdges(svgElement);
  fixArrowMarkers(svgElement);
  const particleGroup = createParticleLayer(svgElement);
  return { edges, particleGroup };
}

// components/MermaidRenderer/particleUtils.ts
function createCircle(radius, fill, opacity, className) {
  const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  circle.setAttribute("r", radius.toString());
  circle.setAttribute("fill", fill);
  circle.setAttribute("opacity", opacity.toString());
  circle.setAttribute("class", className);
  circle.setAttribute("cx", "0");
  circle.setAttribute("cy", "0");
  return circle;
}
function createParticle(particleGroup, style = PARTICLE_STYLE) {
  const outerGlow = createCircle(
    style.outerGlow.radius,
    style.outerGlow.fill,
    style.outerGlow.opacity,
    "particle-outer-glow"
  );
  const core = createCircle(
    style.core.radius,
    style.core.fill,
    style.core.opacity,
    "edge-particle"
  );
  const innerGlow = createCircle(
    style.innerGlow.radius,
    style.innerGlow.fill,
    style.innerGlow.opacity,
    "particle-inner-glow"
  );
  particleGroup.appendChild(outerGlow);
  particleGroup.appendChild(core);
  particleGroup.appendChild(innerGlow);
  return { outerGlow, core, innerGlow };
}
function calculateDuration(pathLength) {
  const { minDuration, maxDuration, durationMultiplier } = PARTICLE_CONFIG;
  return Math.max(minDuration, Math.min(maxDuration, pathLength * durationMultiplier));
}
function createParticlesForPath(path, cumulativeStartTime, particleGroup) {
  const animations = [];
  const pathLength = path.getTotalLength();
  const duration = calculateDuration(pathLength);
  const { particleCount } = PARTICLE_CONFIG;
  for (let i = 0; i < particleCount; i++) {
    const { outerGlow, core, innerGlow } = createParticle(particleGroup);
    animations.push({
      element: core,
      glowElement: innerGlow,
      path,
      pathLength,
      duration,
      offset: 0,
      // No offset for sequential animation
      startTime: cumulativeStartTime
    });
    animations.push({
      element: outerGlow,
      glowElement: outerGlow,
      // Dummy reference
      path,
      pathLength,
      duration,
      offset: 0,
      // No offset for sequential animation
      startTime: cumulativeStartTime
    });
  }
  const nextStartTime = cumulativeStartTime + duration;
  return { animations, nextStartTime };
}
function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function calculateOpacity(progress) {
  const fadeInEnd = 0.15;
  const fadeOutStart = 0.85;
  if (progress < fadeInEnd) {
    return progress / fadeInEnd;
  } else if (progress > fadeOutStart) {
    return (1 - progress) / (1 - fadeOutStart);
  } else {
    return 1;
  }
}
function updateParticlePosition(animation, currentTime, isCore, totalSequenceDuration, sequenceStartTime) {
  const timeSinceSequenceStart = currentTime - sequenceStartTime;
  const cycleTime = timeSinceSequenceStart % totalSequenceDuration;
  const particleStartInSequence = animation.startTime - sequenceStartTime;
  const particleEndInSequence = particleStartInSequence + animation.duration;
  const isInActiveWindow = cycleTime >= particleStartInSequence && cycleTime < particleEndInSequence;
  if (!isInActiveWindow) {
    animation.element.setAttribute("opacity", "0");
    if (isCore && animation.glowElement !== animation.element) {
      animation.glowElement.setAttribute("opacity", "0");
    }
    return;
  }
  const progressInParticle = (cycleTime - particleStartInSequence) / animation.duration;
  const easedProgress = easeInOutCubic(progressInParticle);
  const distance = easedProgress * animation.pathLength;
  const opacity = calculateOpacity(progressInParticle);
  try {
    const point = animation.path.getPointAtLength(distance);
    animation.element.setAttribute("cx", point.x.toString());
    animation.element.setAttribute("cy", point.y.toString());
    animation.element.setAttribute("opacity", opacity.toString());
    if (isCore && animation.glowElement !== animation.element) {
      animation.glowElement.setAttribute("cx", point.x.toString());
      animation.glowElement.setAttribute("cy", point.y.toString());
      animation.glowElement.setAttribute("opacity", opacity.toString());
    }
  } catch (e) {
  }
}
function startParticleAnimation(animations) {
  if (animations.length === 0) return () => {
  };
  let animationFrameId;
  const sequenceStartTime = animations[0].startTime;
  let totalSequenceDuration = 0;
  for (let i = 0; i < animations.length; i += 2) {
    const anim = animations[i];
    const endTime = anim.startTime + anim.duration - sequenceStartTime;
    if (endTime > totalSequenceDuration) {
      totalSequenceDuration = endTime;
    }
  }
  const animate = () => {
    const currentTime = Date.now();
    animations.forEach((anim, index) => {
      const isCore = index % 2 === 0;
      updateParticlePosition(anim, currentTime, isCore, totalSequenceDuration, sequenceStartTime);
    });
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}

// components/MermaidRenderer/exportUtils.ts
async function exportAsPNG(svgElement, filename = "diagram.png") {
  const canvas = await svgToCanvas(svgElement);
  downloadCanvas(canvas, filename, "image/png");
}
async function exportAsJPG(svgElement, filename = "diagram.jpg") {
  const canvas = await svgToCanvas(svgElement, "#FFFFFF");
  downloadCanvas(canvas, filename, "image/jpeg");
}
async function exportAsSVG(svgElement, filename = "diagram.svg") {
  const svgClone = await inlineStyles(svgElement);
  if (!svgClone.getAttribute("xmlns")) {
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgClone);
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
async function urlToDataUri(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn("Failed to convert image to data URI:", url, error);
    return url;
  }
}
async function inlineStyles(svgElement) {
  const svgClone = svgElement.cloneNode(true);
  const allStyles = [];
  for (let i = 0; i < document.styleSheets.length; i++) {
    const sheet = document.styleSheets[i];
    try {
      if (sheet.cssRules) {
        for (let j = 0; j < sheet.cssRules.length; j++) {
          const rule = sheet.cssRules[j];
          allStyles.push(rule.cssText);
        }
      }
    } catch (e) {
      console.warn("Could not access stylesheet:", e);
    }
  }
  const styleElement = document.createElementNS("http://www.w3.org/2000/svg", "style");
  styleElement.textContent = allStyles.join("\n");
  svgClone.insertBefore(styleElement, svgClone.firstChild);
  const images = svgClone.querySelectorAll("image");
  const imagePromises = [];
  images.forEach((img) => {
    const href = img.getAttribute("href") || img.getAttribute("xlink:href");
    if (href && href.startsWith("http")) {
      const promise = urlToDataUri(href).then((dataUri) => {
        img.setAttribute("href", dataUri);
        img.removeAttribute("xlink:href");
      });
      imagePromises.push(promise);
    }
  });
  await Promise.all(imagePromises);
  return svgClone;
}
async function svgToCanvas(svgElement, backgroundColor) {
  const container = svgElement.closest(".mermaid-container");
  const containerStyle = container ? window.getComputedStyle(container) : null;
  const bbox = svgElement.getBoundingClientRect();
  const width = bbox.width;
  const height = bbox.height;
  const svgClone = await inlineStyles(svgElement);
  if (!svgClone.getAttribute("xmlns")) {
    svgClone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  }
  svgClone.setAttribute("width", width.toString());
  svgClone.setAttribute("height", height.toString());
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgClone);
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  await new Promise((resolve, reject) => {
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG as image"));
    };
    img.src = url;
  });
  const canvas = document.createElement("canvas");
  const scale = 2;
  const padding = 100;
  canvas.width = (width + padding * 2) * scale;
  canvas.height = (height + padding * 2) * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Failed to get canvas context");
  }
  ctx.scale(scale, scale);
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
  } else if (containerStyle == null ? void 0 : containerStyle.background) {
    ctx.fillStyle = "#F7F6F2";
  } else {
    ctx.fillStyle = "#F7F6F2";
  }
  ctx.fillRect(0, 0, width + padding * 2, height + padding * 2);
  ctx.drawImage(img, padding, padding, width, height);
  return canvas;
}
function downloadCanvas(canvas, filename, mimeType) {
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error("Failed to create blob from canvas");
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, mimeType);
}
function initializeMermaid() {
  mermaid.initialize(MERMAID_CONFIG);
}
function preprocessChart(chart) {
  const imageMappings = /* @__PURE__ */ new Map();
  const cleanedChart = chart.replace(/participant\s+img:([^\s]+)\s+([^\n]+)/g, (match, imgPath, actorName) => {
    const trimmedName = actorName.trim();
    imageMappings.set(trimmedName, imgPath);
    return `participant ${actorName}`;
  });
  return { cleanedChart, imageMappings };
}
function addActorImages(svgElement, imageMappings) {
  if (imageMappings.size === 0) {
    return;
  }
  const allGroups = svgElement.querySelectorAll("g");
  const actorCandidates = Array.from(allGroups).filter((g) => {
    const hasRect = g.querySelector("rect") !== null;
    const hasText = g.querySelector("text") !== null;
    const className = g.getAttribute("class") || "";
    return hasRect && hasText && (className.includes("actor") || g.querySelector("line"));
  });
  actorCandidates.forEach((actor) => {
    var _a;
    const textElement = actor.querySelector("text");
    const rect = actor.querySelector("rect");
    if (!textElement || !rect) {
      return;
    }
    const actorName = ((_a = textElement.textContent) == null ? void 0 : _a.trim()) || "";
    const imgPath = imageMappings.get(actorName);
    if (imgPath) {
      const x = parseFloat(rect.getAttribute("x") || "0");
      const y = parseFloat(rect.getAttribute("y") || "0");
      const height = parseFloat(rect.getAttribute("height") || "0");
      const logoSize = 48;
      const padding = 20;
      const imageX = x + padding;
      const imageY = y + (height - logoSize) / 2;
      const borderRadius = 8;
      const clipPathId = `actor-logo-clip-${Math.random().toString(36).substr(2, 9)}`;
      const defs = svgElement.querySelector("defs") || svgElement.insertBefore(
        document.createElementNS("http://www.w3.org/2000/svg", "defs"),
        svgElement.firstChild
      );
      const clipPath = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      clipPath.setAttribute("id", clipPathId);
      const clipRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
      clipRect.setAttribute("x", imageX.toString());
      clipRect.setAttribute("y", imageY.toString());
      clipRect.setAttribute("width", logoSize.toString());
      clipRect.setAttribute("height", logoSize.toString());
      clipRect.setAttribute("rx", borderRadius.toString());
      clipRect.setAttribute("ry", borderRadius.toString());
      clipPath.appendChild(clipRect);
      defs.appendChild(clipPath);
      const image = document.createElementNS("http://www.w3.org/2000/svg", "image");
      image.setAttribute("href", imgPath);
      image.setAttribute("x", imageX.toString());
      image.setAttribute("y", imageY.toString());
      image.setAttribute("width", logoSize.toString());
      image.setAttribute("height", logoSize.toString());
      image.setAttribute("class", "actor-logo");
      image.setAttribute("clip-path", `url(#${clipPathId})`);
      const textX = parseFloat(textElement.getAttribute("x") || "0");
      const textShift = logoSize + 4;
      textElement.setAttribute("x", (textX + textShift / 2).toString());
      actor.appendChild(image);
    }
  });
}
async function renderDiagram(chart) {
  try {
    const { cleanedChart, imageMappings } = preprocessChart(chart);
    const { svg } = await mermaid.render(DIAGRAM_ID, cleanedChart);
    return { svg, imageMappings };
  } catch (error) {
    console.error("Mermaid rendering error:", error);
    throw error;
  }
}
function setupParticleAnimations(svgElement) {
  const { edges, particleGroup } = enhanceSVG(svgElement);
  const animations = [];
  let cumulativeStartTime = Date.now();
  edges.forEach((edge) => {
    const pathElement = edge;
    const result = createParticlesForPath(
      pathElement,
      cumulativeStartTime,
      particleGroup
    );
    animations.push(...result.animations);
    cumulativeStartTime = result.nextStartTime;
  });
  return startParticleAnimation(animations);
}
var MermaidVibes = ({
  chart,
  theme,
  className = "",
  disableAnimations = false,
  disableParticles = false,
  onNodeClick,
  onNodeHover,
  onEdgeClick,
  onEdgeHover
}) => {
  const containerRef = useRef(null);
  const [svgContent, setSvgContent] = useState("");
  const [imageMappings, setImageMappings] = useState(/* @__PURE__ */ new Map());
  useEffect(() => {
    initializeMermaid();
    const renderChart = async () => {
      const { svg, imageMappings: imageMappings2 } = await renderDiagram(chart);
      setSvgContent(svg);
      setImageMappings(imageMappings2);
    };
    renderChart();
  }, [chart]);
  const setupInteractivity = useCallback(
    (svgElement) => {
      const findNodeLabel = (element) => {
        const searchElement = element.tagName === "rect" || element.tagName === "circle" || element.tagName === "path" || element.tagName === "image" ? element.parentElement : element;
        if (!searchElement) return void 0;
        const labelSelectors = [
          "text",
          // Direct text element (actors, basic nodes)
          ".nodeLabel",
          // Flowchart node labels
          ".label",
          // Generic labels
          "tspan",
          // Text spans inside text elements
          "foreignObject"
          // HTML labels
        ];
        for (const selector of labelSelectors) {
          const labelElement = searchElement.querySelector(selector);
          if (labelElement) {
            const text = (labelElement.textContent || "").trim();
            if (text && text.length > 0 && text.length < 200) {
              return text;
            }
          }
        }
        const allText = (searchElement.textContent || "").trim();
        const firstLine = allText.split("\n").find((line) => line.trim().length > 0);
        if (firstLine && firstLine.length < 200) {
          return firstLine.trim();
        }
        return void 0;
      };
      if (onNodeClick || onNodeHover) {
        const nodes = svgElement.querySelectorAll(".node, .actor, .stateGroup, .classGroup");
        nodes.forEach((node) => {
          const element = node;
          if (onNodeClick) {
            element.style.cursor = "pointer";
            element.addEventListener("click", (e) => {
              e.stopPropagation();
              const label = findNodeLabel(element);
              const data = {
                element,
                label,
                bounds: element.getBoundingClientRect()
              };
              onNodeClick(data);
            });
          }
          if (onNodeHover) {
            element.addEventListener("mouseenter", () => {
              const label = findNodeLabel(element);
              const data = {
                element,
                label,
                bounds: element.getBoundingClientRect()
              };
              onNodeHover(data);
            });
            element.addEventListener("mouseleave", () => {
              onNodeHover(null);
            });
          }
        });
      }
      if (onEdgeClick || onEdgeHover) {
        const edges = svgElement.querySelectorAll(
          ".flowchart-link, .messageLine0, .messageLine1, .edgePath path, path.edge"
        );
        const findEdgeLabel = (element) => {
          var _a, _b, _c;
          const labelElement = (_a = element.parentElement) == null ? void 0 : _a.querySelector(".edgeLabel text, .messageText");
          if ((_b = labelElement == null ? void 0 : labelElement.textContent) == null ? void 0 : _b.trim()) {
            return labelElement.textContent.trim();
          }
          const parent = element.parentElement;
          if (parent) {
            const labels = parent.querySelectorAll(".edgeLabel text, .messageText");
            for (const label of labels) {
              if ((_c = label.textContent) == null ? void 0 : _c.trim()) {
                return label.textContent.trim();
              }
            }
          }
          return void 0;
        };
        edges.forEach((edge) => {
          const pathElement = edge;
          if (onEdgeClick) {
            pathElement.style.cursor = "pointer";
            pathElement.addEventListener("click", () => {
              const label = findEdgeLabel(pathElement);
              const data = {
                element: pathElement,
                label
              };
              onEdgeClick(data);
            });
          }
          if (onEdgeHover) {
            pathElement.addEventListener("mouseenter", () => {
              const label = findEdgeLabel(pathElement);
              const data = {
                element: pathElement,
                label
              };
              onEdgeHover(data);
            });
            pathElement.addEventListener("mouseleave", () => {
              onEdgeHover(null);
            });
          }
        });
        const edgeLabels = svgElement.querySelectorAll(".edgeLabel, .messageText");
        edgeLabels.forEach((labelElement) => {
          var _a;
          const label = (_a = labelElement.textContent) == null ? void 0 : _a.trim();
          if (onEdgeClick) {
            labelElement.style.cursor = "pointer";
            labelElement.addEventListener("click", (e) => {
              e.stopPropagation();
              const parent = labelElement.closest("g");
              const pathElement = parent == null ? void 0 : parent.querySelector(".flowchart-link, .messageLine0, .messageLine1, path");
              const data = {
                element: pathElement || labelElement,
                label
              };
              onEdgeClick(data);
            });
          }
          if (onEdgeHover) {
            labelElement.addEventListener("mouseenter", (e) => {
              const parent = labelElement.closest("g");
              const pathElement = parent == null ? void 0 : parent.querySelector(".flowchart-link, .messageLine0, .messageLine1, path");
              const data = {
                element: pathElement || labelElement,
                label
              };
              onEdgeHover(data);
            });
            labelElement.addEventListener("mouseleave", () => {
              onEdgeHover(null);
            });
          }
        });
      }
    },
    [onNodeClick, onNodeHover, onEdgeClick, onEdgeHover]
  );
  const applyCustomTheme = useCallback(
    (svgElement) => {
      if (!theme) return;
      const styleElement = document.createElement("style");
      let customStyles = "";
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
  useEffect(() => {
    if (!containerRef.current || !svgContent) return;
    const svgElement = containerRef.current.querySelector("svg");
    if (!svgElement) return;
    addActorImages(svgElement, imageMappings);
    applyCustomTheme(svgElement);
    setupInteractivity(svgElement);
    if (disableAnimations) {
      const animatedElements = svgElement.querySelectorAll(".animated-node, .animated-edge");
      animatedElements.forEach((el) => {
        el.style.animation = "none";
      });
    }
    let cleanup;
    if (!disableParticles && !disableAnimations) {
      cleanup = setupParticleAnimations(svgElement);
    }
    return cleanup;
  }, [svgContent, imageMappings, disableAnimations, disableParticles, applyCustomTheme, setupInteractivity]);
  const containerStyles = __spreadValues({}, (theme == null ? void 0 : theme.backgroundColor) && { background: theme.backgroundColor });
  return /* @__PURE__ */ jsx(
    "div",
    {
      className: `mermaid-container ${className} ${disableAnimations ? "no-animations" : ""}`,
      style: containerStyles,
      children: /* @__PURE__ */ jsx(
        "div",
        {
          ref: containerRef,
          className: "mermaid-renderer",
          dangerouslySetInnerHTML: { __html: svgContent }
        }
      )
    }
  );
};

export { ACCENT, BACKGROUND, MermaidVibes, PRIMARY, TEXT, exportAsJPG, exportAsPNG, exportAsSVG };
//# sourceMappingURL=index.mjs.map
//# sourceMappingURL=index.mjs.map