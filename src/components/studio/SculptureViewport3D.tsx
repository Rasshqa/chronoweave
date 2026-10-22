'use client';

// ponytail: WebGL 3D displaced shader mesh powered by React Three Fiber with preserveDrawingBuffer for 4K export.

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { VisualVector } from '@/lib/mappingEngine';

interface SculptureViewport3DProps {
  vector: VisualVector;
  isPaused?: boolean;
}

// GLSL Noise and Displacement Shader
const customVertexShader = `
  uniform float uTime;
  uniform float uNoiseScale;
  uniform float uSpikeAmplitude;
  uniform float uSpeed;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  // Simple 3D noise
  vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x, 289.0);}
  vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}

  float snoise(vec3 v){
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0 );
    vec4 p = permute( permute( permute(
               i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
             + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
             + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z.xxxx);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );

    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vNormal = normal;
    vPosition = position;

    // Displace normal based on weather turbulence and precipitation
    float noise = snoise(position * uNoiseScale + vec3(uTime * uSpeed * 0.2));
    vDisplacement = noise;

    vec3 newPosition = position + normal * (noise * uSpikeAmplitude);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

const customFragmentShader = `
  uniform vec3 uPrimaryColor;
  uniform vec3 uSecondaryColor;
  uniform vec3 uAccentColor;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vPosition;
  varying float vDisplacement;

  void main() {
    // Basic directional lighting
    vec3 lightDir = normalize(vec3(1.0, 1.5, 2.0));
    float diff = max(dot(normalize(vNormal), lightDir), 0.15);

    // Rim lighting (cyber edge glow)
    vec3 viewDir = normalize(-vPosition);
    float rim = 1.0 - max(dot(viewDir, normalize(vNormal)), 0.0);
    rim = pow(rim, 2.5);

    // Mix colors based on displacement height
    float factor = clamp((vDisplacement + 1.0) * 0.5, 0.0, 1.0);
    vec3 baseColor = mix(uSecondaryColor, uPrimaryColor, factor);

    // Add vibrant rim accent
    vec3 finalColor = baseColor * diff + (uAccentColor * rim * 0.85);

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function DynamicSculptureMesh({
  vector,
  isPaused,
}: {
  vector: VisualVector;
  isPaused?: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uNoiseScale: { value: vector.noiseScale },
      uSpikeAmplitude: { value: vector.spikeAmplitude },
      uSpeed: { value: vector.particleSpeed },
      uPrimaryColor: { value: new THREE.Color(...vector.primaryRgb) },
      uSecondaryColor: { value: new THREE.Color(...vector.secondaryRgb) },
      uAccentColor: { value: new THREE.Color(...vector.accentRgb) },
    }),
    [vector]
  );

  useFrame((_, delta) => {
    if (!isPaused && materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta;
    }
    if (!isPaused && meshRef.current) {
      meshRef.current.rotation.y += delta * vector.particleSpeed * 0.05;
      meshRef.current.rotation.x += delta * vector.particleSpeed * 0.02;
    }
  });

  // Pick geometry from vector
  const geometry = useMemo(() => {
    switch (vector.geometryType) {
      case 'torusKnot':
        return new THREE.TorusKnotGeometry(1.2, 0.42, 128, 32);
      case 'icosahedron':
        return new THREE.IcosahedronGeometry(1.6, 24);
      case 'dodecahedron':
        return new THREE.DodecahedronGeometry(1.6, 16);
      case 'sphere':
      default:
        return new THREE.SphereGeometry(1.6, 64, 64);
    }
  }, [vector.geometryType]);

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.8}>
      <mesh ref={meshRef} geometry={geometry}>
        <shaderMaterial
          ref={materialRef}
          vertexShader={customVertexShader}
          fragmentShader={customFragmentShader}
          uniforms={uniforms}
          wireframe={vector.wireframe}
        />
      </mesh>
    </Float>
  );
}

export default function SculptureViewport3D({
  vector,
  isPaused = false,
}: SculptureViewport3DProps) {
  return (
    <div className="relative w-full h-full min-h-[400px]">
      <Canvas
        id="three-canvas-target"
        camera={{ position: [0, 0, 4.2], fov: 45 }}
        gl={{
          preserveDrawingBuffer: true,
          antialias: true,
          powerPreference: 'high-performance',
        }}
        className="w-full h-full bg-[#070709]"
      >
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color={vector.primaryColor} />
        <pointLight position={[-10, -10, -10]} intensity={1.0} color={vector.accentColor} />
        <DynamicSculptureMesh vector={vector} isPaused={isPaused} />
        <OrbitControls enablePan={true} enableZoom={true} enableRotate={true} />
      </Canvas>
    </div>
  );
}
