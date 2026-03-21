// Register all model loaders
import './loaders/StlLoader';

import { getLoaderForFile } from './loaders/ModelLoader';
import { Camera } from './renderer/Camera';
import { Renderer } from './renderer/Renderer';

const canvas     = document.getElementById('gl-canvas')    as HTMLCanvasElement;
const fileInput  = document.getElementById('file-input')   as HTMLInputElement;
const fileLabel  = document.getElementById('file-name')    as HTMLSpanElement;
const viewToggle = document.getElementById('view-toggle')  as HTMLButtonElement;
const resetBtn   = document.getElementById('reset-view')   as HTMLButtonElement;
const viewLabel  = document.getElementById('view-mode-label') as HTMLParagraphElement;
const modelInfo  = document.getElementById('model-info')   as HTMLParagraphElement;
const dropHint   = document.getElementById('drop-hint')    as HTMLDivElement;

const camera   = new Camera(canvas);
const renderer = new Renderer(canvas, camera);

// Re-render when camera changes
// (Camera mutates internal state on mouse events; we poll via rAF in Renderer)
// The Renderer loop checks dirty; we mark dirty on any pointer event.
canvas.addEventListener('mousedown', () => renderer.markDirty());
window.addEventListener('mousemove', () => renderer.markDirty());
window.addEventListener('mouseup',   () => renderer.markDirty());
canvas.addEventListener('wheel',     () => renderer.markDirty(), { passive: false });

// --- File upload ---
fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  await loadFile(file);
});

// --- Drag and drop ---
canvas.addEventListener('dragover', e => { e.preventDefault(); });
canvas.addEventListener('drop', async e => {
  e.preventDefault();
  const file = e.dataTransfer?.files?.[0];
  if (file) await loadFile(file);
});

async function loadFile(file: File): Promise<void> {
  const loader = getLoaderForFile(file.name);
  if (!loader) {
    alert(`Unsupported file format: ${file.name.split('.').pop()}`);
    return;
  }

  try {
    const buffer = await file.arrayBuffer();
    const geo = loader.load(buffer);
    renderer.loadModel(geo);
    fileLabel.textContent = file.name;
    dropHint.classList.add('hidden');
    modelInfo.textContent = `${geo.triangleCount.toLocaleString()} triangles`;
  } catch (err) {
    console.error(err);
    alert(`Failed to load file: ${err instanceof Error ? err.message : String(err)}`);
  }
}

// --- View toggle ---
viewToggle.addEventListener('click', () => {
  const mode = camera.toggleViewMode();
  viewToggle.textContent = mode === 'perspective' ? 'Switch to Isometric' : 'Switch to Perspective';
  viewLabel.textContent  = mode === 'perspective' ? 'Perspective View' : 'Isometric View';
  renderer.markDirty();
});

// --- Reset view ---
resetBtn.addEventListener('click', () => {
  camera.reset(renderer.getModelCenter(), renderer.getModelSize());
  renderer.markDirty();
});
