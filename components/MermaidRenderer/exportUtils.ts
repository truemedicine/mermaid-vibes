/**
 * Export utilities for saving Mermaid diagrams as image files
 */

/**
 * Exports an SVG element as a PNG file
 */
export async function exportAsPNG(
  svgElement: SVGSVGElement,
  filename: string = 'diagram.png'
): Promise<void> {
  const canvas = await svgToCanvas(svgElement);
  downloadCanvas(canvas, filename, 'image/png');
}

/**
 * Exports an SVG element as a JPG file
 */
export async function exportAsJPG(
  svgElement: SVGSVGElement,
  filename: string = 'diagram.jpg'
): Promise<void> {
  const canvas = await svgToCanvas(svgElement, '#FFFFFF'); // White background for JPG
  downloadCanvas(canvas, filename, 'image/jpeg');
}

/**
 * Exports an SVG element as an SVG file with inlined styles
 */
export async function exportAsSVG(
  svgElement: SVGSVGElement,
  filename: string = 'diagram.svg'
): Promise<void> {
  // Clone the SVG with inlined styles (now async to handle images)
  const svgClone = await inlineStyles(svgElement);

  // Add xmlns if not present
  if (!svgClone.getAttribute('xmlns')) {
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  // Serialize the SVG
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgClone);

  // Create blob and download
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Converts an image URL to a data URI
 */
async function urlToDataUri(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Failed to convert image to data URI:', url, error);
    return url; // Return original URL as fallback
  }
}

/**
 * Inlines all CSS styles and converts images to data URIs
 */
async function inlineStyles(svgElement: SVGSVGElement): Promise<SVGSVGElement> {
  const svgClone = svgElement.cloneNode(true) as SVGSVGElement;

  // Get all style sheets
  const allStyles: string[] = [];
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
      // Skip stylesheets that can't be accessed (CORS)
      console.warn('Could not access stylesheet:', e);
    }
  }

  // Create a style element with all the CSS
  const styleElement = document.createElementNS('http://www.w3.org/2000/svg', 'style');
  styleElement.textContent = allStyles.join('\n');
  svgClone.insertBefore(styleElement, svgClone.firstChild);

  // Convert all image elements to use data URIs
  const images = svgClone.querySelectorAll('image');
  const imagePromises: Promise<void>[] = [];

  images.forEach((img) => {
    const href = img.getAttribute('href') || img.getAttribute('xlink:href');
    if (href && href.startsWith('http')) {
      const promise = urlToDataUri(href).then((dataUri) => {
        img.setAttribute('href', dataUri);
        img.removeAttribute('xlink:href');
      });
      imagePromises.push(promise);
    }
  });

  // Wait for all images to be converted
  await Promise.all(imagePromises);

  return svgClone;
}

/**
 * Converts an SVG element to a canvas with proper styling
 */
async function svgToCanvas(
  svgElement: SVGSVGElement,
  backgroundColor?: string
): Promise<HTMLCanvasElement> {
  // Get the container's background
  const container = svgElement.closest('.mermaid-container') as HTMLElement;
  const containerStyle = container ? window.getComputedStyle(container) : null;

  // Get SVG dimensions
  const bbox = svgElement.getBoundingClientRect();
  const width = bbox.width;
  const height = bbox.height;

  // Clone SVG with inlined styles (this is now async to handle images)
  const svgClone = await inlineStyles(svgElement);

  // Set xmlns if not present
  if (!svgClone.getAttribute('xmlns')) {
    svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }

  // Set explicit width and height
  svgClone.setAttribute('width', width.toString());
  svgClone.setAttribute('height', height.toString());

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgClone);

  // Create image from SVG
  const img = new Image();
  const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  // Wait for image to load
  await new Promise<void>((resolve, reject) => {
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG as image'));
    };
    img.src = url;
  });

  // Create canvas and draw
  const canvas = document.createElement('canvas');
  const scale = 2; // 2x resolution for better quality
  const padding = 100; // Add padding around the diagram
  canvas.width = (width + padding * 2) * scale;
  canvas.height = (height + padding * 2) * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.scale(scale, scale);

  // Add background from container or specified color
  if (backgroundColor) {
    ctx.fillStyle = backgroundColor;
  } else if (containerStyle?.background) {
    // Try to use the container's background
    ctx.fillStyle = '#F7F6F2'; // Default Truemed background
  } else {
    ctx.fillStyle = '#F7F6F2';
  }
  ctx.fillRect(0, 0, width + padding * 2, height + padding * 2);

  // Draw the SVG with padding
  ctx.drawImage(img, padding, padding, width, height);

  return canvas;
}

/**
 * Downloads a canvas as an image file
 */
function downloadCanvas(
  canvas: HTMLCanvasElement,
  filename: string,
  mimeType: string
): void {
  canvas.toBlob((blob) => {
    if (!blob) {
      throw new Error('Failed to create blob from canvas');
    }

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, mimeType);
}
