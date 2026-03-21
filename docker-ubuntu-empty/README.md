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
- Uses the `--rm` flag to automatically remove the container after exit.
- Logins as the `omakoto` user.
- Changes made inside the container are not persisted.

To run the container:
```bash
./01-run.sh
```

## Requirements
- Docker installed and running.
- Bash shell environment.
