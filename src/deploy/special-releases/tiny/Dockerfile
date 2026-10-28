FROM ubuntu AS builder

ENV LANG=C.UTF-8

RUN apt update && apt install -y wget

WORKDIR /app
COPY ./src/ src/
RUN ./src/scripts/install-go.sh
RUN cd src && ~/.local/bin/go build -o /app/ffs ./goapp

FROM ubuntu

ENV LANG=C.UTF-8

WORKDIR /app
COPY data/ /app/data

COPY --from=builder /app/ffs /app/ffs

CMD ["/app/ffs"]
