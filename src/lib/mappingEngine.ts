// ponytail: Deterministic mapping engine translating real-world weather data into 3D and 2D visual vectors.

import { cyrb128, mulberry32, generateSeedHash } from './prng';

export interface TelemetryData {
  cityName: string;
  country: string;
  latitude: number;
  longitude: number;
  date: string; // YYYY-MM-DD
  title: string;
  subtitle?: string;
  tempMax: number; // Celsius
  tempMin: number; // Celsius
  windSpeed: number; // km/h
  windDirection: number; // degrees (0-360)
  precipitation: number; // mm
}

export interface VisualVector {
  seedHash: string;
  tau: number; // Normalized temperature 0-1
  thermalZone: 'cryo' | 'temperate' | 'solar';
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  primaryRgb: [number, number, number]; // 0-1 for shaders
  secondaryRgb: [number, number, number];
  accentRgb: [number, number, number];
  noiseScale: number;
  particleSpeed: number;
  spikeAmplitude: number;
  particleCount: number;
  wireframe: boolean;
  roughness: number;
  metalness: number;
  geometryType: 'torusKnot' | 'icosahedron' | 'dodecahedron' | 'sphere';
}

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (c: number) =>
    Math.round(Math.min(1, Math.max(0, c)) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function lerpColor(hexA: string, hexB: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(hexA);
  const [br, bg, bb] = hexToRgb(hexB);
  const clampedT = Math.min(1, Math.max(0, t));
  return rgbToHex(
    ar + (br - ar) * clampedT,
    ag + (bg - ag) * clampedT,
    ab + (bb - ab) * clampedT
  );
}

export function computeVisualVector(telemetry: TelemetryData): VisualVector {
  const { latitude, longitude, date, title, tempMax, windSpeed, precipitation } = telemetry;

  // 1. Seed Hash Generation
  const seedString = `:${latitude.toFixed(2)}:${longitude.toFixed(2)}:${date}:${title.trim().toLowerCase()}`;
  const [h1] = cyrb128(seedString);
  const seedHash = generateSeedHash(latitude, longitude, date, title);
  const rand = mulberry32(h1);

  // 2. Thermal Color Interpolation (T_max in [-10C, 42C])
  // tau = clamp((T_max + 10) / 52, 0, 1)
  const tau = Math.min(1, Math.max(0, (tempMax + 10) / 52));

  let primaryColor: string;
  let secondaryColor: string;
  let accentColor: string;
  let thermalZone: VisualVector['thermalZone'];

  if (tau < 0.35) {
    // Cryo Zone: Cyber Cyan (#00F0FF) to Deep Cobalt (#3B82F6)
    thermalZone = 'cryo';
    const localT = tau / 0.35;
    primaryColor = lerpColor('#00F0FF', '#3B82F6', localT);
    secondaryColor = lerpColor('#3B82F6', '#1E3A8A', localT);
    accentColor = '#00F0FF';
  } else if (tau <= 0.7) {
    // Temperate Zone: Cyber Cyan (#00F0FF), Violet (#8B5CF6), Electric Gold (#FFB800)
    thermalZone = 'temperate';
    const localT = (tau - 0.35) / 0.35;
    if (localT < 0.5) {
      primaryColor = lerpColor('#00F0FF', '#8B5CF6', localT * 2);
      secondaryColor = lerpColor('#8B5CF6', '#4C1D95', localT * 2);
      accentColor = '#FFB800';
    } else {
      primaryColor = lerpColor('#8B5CF6', '#FFB800', (localT - 0.5) * 2);
      secondaryColor = lerpColor('#4C1D95', '#D97706', (localT - 0.5) * 2);
      accentColor = '#00F0FF';
    }
  } else {
    // Solar Zone: Hyper-Orange (#FF5500) to Plasma Crimson (#FF0055)
    thermalZone = 'solar';
    const localT = (tau - 0.7) / 0.3;
    primaryColor = lerpColor('#FF5500', '#FF0055', localT);
    secondaryColor = lerpColor('#991B1B', '#FF2A54', localT);
    accentColor = '#FFB800';
  }

  // 3. Wind Turbulence & Noise Frequency (W_max in [0, 100] km/h)
  const clampedWind = Math.min(100, Math.max(0, windSpeed));
  const noiseScale = 0.6 + (clampedWind / 100) * 3.4;
  const particleSpeed = 0.5 + clampedWind / 25;

  // 4. Precipitation & Geometry Complexity (R_sum in [0, 100] mm)
  const clampedPrecip = Math.min(100, Math.max(0, precipitation));
  const spikeAmplitude = 0.25 + Math.min(1.5, clampedPrecip / 30);
  const particleCount = 1500 + Math.floor(Math.min(4000, clampedPrecip * 60));

  // Determinstic geometry picking via PRNG
  const geoRoll = rand();
  let geometryType: VisualVector['geometryType'];
  if (geoRoll < 0.35) {
    geometryType = 'torusKnot';
  } else if (geoRoll < 0.65) {
    geometryType = 'icosahedron';
  } else if (geoRoll < 0.85) {
    geometryType = 'dodecahedron';
  } else {
    geometryType = 'sphere';
  }

  const wireframe = rand() < 0.25;
  const roughness = 0.2 + rand() * 0.4;
  const metalness = 0.4 + rand() * 0.5;

  return {
    seedHash,
    tau,
    thermalZone,
    primaryColor,
    secondaryColor,
    accentColor,
    primaryRgb: hexToRgb(primaryColor),
    secondaryRgb: hexToRgb(secondaryColor),
    accentRgb: hexToRgb(accentColor),
    noiseScale,
    particleSpeed,
    spikeAmplitude,
    particleCount,
    wireframe,
    roughness,
    metalness,
    geometryType,
  };
}
