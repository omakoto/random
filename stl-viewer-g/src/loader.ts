import * as THREE from 'three';

export interface ModelLoader {
  load(data: ArrayBuffer): Promise<THREE.Mesh>;
}

export class BinarySTLLoader implements ModelLoader {
  async load(data: ArrayBuffer): Promise<THREE.Mesh> {
    const reader = new DataView(data);
    
    // Binary STL format:
    // 80 bytes header
    // 4 bytes number of triangles
    // For each triangle:
    //   12 bytes normal (3 * float32)
    //   36 bytes vertices (3 * 3 * float32)
    //   2 bytes attribute byte count
    
    if (data.byteLength < 84) {
      throw new Error('File too small to be a binary STL');
    }

    const numTriangles = reader.getUint32(80, true);
    const expectedSize = 84 + numTriangles * 50;
    
    if (data.byteLength < expectedSize) {
      // It might be ASCII if it's smaller than expected for binary, 
      // but let's stick to binary for now as requested.
      throw new Error('Incomplete binary STL file');
    }

    const positions = new Float32Array(numTriangles * 3 * 3);
    const normals = new Float32Array(numTriangles * 3 * 3);

    let offset = 84;
    for (let i = 0; i < numTriangles; i++) {
      // Normal
      const nx = reader.getFloat32(offset, true);
      const ny = reader.getFloat32(offset + 4, true);
      const nz = reader.getFloat32(offset + 8, true);
      offset += 12;

      // Vertices (3 * 3 floats)
      for (let v = 0; v < 3; v++) {
        const vx = reader.getFloat32(offset, true);
        const vy = reader.getFloat32(offset + 4, true);
        const vz = reader.getFloat32(offset + 8, true);
        
        const index = (i * 3 + v) * 3;
        positions[index] = vx;
        positions[index + 1] = vy;
        positions[index + 2] = vz;

        // Use the same normal for all 3 vertices of the triangle
        normals[index] = nx;
        normals[index + 1] = ny;
        normals[index + 2] = nz;

        offset += 12;
      }

      // Attribute byte count (2 bytes)
      offset += 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));

    const material = new THREE.MeshPhongMaterial({
      color: 0xaaaaaa,
      specular: 0x111111,
      shininess: 200,
    });

    return new THREE.Mesh(geometry, material);
  }
}

export class ModelLoaderFactory {
  static getLoader(extension: string): ModelLoader {
    switch (extension.toLowerCase()) {
      case 'stl':
        return new BinarySTLLoader();
      // Future loaders:
      // case '3mf': return new ThreeMFLoader();
      // case 'step': return new StepLoader();
      default:
        throw new Error(`Unsupported file format: ${extension}`);
    }
  }
}
