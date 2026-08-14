import React, { useRef, useState, useEffect, Component } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, OrbitControls, Environment, Lightformer } from '@react-three/drei';

class WebGLErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('WebGL Rendering Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d12]/90 backdrop-blur-2xl rounded-[2.5rem] border border-[#d4af37]/30 p-8 text-center">
          <div className="w-20 h-20 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mb-4 text-[#e5c158] shadow-[0_0_30px_rgba(212,175,55,0.25)]">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Pig Store 3D Experience</h3>
          <p className="text-sm text-white/60 max-w-sm">Trải nghiệm thị giác 3D kỹ thuật số đang chạy ở chế độ đồ họa tối ưu.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

function FloatingObject() {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.position.x = state.pointer.x * 0.3;
      meshRef.current.position.y = state.pointer.y * 0.3;
    }
  });

  return (
    <Float speed={1.8} rotationIntensity={1} floatIntensity={1.2}>
      <mesh ref={meshRef} scale={1.7}>
        <torusKnotGeometry args={[1, 0.35, 96, 24]} />
        <meshPhysicalMaterial
          color="#e5c158"
          metalness={0.15}
          roughness={0.08}
          transmission={0.92}
          thickness={0.8}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.1}
          reflectivity={0.9}
        />
      </mesh>
    </Float>
  );
}

function WebGLContextHandler({ children }) {
  const [contextLost, setContextLost] = useState(false);
  const containerRef = useRef();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let canvasEl = container.querySelector('canvas');

    const handleContextLost = (e) => {
      e.preventDefault();
      console.warn('WebGL context lost event detected on canvas.');
      setContextLost(true);
    };

    const handleContextRestored = () => {
      console.log('WebGL context restored on canvas.');
      setContextLost(false);
    };

    // Use MutationObserver in case canvas is mounted asynchronously by R3F
    const observer = new MutationObserver(() => {
      const currentCanvas = container.querySelector('canvas');
      if (currentCanvas && currentCanvas !== canvasEl) {
        if (canvasEl) {
          canvasEl.removeEventListener('webglcontextlost', handleContextLost);
          canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);
        }
        canvasEl = currentCanvas;
        canvasEl.addEventListener('webglcontextlost', handleContextLost, false);
        canvasEl.addEventListener('webglcontextrestored', handleContextRestored, false);
      }
    });

    observer.observe(container, { childList: true, subtree: true });

    if (canvasEl) {
      canvasEl.addEventListener('webglcontextlost', handleContextLost, false);
      canvasEl.addEventListener('webglcontextrestored', handleContextRestored, false);
    }

    return () => {
      observer.disconnect();
      if (canvasEl) {
        canvasEl.removeEventListener('webglcontextlost', handleContextLost);
        canvasEl.removeEventListener('webglcontextrestored', handleContextRestored);
      }
    };
  }, []);

  if (contextLost) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d0d12]/90 backdrop-blur-2xl rounded-[2.5rem] border border-[#d4af37]/30 p-8 text-center">
        <div className="w-20 h-20 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/30 flex items-center justify-center mb-4 text-[#e5c158] shadow-[0_0_30px_rgba(212,175,55,0.25)]">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10l-2 1m0 0l-2-1m2 1v2.5M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Pig Store 3D Experience</h3>
        <p className="text-sm text-white/60 max-w-sm mb-4">Trải nghiệm thị giác 3D kỹ thuật số đang chạy ở chế độ đồ họa tối ưu.</p>
        <button 
          onClick={() => setContextLost(false)}
          className="px-5 py-2.5 rounded-full border border-[#d4af37]/40 text-[#e5c158] text-xs font-bold uppercase tracking-widest hover:bg-[#d4af37]/10 transition-colors shadow-[0_0_15px_rgba(212,175,55,0.2)]"
        >
          Khôi Phục 3D Canvas
        </button>
      </div>
    );
  }

  return <div ref={containerRef} className="w-full h-full">{children}</div>;
}

export default function Hero3DCanvas() {
  return (
    <WebGLErrorBoundary>
      <div className="w-full h-[450px] md:h-[600px] relative pointer-events-auto">
        <WebGLContextHandler>
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [0, 0, 6], fov: 45 }}
            gl={{ 
              antialias: true, 
              alpha: true, 
              powerPreference: 'high-performance',
              failIfMajorPerformanceCaveat: false,
              preserveDrawingBuffer: false
            }}
            onCreated={({ gl }) => {
              gl.domElement.addEventListener('webglcontextlost', (e) => {
                e.preventDefault();
              }, false);
            }}
          >
            <ambientLight intensity={0.6} />
            <directionalLight position={[10, 10, 5]} intensity={1.8} color="#ffffff" />
            <pointLight position={[-10, -10, -10]} intensity={1.2} color="#d4af37" />

            <FloatingObject />

            <Environment preset="city">
              <Lightformer form="rect" intensity={2} color="#ffffff" position={[0, 5, -5]} scale={[10, 10, 1]} />
              <Lightformer form="ring" intensity={1.5} color="#e5c158" position={[-5, 2, -2]} scale={[5, 5, 1]} />
            </Environment>

            <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={0.5} />
          </Canvas>
        </WebGLContextHandler>
      </div>
    </WebGLErrorBoundary>
  );
}
