# Mermaid Vibes ✨

Vibe-coded Mermaid diagrams for React with buttery animations.

```bash
npm install @truemed/mermaid-vibes mermaid
```

## Quick Start

```tsx
import { MermaidVibes } from '@truemed/mermaid-vibes';
import '@truemed/mermaid-vibes/styles.css';

function App() {
  return (
    <MermaidVibes chart={`
      graph TD
        A[Start] --> B[Process]
        B --> C[End]
    `} />
  );
}
```

## Features

- ✨ Smooth, performant animations
- 🎨 Beautiful teal color theme
- 💫 Animated light particles on arrows
- 🖼️ Logo support in sequence diagrams
- 🎯 Interactive node & edge click events
- 📦 Export as PNG, JPG, or SVG
- 🎭 All Mermaid diagram types supported

## Examples

### With Logos (Sequence Diagrams)

```tsx
<MermaidVibes chart={`
  sequenceDiagram
    participant img:https://example.com/user.png User
    participant img:https://example.com/server.png Server
    User->>Server: Request
    Server-->>User: Response
`} />
```

### With Click Handlers

```tsx
<MermaidVibes
  chart={`graph TD; A-->B; B-->C;`}
  onNodeClick={(data) => console.log('Clicked:', data.label)}
  onEdgeClick={(data) => console.log('Edge:', data.label)}
/>
```

### Export Diagrams

```tsx
import { MermaidVibes, exportAsPNG } from '@truemed/mermaid-vibes';

function App() {
  const handleExport = async () => {
    const svg = document.querySelector('.mermaid-renderer svg');
    await exportAsPNG(svg, 'diagram.png');
  };

  return (
    <>
      <MermaidVibes chart={`graph TD; A-->B;`} />
      <button onClick={handleExport}>Export PNG</button>
    </>
  );
}
```

### Custom Theme

```tsx
<MermaidVibes
  chart={`graph TD; A-->B;`}
  theme={{
    primaryColor: '#FF6B6B',
    backgroundColor: '#1A1A2E',
    textColor: '#EAEAEA',
    strokeWidth: 4,
    fontSize: 18,
  }}
/>
```

### Disable Animations

```tsx
<MermaidVibes
  chart={`graph TD; A-->B;`}
  disableAnimations={true}
  disableParticles={true}
/>
```

## API

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `chart` | `string` | **required** | Mermaid diagram syntax |
| `theme` | `CustomTheme` | - | Custom colors and styling |
| `className` | `string` | `''` | Additional CSS class |
| `disableAnimations` | `boolean` | `false` | Disable CSS animations |
| `disableParticles` | `boolean` | `false` | Disable particle effects |
| `onNodeClick` | `(data) => void` | - | Node click handler |
| `onEdgeClick` | `(data) => void` | - | Edge click handler |

### Export Functions

```typescript
exportAsPNG(svgElement: SVGSVGElement, filename?: string): Promise<void>
exportAsJPG(svgElement: SVGSVGElement, filename?: string): Promise<void>
exportAsSVG(svgElement: SVGSVGElement, filename?: string): Promise<void>
```

## Supported Diagrams

- Flowcharts
- Sequence Diagrams
- Class Diagrams
- State Diagrams
- ER Diagrams
- User Journey
- Gantt Charts
- And more!

See [Mermaid docs](https://mermaid.js.org/) for syntax.

## License

MIT © Truemed
