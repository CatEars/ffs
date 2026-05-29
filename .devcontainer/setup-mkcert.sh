#!/bin/bash

./src/scripts/install-mkcert.sh

mkcert -install
mkcert -cert-file ./data/dev-cert.pem -key-file ./data/dev-cert.key.pem localhost 127.0.0.1
