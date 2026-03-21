import { ModelGeometry, ModelLoader, registerLoader } from './ModelLoader';

/**
 * Loader for binary STL files.
 * Binary STL format:
 *   80 bytes: header
 *   4 bytes:  uint32 triangle count
 *   per triangle (50 bytes):
 *     12 bytes: normal vector (3x float32)
 *     12 bytes: vertex 1 (3x float32)
 *     12 bytes: vertex 2 (3x float32)
 *     12 bytes: vertex 3 (3x float32)
 *     2 bytes:  attribute byte count (ignored)
 */
class StlLoader implements ModelLoader {
  readonly extensions = ['stl'] as const;

  load(buffer: ArrayBuffer): ModelGeometry {
    // TODO: detect text STL (starts with "solid ") and handle separately
    return this.loadBinary(buffer);
  }

  private loadBinary(buffer: ArrayBuffer): ModelGeometry {
    const view = new DataView(buffer);
    // header: 80 bytes, then uint32 triangle count
    const triCount = view.getUint32(80, true);

    const vertices = new Float32Array(triCount * 9);  // 3 vertices * 3 coords
    const normals = new Float32Array(triCount * 9);   // same layout (per-vertex normals = face normal)

    let offset = 84;
    for (let i = 0; i < triCount; i++) {
      const nx = view.getFloat32(offset,      true);
      const ny = view.getFloat32(offset +  4, true);
      const nz = view.getFloat32(offset +  8, true);

      for (let v = 0; v < 3; v++) {
        const vBase = offset + 12 + v * 12;
        const base = i * 9 + v * 3;
        vertices[base]     = view.getFloat32(vBase,     true);
        vertices[base + 1] = view.getFloat32(vBase + 4, true);
        vertices[base + 2] = view.getFloat32(vBase + 8, true);
        normals[base]     = nx;
        normals[base + 1] = ny;
        normals[base + 2] = nz;
      }

      offset += 50;
    }

    return { vertices, normals, triangleCount: triCount };
  }
}

// Self-register
registerLoader(new StlLoader());
