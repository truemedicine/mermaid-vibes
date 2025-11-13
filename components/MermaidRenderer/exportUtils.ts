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
 * Uses a proxy approach to avoid CORS issues
 */
async function urlToDataUri(url: string): Promise<string> {
  try {
    // Try direct fetch with cors mode first
    const response = await fetch(url, { mode: 'cors' });
    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.warn('Failed to convert image to data URI via fetch:', url, error);

    // Fallback: Try loading via Image element (can bypass some CORS restrictions)
    try {
      return await loadImageAsDataUri(url);
    } catch (imgError) {
      console.error('Failed to load image via Image element:', url, imgError);
      // Return a transparent 1x1 pixel as final fallback
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
  }
}

/**
 * Loads an image via Image element and converts to data URI
 * This can sometimes work when fetch fails due to CORS
 */
async function loadImageAsDataUri(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Request CORS

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const dataUri = canvas.toDataURL('image/png');
        resolve(dataUri);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
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
