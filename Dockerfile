# Build rust code to WASM
FROM rust:1.85.0 AS rust

RUN cargo install wasm-pack

WORKDIR /usr/src/rust
COPY rust/ .

# TODO: tests run in dev profile but final bundle should use the release build
RUN wasm-pack build --dev --target web


# Base image for Node.js tasks
FROM node:lts AS node

WORKDIR /usr/src
COPY --from=rust /usr/src/rust/pkg ./rust/pkg
COPY wwwroot/ ./wwwroot
COPY package.json package-lock.json rollup.config.mjs .

RUN npm install && npm run build


FROM rust AS rusttestrunner

# TODO: how to publish test results/coverage?
ENTRYPOINT ["cargo", "test", "--lib"]


# Run wasm-pack browser tests
FROM rust AS rustbrowsertestrunner

# TODO: how to publish test results/coverage?
# TODO: how to configure test browser at runtime?
# TODO: Error: http://127.0.0.1:<random port>/session: status code 500
ENTRYPOINT ["wasm-pack", "test", "--headless", "--firefox"]


# Run JS/TS tests
# FROM node AS nodetestrunner

# TODO: run TypeScript tests (and how to publish results/coverage?)


# Publish the web app (HTML + CSS + JS + WASM)
FROM node AS bundler

RUN npm run bundle


# FROM nginx:latest AS server

# TODO: copy bundle and any Nginx config required
