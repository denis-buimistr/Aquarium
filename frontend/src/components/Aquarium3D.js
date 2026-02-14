import React, { useRef, useState, useEffect, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Fish3D({ position, color, fishId, onFishClick, isSelected, fishData }) {
  const groupRef = useRef();
  const [velocity] = useState({
    x: (Math.random() - 0.5) * 0.03,
    y: (Math.random() - 0.5) * 0.015,
    z: (Math.random() - 0.5) * 0.03
  });
  const time = useRef(0);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    time.current += delta;
    const group = groupRef.current;

    // Swimming motion
    group.position.x += velocity.x;
    group.position.y += velocity.y + Math.sin(time.current * 3) * 0.005;
    group.position.z += velocity.z;

    // Boundary bounce
    if (Math.abs(group.position.x) > 10) velocity.x *= -1;
    if (Math.abs(group.position.y) > 5) velocity.y *= -1;
    if (Math.abs(group.position.z) > 8) velocity.z *= -1;

    // Face direction
    const angle = Math.atan2(velocity.x, velocity.z);
    group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, angle, 0.1);

    // Tail wiggle
    if (group.children[2]) {
      group.children[2].rotation.y = Math.sin(time.current * 8) * 0.3;
    }
  });

  const scale = isSelected ? 1.4 : 1;

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
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
      {/* Body */}
      <mesh castShadow>
        <sphereGeometry args={[0.4, 16, 16]} />
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.5 : 0.2}
          shininess={100}
        />
      </mesh>

      {/* Head detail */}
      <mesh position={[0.3, 0, 0]} castShadow>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isSelected ? 0.4 : 0.15}
          shininess={100}
        />
      </mesh>

      {/* Tail */}
      <mesh position={[-0.5, 0, 0]} rotation={[0, 0, 0]} castShadow>
        <coneGeometry args={[0.3, 0.6, 8]} />
        <meshPhongMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.1}
          shininess={80}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* Top fin */}
      <mesh position={[0, 0.3, 0]} rotation={[Math.PI / 3, 0, 0]} castShadow>
        <coneGeometry args={[0.15, 0.3, 6]} />
        <meshPhongMaterial color={color} transparent opacity={0.7} />
      </mesh>

      {/* Side fins */}
      <mesh position={[0.1, -0.1, 0.2]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.05, 0.25, 0.02]} />
        <meshPhongMaterial color={color} transparent opacity={0.6} />
      </mesh>
      <mesh position={[0.1, -0.1, -0.2]} rotation={[0, 0, Math.PI / 4]} castShadow>
        <boxGeometry args={[0.05, 0.25, 0.02]} />
        <meshPhongMaterial color={color} transparent opacity={0.6} />
      </mesh>

      {/* Eyes */}
      <mesh position={[0.45, 0.1, 0.15]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshPhongMaterial color="white" />
      </mesh>
      <mesh position={[0.45, 0.1, -0.15]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshPhongMaterial color="white" />
      </mesh>
      <mesh position={[0.5, 0.1, 0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshPhongMaterial color="black" />
      </mesh>
      <mesh position={[0.5, 0.1, -0.15]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshPhongMaterial color="black" />
      </mesh>

      {/* Glow on selection */}
      {isSelected && (
        <pointLight color={color} intensity={2} distance={2} />
      )}
    </group>
  );
}

function OceanEnvironment() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#4169E1" />
      <pointLight position={[10, -10, 10]} intensity={0.3} color="#00CED1" />

      {/* Ocean floor */}
      <mesh position={[0, -6, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshPhongMaterial color="#1a4d6d" shininess={20} />
      </mesh>

      {/* Floating particles */}
      {[...Array(30)].map((_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 12,
            (Math.random() - 0.5) * 30
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color="#87CEEB" transparent opacity={0.4} />
        </mesh>
      ))}

      {/* Rocks */}
      {[...Array(8)].map((_, i) => (
        <mesh
          key={`rock-${i}`}
          position={[
            (Math.random() - 0.5) * 25,
            -5.5,
            (Math.random() - 0.5) * 25
          ]}
          rotation={[Math.random(), Math.random(), Math.random()]}
          castShadow
        >
          <dodecahedronGeometry args={[Math.random() * 0.5 + 0.3, 0]} />
          <meshPhongMaterial color="#2F4F4F" />
        </mesh>
      ))}

      {/* Fog */}
      <fog attach="fog" args={['#0a2540', 10, 40]} />
    </>
  );
}

export default function Aquarium3D({ fishList, onFishClick, selectedFishId }) {
  if (!fishList || fishList.length === 0) {
    return (
      <div className="fixed inset-0 z-0 flex items-center justify-center" style={{ background: 'linear-gradient(to bottom, #001a33 0%, #003d66 100%)' }}>
        <div className="text-white text-xl">Загрузка аквариума...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        shadows
        camera={{ position: [0, 0, 15], fov: 60 }}
        gl={{ antialias: true, alpha: false }}
        style={{ background: 'linear-gradient(to bottom, #001a33 0%, #003d66 100%)' }}
      >
        <Suspense fallback={null}>
          <OceanEnvironment />
          {fishList.map((fish) => (
            <Fish3D
              key={fish.id}
              fishId={fish.id}
              position={fish.position || [0, 0, 0]}
              color={fish.color}
              fishData={fish}
              onFishClick={onFishClick}
              isSelected={selectedFishId === fish.id}
            />
          ))}
        </Suspense>
      </Canvas>
    </div>
  );
}