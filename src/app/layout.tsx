import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ChronoWeave // Deterministic Generative 3D Art Studio',
  description:
    'Turn historical weather telemetry and special dates into interactive 3D data sculptures, particle flow-fields, and 4K museum posters.',
  keywords: [
    'ChronoWeave',
    'generative art',
    '3D data sculpture',
    'Three.js',
    'WebGL',
    'Open-Meteo',
    'deterministic art',
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070709] text-[#F4F4F6] antialiased selection:bg-[#FF5500] selection:text-black">
        {children}
      </body>
    </html>
  );
}
