# Blender Add-on: blender-addon-01

A starting template for a Blender add-on with a Python virtual environment and VS Code configuration.

## Project Structure

- `src/`: Contains the add-on source code.
  - `__init__.py`: Entry point for the Blender add-on.
- `.vscode/`: VS Code settings and launch configurations.
- `.venv/`: Python virtual environment (ignored by git).
- `requirements.txt`: Python dependencies (e.g., `fake-bpy-module-latest` for IntelliSense).
- `.gitignore`: Standard ignore patterns for Python, VS Code, and Blender.

## Getting Started

### 1. Prerequisites
- [Blender](https://www.blender.org/download/)
- [Python 3.11+](https://www.python.org/downloads/)
- [VS Code](https://code.visualstudio.com/) with the [Python extension](https://marketplace.visualstudio.com/items?itemName=ms-python.python)

### 2. Setup
The project is already set up with a virtual environment. If you need to recreate it:
```bash
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Development in VS Code
- Open the project folder in VS Code.
- The `.vscode/settings.json` is configured to use the `.venv` interpreter.
- `fake-bpy-module-latest` provides autocompletion for the `bpy` module.

### 4. Packaging
A utility script `00-pack.sh` is provided to package the add-on for distribution.
```bash
./00-pack.sh
```
This will create a zip file in the `dist/` directory (e.g., `dist/blender-addon-01.zip`) containing the contents of the `src/` folder.

### 5. Installing in Blender
To test the add-on in Blender:
1. Run `./00-pack.sh` to create the zip file in the `dist/` directory.
2. In Blender, go to `Edit > Preferences > Add-ons > Install...`.
3. Select the zip file and enable the add-on.

Alternatively, you can create a symbolic link from your Blender add-ons directory to the `src/` folder for live development.

### 6. Usage
Once enabled, you can invoke the skeleton add-on in two ways:
1. **Object Menu**: In the 3D Viewport, go to `Object > Hello World Operator` (at the bottom of the menu).
2. **Search**: Press `F3` (or `Space` depending on your keymap) and search for "Hello World Operator".

When clicked, it will:
- Display a "Hello World!" message at the bottom of the screen.
- Print "Hello World from the Skeleton Addon!" to the System Console.

## Debugging

A `launch.json` is provided for remote debugging. This typically requires a "debug server" script or add-on (like `debugpy`) running inside Blender to attach to.
