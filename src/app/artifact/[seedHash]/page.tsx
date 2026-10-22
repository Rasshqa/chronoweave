import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Box, Compass, Droplets, Thermometer, Wind, Download, Sparkles } from 'lucide-react';
import { memoryGallery, prisma, hasDatabaseConnection } from '@/lib/db';
import { computeVisualVector, TelemetryData } from '@/lib/mappingEngine';
import { PRESETS } from '@/lib/presets';
import ArtifactClientView from './ArtifactClientView';

interface PageProps {
  params: Promise<{ seedHash: string }>;
}

export default async function ArtifactPermalinkPage({ params }: PageProps) {
  const { seedHash } = await params;
  const upperHash = seedHash.toUpperCase();

  let telemetry: TelemetryData | null = null;
  let renderMode = '3d-sculpture';
  let creatorName = 'Anonymous Architect';

  // Check database or memory gallery
  const hasDb = await hasDatabaseConnection();
  if (hasDb) {
    try {
      const art = await prisma.artworkArchive.findUnique({
        where: { seedHash: upperHash },
      });
      if (art) {
        telemetry = {
          cityName: art.cityName,
          country: art.country,
          latitude: art.latitude,
          longitude: art.longitude,
          date: art.targetDate,
          title: art.title,
          subtitle: art.subtitle || undefined,
          tempMax: art.tempMax,
          tempMin: art.tempMin,
          windSpeed: art.windSpeed,
          windDirection: art.windDirection,
          precipitation: art.precipitation,
        };
        renderMode = art.renderMode;
        creatorName = art.creatorName;
      }
    } catch {}
  }

  if (!telemetry) {
    const memoryArt = memoryGallery.getByHash(upperHash);
    if (memoryArt) {
      telemetry = {
        cityName: memoryArt.cityName,
        country: memoryArt.country,
        latitude: memoryArt.latitude,
        longitude: memoryArt.longitude,
        date: memoryArt.targetDate,
        title: memoryArt.title,
        subtitle: memoryArt.subtitle,
        tempMax: memoryArt.tempMax,
        tempMin: memoryArt.tempMin,
        windSpeed: memoryArt.windSpeed,
        windDirection: memoryArt.windDirection,
        precipitation: memoryArt.precipitation,
      };
      renderMode = memoryArt.renderMode;
      creatorName = memoryArt.creatorName;
    }
  }

  // Fallback to preset if arbitrary hash tested
  if (!telemetry) {
    const fallbackPreset = PRESETS.find((p) =>
      computeVisualVector(p.telemetry).seedHash.toUpperCase() === upperHash
    ) || PRESETS[0];

    telemetry = fallbackPreset.telemetry;
  }

  const vector = computeVisualVector(telemetry);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6] flex flex-col">
      {/* Top Navbar */}
      <header className="h-14 border-b border-[#22242C] bg-[#111216] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <Link
          href="/gallery"
          className="flex items-center gap-2 text-xs font-mono-numbers text-[#94A3B8] hover:text-[#00F0FF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          GALLERY ARCHIVE
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono-numbers font-bold text-[#FF5500] bg-[#FF5500]/10 px-2 py-0.5 rounded border border-[#FF5500]/20">
            #{vector.seedHash}
          </span>
          <Link
            href="/"
            className="text-xs font-mono-numbers font-bold bg-[#FF5500] text-black px-3 py-1.5 rounded hover:bg-[#E04B00] transition-colors"
          >
            OPEN IN STUDIO
          </Link>
        </div>
      </header>

      {/* Main View */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8">
        {/* Left: Interactive 3D / 2D Viewport */}
        <div className="flex-1 min-h-[480px] lg:min-h-[600px] bg-[#111216] border border-[#22242C] rounded-2xl overflow-hidden relative shadow-2xl">
          <ArtifactClientView
            telemetry={telemetry}
            vector={vector}
            renderMode={renderMode as '3d-sculpture' | '2d-flowfield'}
          />
        </div>

        {/* Right: Technical Spec Sheet */}
        <div className="w-full lg:w-96 flex flex-col gap-6">
          <div className="bg-[#111216] border border-[#22242C] rounded-2xl p-6">
            <div className="flex items-center gap-2 text-xs font-mono-numbers text-[#00F0FF] uppercase mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              ARCHIVAL METADATA SPEC
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-[#F4F4F6]">
              {telemetry.title}
            </h1>
            <p className="text-xs text-[#94A3B8] mt-1 mb-6">
              {telemetry.cityName}, {telemetry.country} // {telemetry.date}
            </p>

            <div className="flex flex-col gap-3 font-mono-numbers text-xs">
              <div className="flex justify-between py-2 border-b border-[#22242C]">
                <span className="text-[#64748B]">CREATOR</span>
                <span className="font-bold text-[#F4F4F6]">{creatorName}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#22242C]">
                <span className="text-[#64748B]">SEED HASH</span>
                <span className="font-bold text-[#FF5500]">#{vector.seedHash}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#22242C]">
                <span className="text-[#64748B]">THERMAL ZONE</span>
                <span className="font-bold text-[#F4F4F6]">{vector.thermalZone.toUpperCase()}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#22242C]">
                <span className="text-[#64748B]">TEMP MIN / MAX</span>
                <span className="font-bold text-[#F4F4F6]">{telemetry.tempMin}° / {telemetry.tempMax}°C</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#22242C]">
                <span className="text-[#64748B]">KINETIC WIND</span>
                <span className="font-bold text-[#F4F4F6]">{telemetry.windSpeed} km/h ({telemetry.windDirection}°)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#22242C]">
                <span className="text-[#64748B]">PRECIPITATION</span>
                <span className="font-bold text-[#F4F4F6]">{telemetry.precipitation} mm</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#22242C]">
                <span className="text-[#64748B]">TURBULENCE SCALE</span>
                <span className="font-bold text-[#F4F4F6]">{vector.noiseScale.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#64748B]">SPIKE AMPLITUDE</span>
                <span className="font-bold text-[#F4F4F6]">{vector.spikeAmplitude.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#111216] border border-[#22242C] rounded-2xl p-5">
            <h3 className="text-xs font-mono-numbers uppercase text-[#94A3B8] font-semibold mb-3">
              DETERMINISTIC VERIFICATION
            </h3>
            <p className="text-xs text-[#64748B] leading-relaxed">
              Every data point is mapped via pure mathematical formulas. Rendering this seed at any time in the future reproduces 100% identical geometry and particle vectors.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
