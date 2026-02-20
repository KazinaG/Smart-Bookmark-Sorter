FROM node:22

ARG TZ=Asia/Tokyo
ENV TZ="$TZ"

# Install base development tools used in this repository.
RUN apt-get update && \
  apt-get install -y --no-install-recommends \
    git \
    git-flow \
    procps \
    curl \
    jq && \
  rm -rf /var/lib/apt/lists/*

ARG USERNAME=node

# Persist bash history outside container lifecycle.
RUN mkdir -p /commandhistory && \
  touch /commandhistory/.bash_history && \
  chown -R $USERNAME:$USERNAME /commandhistory

# Keep shell behavior consistent in terminal sessions.
RUN echo "export PROMPT_COMMAND='history -a'" >> /home/node/.bashrc && \
  echo "export HISTFILE=/commandhistory/.bash_history" >> /home/node/.bashrc

ENV DEVCONTAINER=true
ENV SHELL=/bin/bash

WORKDIR /workspace

USER node
