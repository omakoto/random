import { Viewer } from './viewer';
import { UI } from './ui';

document.addEventListener('DOMContentLoaded', () => {
  const viewer = new Viewer('viewer-container');
  new UI(viewer);
  console.log('STL Viewer initialized');
});
