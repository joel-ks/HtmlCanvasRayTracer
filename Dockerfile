# Build rust code to WASM
FROM rust:1.85.0 AS rust

RUN cargo install wasm-pack

WORKDIR /usr/src/rust
COPY rust/ .

RUN wasm-pack build --release --target web


# Base image for Node.js tasks
FROM node:lts AS node

WORKDIR /usr/src

COPY package.json package-lock.json rollup.config.mjs .
COPY --from=rust /usr/src/rust/pkg ./rust/pkg
RUN npm install

COPY wwwroot/ ./wwwroot
RUN npm run build


FROM rust AS rusttestrunner

# TODO: how to publish test results/coverage?
ENTRYPOINT ["cargo", "test", "--profile", "release", "--lib"]


# Run wasm-pack browser tests
# FROM rust AS rustbrowsertestrunner

# TODO: how to publish test results/coverage?
# TODO: how to configure test browser at runtime?
# TODO: Error: http://127.0.0.1:<random port>/session: status code 500
# ENTRYPOINT ["wasm-pack", "test", "--release", "--headless", "--firefox"]


# Run JS/TS tests
# FROM node AS nodetestrunner

# TODO: run TypeScript tests (and how to publish results/coverage?)


# Publish the web app (HTML + CSS + JS + WASM)
FROM node AS bundler

RUN npm run bundle


# TODO: how to distribute this app? (Nginx server, copy bundle to another image, ...)
