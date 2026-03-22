import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface InsoleParams {
  length: number;        // mm, heel-to-toe total length
  forefootWidth: number; // mm, width at ball of foot
  heelWidth: number;     // mm, width at heel
  archHeight: number;    // mm, medial arch support height
}

// ─── Math Helpers ─────────────────────────────────────────────────────────────

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const smoothstep = (t: number) => { const c = clamp(t, 0, 1); return c * c * (3 - 2 * c); };
const gauss = (x: number, center: number, sigma: number) =>
  Math.exp(-0.5 * ((x - center) / sigma) ** 2);

// ─── Insole Outline ───────────────────────────────────────────────────────────
//
// The insole outline is described by a set of anchor cross-sections along the
// normalized foot axis (u = 0 → heel, u = 1 → toe).  Each anchor defines what
// fraction of the current reference width is assigned to the lateral (outer)
// and medial (inner/arch) half-widths.
//
// The reference width transitions smoothly from heelWidth near the heel to
// forefootWidth near the ball.

type Anchor = [u: number, lateralFraction: number, medialFraction: number];

const OUTLINE_ANCHORS: Anchor[] = [
  // u     lat    med
  [0.00,  0.000, 0.000],  // heel tip — converges to a point
  [0.06,  0.860, 0.860],
  [0.14,  1.000, 1.000],  // heel widest, symmetric
  [0.24,  0.980, 0.970],
  [0.34,  0.960, 0.890],  // medial starts to narrow (arch region begins)
  [0.44,  0.940, 0.620],  // arch peak – medial narrowest
  [0.52,  0.950, 0.640],  // arch still present
  [0.62,  1.000, 1.000],  // ball of foot – symmetric again (fw reference)
  [0.72,  1.000, 1.000],  // widest part of forefoot
  [0.82,  0.940, 0.940],
  [0.91,  0.700, 0.700],
  [0.96,  0.290, 0.290],
  [1.00,  0.000, 0.000],  // toe tip
];

/**
 * Returns [lateralHalfWidth, medialHalfWidth] in mm at normalized position u.
 * Lateral = outer (positive x), medial = inner/arch side (negative x).
 */
function outlineAt(u: number, hw: number, fw: number): [number, number] {
  // Reference width: blends from hw to fw in the midfoot transition zone
  const refWidth = u < 0.50 ? hw
    : u > 0.64 ? fw
    : lerp(hw, fw, smoothstep((u - 0.50) / 0.14));

  // Locate surrounding anchors and interpolate fractions
  const anchors = OUTLINE_ANCHORS;
  let i = 0;
  while (i < anchors.length - 2 && anchors[i + 1][0] <= u) i++;

  const [u0, lf0, mf0] = anchors[i];
  const [u1, lf1, mf1] = anchors[i + 1];
  const t = smoothstep(clamp((u - u0) / (u1 - u0), 0, 1));

  return [
    lerp(lf0, lf1, t) * refWidth / 2,
    lerp(mf0, mf1, t) * refWidth / 2,
  ];
}

// ─── Geometry Builder ─────────────────────────────────────────────────────────

const U_SEGS = 90;  // longitudinal (heel→toe) mesh subdivisions
const V_SEGS = 36;  // lateral (medial→lateral) mesh subdivisions

/**
 * Builds a closed solid insole mesh from the given parameters.
 *
 * Coordinate convention (all in mm):
 *   +Z = toe direction,  −Z = heel
 *   +X = lateral (outer),  −X = medial (inner/arch side)
 *   +Y = up (top surface)
 */
