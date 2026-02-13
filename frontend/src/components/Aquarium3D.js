import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function SimpleFish({ position, color, fishId, onFishClick, isSelected }) {
  const meshRef = useRef();
  const time = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    time.current += delta;
    meshRef.current.position.y = position[1] + Math.sin(time.current) * 0.1;
    meshRef.current.rotation.y = time.current * 0.5;
  });

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        onFishClick(fishId);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      <mesh scale={isSelected ? 1.3 : 1}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[-0.3, 0, 0]}>
        <coneGeometry args={[0.15, 0.3, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

function Scene({ fishList, onFishClick, selectedFishId }) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={0.8} color="#3B82F6" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#8B5CF6" />
      
      {fishList && fishList.length > 0 && fishList.map((fish) => (
        <SimpleFish
          key={fish.id}
          fishId={fish.id}
          position={fish.position || [0, 0, 0]}
          color={fish.color || '#4ADE80'}
          onFishClick={onFishClick}
          isSelected={selectedFishId === fish.id}
        />
      ))}
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
        onCreated={(state) => {
          state.gl.setClearColor('#050A14');
        }}
      >
        <Suspense fallback={null}>
          <Scene
            fishList={fishList}
            onFishClick={onFishClick}
            selectedFishId={selectedFishId}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
