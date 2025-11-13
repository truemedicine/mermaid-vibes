import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mermaid Renderer - Animated Diagrams',
  description: 'Beautiful animated Mermaid diagrams with glowing effects and particle animations',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
