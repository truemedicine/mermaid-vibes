# Animated Mermaid Renderer

A beautiful, interactive React component for rendering Mermaid diagrams with stunning animations, sequential light particles, and customizable themes.

## ✨ Features

- 🎨 **Themable** - Easily customize colors, stroke widths, and fonts
- 🎭 **Interactive** - Built-in support for click and hover events on nodes and edges
- 📦 **Export Ready** - Export diagrams as PNG, JPG, or SVG
- 🔄 **3D Tilt Effect** - Optional subtle 3D rotation on mouse movement
- ✨ **Stunning Animations** - Glowing borders, pulsing arrows, and sequential light particles
- 🖼️ **Logo Support** - Add images to sequence diagram actors
- 🎯 **Full Mermaid Support** - Works with all Mermaid diagram types
- ⚡ **Easy Integration** - Drop into any React/Next.js app
- 📱 **Responsive** - Adapts to different screen sizes

## 📦 Installation

### Dependencies

This component requires the following peer dependencies:

```json
{
  "react": "^18.0.0 || ^19.0.0",
  "react-dom": "^18.0.0 || ^19.0.0",
  "mermaid": "^11.0.0"
}
```

### Install Mermaid

```bash
npm install mermaid
# or
yarn add mermaid
# or
pnpm add mermaid
```

### Copy Component

Copy the entire `components/MermaidRenderer` directory into your project.

## 🚀 Getting Started

### Basic Usage

```tsx
import { MermaidRenderer } from '@/components/MermaidRenderer';

function MyComponent() {
  return (
    <MermaidRenderer
      chart={`
        graph TD
          A[Start] --> B[Process]
          B --> C[End]
      `}
    />
  );
}
```

### With All Features

```tsx
import {
  MermaidRenderer,
  exportAsPNG,
  type NodeEventData,
  type EdgeEventData
} from '@/components/MermaidRenderer';

function AdvancedExample() {
  const handleNodeClick = (data: NodeEventData) => {
    console.log('Node clicked:', data.label);
  };

  const handleExport = async () => {
    const svg = document.querySelector('.mermaid-renderer svg') as SVGSVGElement;
    if (svg) {
      await exportAsPNG(svg, 'my-diagram.png');
    }
  };

  return (
    <div>
      <MermaidRenderer
        chart={`
          sequenceDiagram
            participant User
            participant API
            User->>API: Request
            API-->>User: Response
        `}
        enable3D={true}
        onNodeClick={handleNodeClick}
        theme={{
          primaryColor: '#3B82F6',
          strokeWidth: 4,
        }}
      />
      <button onClick={handleExport}>Export PNG</button>
    </div>
  );
}
```

## 📖 API Reference

### MermaidRenderer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chart` | `string` | **required** | Mermaid diagram syntax |
| `theme` | `CustomTheme` | `undefined` | Custom theme configuration |
| `className` | `string` | `''` | Additional CSS class for container |
| `disableAnimations` | `boolean` | `false` | Disable all animations |
| `disableParticles` | `boolean` | `false` | Disable particle effects only |
| `enable3D` | `boolean` | `false` | Enable 3D tilt effect on mouse move |
| `onNodeClick` | `(data: NodeEventData) => void` | `undefined` | Callback when node is clicked |
| `onNodeHover` | `(data: NodeEventData \| null) => void` | `undefined` | Callback when node is hovered |
| `onEdgeClick` | `(data: EdgeEventData) => void` | `undefined` | Callback when edge is clicked |
| `onEdgeHover` | `(data: EdgeEventData \| null) => void` | `undefined` | Callback when edge is hovered |

### CustomTheme Interface

```typescript
interface CustomTheme {
  primaryColor?: string;        // Primary color for nodes and edges
  secondaryColor?: string;       // Secondary/hover color
  backgroundColor?: string;      // Background color or gradient
  textColor?: string;            // Text color
  particleColor?: string;        // Particle color
  strokeWidth?: number;          // Stroke width for nodes and edges
  fontSize?: number;             // Font size for labels
}
```

### Event Data Interfaces

```typescript
interface NodeEventData {
  element: SVGElement;           // The SVG element
  label?: string;                // Node label text
  bounds: DOMRect;               // Bounding box
}

interface EdgeEventData {
  element: SVGPathElement;       // The SVG path element
  label?: string;                // Edge label text
}
```

### Export Functions

```typescript
// Export as PNG (2x resolution)
exportAsPNG(svgElement: SVGSVGElement, filename?: string): Promise<void>

// Export as JPG with white background (2x resolution)
exportAsJPG(svgElement: SVGSVGElement, filename?: string): Promise<void>

// Export as SVG
exportAsSVG(svgElement: SVGSVGElement, filename?: string): void
```

