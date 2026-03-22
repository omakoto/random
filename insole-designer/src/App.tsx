import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import InsoleForm from './components/InsoleForm';
import Insole from './components/Insole';
import type { InsoleParameters } from './lib/generateInsole';
import {
  generateInsoleGeometry,
  defaultParams,
} from './lib/generateInsole';
import './index.css'; // We will use index.css for global styles

const App: React.FC = () => {
  const [geometry, setGeometry] = useState<THREE.BufferGeometry | null>(null);

  const handleGenerate = (params: InsoleParameters) => {
    const newGeometry = generateInsoleGeometry(params);
    setGeometry(newGeometry);
  };

  // Generate the initial default insole
  React.useEffect(() => {
    handleGenerate(defaultParams);
  }, []);

  return (
    <div className="app-container">
      <div className="form-panel">
        <InsoleForm setParameters={handleGenerate} />
      </div>
      <div className="canvas-panel">
        <Canvas
          dpr={[1, 2]}
          shadows
          camera={{ fov: 45, position: [-200, 200, 350] }}
          onCreated={({ gl }) => {
            gl.shadowMap.type = THREE.PCFShadowMap;
          }}
        >
          <Suspense fallback={null}>
            <Environment preset="city" background blur={0.6} />
            <ambientLight intensity={0.5} />
            <directionalLight
              position={[50, 100, 50]}
              intensity={1.5}
              castShadow
              shadow-mapSize-width={1024}
              shadow-mapSize-height={1024}
            />
            {geometry && <Insole geometry={geometry} />}
          </Suspense>
          <OrbitControls makeDefault />
        </Canvas>
      </div>
    </div>
  );
};

export default App;
