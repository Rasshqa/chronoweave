'use client';

// ponytail: Left sidebar controls managing city search, date picking, presets, and mode toggles.

import React, { useState } from 'react';
import { TelemetryData } from '@/lib/mappingEngine';
import { PRESETS } from '@/lib/presets';
import { Search, Calendar, Sliders, Sparkles, RefreshCw, Box, Wind, Thermometer, Droplets } from 'lucide-react';

interface TelemetryControlPanelProps {
  telemetry: TelemetryData;
  renderMode: '3d-sculpture' | '2d-flowfield';
  onUpdateTelemetry: (updated: Partial<TelemetryData>) => void;
  onApplyPreset: (presetId: string) => void;
  onSelectRenderMode: (mode: '3d-sculpture' | '2d-flowfield') => void;
  onFetchCityWeather: (city: string, date: string) => Promise<void>;
  isLoading: boolean;
}

export default function TelemetryControlPanel({
  telemetry,
  renderMode,
  onUpdateTelemetry,
  onApplyPreset,
  onSelectRenderMode,
  onFetchCityWeather,
  isLoading,
}: TelemetryControlPanelProps) {
  const [cityInput, setCityInput] = useState(telemetry.cityName);
  const [dateInput, setDateInput] = useState(telemetry.date);
  const [showSliders, setShowSliders] = useState(false);

  const handleSubmitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (cityInput.trim()) {
      onFetchCityWeather(cityInput.trim(), dateInput);
    }
  };

  return (
    <div className="w-full lg:w-96 bg-[#111216] border-r border-[#22242C] flex flex-col h-full overflow-y-auto p-4 sm:p-5 gap-5 select-none">
      {/* Brand Header */}
      <div className="border-b border-[#22242C] pb-4">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2.5 h-2.5 rounded-full bg-[#FF5500] animate-pulse" />
          <span className="text-xs font-mono-numbers uppercase tracking-widest text-[#FF5500] font-bold">
            CHRONOWEAVE // STUDIO
          </span>
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#F4F4F6] uppercase">
          Data Sculpture Studio
        </h1>
        <p className="text-xs text-[#94A3B8] mt-1">
          Convert historical climate vectors into deterministic 3D and 2D generative art.
        </p>
      </div>

      {/* Render Mode Switcher */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono-numbers font-semibold text-[#94A3B8] uppercase">
          RENDER ENGINE
        </label>
        <div className="grid grid-cols-2 gap-2 bg-[#070709] p-1 rounded-lg border border-[#22242C]">
          <button
            onClick={() => onSelectRenderMode('3d-sculpture')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded text-xs font-semibold transition-all ${
              renderMode === '3d-sculpture'
                ? 'bg-[#FF5500] text-black shadow-md'
                : 'text-[#94A3B8] hover:text-[#F4F4F6] hover:bg-[#181A20]'
            }`}
          >
            <Box className="w-3.5 h-3.5" />
            3D SCULPTURE
          </button>
          <button
            onClick={() => onSelectRenderMode('2d-flowfield')}
            className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded text-xs font-semibold transition-all ${
              renderMode === '2d-flowfield'
                ? 'bg-[#00F0FF] text-black shadow-md'
                : 'text-[#94A3B8] hover:text-[#F4F4F6] hover:bg-[#181A20]'
            }`}
          >
            <Wind className="w-3.5 h-3.5" />
            2D FLOW-FIELD
          </button>
        </div>
      </div>

      {/* Search City & Date Form */}
      <form onSubmit={handleSubmitSearch} className="flex flex-col gap-3">
        <label className="text-xs font-mono-numbers font-semibold text-[#94A3B8] uppercase">
          TELEMETRY LOCATION & DATE
        </label>
        <div className="relative">
          <input
            type="text"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
            placeholder="Search city (e.g. Kyoto, Reykjavik)"
            className="w-full bg-[#070709] border border-[#22242C] focus:border-[#FF5500] rounded-lg px-3.5 py-2.5 pl-9 text-xs text-[#F4F4F6] placeholder-[#64748B] transition-colors"
          />
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3 pointer-events-none" />
        </div>

        <div className="relative">
          <input
            type="date"
            value={dateInput}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => setDateInput(e.target.value)}
            className="w-full bg-[#070709] border border-[#22242C] focus:border-[#FF5500] rounded-lg px-3.5 py-2.5 pl-9 text-xs text-[#F4F4F6] font-mono-numbers transition-colors"
          />
          <Calendar className="w-4 h-4 text-[#64748B] absolute left-3 top-3 pointer-events-none" />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#FF5500] hover:bg-[#E04B00] active:scale-[0.99] disabled:opacity-50 text-black font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 transition-all mt-1"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              QUERYING OPEN-METEO ARCHIVE...
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              FETCH HISTORICAL TELEMETRY
            </>
          )}
        </button>
      </form>

      {/* 1-Click Presets */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono-numbers font-semibold text-[#94A3B8] uppercase">
          HISTORICAL PRESETS (0-CLICK)
        </label>
        <div className="flex flex-col gap-1.5">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                setCityInput(preset.telemetry.cityName);
                setDateInput(preset.telemetry.date);
                onApplyPreset(preset.id);
              }}
              className="flex items-center justify-between p-2.5 rounded-lg bg-[#070709] hover:bg-[#181A20] border border-[#22242C] hover:border-[#FF5500]/50 text-left transition-all group"
            >
              <div>
                <div className="text-xs font-bold text-[#F4F4F6] group-hover:text-[#FF5500] transition-colors">
                  {preset.name}
                </div>
                <div className="text-[10px] text-[#64748B] font-mono-numbers mt-0.5">
                  {preset.telemetry.cityName} // {preset.telemetry.date}
                </div>
              </div>
              <span className="text-[9px] font-mono-numbers font-bold px-1.5 py-0.5 rounded bg-[#FF5500]/10 text-[#FF5500] border border-[#FF5500]/20">
                {preset.badge}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Title & Subtitle */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-mono-numbers font-semibold text-[#94A3B8] uppercase">
          MEMORABILIA SPEC SHEET LABELS
        </label>
        <input
          type="text"
          value={telemetry.title}
          onChange={(e) => onUpdateTelemetry({ title: e.target.value })}
          placeholder="Artifact Title"
          className="w-full bg-[#070709] border border-[#22242C] focus:border-[#00F0FF] rounded-lg px-3 py-2 text-xs text-[#F4F4F6]"
        />
        <input
          type="text"
          value={telemetry.subtitle || ''}
          onChange={(e) => onUpdateTelemetry({ subtitle: e.target.value })}
          placeholder="Subtitle / Description"
          className="w-full bg-[#070709] border border-[#22242C] focus:border-[#00F0FF] rounded-lg px-3 py-2 text-xs text-[#F4F4F6]"
        />
      </div>

      {/* Fine-Tuning Overrides Toggle */}
      <div className="border-t border-[#22242C] pt-4 mt-auto">
        <button
          onClick={() => setShowSliders(!showSliders)}
          className="w-full flex items-center justify-between py-2 text-xs font-mono-numbers text-[#94A3B8] hover:text-[#F4F4F6] transition-colors"
        >
          <span className="flex items-center gap-2">
            <Sliders className="w-3.5 h-3.5 text-[#00F0FF]" />
            ENVIRONMENTAL TUNING SLIDERS
          </span>
          <span>{showSliders ? 'COLLAPSE' : 'EXPAND'}</span>
        </button>

        {showSliders && (
          <div className="flex flex-col gap-3 mt-3 bg-[#070709] p-3 rounded-lg border border-[#22242C]">
            <div>
              <div className="flex justify-between text-[11px] font-mono-numbers mb-1">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-[#FF5500]" /> TEMP MAX
                </span>
                <span className="text-[#F4F4F6] font-bold">{telemetry.tempMax}°C</span>
              </div>
              <input
                type="range"
                min="-10"
                max="45"
                step="0.5"
                value={telemetry.tempMax}
                onChange={(e) => onUpdateTelemetry({ tempMax: parseFloat(e.target.value) })}
                className="w-full accent-[#FF5500] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono-numbers mb-1">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <Wind className="w-3 h-3 text-[#00F0FF]" /> WIND SPEED
                </span>
                <span className="text-[#F4F4F6] font-bold">{telemetry.windSpeed} km/h</span>
              </div>
              <input
                type="range"
                min="0"
                max="120"
                step="1"
                value={telemetry.windSpeed}
                onChange={(e) => onUpdateTelemetry({ windSpeed: parseFloat(e.target.value) })}
                className="w-full accent-[#00F0FF] cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-[11px] font-mono-numbers mb-1">
                <span className="text-[#94A3B8] flex items-center gap-1">
                  <Droplets className="w-3 h-3 text-[#3B82F6]" /> PRECIPITATION
                </span>
                <span className="text-[#F4F4F6] font-bold">{telemetry.precipitation} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={telemetry.precipitation}
                onChange={(e) => onUpdateTelemetry({ precipitation: parseFloat(e.target.value) })}
                className="w-full accent-[#3B82F6] cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
