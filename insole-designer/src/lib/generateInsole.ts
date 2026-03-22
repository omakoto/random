import * as THREE from 'three';

export interface InsoleParameters {
  footLength: number;
  heelWidth: number;
  ballWidth: number;
  waistWidth: number;
  archHeight: number;
}

export const defaultParams: InsoleParameters = {
  footLength: 270,
  heelWidth: 60,
  ballWidth: 90,
  waistWidth: 50,
  archHeight: 20,
};

// A simple function to create a smooth curve for the arch
const getArchFactor = (x: number) => {
  // This creates a bell curve centered at x = 0.5
  const val = Math.exp(-Math.pow(x - 0.5, 2) / 0.05);
  return val;
};

export const generateInsoleGeometry = (params: InsoleParameters): THREE.BufferGeometry => {
  const { footLength, heelWidth, ballWidth, waistWidth, archHeight } = params;

  // 1. Create the 2D outline of the insole
  const shape = new THREE.Shape();

  // Define points for the insole shape (simplified)
  // Starting from the center of the heel
  shape.moveTo(0, -heelWidth / 2);
  shape.lineTo(footLength * 0.1, -heelWidth / 2); // Heel
  shape.splineThru([
    new THREE.Vector2(footLength * 0.4, -waistWidth / 2), // Waist
    new THREE.Vector2(footLength * 0.75, -ballWidth / 2), // Ball
  ]);
  shape.lineTo(footLength * 0.95, -ballWidth / 4); // Towards toes
  shape.splineThru([
    new THREE.Vector2(footLength, 0), // Tip of the toe
  ]);
  shape.splineThru([
    new THREE.Vector2(footLength * 0.95, ballWidth / 4),
  ]);
  shape.lineTo(footLength * 0.75, ballWidth / 2); // Ball
  shape.splineThru([
    new THREE.Vector2(footLength * 0.4, waistWidth / 2), // Waist
  ]);
  shape.lineTo(footLength * 0.1, heelWidth / 2); // Heel
  shape.lineTo(0, heelWidth / 2); // Back of heel

  // Close the shape
  shape.closePath();

  // 2. Extrude the 2D shape to give it thickness
  const extrudeSettings = {
    steps: 1,
    depth: 10, // Base thickness of the insole
    bevelEnabled: true,
    bevelThickness: 2,
    bevelSize: 2,
    bevelSegments: 5,
  };

  const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

  // Center the geometry
  geometry.center();

  // 3. Deform the top surface to create the arch
  const positionAttribute = geometry.getAttribute('position');
  const vertex = new THREE.Vector3();

  for (let i = 0; i < positionAttribute.count; i++) {
    vertex.fromBufferAttribute(positionAttribute, i);

    // Check if the vertex is on the top surface (z > 0 after centering)
    if (vertex.z > 0) {
      // Normalize the x position (from heel to toe) to a 0-1 range
      const normalizedX = (vertex.x + footLength / 2) / footLength;
      
      // Apply the arch deformation
      const archFactor = getArchFactor(normalizedX);
      vertex.z += archFactor * archHeight;
    }
    
    positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
  }

  positionAttribute.needsUpdate = true;
  geometry.computeVertexNormals(); // Recalculate normals for correct lighting

  return geometry;
};
