# STL Viewer

A lightweight, web-based STL file viewer built with Three.js, TypeScript, and Vite.

## Features

- **STL Loading:** Easily upload and view `.stl` files.
- **Interactive 3D View:** Rotate, zoom, and pan around your 3D models.
- **View Options:** Toggle between perspective and isometric views.
- **Fast and Modern:** Built using Vite for a quick development experience and high performance.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd stl-viewer-g
   ```

2. **Install dependency packages:**
   ```bash
   npm install
   ```
   *Alternatively, for a clean install using the lockfile:*
   ```bash
   npm ci
   ```

   This will install all required packages listed in `package.json` and `package-lock.json`, including Three.js and development tools like Vite and TypeScript.

### Running the Application

To start the development server:
```bash
npm run dev
```

To run the application and make it accessible on your local network:
```bash
./00-start.sh
```

### Building for Production

To build the project for production:
```bash
npm run build
```

The output will be in the `dist` directory.

## License

BSD 3-Clause
