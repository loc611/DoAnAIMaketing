import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, RoundedBox } from '@react-three/drei';

function MacBookModel(props) {
  const group = useRef();
  
  // Rotate slowly
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.rotation.y = Math.sin(t / 4) / 4;
    group.current.rotation.x = Math.cos(t / 4) / 8;
  });

  return (
    <group ref={group} {...props} dispose={null}>
      {/* Base/Keyboard part */}
      <RoundedBox args={[3.2, 0.1, 2.2]} radius={0.05} smoothness={4} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#8a8a8e" metalness={0.9} roughness={0.1} />
      </RoundedBox>
      
      {/* Keyboard well */}
      <RoundedBox args={[2.8, 0.01, 1.1]} radius={0.02} smoothness={4} position={[0, 0, -0.4]}>
        <meshStandardMaterial color="#1c1c1e" roughness={0.8} />
      </RoundedBox>
      
      {/* Trackpad */}
      <RoundedBox args={[1.2, 0.01, 0.7]} radius={0.02} smoothness={4} position={[0, 0, 0.6]}>
        <meshStandardMaterial color="#a1a1a6" metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Screen part (angled open) */}
      <group position={[0, 0, -1.05]} rotation={[-Math.PI / 2 + 0.3, 0, 0]}>
        <RoundedBox args={[3.2, 2.2, 0.08]} radius={0.05} smoothness={4} position={[0, 1.1, 0]}>
          <meshStandardMaterial color="#8a8a8e" metalness={0.9} roughness={0.1} />
        </RoundedBox>
        {/* Screen glass/display */}
        <mesh position={[0, 1.1, 0.041]}>
          <planeGeometry args={[3.1, 2.1]} />
          <meshStandardMaterial color="#000000" metalness={0.5} roughness={0.1} emissive="#000010" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </group>
  );
}

export default function MacModel() {
  return (
    <div className="h-[600px] w-full cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.5, 4], fov: 45 }}>
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
        <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={0.5} />
        <Environment preset="city" />
        
        <MacBookModel position={[0, -0.5, 0]} />
        
        <ContactShadows position={[0, -0.6, 0]} opacity={0.4} scale={10} blur={2} far={4} />
        <OrbitControls 
          enableZoom={false} 
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />
      </Canvas>
    </div>
  );
}
