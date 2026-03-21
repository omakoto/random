/** Column-major 4x4 matrix utilities (matching WebGL convention). */

export type Mat4 = Float32Array; // 16 elements
export type Vec3 = [number, number, number];

export function mat4Identity(): Mat4 {
  // prettier-ignore
  return new Float32Array([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
  ]);
}

export function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float32Array(16);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[k * 4 + row] * b[col * 4 + k];
      }
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

export function mat4Perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1.0 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  const out = new Float32Array(16);
  out[0]  = f / aspect;
  out[5]  = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;
  return out;
}

export function mat4Ortho(left: number, right: number, bottom: number, top: number, near: number, far: number): Mat4 {
  const out = new Float32Array(16);
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);
  out[0]  = -2 * lr;
  out[5]  = -2 * bt;
  out[10] =  2 * nf;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;
  return out;
}

export function mat4LookAt(eye: Vec3, center: Vec3, up: Vec3): Mat4 {
  const fx = center[0] - eye[0];
  const fy = center[1] - eye[1];
  const fz = center[2] - eye[2];
  const fl = Math.sqrt(fx*fx + fy*fy + fz*fz);
  const f0 = fx/fl, f1 = fy/fl, f2 = fz/fl;

  const sx = f1*up[2] - f2*up[1];
  const sy = f2*up[0] - f0*up[2];
  const sz = f0*up[1] - f1*up[0];
  const sl = Math.sqrt(sx*sx + sy*sy + sz*sz);
  const s0 = sx/sl, s1 = sy/sl, s2 = sz/sl;

  const ux = s1*f2 - s2*f1;
  const uy = s2*f0 - s0*f2;
  const uz = s0*f1 - s1*f0;

  const out = new Float32Array(16);
  out[0]  = s0; out[4] = s1; out[8]  = s2;  out[12] = -(s0*eye[0] + s1*eye[1] + s2*eye[2]);
  out[1]  = ux; out[5] = uy; out[9]  = uz;  out[13] = -(ux*eye[0] + uy*eye[1] + uz*eye[2]);
  out[2]  = -f0; out[6] = -f1; out[10] = -f2; out[14] = (f0*eye[0] + f1*eye[1] + f2*eye[2]);
  out[3]  = 0; out[7] = 0; out[11] = 0; out[15] = 1;
  return out;
}

/** Extract upper-left 3x3 normal matrix (inverse transpose of model-view 3x3) */
export function normalMatrix(modelView: Mat4): Float32Array {
  // For a pure rotation/uniform-scale matrix, transpose of inverse = matrix itself (normalized)
  const a00 = modelView[0], a01 = modelView[1], a02 = modelView[2];
  const a10 = modelView[4], a11 = modelView[5], a12 = modelView[6];
  const a20 = modelView[8], a21 = modelView[9], a22 = modelView[10];

  const b01 = a22*a11 - a12*a21;
  const b11 = -a22*a10 + a12*a20;
  const b21 = a21*a10 - a11*a20;
  const det = a00*b01 + a01*b11 + a02*b21;
  const id = det === 0 ? 0 : 1/det;

  const out = new Float32Array(9);
  out[0] = b01*id;
  out[1] = (-a22*a01 + a02*a21)*id;
  out[2] = (a12*a01 - a02*a11)*id;
  out[3] = b11*id;
  out[4] = (a22*a00 - a02*a20)*id;
  out[5] = (-a12*a00 + a02*a10)*id;
  out[6] = b21*id;
  out[7] = (-a21*a00 + a01*a20)*id;
  out[8] = (a11*a00 - a01*a10)*id;
  return out;
}

export function vec3Length(v: Vec3): number {
  return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
}

export function vec3Normalize(v: Vec3): Vec3 {
  const l = vec3Length(v);
  return l > 0 ? [v[0]/l, v[1]/l, v[2]/l] : [0, 0, 0];
}

export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1]*b[2] - a[2]*b[1],
    a[2]*b[0] - a[0]*b[2],
    a[0]*b[1] - a[1]*b[0],
  ];
}

export function vec3Scale(v: Vec3, s: number): Vec3 {
  return [v[0]*s, v[1]*s, v[2]*s];
}

export function vec3Add(a: Vec3, b: Vec3): Vec3 {
  return [a[0]+b[0], a[1]+b[1], a[2]+b[2]];
}

export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0]-b[0], a[1]-b[1], a[2]-b[2]];
}

export function vec3Dot(a: Vec3, b: Vec3): number {
  return a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
}
