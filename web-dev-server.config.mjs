export default {
    port: 8080,
    rootDir: 'wwwroot',
    nodeResolve: true,
    watch: true,
    middleware: [async (ctx, next) => {
        // https://developer.mozilla.org/en-US/docs/Web/API/crossOriginIsolated
        ctx.set('Cross-Origin-Opener-Policy', 'same-origin');
        ctx.set('Cross-Origin-Embedder-Policy', 'require-corp');
        await next();
    }]
};
