import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Fish({ position, color, fishId, onFishClick, isSelected }) {
  const meshRef = useRef();
  const targetPos = useRef(new THREE.Vector3(...position));
  const velocity = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 0.02,
    (Math.random() - 0.5) * 0.01,
    (Math.random() - 0.5) * 0.02
  ));
  
  const swimTime = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    swimTime.current += delta;
    
    const mesh = meshRef.current;
    const bounds = { x: 8, y: 4, z: 3 };
    
    if (Math.random() < 0.01) {
      targetPos.current.set(
        (Math.random() - 0.5) * bounds.x * 2,
        (Math.random() - 0.5) * bounds.y * 2,
        (Math.random() - 0.5) * bounds.z * 2
      );
    }
    
    const direction = new THREE.Vector3()
      .subVectors(targetPos.current, mesh.position)
      .normalize()
      .multiplyScalar(0.015);
    
    velocity.current.lerp(direction, 0.1);
    mesh.position.add(velocity.current);
    
    mesh.position.x = THREE.MathUtils.clamp(mesh.position.x, -bounds.x, bounds.x);
    mesh.position.y = THREE.MathUtils.clamp(mesh.position.y, -bounds.y, bounds.y);
    mesh.position.z = THREE.MathUtils.clamp(mesh.position.z, -bounds.z, bounds.z);
    
    if (velocity.current.length() > 0.001) {
      const targetRotation = Math.atan2(velocity.current.x, velocity.current.z);
      mesh.rotation.y = THREE.MathUtils.lerp(mesh.rotation.y, targetRotation, 0.1);
    }
    
    mesh.position.y += Math.sin(swimTime.current * 2) * 0.002;
  });

  const scale = isSelected ? 1.3 : 1;

  return (
    <mesh
      ref={meshRef}
      position={position}
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
  return (
    <>
      <mesh position={[0, -5, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial color="#0A1628" opacity={0.3} transparent />
      </mesh>
      {[...Array(15)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 20,
            -4.5 + Math.random() * 0.5,
            (Math.random() - 0.5) * 20
          ]}
        >
          <sphereGeometry args={[Math.random() * 0.3 + 0.1, 8, 8]} />
          <meshStandardMaterial color="#1E3A5F" />
        </mesh>
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
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <color attach="background" args={['#050A14']} />
        
        <ambientLight intensity={0.4} />
        <pointLight position={[-10, 10, -10]} intensity={0.8} color="#3B82F6" />
        <pointLight position={[10, 10, 10]} intensity={0.6} color="#8B5CF6" />
        <pointLight position={[0, -5, 5]} intensity={0.3} color="#22D3EE" />
        
        <fog attach="fog" args={['#050A14', 5, 25]} />
        
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
      </Canvas>
    </div>
  );
}