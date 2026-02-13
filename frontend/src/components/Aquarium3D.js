import React, { useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Fish({ position, color, fishId, onFishClick, isSelected }) {
  const meshRef = useRef();
  const [localPosition] = useState(position);
  const [velocity] = useState(() => ({
    x: (Math.random() - 0.5) * 0.02,
    y: (Math.random() - 0.5) * 0.01,
    z: (Math.random() - 0.5) * 0.02
  }));
  
  const time = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    try {
      time.current += delta;
      
      const mesh = meshRef.current;
      
      mesh.position.x += velocity.x;
      mesh.position.y += velocity.y + Math.sin(time.current * 2) * 0.002;
      mesh.position.z += velocity.z;
      
      if (Math.abs(mesh.position.x) > 8) velocity.x *= -1;
      if (Math.abs(mesh.position.y) > 4) velocity.y *= -1;
      if (Math.abs(mesh.position.z) > 3) velocity.z *= -1;
      
      if (Math.abs(velocity.x) > 0.001) {
        mesh.rotation.y = Math.atan2(velocity.x, velocity.z);
      }
    } catch (error) {
      console.error('Fish animation error:', error);
    }
  });

  const scale = isSelected ? 1.3 : 1;

  return (
    <mesh
      ref={meshRef}
      position={localPosition}
      scale={scale}
      onClick={(e) => {
        e.stopPropagation();
        onFishClick(fishId);
      }}
      onPointerOver={() => document.body.style.cursor = 'pointer'}
      onPointerOut={() => document.body.style.cursor = 'default'}
    >
      <group>
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.5 : 0.2}
          />
        </mesh>
        <mesh position={[-0.35, 0, 0]} rotation={[0, 0, Math.PI / 4]}>
          <coneGeometry args={[0.2, 0.4, 8]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={isSelected ? 0.4 : 0.15}
          />
        </mesh>
        <mesh position={[0.1, 0.15, 0]} rotation={[Math.PI / 3, 0, 0]}>
          <coneGeometry args={[0.08, 0.15, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
        </mesh>
        <mesh position={[0.1, -0.15, 0]} rotation={[-Math.PI / 3, 0, 0]}>
          <coneGeometry args={[0.08, 0.15, 6]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.1} />
        </mesh>
      </group>
    </mesh>
  );
}

function OceanFloor() {
  const rocks = useMemo(() => {
    return [...Array(15)].map((_, i) => ({
      key: i,
      position: [
        (Math.random() - 0.5) * 20,
        -4.5 + Math.random() * 0.5,
        (Math.random() - 0.5) * 20
      ],
      size: Math.random() * 0.3 + 0.1
    }));
  }, []);

  return (
    <>
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0A1628" opacity={0.3} transparent />
      </mesh>
      {rocks.map(rock => (
        <mesh key={rock.key} position={rock.position}>
          <sphereGeometry args={[rock.size, 8, 8]} />
          <meshStandardMaterial color="#1E3A5F" />
        </mesh>
      ))}
    </>
  );
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[-10, 10, -10]} intensity={0.8} color="#3B82F6" />
      <pointLight position={[10, 10, 10]} intensity={0.6} color="#8B5CF6" />
      <pointLight position={[0, -5, 5]} intensity={0.3} color="#22D3EE" />
    </>
  );
}

export default function Aquarium3D({ fishList, onFishClick, selectedFishId }) {
  if (!fishList || fishList.length === 0) {
    return (
      <div className="fixed inset-0 z-0 flex items-center justify-center bg-[#050A14]">
        <div className="text-white text-xl">Загрузка аквариума...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050A14']} />
        <fog attach="fog" args={['#050A14', 5, 25]} />
        
        <Suspense fallback={null}>
          <Lights />
          <OceanFloor />
          
          {fishList.map((fish) => (
            <Fish
              key={fish.id}
              fishId={fish.id}
              position={fish.position}
              color={fish.color}
              onFishClick={onFishClick}
              isSelected={selectedFishId === fish.id}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}