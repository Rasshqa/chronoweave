'use client';

// ponytail: Telemetry HUD overlay rendering precision crosshairs and coordinates directly over viewport.

import React from 'react';
import { TelemetryData, VisualVector } from '@/lib/mappingEngine';
import { Crosshair, Play, Pause, Compass, Wind, Droplets, Thermometer, ShieldCheck } from 'lucide-react';

interface TelemetryHudOverlayProps {
  telemetry: TelemetryData;
  vector: VisualVector;
  renderMode: '3d-sculpture' | '2d-flowfield';
  isPaused: boolean;
  onTogglePause: () => void;
}

export default function TelemetryHudOverlay({
  telemetry,
  vector,
  renderMode,
  isPaused,
  onTogglePause,
}: TelemetryHudOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between select-none z-10">
      {/* Top Bar */}
      <div className="flex flex-wrap justify-between items-start gap-4">
        {/* Top-Left: Target Location & Title */}
        <div className="flex items-start gap-3 bg-[#070709]/80 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-[#22242C]">
          <Crosshair className="w-5 h-5 text-[#FF5500] animate-pulse shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-mono-numbers tracking-widest text-[#00F0FF] font-semibold">
                TELEMETRY TARGET
              </span>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            </div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-tight text-[#F4F4F6]">
              {telemetry.cityName}, {telemetry.country}
            </h2>
            <p className="text-xs text-[#94A3B8] font-mono-numbers">
              ARCHIVE DATE: {telemetry.date}
            </p>
          </div>
        </div>

        {/* Top-Right: Coordinates & Seed Hash */}
        <div className="flex flex-col items-end bg-[#070709]/80 backdrop-blur-md px-3.5 py-2.5 rounded-lg border border-[#22242C]">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono-numbers text-[#94A3B8]">DETERMINISTIC SEED</span>
            <span className="text-xs font-mono-numbers font-bold text-[#FF5500] bg-[#FF5500]/10 px-1.5 py-0.5 rounded border border-[#FF5500]/30">
              #{vector.seedHash}
            </span>
          </div>
          <div className="text-xs font-mono-numbers text-[#F4F4F6] mt-1">
            GPS: {telemetry.latitude > 0 ? `${telemetry.latitude.toFixed(2)}°N` : `${Math.abs(telemetry.latitude).toFixed(2)}°S`},{' '}
            {telemetry.longitude > 0 ? `${telemetry.longitude.toFixed(2)}°E` : `${Math.abs(telemetry.longitude).toFixed(2)}°W`}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        {/* Bottom-Left: Live Environmental Telemetry Chips */}
        <div className="flex flex-wrap items-center gap-2 bg-[#070709]/85 backdrop-blur-md p-2 rounded-lg border border-[#22242C]">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#111216] border border-[#22242C] text-xs font-mono-numbers">
            <Thermometer className="w-3.5 h-3.5 text-[#FF5500]" />
            <span className="text-[#94A3B8]">TEMP:</span>
            <span className="font-bold text-[#F4F4F6]">
              {telemetry.tempMin}° / {telemetry.tempMax}°C
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#111216] border border-[#22242C] text-xs font-mono-numbers">
            <Wind className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="text-[#94A3B8]">WIND:</span>
            <span className="font-bold text-[#F4F4F6]">{telemetry.windSpeed} KM/H</span>
            <Compass className="w-3 h-3 text-[#94A3B8]" />
            <span className="text-[#94A3B8]">{telemetry.windDirection}°</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-[#111216] border border-[#22242C] text-xs font-mono-numbers">
            <Droplets className="w-3.5 h-3.5 text-[#3B82F6]" />
            <span className="text-[#94A3B8]">RAIN:</span>
            <span className="font-bold text-[#F4F4F6]">{telemetry.precipitation} MM</span>
          </div>
        </div>

        {/* Bottom-Right: Play/Pause & Mode Indicator */}
        <div className="flex items-center gap-2">
          <div className="bg-[#070709]/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-[#22242C] text-xs font-mono-numbers text-[#94A3B8]">
            <span className="text-[#F4F4F6] font-semibold">
              {renderMode === '3d-sculpture' ? '3D SHADER SCULPTURE' : '2D FLOW-FIELD'}
            </span>
          </div>

          <button
            onClick={onTogglePause}
            className="pointer-events-auto flex items-center justify-center w-10 h-10 rounded-lg bg-[#111216] hover:bg-[#181A20] text-[#F4F4F6] border border-[#22242C] hover:border-[#FF5500] transition-colors focus:ring-2 focus:ring-[#FF5500]"
            title={isPaused ? 'Resume animation' : 'Freeze frame for snapshot'}
            aria-label={isPaused ? 'Resume animation' : 'Freeze frame'}
          >
            {isPaused ? <Play className="w-4 h-4 text-[#10B981]" /> : <Pause className="w-4 h-4 text-[#FF5500]" />}
          </button>
        </div>
      </div>
    </div>
  );
}
