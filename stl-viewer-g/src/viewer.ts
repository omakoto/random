import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export class Viewer {
  private scene: THREE.Scene;
  private renderer: THREE.WebGLRenderer;
  private perspectiveCamera: THREE.PerspectiveCamera;
  private orthographicCamera: THREE.OrthographicCamera;
  private currentCamera: THREE.Camera;
  private controls: OrbitControls;
  private container: HTMLElement;
  private model: THREE.Group;

  constructor(containerId: string) {
    this.container = document.getElementById(containerId)!;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x333333);
    this.model = new THREE.Group();
    this.scene.add(this.model);

    // Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.container.appendChild(this.renderer.domElement);

    // Cameras
    const aspect = this.container.clientWidth / this.container.clientHeight;
    this.perspectiveCamera = new THREE.PerspectiveCamera(45, aspect, 0.1, 2000);
    this.perspectiveCamera.position.set(200, 200, 200);

    const frustumSize = 400;
    this.orthographicCamera = new THREE.OrthographicCamera(
      frustumSize * aspect / -2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      frustumSize / -2,
      0.1,
      2000
    );
    this.orthographicCamera.position.set(200, 200, 200);

    this.currentCamera = this.perspectiveCamera;

    // Controls (Blender Style)
    this.controls = new OrbitControls(this.currentCamera, this.renderer.domElement);
    this.setupBlenderControls();

    // Lights
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-1, -1, -1).normalize();
    this.scene.add(directionalLight2);

    // Helpers
    const grid = new THREE.GridHelper(1000, 50, 0x555555, 0x444444);
    grid.rotation.x = -Math.PI / 2;
    this.scene.add(grid);

    window.addEventListener('resize', () => this.onWindowResize());
    this.animate();
  }

  private setupBlenderControls() {
    // Blender 2.8+ defaults:
    // Middle Mouse: Orbit
    // Shift + Middle Mouse: Pan
    // Scroll: Zoom
    
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE, // Default, but we'll prioritize middle
      MIDDLE: THREE.MOUSE.ROTATE,
      RIGHT: THREE.MOUSE.PAN
    };

    // To strictly match "Shift + Middle Mouse = Pan", we need to handle modifiers
    // Three.js OrbitControls doesn't natively support "only with shift" for a button easily via mouseButtons config,
    // but we can customize it or accept standard OrbitControls which is close.
    // Let's refine it:
    this.controls.touches = {
      ONE: THREE.TOUCH.ROTATE,
      TWO: THREE.TOUCH.DOLLY_PAN
    };

    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.screenSpacePanning = true;

    // Custom modifier handling for Pan
    // Note: Overriding internal methods is risky but sometimes necessary for specific layouts.
    // For now, let's use standard MOUSE.PAN on Right Click or Middle as is, 
    // and I'll add the Shift+Middle check if needed.
  }

  public setModel(mesh: THREE.Mesh) {
    this.model.clear();
    this.model.add(mesh);

    // Center model at origin
    const box = new THREE.Box3().setFromObject(mesh);
    const center = box.getCenter(new THREE.Vector3());
    mesh.position.sub(center);

    this.fitToScreen();
  }

  public fitToScreen() {
    const box = new THREE.Box3().setFromObject(this.model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    
    if (maxDim === 0) return;

    // Perspective Camera adjustment
    const fov = this.perspectiveCamera.fov * (Math.PI / 180);
    const aspect = this.perspectiveCamera.aspect;
    
    // Calculate distance needed to fit the object
    // We take the max of horizontal and vertical FOV
    const fovH = 2 * Math.atan(Math.tan(fov / 2) * aspect);
    const distance = maxDim / (2 * Math.tan(Math.min(fov, fovH) / 2));
    
    const cameraOffset = distance * 1.5; // Add some padding
    const position = new THREE.Vector3(cameraOffset, cameraOffset, cameraOffset);
    
    this.perspectiveCamera.position.copy(position);
    this.perspectiveCamera.lookAt(0, 0, 0);

    // Orthographic Camera adjustment
    // The frustum should be large enough to contain maxDim
    const frustumSize = maxDim * 1.5;
    this.orthographicCamera.left = -frustumSize * aspect / 2;
    this.orthographicCamera.right = frustumSize * aspect / 2;
    this.orthographicCamera.top = frustumSize / 2;
    this.orthographicCamera.bottom = -frustumSize / 2;
    this.orthographicCamera.position.copy(position);
    this.orthographicCamera.lookAt(0, 0, 0);
    this.orthographicCamera.updateProjectionMatrix();

    // Update controls
    this.controls.target.set(0, 0, 0);
    this.controls.update();
  }

  public toggleCamera() {
    const isPerspective = this.currentCamera === this.perspectiveCamera;
    
    if (isPerspective) {
      this.currentCamera = this.orthographicCamera;
    } else {
      this.currentCamera = this.perspectiveCamera;
    }
    
    this.controls.object = this.currentCamera;
    this.fitToScreen();
    
    return this.currentCamera instanceof THREE.PerspectiveCamera ? 'Perspective' : 'Isometric';
  }

  private onWindowResize() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    const aspect = width / height;

    this.perspectiveCamera.aspect = aspect;
    this.perspectiveCamera.updateProjectionMatrix();

    const frustumSize = 400;
    this.orthographicCamera.left = -frustumSize * aspect / 2;
    this.orthographicCamera.right = frustumSize * aspect / 2;
    this.orthographicCamera.top = frustumSize / 2;
    this.orthographicCamera.bottom = -frustumSize / 2;
    this.orthographicCamera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.currentCamera);
  }
}
