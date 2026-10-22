// ponytail: Dual-layer persistence with Prisma and in-memory store for offline and zero-config deployment.

import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export interface MockArtwork {
  id: string;
  title: string;
  subtitle?: string;
  creatorName: string;
  cityName: string;
  country: string;
  latitude: number;
  longitude: number;
  targetDate: string;
  tempMax: number;
  tempMin: number;
  windSpeed: number;
  windDirection: number;
  precipitation: number;
  seedHash: string;
  renderMode: string;
  posterTheme: string;
  likesCount: number;
  createdAt: Date;
}

class MemoryGallery {
  private items: Map<string, MockArtwork> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const seeds: MockArtwork[] = [
      {
        id: 'art-tokyo',
        title: 'Typhoon Hagibis Apex',
        subtitle: 'Record-breaking Pacific Super Typhoon',
        creatorName: 'Kaito Tanaka',
        cityName: 'Tokyo',
        country: 'Japan',
        latitude: 35.68,
        longitude: 139.76,
        targetDate: '2019-10-12',
        tempMax: 26.2,
        tempMin: 18.5,
        windSpeed: 88.5,
        windDirection: 140,
        precipitation: 74.0,
        seedHash: 'E8A42D11',
        renderMode: '3d-sculpture',
        posterTheme: 'obsidian',
        likesCount: 142,
        createdAt: new Date(Date.now() - 3600000 * 24),
      },
      {
        id: 'art-jakarta',
        title: 'Proclamation of Independence',
        subtitle: 'Pegangsaan Timur Historic Day',
        creatorName: 'Dewi Sartika',
        cityName: 'Jakarta',
        country: 'Indonesia',
        latitude: -6.2,
        longitude: 106.85,
        targetDate: '1945-08-17',
        tempMax: 32.4,
        tempMin: 23.8,
        windSpeed: 14.2,
        windDirection: 70,
        precipitation: 0.0,
        seedHash: '72F9B8A3',
        renderMode: '2d-flowfield',
        posterTheme: 'archival-white',
        likesCount: 98,
        createdAt: new Date(Date.now() - 3600000 * 48),
      },
      {
        id: 'art-bandung',
        title: 'Highland Cyber Rain',
        subtitle: 'Monsoon Mist in Priangan Valley',
        creatorName: 'Rasshqa',
        cityName: 'Bandung',
        country: 'Indonesia',
        latitude: -6.91,
        longitude: 107.61,
        targetDate: '2024-02-14',
        tempMax: 24.8,
        tempMin: 19.2,
        windSpeed: 22.0,
        windDirection: 260,
        precipitation: 38.5,
        seedHash: '34C198F0',
        renderMode: '3d-sculpture',
        posterTheme: 'obsidian',
        likesCount: 230,
        createdAt: new Date(Date.now() - 3600000 * 12),
      },
    ];

    seeds.forEach((item) => this.items.set(item.seedHash, item));
  }

  getAll(): MockArtwork[] {
    return Array.from(this.items.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  getByHash(seedHash: string): MockArtwork | undefined {
    return this.items.get(seedHash.toUpperCase());
  }

  add(artwork: MockArtwork): void {
    this.items.set(artwork.seedHash.toUpperCase(), artwork);
  }

  like(seedHash: string): number {
    const art = this.items.get(seedHash.toUpperCase());
    if (art) {
      art.likesCount += 1;
      return art.likesCount;
    }
    return 0;
  }
}

export const memoryGallery = new MemoryGallery();

let isPrismaReady: boolean | null = null;

export async function hasDatabaseConnection(): Promise<boolean> {
  if (isPrismaReady !== null) return isPrismaReady;
  if (!process.env.DATABASE_URL) {
    isPrismaReady = false;
    return false;
  }
  try {
    await prisma.$connect();
    isPrismaReady = true;
    return true;
  } catch {
    isPrismaReady = false;
    return false;
  }
}
