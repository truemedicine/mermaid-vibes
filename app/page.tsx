'use client';

import { MermaidVibes, exportAsPNG, exportAsJPG, exportAsSVG, NodeEventData, EdgeEventData } from '@/components/MermaidRenderer';
import { useState, useRef } from 'react';

const exampleDiagrams = {
  sequence: `sequenceDiagram
    participant img:https://ui-avatars.com/api/?name=User&background=179895&color=fff&size=128&rounded=false User
    participant img:https://ui-avatars.com/api/?name=Web&background=679b9a&color=fff&size=128&rounded=false Frontend
    participant img:https://ui-avatars.com/api/?name=API&background=183B43&color=fff&size=128&rounded=false API Server
    participant img:https://ui-avatars.com/api/?name=DB&background=FFF6A8&color=333&size=128&rounded=false Database
    User->>Frontend: Submit Login Request
    Frontend->>API Server: POST /auth/login
    API Server->>Database: Query User Credentials
    Database-->>API Server: User Data
    API Server->>API Server: Generate JWT Token
    API Server-->>Frontend: Auth Token
    Frontend-->>User: Redirect to Dashboard`,

  flowchart: `graph TD
    A[Start Process] --> B{Decision Point}
    B -->|Yes| C[Execute Task 1]
    B -->|No| D[Execute Task 2]
    C --> E[Process Data]
    D --> E
    E --> F[Validate Results]
    F --> G{Valid?}
    G -->|Yes| H[Complete]
    G -->|No| I[Error Handling]
    I --> B`,

  classDiagram: `classDiagram
    class User {
        +String name
        +String email
        +login()
        +logout()
    }
    class Product {
        +String id
        +String title
        +Float price
        +purchase()
    }
    class Order {
        +String orderId
        +Date createdAt
        +calculateTotal()
    }
    User --> Order: places
    Order --> Product: contains`,

  stateDiagram: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Failed: Error
    Success --> [*]
    Failed --> Retry: Retry
    Retry --> Processing
    Failed --> [*]: Cancel`,
};

export default function Home() {
  const [selectedDiagram, setSelectedDiagram] = useState<keyof typeof exampleDiagrams>('sequence');
  const [eventLog, setEventLog] = useState<string[]>([]);
  const svgContainerRef = useRef<HTMLDivElement>(null);

  // Event handlers
  const handleNodeClick = (data: NodeEventData) => {
    setEventLog(prev => [`Node clicked: ${data.label || 'Unnamed'}`, ...prev].slice(0, 5));
  };


  const handleEdgeClick = (data: EdgeEventData) => {
    setEventLog(prev => [`Edge clicked: ${data.label || 'Unnamed'}`, ...prev].slice(0, 5));
  };

  // Export handlers
  const handleExport = async (format: 'png' | 'jpg' | 'svg') => {
    const svgElement = document.querySelector('.mermaid-renderer svg') as SVGSVGElement;
    if (!svgElement) return;

    try {
      setEventLog(prev => [`Exporting as ${format.toUpperCase()}...`, ...prev].slice(0, 5));

      switch (format) {
        case 'png':
          await exportAsPNG(svgElement, 'diagram.png');
          break;
        case 'jpg':
          await exportAsJPG(svgElement, 'diagram.jpg');
          break;
        case 'svg':
          await exportAsSVG(svgElement, 'diagram.svg');
          break;
      }
      setEventLog(prev => [`Successfully exported as ${format.toUpperCase()}`, ...prev].slice(0, 5));
    } catch (error) {
      console.error('Export failed:', error);
      setEventLog(prev => [`Export failed: ${error}`, ...prev].slice(0, 5));
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
            Mermaid Vibes ✨
          </h1>
          <p className="text-xl text-gray-600">
            Vibe-coded diagrams with buttery animations and aesthetic appeal
          </p>
        </header>

        <div className="mb-6 flex justify-center gap-4 flex-wrap">
          {(Object.keys(exampleDiagrams) as Array<keyof typeof exampleDiagrams>).map((key) => (
            <button
              key={key}
              onClick={() => setSelectedDiagram(key)}
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                selectedDiagram === key
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/50 scale-105'
                  : 'bg-gray-100 text-gray-700 hover:bg-teal-50 hover:scale-105'
              }`}
              style={{
                border: selectedDiagram === key ? '2px solid #179895' : '1px solid #d1d5db',
              }}
            >
              {key.charAt(0).toUpperCase() + key.slice(1)} Diagram
            </button>
          ))}
        </div>

        <div className="mb-6 flex justify-center gap-2">
          <button
            onClick={() => handleExport('png')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md font-semibold hover:bg-blue-700 transition-colors"
          >
            Export PNG
          </button>
          <button
            onClick={() => handleExport('jpg')}
            className="px-4 py-2 bg-green-600 text-white rounded-md font-semibold hover:bg-green-700 transition-colors"
          >
            Export JPG
          </button>
          <button
            onClick={() => handleExport('svg')}
            className="px-4 py-2 bg-purple-600 text-white rounded-md font-semibold hover:bg-purple-700 transition-colors"
          >
            Export SVG
          </button>
        </div>

        <div className="mb-8" ref={svgContainerRef}>
          <MermaidVibes
            chart={exampleDiagrams[selectedDiagram]}
            onNodeClick={handleNodeClick}
            onEdgeClick={handleEdgeClick}
          />
        </div>

        {eventLog.length > 0 && (
          <div className="mb-8 p-4 bg-gray-800 text-gray-100 rounded-lg">
            <h3 className="text-lg font-bold mb-2">Event Log</h3>
            <div className="space-y-1 font-mono text-sm">
              {eventLog.map((event, index) => (
                <div key={index} className="text-teal-300">
                  → {event}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-12 p-6 rounded-lg bg-gray-50 border border-gray-200">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">How to Use</h2>
          <div className="space-y-4 text-gray-700">
            <p>
              The <code className="bg-teal-100 text-teal-800 px-2 py-1 rounded">MermaidVibes</code> component
              brings the vibes to your diagrams:
            </p>
            <div className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <pre className="text-sm text-gray-100">
{`import { MermaidVibes } from '@truemed/mermaid-vibes';

<MermaidVibes chart={\`
  sequenceDiagram
    participant img:/path/to/logo.png User
    participant API Server
    User->>API Server: Request
    API Server-->>User: Response
\`} />`}
              </pre>
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Features:</h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>🎨 Truemed-inspired color theme with warm teal and off-white palette</li>
                <li>✨ Glowing borders on all nodes with subtle animated pulse effects</li>
                <li>🌊 Pulsing arrows that breathe with color transitions</li>
                <li>💫 Sequential animated light particles traveling along arrow paths</li>
                <li>🖼️ Logo support in sequence diagrams - add images with <code className="bg-teal-100 text-teal-800 px-1 rounded text-sm">img:path/to/logo.png</code></li>
                <li>📏 Enlarged sequence diagrams with bigger text and spacing</li>
                <li>🎯 Support for all Mermaid diagram types</li>
                <li>🎭 Interactive events - click on nodes and edges</li>
                <li>🎨 Themable - customize colors, stroke widths, and fonts</li>
                <li>📦 Export diagrams as PNG, JPG, or SVG</li>
                <li>⚡ Easily embeddable in any React app</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
