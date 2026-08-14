import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Orb({ position, color, size, speed }) {
  const meshRef = useRef();
  const initialPos = useMemo(() => [...position], [position]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    meshRef.current.position.x = initialPos[0] + Math.sin(t * speed * 0.4 + initialPos[1]) * 1.5;
    meshRef.current.position.y = initialPos[1] + Math.cos(t * speed * 0.3 + initialPos[0]) * 1.2;
    meshRef.current.position.z = initialPos[2] + Math.sin(t * speed * 0.2) * 0.5;
    
    // Pulsing size
    const scale = 1 + Math.sin(t * speed * 0.8) * 0.2;
    meshRef.current.scale.setScalar(scale);
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.5}
        transparent
        opacity={0.4}
        roughness={0.1}
        metalness={0.1}
      />
    </mesh>
  );
}

function OrbsScene({ orbs }) {
  return (
    <group>
      {orbs.map((orb, i) => (
        <Orb key={i} {...orb} />
      ))}
    </group>
  );
}

export default function GlowOrbs({
  height = '100%',
  colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'],
  count = 5,
  baseSize = 0.8,
  speed = 1,
  className = '',
  style = {},
}) {
  const orbs = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      position: [
        (Math.random() - 0.5) * 8,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2,
      ],
      color: colors[i % colors.length],
      size: baseSize * (0.5 + Math.random() * 0.8),
      speed: speed * (0.6 + Math.random() * 0.8),
    }));
  }, [count, colors, baseSize, speed]);

  return (
    <div
      className={`glow-orbs-container ${className}`}
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
        camera={{ position: [0, 0, 8], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <ambientLight intensity={0.1} />
        <OrbsScene orbs={orbs} />
      </Canvas>
    </div>
  );
}
