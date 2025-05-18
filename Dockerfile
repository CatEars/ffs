FROM denoland/deno:ubuntu

RUN apt update && apt install -y ffmpeg

WORKDIR /app
COPY data/ /app/data
COPY scripts/ /app/scripts
COPY src/ /app/src
COPY deno.json deno.lock README.md ./

RUN deno cache main.ts && deno install

CMD ["deno", "run", "--allow-all", "src/main.ts"]