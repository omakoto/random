export interface ModelGeometry {
  /** Flat array: x,y,z per vertex, 3 vertices per triangle */
  vertices: Float32Array;
  /** Flat array: nx,ny,nz per triangle (one normal per face, repeated 3x if needed) */
  normals: Float32Array;
  triangleCount: number;
}

export interface ModelLoader {
  /** File extensions this loader handles, e.g. ["stl"] */
  readonly extensions: readonly string[];
  load(buffer: ArrayBuffer): ModelGeometry;
}

// Registry of available loaders
const loaders: ModelLoader[] = [];

export function registerLoader(loader: ModelLoader): void {
  loaders.push(loader);
}

export function getLoaderForFile(filename: string): ModelLoader | null {
  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  return loaders.find(l => l.extensions.includes(ext)) ?? null;
}
