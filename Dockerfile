FROM denoland/deno:ubuntu

RUN apt update && apt install -y ffmpeg imagemagick

WORKDIR /app
COPY data/ /app/data
COPY scripts/ /app/scripts
COPY src/ /app/src
COPY deno.jsonc deno.lock README.md ./

RUN deno cache src/main.ts && deno install

CMD ["deno", "run", "--allow-all", "src/main.ts"]