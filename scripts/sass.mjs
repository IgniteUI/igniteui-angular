import * as sass from 'sass-embedded';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import { globby } from 'globby';
import path from 'path';
import { resolve } from 'node:path';
import { mkdirSync as makeDir } from 'fs';
import fsExtra from 'fs-extra';
import { fileURLToPath } from 'url';
import { writeFile } from 'fs/promises';
import report from './report.mjs';

const THEMES = {
  SRC: 'projects/igniteui-angular/src/lib/core/styles/themes/presets',
  DIST: '../dist/igniteui-angular/styles',
  THEMING: {
    SRC: 'projects/igniteui-angular/src/lib/core/styles/',
    DIST: 'dist/igniteui-angular/lib/core/styles/',
  },
  CONFIG: {
    style: 'compressed',
    loadPaths: ['node_modules'],
    sourceMap: true,
    sourceMapEmbed: true,
  },
};

const STYLES = {
  SRC: 'projects/igniteui-angular/src/lib/**/*.component.scss',
  DIST: './',
  IGNORE: '!projects/igniteui-angular/src/lib/core/styles/**/*.scss',
  CONFIG: {
    style: 'compressed',
    loadPaths: ['node_modules', 'projects/igniteui-angular/src/lib/core/'],
    sourceMap: true,
    sourceMapEmbed: true,
  },
};

const { copySync } = fsExtra;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEST_DIR = path.join.bind(null, resolve(__dirname, THEMES.DIST));

const stripComments = () => {
  return {
    postcssPlugin: 'postcss-strip-comments',
    OnceExit(root) {
      root.walkComments((node) => node.remove());
    },
  };
};

stripComments.postcss = true;

const postProcessor = postcss([
  autoprefixer({
    cascade: false,
    grid: true,
  }),
  stripComments,
]);

const _postProcessor = postcss([autoprefixer, stripComments]);

async function createFile(outputFile, content) {
  makeDir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, content, 'utf-8');
}

export async function compileSass(src, compiler, options) {
  const compiled = await compiler.compileAsync(src, options);

  const out = _postProcessor.process(compiled.css).css;
  return out.charCodeAt(0) === 0xfeff ? out.slice(1) : out;
}

async function _buildThemes() {
  const paths = await globby(`${THEMES.SRC}/**/*.scss`);
  const compiler = await sass.initAsyncCompiler();

  try {
    await Promise.all(
      paths.map(async (path) => {
        const result = await compiler.compileAsync(path, THEMES.CONFIG);
        const fileName = path
          .replace(/\.scss$/, '.css')
          .replace(THEMES.SRC, '');
        const sourceMapComment = `/*# sourceMappingURL=maps${fileName}.map */`;

        let outCss = postProcessor.process(result.css).css;

        if (outCss.charCodeAt(0) === 0xfeff) {
          outCss = outCss.substring(1);
        }

        outCss = outCss + '\n'.repeat(2) + sourceMapComment;

        const outputFile = DEST_DIR(fileName);
        await createFile(outputFile, outCss);
      })
    );
  } catch (err) {
    await compiler.dispose();
    report.error(err);
    process.exit(1);
  }

  await compiler.dispose();
}

export async function buildComponentStyles() {
  const [compiler, paths] = await Promise.all([
    sass.initAsyncCompiler(),
    globby([STYLES.SRC, STYLES.IGNORE]),
  ]);

  try {
    await Promise.all(
      paths.map(async (path) => {
        const result = await compiler.compileAsync(path, STYLES.CONFIG);
        const fileName = path
          .replace(/\.scss$/, '.css')
          .replace(STYLES.SRC, '');

        const sm = JSON.stringify(result.sourceMap);
        const smBase64 = (Buffer.from(sm, 'utf8') || '').toString('base64');
        const sourceMapComment =
          '/*# sourceMappingURL=data:application/json;charset=utf-8;base64,' +
          smBase64 +
          ' */';

        let outCss = postProcessor.process(result.css).css;

        if (outCss.charCodeAt(0) === 0xfeff) {
          outCss = outCss.substring(1);
        }

        outCss = outCss + '\n'.repeat(2) + sourceMapComment;

        await createFile(fileName, outCss);
      })
    );
  } catch (err) {
    await compiler.dispose();
    report.error(err);
  }

  await compiler.dispose();
}

export async function buildComponents(isProduction = false) {
  const start = performance.now();

  await buildComponentStyles();

  if (!isProduction) {
    report.success(
      `Component styles generated in ${((performance.now() - start) / 1000).toFixed(2)}s`
    );
  }
}

export async function buildThemes() {
  const start = performance.now();

  // Move theming files
  copySync(THEMES.THEMING.SRC, THEMES.THEMING.DIST, { recursive: true });

  // Build theme presets
  console.info('Building themes...');
  await _buildThemes();
  report.success(
    `Themes generated in ${((performance.now() - start) / 1000).toFixed(2)}s`
  );
}
