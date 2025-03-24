import nodeResolve from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
    {
        input: "wwwroot/js/main/main.js",
        output: {
            dir: "dist/js/main",
            format: "es",
            plugins: [terser()]
        },
        plugins: [
            nodeResolve(),
            copy({
                targets: [
                    { src: "wwwroot/index.html", dest: "dist" },
                    { src: "wwwroot/css/*.css", dest: "dist/css" },
                    { src: "rust/pkg/*.wasm", dest: "dist/js/worker" },
                ]
            })
        ]
    },
    {
        input: "wwwroot/js/worker/worker.js",
        output: {
            dir: "dist/js/worker",
            format: "es",
            plugins: [terser()]
        },
        plugins: [nodeResolve()]
    }
];
