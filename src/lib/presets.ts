// ponytail: Curated 0-click historical presets for instant aesthetic showcase.

import { TelemetryData } from './mappingEngine';

export interface PresetItem {
  id: string;
  name: string;
  badge: string;
  telemetry: TelemetryData;
}

export const PRESETS: PresetItem[] = [
  {
    id: 'tokyo-typhoon',
    name: 'Tokyo Typhoon Hagibis',
    badge: 'EXTREME STORM',
    telemetry: {
      cityName: 'Tokyo',
      country: 'Japan',
      latitude: 35.68,
      longitude: 139.76,
      date: '2019-10-12',
      title: 'Typhoon Hagibis Apex',
      subtitle: 'Record-breaking Pacific Super Typhoon',
      tempMax: 26.2,
      tempMin: 18.5,
      windSpeed: 88.5,
      windDirection: 140,
      precipitation: 74.0,
    },
  },
  {
    id: 'jakarta-independence',
    name: 'Jakarta Independence Sky',
    badge: 'HISTORIC MOMENT',
    telemetry: {
      cityName: 'Jakarta',
      country: 'Indonesia',
      latitude: -6.2,
      longitude: 106.85,
      date: '1945-08-17',
      title: 'Proclamation of Independence',
      subtitle: 'Pegangsaan Timur Historic Day',
      tempMax: 32.4,
      tempMin: 23.8,
      windSpeed: 14.2,
      windDirection: 70,
      precipitation: 0.0,
    },
  },
  {
    id: 'bandung-cyber-rain',
    name: 'Bandung Mountain Downpour',
    badge: 'CHILL FLOW',
    telemetry: {
      cityName: 'Bandung',
      country: 'Indonesia',
      latitude: -6.91,
      longitude: 107.61,
      date: '2024-02-14',
      title: 'Highland Cyber Rain',
      subtitle: 'Monsoon Mist in Priangan Valley',
      tempMax: 24.8,
      tempMin: 19.2,
      windSpeed: 22.0,
      windDirection: 260,
      precipitation: 38.5,
    },
  },
  {
    id: 'reykjavik-aurora',
    name: 'Reykjavik Polar Gale',
    badge: 'CRYO ZERO',
    telemetry: {
      cityName: 'Reykjavik',
      country: 'Iceland',
      latitude: 64.14,
      longitude: -21.94,
      date: '2021-12-21',
      title: 'Winter Solstice Aurora',
      subtitle: 'Sub-zero North Atlantic Vortex',
      tempMax: -4.5,
      tempMin: -11.2,
      windSpeed: 64.0,
      windDirection: 350,
      precipitation: 12.0,
    },
  },
  {
    id: 'sahara-solar-flare',
    name: 'Sahara Desert Zenith',
    badge: 'SOLAR SURGE',
    telemetry: {
      cityName: 'Tamanrasset',
      country: 'Algeria',
      latitude: 22.79,
      longitude: 5.53,
      date: '2023-07-15',
      title: 'High Summer Solar Wave',
      subtitle: 'Ahaggar Mountains Thermal Peak',
      tempMax: 41.8,
      tempMin: 28.5,
      windSpeed: 34.0,
      windDirection: 110,
      precipitation: 0.0,
    },
  },
];
