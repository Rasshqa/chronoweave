// ponytail: Gallery API with automatic persistence switching between Prisma and memory store.

import { NextRequest, NextResponse } from 'next/server';
import { prisma, memoryGallery, hasDatabaseConnection, MockArtwork } from '@/lib/db';

export async function GET() {
  try {
    const hasDb = await hasDatabaseConnection();
    if (hasDb) {
      const artworks = await prisma.artworkArchive.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      return NextResponse.json({ success: true, artworks, source: 'database' });
    }

    const memoryArtworks = memoryGallery.getAll();
    return NextResponse.json({ success: true, artworks: memoryArtworks, source: 'memory' });
  } catch (error: any) {
    const memoryArtworks = memoryGallery.getAll();
    return NextResponse.json({ success: true, artworks: memoryArtworks, source: 'fallback' });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      title,
      subtitle = '',
      creatorName = 'Anonymous Architect',
      cityName,
      country = 'Global',
      latitude,
      longitude,
      targetDate,
      tempMax,
      tempMin,
      windSpeed,
      windDirection = 0,
      precipitation = 0,
      seedHash,
      renderMode = '3d-sculpture',
      posterTheme = 'obsidian',
    } = body;

    if (!title || !cityName || !targetDate || !seedHash) {
      return NextResponse.json(
        { error: 'Missing required artwork parameters' },
        { status: 400 }
      );
    }

    const hasDb = await hasDatabaseConnection();

    if (hasDb) {
      const artifact = await prisma.artworkArchive.upsert({
        where: { seedHash },
        update: {
          title,
          subtitle,
          creatorName,
          renderMode,
          posterTheme,
        },
        create: {
          title,
          subtitle,
          creatorName,
          cityName,
          country,
          latitude: Number(latitude),
          longitude: Number(longitude),
          targetDate,
          tempMax: Number(tempMax),
          tempMin: Number(tempMin),
          windSpeed: Number(windSpeed),
          windDirection: Number(windDirection),
          precipitation: Number(precipitation),
          seedHash,
          renderMode,
          posterTheme,
        },
      });

      return NextResponse.json({ success: true, artifact, source: 'database' });
    }

    const mockItem: MockArtwork = {
      id: `art-${Date.now()}`,
      title,
      subtitle,
      creatorName,
      cityName,
      country,
      latitude: Number(latitude),
      longitude: Number(longitude),
      targetDate,
      tempMax: Number(tempMax),
      tempMin: Number(tempMin),
      windSpeed: Number(windSpeed),
      windDirection: Number(windDirection),
      precipitation: Number(precipitation),
      seedHash,
      renderMode,
      posterTheme,
      likesCount: 1,
      createdAt: new Date(),
    };

    memoryGallery.add(mockItem);
    return NextResponse.json({ success: true, artifact: mockItem, source: 'memory' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to save artwork' },
      { status: 500 }
    );
  }
}