## 🎨 Advanced Features

### Logo Support in Sequence Diagrams

Add images to sequence diagram actors using the `img:` prefix:

```typescript
const chart = `sequenceDiagram
  participant img:https://example.com/logo1.png User
  participant img:https://example.com/logo2.png API Server
  User->>API Server: Request
  API Server-->>User: Response
`;
```

### Custom Themes

```tsx
<MermaidRenderer
  chart={chart}
  theme={{
    primaryColor: '#8B5CF6',
    secondaryColor: '#A78BFA',
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    textColor: '#1F2937',
    strokeWidth: 5,
    fontSize: 18,
  }}
/>
```

### Interactive Events

```tsx
const [hoveredNode, setHoveredNode] = useState<string | null>(null);
const [eventLog, setEventLog] = useState<string[]>([]);

<MermaidRenderer
  chart={chart}
  onNodeClick={(data) => {
    alert(`You clicked: ${data.label}`);
  }}
  onNodeHover={(data) => {
    setHoveredNode(data?.label || null);
  }}
  onEdgeClick={(data) => {
    setEventLog(prev => [`Edge clicked: ${data.label}`, ...prev]);
  }}
/>
```

### 3D Tilt Effect

```tsx
<MermaidRenderer
  chart={chart}
  enable3D={true}
/>
```

The diagram will subtly rotate (up to 5 degrees) as you move your mouse over it.

### Exporting Diagrams

```tsx
import { exportAsPNG, exportAsJPG, exportAsSVG } from '@/components/MermaidRenderer';

function ExportButtons() {
  const handleExport = async (format: 'png' | 'jpg' | 'svg') => {
    const svg = document.querySelector('.mermaid-renderer svg') as SVGSVGElement;
    if (!svg) return;

    try {
      switch (format) {
        case 'png':
          await exportAsPNG(svg, 'diagram.png');
          break;
        case 'jpg':
          await exportAsJPG(svg, 'diagram.jpg');
          break;
        case 'svg':
          exportAsSVG(svg, 'diagram.svg');
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  return (
    <div>
      <button onClick={() => handleExport('png')}>Export PNG</button>
      <button onClick={() => handleExport('jpg')}>Export JPG</button>
      <button onClick={() => handleExport('svg')}>Export SVG</button>
    </div>
  );
}
```

## 📊 Supported Diagram Types

The component supports all Mermaid diagram types:

- **Flowcharts** (`graph`, `flowchart`)
- **Sequence Diagrams** (`sequenceDiagram`)
- **Class Diagrams** (`classDiagram`)
- **State Diagrams** (`stateDiagram`, `stateDiagram-v2`)
- **ER Diagrams** (`erDiagram`)
- **Gantt Charts** (`gantt`)
- **Pie Charts** (`pie`)
- **Git Graphs** (`gitGraph`)
- **User Journey** (`journey`)
- **Requirement Diagrams** (`requirementDiagram`)
- And more!

## ⚙️ Performance Considerations

### Disabling Animations

For better performance on complex diagrams or slower devices:

```tsx
<MermaidRenderer
  chart={chart}
  disableAnimations={true}
/>
```

### Disabling Only Particles

Keep the glows and pulses but remove particle animations:

```tsx
<MermaidRenderer
  chart={chart}
  disableParticles={true}
/>
```

## 🎨 Styling

The component includes default styles that create a beautiful Truemed-inspired theme. You can:

1. **Override container styles**:
```tsx
<MermaidRenderer
  chart={chart}
  className="my-custom-container"
  theme={{
    backgroundColor: 'linear-gradient(to right, #ffecd2, #fcb69f)',
  }}
/>
```

2. **Use CSS to override specific elements**:
```css
.my-custom-container .animated-node {
  stroke: #FF6B6B !important;
  stroke-width: 5 !important;
}

.my-custom-container .animated-edge {
  stroke: #4ECDC4 !important;
}
```

## 📁 File Structure

```
components/MermaidRenderer/
├── index.tsx              # Main component
├── types.ts               # TypeScript interfaces
├── constants.ts           # Configuration constants
├── theme.ts               # Color theme definitions
├── particleUtils.ts       # Particle animation logic
├── svgUtils.ts            # SVG enhancement utilities
├── exportUtils.ts         # Export functionality (NEW)
├── styles.css             # Component styles
└── README.md              # This file
```

## 🏗️ Architecture Overview

### Data Flow

