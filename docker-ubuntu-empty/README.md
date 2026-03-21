# Docker Ubuntu Empty

This project provides scripts to create and run a custom Ubuntu Docker image with a non-root user and sudo privileges.

## Scripts

### zz-init-docker.sh
Installs Docker on the host Ubuntu system.
- Removes old Docker versions.
- Sets up the official Docker APT repository.
- Installs `docker-ce`, `docker-ce-cli`, and other necessary plugins.
- Adds the current user to the `docker` group.

To run:
```bash
./zz-init-docker.sh
```
**Note:** A logout or restart is required for group changes to take effect.

### 00-create-ubuntu.sh
Builds the Docker image `ubuntu-25-custom`.
- Installs basic packages: `ca-certificates`, `curl`, `wget`, `vim`, `sudo`.
- Creates a user `omakoto` with a home directory and bash shell.
- Configures passwordless `sudo` access for the `omakoto` user.
- Sets the default user to `omakoto`.

To build the image:
```bash
./00-create-ubuntu.sh
```

### 01-run.sh
Runs the built Docker image interactively.
- Optionally takes a script file as an argument.
- If a script is provided, it's mounted, executed, and the shell remains open for interactive use.
- Uses the `--rm` flag for cleanup.
- Logins as the `omakoto` user.

To run:
```bash
./01-run.sh [script-file]
```

### 02-run-script.sh
Runs a host-side script file inside the Docker image.
- Takes a script filename as an argument.
- Mounts the script file as read-only into the container.
- Uses the `--rm` flag for cleanup.
- Executes the script as the `omakoto` user using `bash`.

To run:
```bash
./02-run-script.sh <script-file>
```

## Requirements
- Docker installed and running.
- Bash shell environment.
