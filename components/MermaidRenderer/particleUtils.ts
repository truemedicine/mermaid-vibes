/**
 * Utilities for creating and animating particles along arrow paths
 */

import { ParticleAnimation, ParticleStyle } from './types';
import { PARTICLE_CONFIG, PARTICLE_STYLE } from './constants';

/**
 * Creates a single SVG circle element with specified attributes
 */
function createCircle(
  radius: number,
  fill: string,
  opacity: number,
  className: string
): SVGCircleElement {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('r', radius.toString());
  circle.setAttribute('fill', fill);
  circle.setAttribute('opacity', opacity.toString());
  circle.setAttribute('class', className);
  circle.setAttribute('cx', '0');
  circle.setAttribute('cy', '0');
  return circle;
}

/**
 * Creates a three-layer particle (outer glow, core, inner glow)
 * and adds them to the particle group
 */
export function createParticle(
  particleGroup: SVGGElement,
  style: ParticleStyle = PARTICLE_STYLE
): {
  outerGlow: SVGCircleElement;
  core: SVGCircleElement;
  innerGlow: SVGCircleElement;
} {
  const outerGlow = createCircle(
    style.outerGlow.radius,
    style.outerGlow.fill,
    style.outerGlow.opacity,
    'particle-outer-glow'
  );

  const core = createCircle(
    style.core.radius,
    style.core.fill,
    style.core.opacity,
    'edge-particle'
  );

  const innerGlow = createCircle(
    style.innerGlow.radius,
    style.innerGlow.fill,
    style.innerGlow.opacity,
    'particle-inner-glow'
  );

  particleGroup.appendChild(outerGlow);
  particleGroup.appendChild(core);
  particleGroup.appendChild(innerGlow);

  return { outerGlow, core, innerGlow };
}

/**
 * Calculates animation duration based on path length
 */
export function calculateDuration(pathLength: number): number {
  const { minDuration, maxDuration, durationMultiplier } = PARTICLE_CONFIG;
  return Math.max(minDuration, Math.min(maxDuration, pathLength * durationMultiplier));
}

/**
 * Creates all particle animations for a given path
 * For sequential animation, cumulativeStartTime should be the end time of the previous particle
 */
export function createParticlesForPath(
  path: SVGPathElement,
  cumulativeStartTime: number,
  particleGroup: SVGGElement
): { animations: ParticleAnimation[]; nextStartTime: number } {
  const animations: ParticleAnimation[] = [];
  const pathLength = path.getTotalLength();
  const duration = calculateDuration(pathLength);
  const { particleCount } = PARTICLE_CONFIG;

  for (let i = 0; i < particleCount; i++) {
    const { outerGlow, core, innerGlow } = createParticle(particleGroup);

    // Track the main particle (core) animation
    animations.push({
      element: core,
      glowElement: innerGlow,
      path,
      pathLength,
      duration,
      offset: 0, // No offset for sequential animation
      startTime: cumulativeStartTime,
    });

    // Track the outer glow animation (follows the same path)
    animations.push({
      element: outerGlow,
      glowElement: outerGlow, // Dummy reference
      path,
      pathLength,
      duration,
      offset: 0, // No offset for sequential animation
      startTime: cumulativeStartTime,
    });
  }

  // Return the next start time (current start + duration)
  const nextStartTime = cumulativeStartTime + duration;
  return { animations, nextStartTime };
}

/**
 * Ease-in-out cubic easing function
 * Provides smooth acceleration and deceleration
 */
function easeInOutCubic(t: number): number {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Calculate opacity based on progress for fade in/out effect
 * Fades in from 0-15%, full opacity 15-85%, fades out 85-100%
 */
function calculateOpacity(progress: number): number {
  const fadeInEnd = 0.15;
  const fadeOutStart = 0.85;

  if (progress < fadeInEnd) {
    // Fade in
    return progress / fadeInEnd;
  } else if (progress > fadeOutStart) {
    // Fade out
    return (1 - progress) / (1 - fadeOutStart);
  } else {
    // Full opacity
    return 1;
  }
}

/**
 * Updates the position of a single particle based on elapsed time
 * For sequential animation, particles only show when it's their turn in the sequence
 */
export function updateParticlePosition(
  animation: ParticleAnimation,
  currentTime: number,
  isCore: boolean,
  totalSequenceDuration: number,
  sequenceStartTime: number
): void {
  // Calculate where we are in the full sequence cycle
  const timeSinceSequenceStart = currentTime - sequenceStartTime;
  const cycleTime = timeSinceSequenceStart % totalSequenceDuration;

  // Calculate when this particle should be active in the sequence
  const particleStartInSequence = animation.startTime - sequenceStartTime;
  const particleEndInSequence = particleStartInSequence + animation.duration;

  // Check if this particle should be animating right now
  const isInActiveWindow = cycleTime >= particleStartInSequence && cycleTime < particleEndInSequence;

  if (!isInActiveWindow) {
    // Hide the particle when it's not active
    animation.element.setAttribute('opacity', '0');
    if (isCore && animation.glowElement !== animation.element) {
      animation.glowElement.setAttribute('opacity', '0');
    }
    return;
  }

  // Calculate progress within this particle's animation
  const progressInParticle = (cycleTime - particleStartInSequence) / animation.duration;

  // Apply easing for smooth motion
  const easedProgress = easeInOutCubic(progressInParticle);
  const distance = easedProgress * animation.pathLength;

  // Calculate opacity for fade in/out (use raw progress, not eased)
  const opacity = calculateOpacity(progressInParticle);

  try {
    const point = animation.path.getPointAtLength(distance);
    animation.element.setAttribute('cx', point.x.toString());
    animation.element.setAttribute('cy', point.y.toString());
    animation.element.setAttribute('opacity', opacity.toString());

    // Update inner glow position and opacity (only for core particles, not outer glows)
    if (isCore && animation.glowElement !== animation.element) {
      animation.glowElement.setAttribute('cx', point.x.toString());
      animation.glowElement.setAttribute('cy', point.y.toString());
      animation.glowElement.setAttribute('opacity', opacity.toString());
    }
  } catch (e) {
    // Path might be invalid or animation not ready, skip silently
  }
}

/**
 * Creates and starts the main animation loop for all particles
 * Particles animate sequentially, looping through the full sequence
 */
export function startParticleAnimation(
  animations: ParticleAnimation[]
): () => void {
  if (animations.length === 0) return () => {};

  let animationFrameId: number;

  // Calculate total sequence duration
  // Find the latest end time (startTime + duration) among all animations
  const sequenceStartTime = animations[0].startTime;
  let totalSequenceDuration = 0;

  // Since particles come in pairs (core and outer glow), we only need to check even indices
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
      // Every even index is a core particle, odd indices are outer glows
      const isCore = index % 2 === 0;
      updateParticlePosition(anim, currentTime, isCore, totalSequenceDuration, sequenceStartTime);
    });

    animationFrameId = requestAnimationFrame(animate);
  };

  animate();

  // Return cleanup function
  return () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
  };
}