```
User provides chart string
        ↓
Component initializes Mermaid
        ↓
Preprocessing: Extract image references
        ↓
Mermaid renders SVG string
        ↓
SVG is enhanced (nodes, edges, labels)
        ↓
Images added to actors (if any)
        ↓
Custom theme applied (if provided)
        ↓
Event listeners attached (if callbacks provided)
        ↓
Particles created for each edge (unless disabled)
        ↓
Animation loop runs continuously
```

### Module Responsibilities

#### `index.tsx` - Main Component
- Orchestrates the entire rendering pipeline
- Manages React lifecycle and state
- Handles all new features: themes, events, 3D, etc.
- Coordinates between Mermaid and custom enhancements

**Key Functions:**
- `initializeMermaid()` - Configures Mermaid with theme
- `preprocessChart()` - Extracts image references and cleans syntax
- `renderDiagram()` - Converts chart text to SVG
- `addActorImages()` - Adds logos to sequence diagram actors
- `applyCustomTheme()` - Applies custom theme CSS
- `setupInteractivity()` - Attaches event listeners
- `setupParticleAnimations()` - Creates and starts particle system
- `handleMouseMove()` - Manages 3D tilt effect

#### `exportUtils.ts` - Export Functionality (NEW)
Utilities for exporting diagrams as image files.

**Key Functions:**
- `exportAsPNG()` - Exports SVG as PNG
- `exportAsJPG()` - Exports SVG as JPG with white background
- `exportAsSVG()` - Downloads SVG file
- `svgToCanvas()` - Converts SVG to canvas for raster export
- `downloadCanvas()` - Triggers browser download

## 🔧 Customization Guide

### Changing Animation Speed

Edit `constants.ts`:

```typescript
export const PARTICLE_CONFIG: ParticleConfig = {
  minDuration: 3000,  // Slower
  maxDuration: 6000,  // Slower
  // ...
};
```

### Changing Default Theme Colors

Edit `theme.ts` to change the entire color scheme:

```typescript
export const PRIMARY = {
  teal: '#ff6b6b',        // Change to red
  tealLight: '#ff8787',   // Light red
  cyanDark: '#8b0000',    // Dark red
} as const;
```

### Adjusting 3D Tilt Sensitivity

Edit `index.tsx`:

```typescript
const rotateX = ((y - centerY) / centerY) * -10; // Increase from -5 to -10
const rotateY = ((x - centerX) / centerX) * 10;  // Increase from 5 to 10
```

## 🐛 Troubleshooting

### Diagrams not rendering

Make sure Mermaid is installed:
```bash
npm install mermaid
```

### Export functions not working

Ensure you're calling export functions client-side (not during SSR):

```tsx
'use client'; // Add this at the top of your file

import { exportAsPNG } from '@/components/MermaidRenderer';
```

### Images not showing in sequence diagrams

1. Ensure the image URLs are accessible
2. Check CORS policies for external images
3. Use the `img:` prefix correctly: `participant img:https://... ActorName`

### Event handlers not firing

Make sure you're using the correct element selectors. Check the SVG structure in DevTools.

### 3D effect causing layout issues

The 3D transform uses `perspective` which can affect layout. Ensure the container has sufficient padding.

## 🌐 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers with SVG support

## 🧪 Testing Checklist

When modifying this component:

1. ✅ Test with all diagram types (flowchart, sequence, class, state, etc.)
2. ✅ Verify particles appear on all edges
3. ✅ Test theme customization
4. ✅ Test all event handlers (click, hover)
5. ✅ Test export functionality (PNG, JPG, SVG)
6. ✅ Test 3D effect
7. ✅ Check performance with complex diagrams (50+ nodes)
8. ✅ Test on different browsers
9. ✅ Verify cleanup (check for memory leaks on unmount)

## 🚀 Future Enhancement Ideas

- Per-edge particle customization
- Animated zoom/pan controls
- Custom particle shapes and trails
- Theme presets (dark mode, high contrast, etc.)
- Accessibility improvements (ARIA labels, keyboard navigation)
- Diagram editing capabilities
- Integration with popular state management libraries

## 📚 References

- [Mermaid.js Documentation](https://mermaid.js.org/)
- [SVG Path Documentation](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/path)
- [requestAnimationFrame API](https://developer.mozilla.org/en-US/docs/Web/API/window/requestAnimationFrame)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 📄 License

This component is part of your project and follows your project's license.

## 🙏 Credits

- Built with [Mermaid.js](https://mermaid.js.org/)
- Color theme inspired by [Truemed](https://www.truemed.com/)
- Particle animation concept inspired by modern data visualization libraries
