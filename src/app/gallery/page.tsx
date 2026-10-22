'use client';

// ponytail: Community gallery showcasing minted data sculptures with instant filtering, search, and load into studio.

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Sparkles, Thermometer, Wind, Droplets, Box, Compass, RefreshCw, Layers } from 'lucide-react';
import { MockArtwork } from '@/lib/db';

type FilterCategory = 'all' | '3d-sculpture' | '2d-flowfield' | 'glacial' | 'temperate' | 'tropical';

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<MockArtwork[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');

  useEffect(() => {
    async function loadGallery() {
      try {
        const res = await fetch('/api/gallery');
        if (res.ok) {
          const data = await res.json();
          setArtworks(data.artworks || []);
        }
      } catch {
        // Fallback silently
      } finally {
        setIsLoading(false);
      }
    }
    loadGallery();
  }, []);

  const filteredArtworks = useMemo(() => {
    return artworks.filter((art) => {
      // Search query filter
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchTitle = art.title.toLowerCase().includes(q);
        const matchCity = art.cityName.toLowerCase().includes(q);
        const matchCountry = art.country.toLowerCase().includes(q);
        const matchCreator = art.creatorName.toLowerCase().includes(q);
        const matchSeed = art.seedHash.toLowerCase().includes(q);
        if (!matchTitle && !matchCity && !matchCountry && !matchCreator && !matchSeed) {
          return false;
        }
      }

      // Category filter
      if (activeFilter === '3d-sculpture') return art.renderMode === '3d-sculpture';
      if (activeFilter === '2d-flowfield') return art.renderMode === '2d-flowfield';
      if (activeFilter === 'glacial') return art.tempMax < 10;
      if (activeFilter === 'temperate') return art.tempMax >= 10 && art.tempMax <= 25;
      if (activeFilter === 'tropical') return art.tempMax > 25;

      return true;
    });
  }, [artworks, searchQuery, activeFilter]);

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6] flex flex-col">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#22242C] bg-[#111216] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-mono-numbers text-[#94A3B8] hover:text-[#FF5500] transition-colors min-h-[44px] px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK TO STUDIO</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00F0FF] animate-pulse" />
          <span className="text-xs font-mono-numbers uppercase tracking-widest text-[#00F0FF] font-semibold">
            COMMUNITY ARCHIVE
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8">
        <div className="mb-8 border-b border-[#22242C] pb-6">
          <div className="flex items-center gap-2 text-xs font-mono-numbers text-[#FF5500] uppercase mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MINTED DATA SCULPTURES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-tight text-[#F4F4F6]">
            Public Memorabilia Gallery
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1 max-w-2xl">
            Explore deterministic 3D sculptures and particle flows generated from historical weather records across the globe.
          </p>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {(
              [
                { id: 'all', label: 'All Artifacts' },
                { id: '3d-sculpture', label: '3D Sculptures' },
                { id: '2d-flowfield', label: '2D Flow-Fields' },
                { id: 'glacial', label: 'Glacial (<10°C)' },
                { id: 'temperate', label: 'Temperate (10-25°C)' },
                { id: 'tropical', label: 'Tropical (>25°C)' },
              ] as const
            ).map((filter) => (
              <button
                key={filter.id}
                type="button"
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 py-2 text-xs font-mono-numbers rounded-lg border transition-all whitespace-nowrap min-h-[44px] flex items-center cursor-pointer ${
                  activeFilter === filter.id
                    ? 'bg-[#FF5500]/15 border-[#FF5500] text-[#FF5500] font-bold'
                    : 'bg-[#111216] border-[#22242C] text-[#94A3B8] hover:text-[#F4F4F6] hover:border-[#00F0FF]'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72 shrink-0">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search city, country, title..."
              className="w-full bg-[#111216] border border-[#22242C] focus:border-[#00F0FF] rounded-lg px-3.5 py-2.5 pl-9 text-xs text-[#F4F4F6] placeholder-[#64748B] transition-colors min-h-[44px]"
            />
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-3.5 pointer-events-none" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#94A3B8]">
            <div className="w-8 h-8 border-2 border-[#00F0FF] border-t-transparent rounded-full animate-spin mb-3" />
            <span className="text-xs font-mono-numbers uppercase">LOADING ARCHIVE RECORDS...</span>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[#111216] border border-[#22242C] rounded-xl text-center p-6">
            <Layers className="w-10 h-10 text-[#64748B] mb-3" />
            <h3 className="text-base font-bold text-[#F4F4F6] uppercase">No Matching Artifacts Found</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mt-1 mb-4">
              No historical data sculptures match the current category filter or search keywords.
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-[#FF5500] text-black font-bold text-xs rounded-lg hover:bg-[#E04B00] transition-colors min-h-[44px] flex items-center cursor-pointer"
            >
              RESET ALL FILTERS
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredArtworks.map((art) => (
              <div
                key={art.seedHash}
                className="bg-[#111216] border border-[#22242C] hover:border-[#FF5500]/60 rounded-xl p-5 flex flex-col justify-between transition-all group hover:shadow-xl hover:shadow-[#FF5500]/5"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-mono-numbers font-bold text-[#FF5500] bg-[#FF5500]/10 px-2 py-0.5 rounded border border-[#FF5500]/20">
                      #{art.seedHash}
                    </span>
                    <span className="text-[11px] font-mono-numbers text-[#94A3B8] flex items-center gap-1">
                      <Box className="w-3 h-3 text-[#00F0FF]" />
                      {art.renderMode.toUpperCase()}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-[#F4F4F6] group-hover:text-[#FF5500] transition-colors uppercase leading-snug">
                    {art.title}
                  </h2>
                  <p className="text-xs text-[#94A3B8] mt-0.5 mb-4">
                    {art.cityName}, {art.country} // {art.targetDate}
                  </p>

                  <div className="grid grid-cols-3 gap-2 bg-[#070709] p-2.5 rounded-lg border border-[#22242C] text-xs font-mono-numbers mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                        <Thermometer className="w-3 h-3 text-[#FF5500]" /> TEMP
                      </span>
                      <span className="font-bold text-[#F4F4F6] mt-0.5">{art.tempMax}°C</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                        <Wind className="w-3 h-3 text-[#00F0FF]" /> WIND
                      </span>
                      <span className="font-bold text-[#F4F4F6] mt-0.5">{art.windSpeed}k</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-[#3B82F6]" /> RAIN
                      </span>
                      <span className="font-bold text-[#F4F4F6] mt-0.5">{art.precipitation}m</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#22242C]">
                  <span className="text-[11px] text-[#64748B] font-mono-numbers">
                    BY {art.creatorName.toUpperCase()}
                  </span>
                  <Link
                    href={`/artifact/${art.seedHash}`}
                    className="text-xs font-bold font-mono-numbers text-[#00F0FF] hover:underline min-h-[44px] flex items-center"
                  >
                    INSPECT ARTIFACT →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
