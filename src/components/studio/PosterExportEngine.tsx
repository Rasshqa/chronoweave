'use client';

// ponytail: Offscreen High-DPI canvas compositor generating 4K museum posters and 9:16 mobile wallpapers.

import React, { useState } from 'react';
import { TelemetryData, VisualVector } from '@/lib/mappingEngine';
import { Download, Share2, Check, Sparkles, Image as ImageIcon } from 'lucide-react';

interface PosterExportEngineProps {
  telemetry: TelemetryData;
  vector: VisualVector;
  renderMode: '3d-sculpture' | '2d-flowfield';
}

type PosterRatio = '4:5' | '9:16';
type PosterTheme = 'obsidian' | 'archival-white';

export default function PosterExportEngine({
  telemetry,
  vector,
  renderMode,
}: PosterExportEngineProps) {
  const [ratio, setRatio] = useState<PosterRatio>('4:5');
  const [theme, setTheme] = useState<PosterTheme>('obsidian');
  const [isExporting, setIsExporting] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [mintedUrl, setMintedUrl] = useState<string | null>(null);

  const handleExportPNG = async () => {
    setIsExporting(true);
    try {
      // Find active canvas
      const targetCanvasId =
        renderMode === '3d-sculpture' ? 'three-canvas-target' : 'flowfield-canvas-target';
      const sourceCanvas = document.getElementById(targetCanvasId) as HTMLCanvasElement | null;

      if (!sourceCanvas) {
        alert('Canvas viewport not ready for capture');
        return;
      }

      // Output Dimensions
      // 4:5 Poster = 2400 x 3000, 9:16 Wallpaper = 2160 x 3840
      const posterWidth = ratio === '4:5' ? 2400 : 2160;
      const posterHeight = ratio === '4:5' ? 3000 : 3840;

      const offscreen = document.createElement('canvas');
      offscreen.width = posterWidth;
      offscreen.height = posterHeight;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return;

      const isDark = theme === 'obsidian';
      const bgColor = isDark ? '#09090C' : '#F4F4F0';
      const textColor = isDark ? '#F4F4F6' : '#09090B';
      const mutedColor = isDark ? '#A1A1AA' : '#52525B';
      const borderColor = isDark ? '#27272A' : '#D4D4D8';
      const accentColor = '#FF5500';

      // 1. Draw Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, posterWidth, posterHeight);

      // Margins
      const margin = 120;
      const innerWidth = posterWidth - margin * 2;
      const specHeight = 650;
      const visualHeight = posterHeight - margin * 2 - specHeight;

      // 2. Draw Artwork Frame
      ctx.fillStyle = '#070709';
      ctx.fillRect(margin, margin, innerWidth, visualHeight);

      // Draw Artwork Image
      ctx.drawImage(
        sourceCanvas,
        0,
        0,
        sourceCanvas.width,
        sourceCanvas.height,
        margin,
        margin,
        innerWidth,
        visualHeight
      );

      // Draw Subtle inner border around artwork
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(margin, margin, innerWidth, visualHeight);

      // 3. Draw Spec Sheet Metadata (Bottom section)
      const specTop = margin + visualHeight + 60;

      // Line 1: Memory Title (Left) + Coordinates (Right)
      ctx.font = '700 64px -apple-system, BlinkMacSystemFont, "Space Grotesk", sans-serif';
      ctx.fillStyle = textColor;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';

      const maxTitleWidth = innerWidth * 0.65;
      const displayTitle = telemetry.title.toUpperCase();
      ctx.fillText(displayTitle, margin, specTop, maxTitleWidth);

      // Coordinates
      ctx.font = '600 32px "JetBrains Mono", monospace';
      ctx.fillStyle = mutedColor;
      ctx.textAlign = 'right';
      const latText =
        telemetry.latitude >= 0
          ? `${telemetry.latitude.toFixed(2)}°N`
          : `${Math.abs(telemetry.latitude).toFixed(2)}°S`;
      const lonText =
        telemetry.longitude >= 0
          ? `${telemetry.longitude.toFixed(2)}°E`
          : `${Math.abs(telemetry.longitude).toFixed(2)}°W`;
      ctx.fillText(`${latText} // ${lonText}`, posterWidth - margin, specTop + 14);

      // Horizontal Divider
      const lineY = specTop + 100;
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(margin, lineY);
      ctx.lineTo(posterWidth - margin, lineY);
      ctx.stroke();

      // 4-Column Metadata Grid
      const gridY = lineY + 50;
      const colWidth = innerWidth / 4;

      const drawColumn = (
        index: number,
        label: string,
        val1: string,
        val2?: string,
        isAccent?: boolean
      ) => {
        const x = margin + index * colWidth;
        // Label
        ctx.font = '600 22px "JetBrains Mono", monospace';
        ctx.fillStyle = isAccent ? accentColor : mutedColor;
        ctx.textAlign = 'left';
        ctx.fillText(label, x, gridY);

        // Value Line 1
        ctx.font = '700 36px "JetBrains Mono", monospace';
        ctx.fillStyle = textColor;
        ctx.fillText(val1, x, gridY + 45);

        // Value Line 2
        if (val2) {
          ctx.font = '500 24px "JetBrains Mono", monospace';
          ctx.fillStyle = mutedColor;
          ctx.fillText(val2, x, gridY + 95);
        }
      };

      drawColumn(
        0,
        'DATE ARCHIVE',
        telemetry.date.replace(/-/g, '.'),
        telemetry.cityName.toUpperCase()
      );
      drawColumn(
        1,
        'THERMAL DELTA',
        `${telemetry.tempMin}° / ${telemetry.tempMax}°C`,
        `ZONE: ${vector.thermalZone.toUpperCase()}`
      );
      drawColumn(
        2,
        'KINETIC WIND',
        `${telemetry.windSpeed} KM/H`,
        `DIR: ${telemetry.windDirection}° (${telemetry.precipitation}MM RAIN)`
      );
      drawColumn(
        3,
        'DETERMINISTIC SEED',
        `#${vector.seedHash}`,
        renderMode === '3d-sculpture' ? '3D SHADER MESH' : '2D FLOW-FIELD',
        true
      );

      // Footer branding
      ctx.font = '500 20px "JetBrains Mono", monospace';
      ctx.fillStyle = mutedColor;
      ctx.textAlign = 'left';
      ctx.fillText(
        'CHRONOWEAVE STUDIO // DETERMINISTIC GENERATIVE ARCHIVE',
        margin,
        posterHeight - 50
      );

      ctx.textAlign = 'right';
      ctx.fillText('OPEN-METEO CLIMATE RECONSTRUCTION', posterWidth - margin, posterHeight - 50);

      // 4. Download as PNG
      const dataUrl = offscreen.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `chronoweave_${vector.seedHash}_${ratio.replace(':', 'x')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      alert('Export failed. Check WebGL support in browser.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleMintGallery = async () => {
    setIsMinting(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: telemetry.title,
          subtitle: telemetry.subtitle,
          cityName: telemetry.cityName,
          country: telemetry.country,
          latitude: telemetry.latitude,
          longitude: telemetry.longitude,
          targetDate: telemetry.date,
          tempMax: telemetry.tempMax,
          tempMin: telemetry.tempMin,
          windSpeed: telemetry.windSpeed,
          windDirection: telemetry.windDirection,
          precipitation: telemetry.precipitation,
          seedHash: vector.seedHash,
          renderMode,
          posterTheme: theme,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMintedUrl(`/artifact/${vector.seedHash}`);
      }
    } catch {
      // Fallback
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="bg-[#111216] border-t border-[#22242C] p-3 sm:p-4 flex flex-wrap items-center justify-between gap-4 z-20">
      {/* Configuration Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Aspect Ratio */}
        <div className="flex items-center gap-1.5 bg-[#070709] p-1 rounded-lg border border-[#22242C]">
          <span className="text-[11px] font-mono-numbers text-[#94A3B8] px-2">RATIO:</span>
          <button
            onClick={() => setRatio('4:5')}
            className={`px-3 py-1.5 rounded text-xs font-mono-numbers font-semibold transition-all ${
              ratio === '4:5'
                ? 'bg-[#FF5500] text-black shadow'
                : 'text-[#94A3B8] hover:text-[#F4F4F6]'
            }`}
          >
            4:5 MUSEUM POSTER
          </button>
          <button
            onClick={() => setRatio('9:16')}
            className={`px-3 py-1.5 rounded text-xs font-mono-numbers font-semibold transition-all ${
              ratio === '9:16'
                ? 'bg-[#FF5500] text-black shadow'
                : 'text-[#94A3B8] hover:text-[#F4F4F6]'
            }`}
          >
            9:16 WALLPAPER
          </button>
        </div>

        {/* Poster Theme */}
        <div className="flex items-center gap-1.5 bg-[#070709] p-1 rounded-lg border border-[#22242C]">
          <span className="text-[11px] font-mono-numbers text-[#94A3B8] px-2">THEME:</span>
          <button
            onClick={() => setTheme('obsidian')}
            className={`px-3 py-1.5 rounded text-xs font-mono-numbers font-semibold transition-all ${
              theme === 'obsidian'
                ? 'bg-[#22242C] text-[#F4F4F6] border border-[#FF5500]/40'
                : 'text-[#94A3B8] hover:text-[#F4F4F6]'
            }`}
          >
            OBSIDIAN
          </button>
          <button
            onClick={() => setTheme('archival-white')}
            className={`px-3 py-1.5 rounded text-xs font-mono-numbers font-semibold transition-all ${
              theme === 'archival-white'
                ? 'bg-[#F4F4F0] text-[#09090B] border border-[#D4D4D8]'
                : 'text-[#94A3B8] hover:text-[#F4F4F6]'
            }`}
          >
            ARCHIVAL WHITE
          </button>
        </div>
      </div>

      {/* Export & Share Buttons */}
      <div className="flex items-center gap-3">
        {mintedUrl ? (
          <a
            href={mintedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#10B981]/15 hover:bg-[#10B981]/25 text-[#10B981] border border-[#10B981]/40 text-xs font-mono-numbers font-bold py-2.5 px-4 rounded-lg transition-all"
          >
            <Check className="w-4 h-4" />
            VIEW IN PUBLIC GALLERY
          </a>
        ) : (
          <button
            onClick={handleMintGallery}
            disabled={isMinting}
            className="flex items-center gap-2 bg-[#181A20] hover:bg-[#22242C] text-[#00F0FF] border border-[#00F0FF]/30 hover:border-[#00F0FF] text-xs font-mono-numbers font-bold py-2.5 px-4 rounded-lg transition-all disabled:opacity-50"
          >
            <Sparkles className="w-4 h-4" />
            {isMinting ? 'MINTING...' : 'MINT TO GALLERY'}
          </button>
        )}

        <button
          onClick={handleExportPNG}
          disabled={isExporting}
          className="flex items-center gap-2 bg-[#FF5500] hover:bg-[#E04B00] active:scale-[0.98] text-black font-bold text-xs py-2.5 px-5 rounded-lg shadow-lg shadow-[#FF5500]/20 transition-all disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          {isExporting ? 'COMPOSITING 4K CANVAS...' : 'DOWNLOAD HIGH-RES POSTER'}
        </button>
      </div>
    </div>
  );
}