export function buildInsoleGeometry(params: InsoleParams): THREE.BufferGeometry {
  const { length, forefootWidth, heelWidth, archHeight } = params;

  const L  = length;
  const FW = forefootWidth;
  const HW = heelWidth;
  const AH = archHeight;
  const BASE = 4.5; // mm — base insole thickness under arch
  const US = U_SEGS;
  const VS = V_SEGS;
  const S  = VS + 1; // stride per u-row

  const topPos: number[] = [];
  const botPos: number[] = [];

  // ── Generate surface vertices ──────────────────────────────────────────────

  for (let ui = 0; ui <= US; ui++) {
    const u = ui / US;
    const z = (u - 0.5) * L;  // centered on origin along Z

    const [latHW, medHW] = outlineAt(u, HW, FW);

    for (let vi = 0; vi <= VS; vi++) {
      const v = vi / VS;  // 0 = medial, 1 = lateral
      const x = lerp(-medHW, latHW, v);

      // ── Top surface height ──
      // Medial arch: gaussian along u, strongest at medial edge (v=0)
      const archU = gauss(u, 0.43, 0.11);
      const archV = (1.0 - v) ** 1.6;  // falls off toward lateral side
      const archY = archU * archV * AH;

      // Heel cup: slight parabolic concavity to cradle the heel
      const heelU  = gauss(u, 0.13, 0.065);
      const heelV  = 4.0 * v * (1.0 - v);  // 0 at edges, 1 at center
      const heelY  = -heelU * heelV * Math.min(AH * 0.12 + 0.4, 2.5);

      topPos.push(x, BASE + archY + heelY, z);
      botPos.push(x, 0,                    z);
    }
  }

  // ── Build index buffer ─────────────────────────────────────────────────────

  const topOff = 0;
  const botOff = topPos.length / 3;
  const pos = new Float32Array([...topPos, ...botPos]);
  const idx: number[] = [];

  // Helper: push a quad as two triangles
  const quad = (a: number, b: number, c: number, d: number) => {
    idx.push(a, b, c,  b, d, c);
  };
  const quadFlip = (a: number, b: number, c: number, d: number) => {
    idx.push(a, c, b,  b, c, d);
  };

  // Top face (normals point up — winding viewed from +Y)
  for (let ui = 0; ui < US; ui++) {
    for (let vi = 0; vi < VS; vi++) {
      const a = topOff + ui * S + vi;
      quad(a, a + 1, a + S, a + S + 1);
    }
  }

  // Bottom face (normals point down — reversed winding)
  for (let ui = 0; ui < US; ui++) {
    for (let vi = 0; vi < VS; vi++) {
      const a = botOff + ui * S + vi;
      quadFlip(a, a + 1, a + S, a + S + 1);
    }
  }

  // Lateral side wall (vi = VS, outer edge)
  for (let ui = 0; ui < US; ui++) {
    const tA = topOff + ui * S + VS;
    const tB = topOff + (ui + 1) * S + VS;
    const bA = botOff + ui * S + VS;
    const bB = botOff + (ui + 1) * S + VS;
    quad(tA, bA, tB, bB);
  }

  // Medial side wall (vi = 0, inner/arch edge)
  for (let ui = 0; ui < US; ui++) {
    const tA = topOff + ui * S;
    const tB = topOff + (ui + 1) * S;
    const bA = botOff + ui * S;
    const bB = botOff + (ui + 1) * S;
    quadFlip(tA, bA, tB, bB);
  }

  // Heel cap (ui = 0)
  for (let vi = 0; vi < VS; vi++) {
    const tA = topOff + vi;
    const tB = topOff + vi + 1;
    const bA = botOff + vi;
    const bB = botOff + vi + 1;
    quadFlip(tA, bA, tB, bB);
  }

  // Toe cap (ui = US)
  for (let vi = 0; vi < VS; vi++) {
    const tA = topOff + US * S + vi;
    const tB = topOff + US * S + vi + 1;
    const bA = botOff + US * S + vi;
    const bB = botOff + US * S + vi + 1;
    quad(tA, bA, tB, bB);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  return geo;
}

// ─── Scene ────────────────────────────────────────────────────────────────────

function initScene(canvas: HTMLCanvasElement) {
  // Renderer
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  // Scene
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x111827);
  scene.fog = new THREE.Fog(0x111827, 600, 1400);

  // Camera
  const camera = new THREE.PerspectiveCamera(42, 1, 1, 2000);
  camera.position.set(-40, 220, 370);
  camera.lookAt(0, 20, 0);

  // Controls
  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.target.set(0, 15, 0);
  controls.minDistance = 80;
  controls.maxDistance = 800;

  // Lights
  const ambient = new THREE.AmbientLight(0xddeeff, 0.55);
  scene.add(ambient);

  const sun = new THREE.DirectionalLight(0xfff4e0, 1.6);
  sun.position.set(120, 260, 150);
  sun.castShadow = true;
  sun.shadow.camera.near = 10;
  sun.shadow.camera.far = 800;
  sun.shadow.camera.left = -200;
  sun.shadow.camera.right = 200;
  sun.shadow.camera.top = 200;
  sun.shadow.camera.bottom = -200;
  sun.shadow.mapSize.set(2048, 2048);
  sun.shadow.bias = -0.0003;
  scene.add(sun);

  const fill = new THREE.DirectionalLight(0xaac8ff, 0.5);
  fill.position.set(-150, 80, -80);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xffd9b0, 0.35);
  rim.position.set(60, -40, -180);
  scene.add(rim);

  // Ground plane (shadow catcher)
  const groundGeo = new THREE.PlaneGeometry(700, 700);
  const groundMat = new THREE.ShadowMaterial({ opacity: 0.25 });
  const ground = new THREE.Mesh(groundGeo, groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1;
  ground.receiveShadow = true;
  scene.add(ground);

  // Grid
  const grid = new THREE.GridHelper(600, 24, 0x1e3a5f, 0x1e3a5f);
  grid.position.y = -1;
  scene.add(grid);

  // Axis helper labels (tiny, just for orientation)
  const axesHelper = new THREE.AxesHelper(30);
  axesHelper.position.set(-130, 0, -155);
  scene.add(axesHelper);

  // Insole mesh
  let insoleMesh: THREE.Mesh | null = null;

  const insoleMat = new THREE.MeshStandardMaterial({
    color: 0xd4b896,
    roughness: 0.72,
    metalness: 0.02,
    side: THREE.FrontSide,
  });

  function updateInsole(params: InsoleParams) {
    if (insoleMesh) {
      scene.remove(insoleMesh);
      insoleMesh.geometry.dispose();
    }
    const geo = buildInsoleGeometry(params);
    insoleMesh = new THREE.Mesh(geo, insoleMat);
    insoleMesh.castShadow = true;
    insoleMesh.receiveShadow = true;
    // Insole is generated centered in XZ; heel is at −Z, toe at +Z.
    // Rotate 180° so toe faces the viewer by default.
    insoleMesh.rotation.y = Math.PI;
    scene.add(insoleMesh);

    // Update info overlay
    const infoEl = document.getElementById('info-overlay');
    if (infoEl) {
      infoEl.innerHTML =
        `${params.length} × ${params.forefootWidth} mm &nbsp;|&nbsp; ` +
        `arch ${params.archHeight} mm`;
    }
  }

  // Resize handling
  function handleResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }

  // Render loop
  function animate() {
    requestAnimationFrame(animate);
    handleResize();
    controls.update();
    renderer.render(scene, camera);
  }
  animate();

  return { updateInsole };
}

