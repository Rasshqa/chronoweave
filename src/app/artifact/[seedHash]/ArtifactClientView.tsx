'use client';

// ponytail: Client wrapper for permalink viewport supporting both 3D WebGL and 2D flow field modes.

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { TelemetryData, VisualVector } from '@/lib/mappingEngine';
import FlowFieldViewport2D from '@/components/studio/FlowFieldViewport2D';
import TelemetryHudOverlay from '@/components/studio/TelemetryHudOverlay';

const SculptureViewport3D = dynamic(
  () => import('@/components/studio/SculptureViewport3D'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#070709] text-[#94A3B8]">
        <div className="w-8 h-8 border-2 border-[#FF5500] border-t-transparent rounded-full animate-spin mb-3" />
      </div>
    ),
  }
);

interface ArtifactClientViewProps {
  telemetry: TelemetryData;
  vector: VisualVector;
  renderMode: '3d-sculpture' | '2d-flowfield';
}

export default function ArtifactClientView({
  telemetry,
  vector,
  renderMode,
}: ArtifactClientViewProps) {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <div className="w-full h-full relative">
      {renderMode === '3d-sculpture' ? (
        <SculptureViewport3D vector={vector} isPaused={isPaused} />
      ) : (
        <FlowFieldViewport2D vector={vector} isPaused={isPaused} />
      )}

      <TelemetryHudOverlay
        telemetry={telemetry}
        vector={vector}
        renderMode={renderMode}
        isPaused={isPaused}
        onTogglePause={() => setIsPaused(!isPaused)}
      />
    </div>
  );
}
