# 開発環境を開始する手順

このガイドでは、開発環境をWSL (Windows Subsystem for Linux) 上にセットアップする方法を説明します。まず、SSHキーを生成してGitHubに追加し、Keychainをインストールして設定します。最後に、DevContainerを起動して開発を開始します。

## WSL (Windows Subsystem for Linux)内での作業

### 1. SSHキーの生成と設定

まず、SSHキーを生成し、SSHエージェントに追加します。

1. [GitHub Docs: SSHキーの生成](https://docs.github.com/ja/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key) の手順に従って、新しいSSHキーを生成します。

2. SSHエージェントを開始します。
   ```sh
   eval "$(ssh-agent -s)"
   ```

3. 生成したSSHキーをSSHエージェントに追加します。
   ```sh
   ssh-add ~/.ssh/id_ed25519
   ```

4. 生成したSSH公開鍵をGitHubに追加します。

   1. SSH公開鍵をクリップボードにコピーします。
      ```sh
      cat ~/.ssh/id_ed25519.pub | clip
      ```

   2. [GitHubのSSHキー追加ページ](https://github.com/settings/ssh/new)にアクセスし、SSH公開鍵を追加します。

### 2. Keychainのインストールと設定

SSHキーの管理を容易にするため、Keychainをインストールし、設定します。

1. Keychainをインストールします。
   ```sh
   sudo apt-get install keychain
   ```

2. .bashrcにKeychainの設定を追加します。以下のコードを`~/.bashrc`の末尾に追記してください。
   ```sh
   /usr/bin/keychain -q --nogui $HOME/.ssh/id_ed25519
   source $HOME/.keychain/$(hostname)-sh
   ```

### 3. GitHubトークン用 `devcontainer.env` の準備

コンテナ起動前に、ローカルの `.devcontainer/devcontainer.env` を作成して `GH_TOKEN` を設定します。

1. サンプルから `devcontainer.env` を作成します。
   ```sh
   cp .devcontainer/devcontainer.env.example .devcontainer/devcontainer.env
   ```

2. `.devcontainer/devcontainer.env` を編集してトークンを設定します。
   ```env
   GH_TOKEN=<your_github_pat>
   ```

DevContainer 設定は `--env-file=${localWorkspaceFolder}/.devcontainer/devcontainer.env` を使用するため、`GH_TOKEN` はコンテナ内でも利用できます。

### 4. DevContainerの起動

開発環境を整えたら、次にDevContainerを起動して開発を開始します。

1. Visual Studio Codeを開きます。

2. DevContainer拡張機能がインストールされていることを確認します。インストールされていない場合は、[Dev Containers拡張機能](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)をインストールしてください。

3. プロジェクトのフォルダーを開きます。

4. コマンドパレット（`Ctrl+Shift+P`）を開き、「Dev Containers: Reopen in Container」を選択します。

これでDevContainerが起動し、開発を開始する準備が整います。

### 5. トラブルシュート: worktree で `not a git repository` が出る場合

リポジトリの配置先を移動した場合（WSL のパス変更など）、worktree の `.git` に残っている絶対パスが古くなり、
DevContainer 起動時に `fatal: not a git repository: .../.git/worktrees/<name>` が出ることがあります。

その場合はホスト側ターミナルでリポジトリルートに移動して、次を実行してから再ビルドしてください。

```sh
git worktree repair worktrees/chore-codex-runtime-alignment
```
