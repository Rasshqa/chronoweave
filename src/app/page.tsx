'use client';

// ponytail: Main split-screen generative studio bringing together telemetry panel, viewports, HUD, and export engine.

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { PRESETS } from '@/lib/presets';
import { computeVisualVector, TelemetryData, VisualVector } from '@/lib/mappingEngine';
import TelemetryControlPanel from '@/components/studio/TelemetryControlPanel';
import TelemetryHudOverlay from '@/components/studio/TelemetryHudOverlay';
import PosterExportEngine from '@/components/studio/PosterExportEngine';
import FlowFieldViewport2D from '@/components/studio/FlowFieldViewport2D';

// Dynamically import Three.js 3D viewport with SSR disabled
const SculptureViewport3D = dynamic(
  () => import('@/components/studio/SculptureViewport3D'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#070709] text-[#94A3B8]">
        <div className="w-10 h-10 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin mb-3" />
        <span className="text-xs font-mono-numbers uppercase tracking-widest text-[#FF5500]">
          INITIALIZING WEBGL SHADER ENGINE...
        </span>
      </div>
    ),
  }
);

export default function StudioPage() {
  const [telemetry, setTelemetry] = useState<TelemetryData>(PRESETS[0].telemetry);
  const [renderMode, setRenderMode] = useState<'3d-sculpture' | '2d-flowfield'>('3d-sculpture');
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Compute visual vector deterministically
  const vector: VisualVector = React.useMemo(() => {
    return computeVisualVector(telemetry);
  }, [telemetry]);

  const handleUpdateTelemetry = (updated: Partial<TelemetryData>) => {
    setTelemetry((prev) => ({ ...prev, ...updated }));
  };

  const handleApplyPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (found) {
      setTelemetry(found.telemetry);
    }
  };

  const handleFetchCityWeather = async (city: string, date: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/telemetry?city=${encodeURIComponent(city)}&date=${encodeURIComponent(date)}&title=${encodeURIComponent(
          telemetry.title
        )}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.telemetry) {
          setTelemetry(data.telemetry);
        }
      }
    } catch {
      // Keep existing telemetry if query fails
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#070709] text-[#F4F4F6]">
      {/* Top Navbar */}
      <header className="h-12 border-b border-[#22242C] bg-[#111216] px-4 flex items-center justify-between z-30 select-none shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#FF5500]" />
            <span className="font-bold tracking-tight text-sm text-[#F4F4F6]">CHRONOWEAVE</span>
          </div>
          <span className="text-[10px] font-mono-numbers px-2 py-0.5 rounded bg-[#181A20] text-[#00F0FF] border border-[#00F0FF]/20">
            v2.0 STUDIO
          </span>
        </div>

        <nav className="flex items-center gap-4 text-xs font-mono-numbers">
          <a
            href="/gallery"
            className="text-[#94A3B8] hover:text-[#00F0FF] transition-colors flex items-center gap-1.5"
          >
            <span>COMMUNITY GALLERY</span>
          </a>
          <a
            href="https://github.com/Rasshqa/chronoweave"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#94A3B8] hover:text-[#FF5500] transition-colors"
          >
            GITHUB
          </a>
        </nav>
      </header>

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left: Controls Sidebar */}
        <TelemetryControlPanel
          telemetry={telemetry}
          renderMode={renderMode}
          onUpdateTelemetry={handleUpdateTelemetry}
          onApplyPreset={handleApplyPreset}
          onSelectRenderMode={setRenderMode}
          onFetchCityWeather={handleFetchCityWeather}
          isLoading={isLoading}
        />

        {/* Center/Right: Viewport + HUD */}
        <main className="flex-1 relative flex flex-col bg-[#070709] overflow-hidden">
          <div className="flex-1 relative overflow-hidden">
            {renderMode === '3d-sculpture' ? (
              <SculptureViewport3D vector={vector} isPaused={isPaused} />
            ) : (
              <FlowFieldViewport2D vector={vector} isPaused={isPaused} />
            )}

            {/* Precision Telemetry HUD */}
            <TelemetryHudOverlay
              telemetry={telemetry}
              vector={vector}
              renderMode={renderMode}
              isPaused={isPaused}
              onTogglePause={() => setIsPaused(!isPaused)}
            />
          </div>

          {/* Bottom High-DPI Poster Compositor */}
          <PosterExportEngine
            telemetry={telemetry}
            vector={vector}
            renderMode={renderMode}
          />
        </main>
      </div>
    </div>
  );
}
