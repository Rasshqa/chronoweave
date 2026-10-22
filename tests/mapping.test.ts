// ponytail: Automated validation ensuring deterministic 100% reproduction of visual vectors.

import assert from 'node:assert';
import { computeVisualVector } from '../src/lib/mappingEngine';
import { generateSeedHash } from '../src/lib/prng';
import { PRESETS } from '../src/lib/presets';

console.log('Running ChronoWeave deterministic mapping test suite...');

// 1. Determinism Test: Same inputs must yield identical hash and visual vector
const sampleA = computeVisualVector(PRESETS[0].telemetry);
const sampleB = computeVisualVector(PRESETS[0].telemetry);

assert.strictEqual(sampleA.seedHash, sampleB.seedHash, 'Seed hash must be 100% deterministic');
assert.strictEqual(sampleA.primaryColor, sampleB.primaryColor, 'Primary color must match exactly');
assert.strictEqual(sampleA.noiseScale, sampleB.noiseScale, 'Noise scale must match exactly');
assert.strictEqual(sampleA.particleSpeed, sampleB.particleSpeed, 'Particle speed must match exactly');
assert.strictEqual(sampleA.spikeAmplitude, sampleB.spikeAmplitude, 'Spike amplitude must match exactly');
assert.strictEqual(sampleA.particleCount, sampleB.particleCount, 'Particle count must match exactly');

// 2. Thermal Zones Verification
// Sub-zero Reykjavik -> Cryo Zone
const cryoVector = computeVisualVector(PRESETS[3].telemetry);
assert.strictEqual(cryoVector.thermalZone, 'cryo', 'Reykjavik sub-zero should map to cryo zone');

// Moderate Bandung -> Temperate Zone
const temperateVector = computeVisualVector(PRESETS[2].telemetry);
assert.strictEqual(temperateVector.thermalZone, 'temperate', 'Bandung moderate should map to temperate zone');

// Scorching Sahara -> Solar Zone
const solarVector = computeVisualVector(PRESETS[4].telemetry);
assert.strictEqual(solarVector.thermalZone, 'solar', 'Sahara 41C should map to solar zone');

// 3. Formula math verification
// Wind formula: noiseScale = 0.6 + (W / 100) * 3.4
const expectedNoise = 0.6 + (88.5 / 100) * 3.4;
assert.ok(Math.abs(sampleA.noiseScale - expectedNoise) < 0.0001, 'Noise scale calculation matches TRD formula');

// Particle speed: 0.5 + W / 25
const expectedSpeed = 0.5 + 88.5 / 25;
assert.ok(Math.abs(sampleA.particleSpeed - expectedSpeed) < 0.0001, 'Particle speed calculation matches TRD formula');

// Precipitation: spikeAmplitude = 0.25 + min(1.5, R / 30)
const expectedSpike = 0.25 + Math.min(1.5, 74.0 / 30);
assert.ok(Math.abs(sampleA.spikeAmplitude - expectedSpike) < 0.0001, 'Spike amplitude calculation matches TRD formula');

console.log('All ChronoWeave deterministic mapping tests PASSED successfully!');
