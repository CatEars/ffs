FROM denoland/deno:alpine

WORKDIR /app
COPY data/ /app/data
COPY src /app/src
COPY deno.jsonc deno.lock README.md ./

RUN deno cache src/app/main.ts && deno install
RUN ./src/scripts/install-go.sh
RUN cd src && ~/.local/bin/go build -o /app/ffs ./goapp

CMD ["/app/src/scripts/prod-main.sh"]
