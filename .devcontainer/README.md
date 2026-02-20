# How to Start Your Development Environment

This guide explains how to set up a development environment on WSL (Windows Subsystem for Linux). First, you'll generate an SSH key and add it to GitHub, then install and configure Keychain. Finally, you'll start the DevContainer to begin development.

## Working within WSL (Windows Subsystem for Linux)

### 1. Generating and Configuring SSH Keys

First, generate an SSH key and add it to the SSH agent.

1. Follow the instructions in [GitHub Docs: Generating a new SSH key and adding it to the ssh-agent](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key) to generate a new SSH key.

2. Start the SSH agent.
   ```sh
   eval "$(ssh-agent -s)"
   ```

3. Add the generated SSH key to the SSH agent.
   ```sh
   ssh-add ~/.ssh/id_ed25519
   ```

4. Add the generated SSH public key to GitHub.

   1. Copy the SSH public key to the clipboard.
      ```sh
      cat ~/.ssh/id_ed25519.pub | clip
      ```

   2. Go to the [GitHub SSH key addition page](https://github.com/settings/ssh/new) and add your SSH public key.

### 2. Installing and Configuring Keychain

To easily manage your SSH keys, install and configure Keychain.

1. Install Keychain.
   ```sh
   sudo apt-get install keychain
   ```

2. Add the following code to the end of your `~/.bashrc` to configure Keychain.
   ```sh
   /usr/bin/keychain -q --nogui $HOME/.ssh/id_ed25519
   source $HOME/.keychain/$(hostname)-sh
   ```

### 3. Preparing `devcontainer.env` for GitHub Token

Before starting the container, create a local `.devcontainer/devcontainer.env` file and set `GH_TOKEN`.

1. Create `devcontainer.env` from the sample.
   ```sh
   cp .devcontainer/devcontainer.env.example .devcontainer/devcontainer.env
   ```

2. Edit `.devcontainer/devcontainer.env` and set your token.
   ```env
   GH_TOKEN=<your_github_pat>
   ```

The DevContainer configuration uses `--env-file=${localWorkspaceFolder}/.devcontainer/devcontainer.env`, so `GH_TOKEN` is available in the container.

### 4. Starting the DevContainer

Once the development environment is set up, start the DevContainer to begin development.

1. Open Visual Studio Code.

2. Ensure that the DevContainer extension is installed. If it is not, install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).

3. Open the project folder.

4. Open the command palette (`Ctrl+Shift+P`) and select "Dev Containers: Reopen in Container".

This will start the DevContainer, and you'll be ready to begin development.

### 5. Troubleshooting: `not a git repository` in a worktree

If you moved the repository directory (for example between WSL paths), a worktree may keep stale absolute paths in `.git`.
When that happens, opening the worktree in DevContainer can fail with:
`fatal: not a git repository: .../.git/worktrees/<name>`.

Run this on the host terminal from the repository root, then rebuild the container:

```sh
git worktree repair worktrees/<your-worktree-name>
```

### 6. Expected startup messages

- If the repository root has no `package.json`, this log is expected during `postCreateCommand`:
  `No package.json, skip npm install`
- `postStartCommand` updates `@openai/codex` and `pnpm` each container start.
