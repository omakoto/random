import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface InsoleProps {
  geometry: THREE.BufferGeometry;
}

const Insole: React.FC<InsoleProps> = ({ geometry }) => {
  const meshRef = useRef<THREE.Mesh>(null!);

  // Optional: Add a rotation animation
  useFrame(() => {
    if (meshRef.current) {
      // meshRef.current.rotation.y += 0.005;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#f3e5ab" side={THREE.DoubleSide} />
    </mesh>
  );
};

export default Insole;
