import { ModelGeometry } from '../loaders/ModelLoader';
import { VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC } from './shaders';
import { Camera } from './Camera';
import { mat4Identity, mat4Multiply, normalMatrix, Vec3 } from './math';

function compileShader(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compile error: ${log}`);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const program = gl.createProgram()!;
  gl.attachShader(program, compileShader(gl, gl.VERTEX_SHADER, vs));
  gl.attachShader(program, compileShader(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Program link error: ${gl.getProgramInfoLog(program)}`);
  }
  return program;
}

export class Renderer {
  private gl: WebGL2RenderingContext;
  private program: WebGLProgram;
  private vao: WebGLVertexArrayObject;
  private vertexCount = 0;
  private modelCenter: Vec3 = [0, 0, 0];
  private modelSize = 1;
  private animFrameId = 0;
  private dirty = true;

  constructor(private canvas: HTMLCanvasElement, private camera: Camera) {
    const gl = canvas.getContext('webgl2');
    if (!gl) throw new Error('WebGL2 not supported');
    this.gl = gl;

    this.program = createProgram(gl, VERTEX_SHADER_SRC, FRAGMENT_SHADER_SRC);
    this.vao = gl.createVertexArray()!;

    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);
    gl.clearColor(0.1, 0.1, 0.18, 1.0);

    this.startRenderLoop();
  }

  loadModel(geo: ModelGeometry): void {
    const gl = this.gl;

    // Compute bounding box
    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < geo.vertices.length; i += 3) {
      const x = geo.vertices[i], y = geo.vertices[i+1], z = geo.vertices[i+2];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (y < minY) minY = y; if (y > maxY) maxY = y;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
    this.modelCenter = [(minX+maxX)/2, (minY+maxY)/2, (minZ+maxZ)/2];
    const dx = maxX-minX, dy = maxY-minY, dz = maxZ-minZ;
    this.modelSize = Math.sqrt(dx*dx + dy*dy + dz*dz);

    this.camera.fitToModel(this.modelCenter, this.modelSize);
    this.camera.setModelInfo(this.modelCenter, this.modelSize);

    // Upload to GPU
    gl.bindVertexArray(this.vao);

    // Positions
    const posBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.vertices, gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(this.program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    // Normals
    const normBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, normBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.normals, gl.STATIC_DRAW);
    const normLoc = gl.getAttribLocation(this.program, 'a_normal');
    gl.enableVertexAttribArray(normLoc);
    gl.vertexAttribPointer(normLoc, 3, gl.FLOAT, false, 0, 0);

    gl.bindVertexArray(null);
    this.vertexCount = geo.triangleCount * 3;
    this.dirty = true;
  }

  markDirty(): void {
    this.dirty = true;
  }

  private startRenderLoop(): void {
    const loop = () => {
      this.resize();
      this.render();
      this.animFrameId = requestAnimationFrame(loop);
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private resize(): void {
    const canvas = this.canvas;
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      this.camera.setAspect(w / h);
      this.dirty = true;
    }
  }

  private render(): void {
    if (!this.dirty) return;
    this.dirty = false;

    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (this.vertexCount === 0) return;

    gl.useProgram(this.program);

    const model = mat4Identity();
    const view  = this.camera.getViewMatrix();
    const proj  = this.camera.getProjectionMatrix();
    const mv    = mat4Multiply(view, model);
    const nm    = normalMatrix(mv);

    const eye = this.camera.getEyePosition();

    const u = (name: string) => gl.getUniformLocation(this.program, name);
    gl.uniformMatrix4fv(u('u_model'),       false, model);
    gl.uniformMatrix4fv(u('u_view'),        false, view);
    gl.uniformMatrix4fv(u('u_projection'), false, proj);
    gl.uniformMatrix3fv(u('u_normalMatrix'), false, nm);
    gl.uniform3fv(u('u_lightDir'), [1, 2, 3]);
    gl.uniform3fv(u('u_modelColor'), [0.6, 0.75, 0.9]);
    gl.uniform3fv(u('u_viewPos'), eye);

    gl.bindVertexArray(this.vao);
    gl.drawArrays(gl.TRIANGLES, 0, this.vertexCount);
    gl.bindVertexArray(null);
  }

  getModelCenter(): Vec3 { return this.modelCenter; }
  getModelSize(): number { return this.modelSize; }
}
