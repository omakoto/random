import {
  Mat4, Vec3,
  mat4LookAt, mat4Perspective, mat4Ortho,
  vec3Normalize, vec3Cross, vec3Scale, vec3Add, vec3Sub, vec3Dot, vec3Length,
} from './math';

export type ViewMode = 'perspective' | 'isometric';

/**
 * Orbit camera with Blender-style controls:
 *   Middle mouse drag  → orbit
 *   Shift + MMB drag   → pan
 *   Scroll wheel       → zoom
 *   (No right-click pan yet; Blender uses Alt+LMB too — MMB covers it here)
 */
export class Camera {
  // Spherical coordinates around target
  private theta = Math.PI / 4;   // azimuth (horizontal)
  private phi   = Math.PI / 4;   // elevation (from equator)
  private radius = 5;

  private target: Vec3 = [0, 0, 0];
  private viewMode: ViewMode = 'perspective';

  // Ortho scale factor
  private orthoScale = 1;

  // Viewport size (needed for ortho projection)
  private aspect = 1;

  constructor(private canvas: HTMLCanvasElement) {
    this.attachEvents();
  }

  setAspect(aspect: number): void {
    this.aspect = aspect;
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
  }

  getViewMode(): ViewMode {
    return this.viewMode;
  }

  toggleViewMode(): ViewMode {
    this.viewMode = this.viewMode === 'perspective' ? 'isometric' : 'perspective';
    return this.viewMode;
  }

  /** Fit camera to bounding box of the model. */
  fitToModel(center: Vec3, size: number): void {
    this.target = [...center];
    this.radius = size * 2.0;
    this.orthoScale = size * 1.5;
  }

  getEyePosition(): Vec3 {
    const x = this.target[0] + this.radius * Math.cos(this.phi) * Math.cos(this.theta);
    const y = this.target[1] + this.radius * Math.sin(this.phi);
    const z = this.target[2] + this.radius * Math.cos(this.phi) * Math.sin(this.theta);
    return [x, y, z];
  }

  getViewMatrix(): Mat4 {
    const eye = this.getEyePosition();
    return mat4LookAt(eye, this.target, [0, 1, 0]);
  }

  getProjectionMatrix(): Mat4 {
    if (this.viewMode === 'perspective') {
      return mat4Perspective(Math.PI / 4, this.aspect, 0.01, 10000);
    } else {
      const h = this.orthoScale;
      const w = h * this.aspect;
      return mat4Ortho(-w, w, -h, h, -10000, 10000);
    }
  }

  reset(center: Vec3, size: number): void {
    this.theta = Math.PI / 4;
    this.phi   = Math.PI / 4;
    this.target = [...center];
    this.radius = size * 2.0;
    this.orthoScale = size * 1.5;
  }

  // --- Mouse interaction (Blender layout) ---

  private dragging: 'orbit' | 'pan' | null = null;
  private lastX = 0;
  private lastY = 0;
  private modelCenter: Vec3 = [0, 0, 0];
  private modelSize = 1;

  setModelInfo(center: Vec3, size: number): void {
    this.modelCenter = center;
    this.modelSize = size;
  }

  private attachEvents(): void {
    const c = this.canvas;

    c.addEventListener('mousedown', (e) => {
      if (e.button === 1) {
        // Middle mouse button
        e.preventDefault();
        this.dragging = e.shiftKey ? 'pan' : 'orbit';
        this.lastX = e.clientX;
        this.lastY = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastX;
      const dy = e.clientY - this.lastY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;

      if (this.dragging === 'orbit') {
        this.orbit(dx, dy);
      } else {
        this.pan(dx, dy);
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 1) this.dragging = null;
    });

    c.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.1 : 0.9;
      this.radius *= factor;
      this.orthoScale *= factor;
      // Clamp radius
      const minR = this.modelSize * 0.05;
      const maxR = this.modelSize * 100;
      this.radius = Math.max(minR, Math.min(maxR, this.radius));
      this.orthoScale = Math.max(minR * 0.5, Math.min(maxR * 0.5, this.orthoScale));
    }, { passive: false });

    // Prevent context menu on middle click
    c.addEventListener('contextmenu', e => e.preventDefault());
  }

  private orbit(dx: number, dy: number): void {
    const sensitivity = 0.005;
    this.theta -= dx * sensitivity;
    this.phi   += dy * sensitivity;
    // Clamp phi to avoid gimbal flip
    const limit = Math.PI / 2 - 0.01;
    this.phi = Math.max(-limit, Math.min(limit, this.phi));
  }

  private pan(dx: number, dy: number): void {
    const eye = this.getEyePosition();
    const forward = vec3Normalize(vec3Sub(this.target, eye));
    const worldUp: Vec3 = [0, 1, 0];
    const right = vec3Normalize(vec3Cross(forward, worldUp));
    const up = vec3Normalize(vec3Cross(right, forward));

    const panSpeed = this.radius * 0.001;
    const delta = vec3Add(
      vec3Scale(right, -dx * panSpeed),
      vec3Scale(up, dy * panSpeed),
    );
    this.target = vec3Add(this.target, delta);
  }
}
