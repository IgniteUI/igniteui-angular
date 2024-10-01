import * as esbuild from 'esbuild';

const ROOT = 'dist/igniteui-angular-elements/browser';
const config = {
    // logLevel: 'verbose',
    entryPoints: [`${ROOT}/index.bundle.js`],
    bundle: true,
    minify: false, // temporary disabled due to Webpack issues https://github.com/webpack/webpack/issues/16262
    outfile: `${ROOT}/elements.js`,
    format: 'esm',
    external: ['lit-html'],
    target: 'es2022',
    metafile: true,
    treeShaking: true
};

console.info(await esbuild.analyzeMetafile((await esbuild.build(config)).metafile));

