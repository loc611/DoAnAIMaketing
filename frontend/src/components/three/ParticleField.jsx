import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

function Particles({ count = 800, color = '#ffffff', size = 0.015, spread = 8, speed = 0.15 }) {
  const mesh = useRef();
  const mouse = useRef({ x: 0, y: 0 });
  const { viewport } = useThree();

  const [positions, velocities] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * spread;
      pos[i * 3 + 1] = (Math.random() - 0.5) * spread;
      pos[i * 3 + 2] = (Math.random() - 0.5) * spread;
      vel[i * 3]     = (Math.random() - 0.5) * speed * 0.01;
      vel[i * 3 + 1] = (Math.random() - 0.5) * speed * 0.01;
      vel[i * 3 + 2] = (Math.random() - 0.5) * speed * 0.01;
    }
    return [pos, vel];
  }, [count, spread, speed]);

  const sizes = useMemo(() => {
    const s = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      s[i] = Math.random() * size + size * 0.3;
    }
    return s;
  }, [count, size]);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    const posArray = mesh.current.geometry.attributes.position.array;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      posArray[i3]     += vel[i3]     + Math.sin(t * 0.3 + i * 0.01) * 0.001;
      posArray[i3 + 1] += vel[i3 + 1] + Math.cos(t * 0.2 + i * 0.01) * 0.001;
      posArray[i3 + 2] += vel[i3 + 2] + Math.sin(t * 0.15 + i * 0.02) * 0.001;

      // Boundary wrapping
      const half = spread / 2;
      if (Math.abs(posArray[i3])     > half) vel[i3]     *= -1;
      if (Math.abs(posArray[i3 + 1]) > half) vel[i3 + 1] *= -1;
      if (Math.abs(posArray[i3 + 2]) > half) vel[i3 + 2] *= -1;
    }

    mesh.current.geometry.attributes.position.needsUpdate = true;
    mesh.current.rotation.y = t * 0.02;
    mesh.current.rotation.x = Math.sin(t * 0.01) * 0.1;
  });

  // Simple animated vel reference
  const vel = velocities;

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        transparent
        opacity={0.7}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

export default function ParticleField({
  height = '100%',
  count = 800,
  color = '#ffffff',
  size = 0.015,
  spread = 8,
  speed = 0.15,
  bgColor = 'transparent',
  className = '',
  style = {},
}) {
  return (
    <div
      className={`particle-field-container ${className}`}
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
        camera={{ position: [0, 0, 5], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
        style={{ background: bgColor }}
      >
        <Particles count={count} color={color} size={size} spread={spread} speed={speed} />
      </Canvas>
    </div>
  );
}
