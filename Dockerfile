# Build rust code to WASM
FROM rust:1.98.0 AS rust

RUN cargo install wasm-pack@^0.15

WORKDIR /usr/src/rust
COPY --link rust/ .

RUN wasm-pack build --release --target web


# Base image for Node.js tasks
FROM node:lts AS node

WORKDIR /usr/src

COPY --link package.json package-lock.json rollup.config.mjs ./
COPY --from=rust /usr/src/rust/pkg ./rust/pkg
RUN npm ci

COPY --link wwwroot/ ./wwwroot
RUN npm run build

VOLUME /usr/src/dist/
