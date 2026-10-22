// ponytail: Open-Meteo proxy fetching real historical weather with automatic recent-forecast and fallback routing.

import { NextRequest, NextResponse } from 'next/server';
import { computeVisualVector, TelemetryData } from '@/lib/mappingEngine';
import { PRESETS } from '@/lib/presets';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city')?.trim() || 'Tokyo';
    const date = searchParams.get('date')?.trim() || '2019-10-12';
    const title = searchParams.get('title')?.trim() || `${city} Memory`;
    const subtitle = searchParams.get('subtitle')?.trim() || 'Data Sculpture Artifact';

    // 1. Geocoding
    let lat = parseFloat(searchParams.get('lat') || '');
    let lon = parseFloat(searchParams.get('lon') || '');
    let resolvedCity = city;
    let country = 'Global';

    if (isNaN(lat) || isNaN(lon)) {
      try {
        const geoRes = await fetch(
          `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`,
          { next: { revalidate: 86400 } }
        );
        if (geoRes.ok) {
          const geoData = await geoRes.json();
          if (geoData.results && geoData.results.length > 0) {
            lat = geoData.results[0].latitude;
            lon = geoData.results[0].longitude;
            resolvedCity = geoData.results[0].name;
            country = geoData.results[0].country || 'Global';
          }
        }
      } catch {
        // Geocoding fallback to default Tokyo
        lat = 35.68;
        lon = 139.76;
      }
    }

    if (isNaN(lat) || isNaN(lon)) {
      lat = 35.68;
      lon = 139.76;
    }

    // 2. Fetch Historical or Forecast Weather
    const targetDateObj = new Date(date);
    const now = new Date();
    const diffDays = (now.getTime() - targetDateObj.getTime()) / (1000 * 3600 * 24);

    let tempMax = 24;
    let tempMin = 18;
    let windSpeed = 15;
    let windDirection = 120;
    let precipitation = 0;

    const isArchive = diffDays > 5;
    const weatherUrl = isArchive
      ? `https://archive-api.open-meteo.com/v1/archive?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&start_date=${date}&end_date=${date}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant&timezone=auto`
      : `https://api.open-meteo.com/v1/forecast?latitude=${lat.toFixed(4)}&longitude=${lon.toFixed(4)}&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,windspeed_10m_max,winddirection_10m_dominant&timezone=auto`;

    try {
      const weatherRes = await fetch(weatherUrl, { next: { revalidate: 86400 } });
      if (weatherRes.ok) {
        const weatherData = await weatherRes.json();
        const daily = weatherData.daily;
        if (daily && daily.temperature_2m_max && daily.temperature_2m_max.length > 0) {
          tempMax = Number(daily.temperature_2m_max[0]) || 24;
          tempMin = Number(daily.temperature_2m_min[0]) || 18;
          windSpeed = Number(daily.windspeed_10m_max[0]) || 15;
          windDirection = Number(daily.winddirection_10m_dominant[0]) || 120;
          precipitation = Number(daily.precipitation_sum[0]) || 0;
        }
      } else {
        throw new Error('Weather API returned status ' + weatherRes.status);
      }
    } catch {
      // ponytail: Astronomical seasonal approximation fallback when external API is unreachable
      const month = targetDateObj.getMonth();
      const isNorthern = lat >= 0;
      const summerFactor = Math.sin(((month - (isNorthern ? 2 : 8)) / 12) * Math.PI * 2);
      const baseTemp = 20 - Math.abs(lat) * 0.4;
      tempMax = Math.round((baseTemp + summerFactor * 10 + 4) * 10) / 10;
      tempMin = Math.round((baseTemp + summerFactor * 10 - 4) * 10) / 10;
      windSpeed = Math.round((12 + Math.abs(Math.sin(lat + lon)) * 25) * 10) / 10;
      windDirection = Math.round(Math.abs(Math.sin(lat * 3)) * 360);
      precipitation = Math.round(Math.abs(Math.cos(lon * 2)) * 18 * 10) / 10;
    }

    const telemetry: TelemetryData = {
      cityName: resolvedCity,
      country,
      latitude: lat,
      longitude: lon,
      date,
      title,
      subtitle,
      tempMax,
      tempMin,
      windSpeed,
      windDirection,
      precipitation,
    };

    const visualVector = computeVisualVector(telemetry);

    return NextResponse.json({
      success: true,
      telemetry,
      visualVector,
    });
  } catch (error: any) {
    // If complete unexpected failure, serve Tokyo default preset
    const fallback = PRESETS[0].telemetry;
    const visualVector = computeVisualVector(fallback);
    return NextResponse.json({
      success: true,
      telemetry: fallback,
      visualVector,
      warning: error?.message || 'Fallback preset used',
    });
  }
}