// ─── UI Wiring ────────────────────────────────────────────────────────────────

function getParams(): InsoleParams {
  const val = (id: string) =>
    parseFloat((document.getElementById(id) as HTMLInputElement).value);
  return {
    length:        val('length'),
    forefootWidth: val('forefootWidth'),
    heelWidth:     val('heelWidth'),
    archHeight:    val('archHeight'),
  };
}

function syncDisplay(inputId: string, spanId: string) {
  const input = document.getElementById(inputId) as HTMLInputElement;
  const span  = document.getElementById(spanId)  as HTMLSpanElement;
  span.textContent = input.value;
  input.addEventListener('input', () => { span.textContent = input.value; });
}

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('canvas') as HTMLCanvasElement;
  const { updateInsole } = initScene(canvas);

  // Keep value displays in sync with sliders
  syncDisplay('length',        'lengthVal');
  syncDisplay('forefootWidth', 'forefootWidthVal');
  syncDisplay('heelWidth',     'heelWidthVal');
  syncDisplay('archHeight',    'archHeightVal');

  const goBtn      = document.getElementById('goBtn')       as HTMLButtonElement;
  const liveCheck  = document.getElementById('liveUpdate')  as HTMLInputElement;

  // Initial render
  updateInsole(getParams());

  // Generate button
  goBtn.addEventListener('click', () => updateInsole(getParams()));

  // Live update while dragging sliders
  ['length', 'forefootWidth', 'heelWidth', 'archHeight'].forEach(id => {
    document.getElementById(id)!.addEventListener('input', () => {
      if (liveCheck.checked) updateInsole(getParams());
    });
  });
});
