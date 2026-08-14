import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Shape({ position, rotation, geometry, color, speed, floatAmplitude }) {
  const meshRef = useRef();
  const initialPos = useMemo(() => [...position], [position]);
  const rotSpeed = useMemo(() => [
    (Math.random() - 0.5) * speed,
    (Math.random() - 0.5) * speed,
    (Math.random() - 0.5) * speed,
  ], [speed]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.rotation.x += rotSpeed[0] * 0.01;
    meshRef.current.rotation.y += rotSpeed[1] * 0.01;
    meshRef.current.rotation.z += rotSpeed[2] * 0.005;
    meshRef.current.position.y = initialPos[1] + Math.sin(t * 0.5 + initialPos[0]) * floatAmplitude;
    meshRef.current.position.x = initialPos[0] + Math.cos(t * 0.3 + initialPos[1]) * floatAmplitude * 0.5;
  });

  return (
    <mesh ref={meshRef} position={position} rotation={rotation}>
      {geometry}
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.15}
        roughness={0.2}
        metalness={0.8}
        wireframe={Math.random() > 0.5}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

function GeometryScene({ count = 12, spread = 10, colors, speed = 1, floatAmplitude = 0.5 }) {
  const shapes = useMemo(() => {
    const geometries = [
      <icosahedronGeometry args={[0.5, 0]} />,
      <octahedronGeometry args={[0.5, 0]} />,
      <dodecahedronGeometry args={[0.4, 0]} />,
      <torusGeometry args={[0.4, 0.15, 8, 16]} />,
      <tetrahedronGeometry args={[0.5, 0]} />,
      <torusKnotGeometry args={[0.3, 0.1, 32, 8]} />,
    ];

    const defaultColors = ['#667eea', '#764ba2', '#00d2ff', '#a18cd1', '#fbc2eb', '#6dd5fa'];
    const colorPalette = colors || defaultColors;

    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * (spread * 0.5) - 2,
      ],
      rotation: [
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI,
      ],
      geometry: geometries[Math.floor(Math.random() * geometries.length)],
      color: colorPalette[Math.floor(Math.random() * colorPalette.length)],
      speed: speed * (0.5 + Math.random()),
      floatAmplitude: floatAmplitude * (0.5 + Math.random()),
    }));
  }, [count, spread, colors, speed, floatAmplitude]);

  return (
    <group>
      {shapes.map((props, i) => (
        <Shape key={i} {...props} />
      ))}
    </group>
  );
}

export default function FloatingGeometry({
  height = '100%',
  count = 12,
  spread = 10,
  colors,
  speed = 1,
  floatAmplitude = 0.5,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`floating-geometry-container ${className}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height,
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[5, 5, 5]} intensity={0.5} />
        <GeometryScene count={count} spread={spread} colors={colors} speed={speed} floatAmplitude={floatAmplitude} />
      </Canvas>
    </div>
  );
}
