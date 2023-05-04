import * as esbuild from 'esbuild';

const ROOT = 'dist/igniteui-angular-elements';
const config = {
    // logLevel: 'verbose',
    entryPoints: [`${ROOT}/index.js`],
    bundle: true,
    minify: true,
    outfile: `${ROOT}/elements.js`,
    format: 'esm',
    external: ['lit-html'],
    target: 'es2022',
    metafile: true,
    treeShaking: true
};

console.info(await esbuild.analyzeMetafile((await esbuild.build(config)).metafile));

