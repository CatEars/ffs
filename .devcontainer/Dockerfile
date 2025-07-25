FROM mcr.microsoft.com/devcontainers/base:ubuntu

RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
RUN sudo apt-get install -y git-lfs
RUN curl -fsSL https://deno.land/install.sh > /tmp/install-deno.sh && /tmp/install-deno.sh -y
