FROM mcr.microsoft.com/devcontainers/base:ubuntu

RUN curl -s https://packagecloud.io/install/repositories/github/git-lfs/script.deb.sh | sudo bash
RUN sudo apt-get install -y git-lfs ffmpeg imagemagick
USER 1000
RUN curl -fsSL https://deno.land/install.sh > /tmp/install-deno.sh && \
  chmod +x /tmp/install-deno.sh && \
  /tmp/install-deno.sh -y
