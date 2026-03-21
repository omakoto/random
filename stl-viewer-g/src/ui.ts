import { Viewer } from './viewer';
import { ModelLoaderFactory } from './loader';

export class UI {
  private viewer: Viewer;
  private status: HTMLElement;

  constructor(viewer: Viewer) {
    this.viewer = viewer;
    this.status = document.getElementById('status')!;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    fileInput.addEventListener('change', (event) => this.handleFileUpload(event));

    const toggleBtn = document.getElementById('toggle-view') as HTMLButtonElement;
    toggleBtn.addEventListener('click', () => {
      const mode = this.viewer.toggleCamera();
      toggleBtn.textContent = `Switch to ${mode === 'Perspective' ? 'Isometric' : 'Perspective'}`;
    });
  }

  private async handleFileUpload(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const extension = file.name.split('.').pop() || '';
    
    this.updateStatus(`Loading ${file.name}...`);

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        if (!buffer) {
          this.updateStatus('Error: Failed to read file');
          return;
        }

        try {
          const loader = ModelLoaderFactory.getLoader(extension);
          const mesh = await loader.load(buffer);
          this.viewer.setModel(mesh);
          this.updateStatus(`Loaded ${file.name}`);
        } catch (error) {
          console.error(error);
          this.updateStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      };
      reader.onerror = () => this.updateStatus('Error: Failed to read file');
      reader.readAsArrayBuffer(file);
    } catch (error) {
      this.updateStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private updateStatus(message: string) {
    this.status.textContent = message;
  }
}
