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

### 3. Starting the DevContainer

Once the development environment is set up, start the DevContainer to begin development.

1. Open Visual Studio Code.

2. Ensure that the DevContainer extension is installed. If it is not, install the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers).

3. Open the project folder.

4. Open the command palette (`Ctrl+Shift+P`) and select "Dev Containers: Reopen in Container".

This will start the DevContainer, and you'll be ready to begin development.
