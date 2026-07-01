import * as sass from 'sass-embedded';
import postcss from 'postcss';
import autoprefixer from 'autoprefixer';
import { globby } from 'globby';
import path, { resolve } from 'node:path';
import fsExtra from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import report from './report.mjs';

const SHARED_SASS_CONFIG = {
  style: 'compressed',
  silenceDeprecations: ['if-function'],
};

// Shared Sass `loadPaths` so `@use` specifiers can be written relative to these
// roots instead of long relative paths. `projects/igniteui-angular` lets any
// theme/component partial reference another package by its folder, e.g.
// `@use 'badge/src/badge/themes/light/tokens'`.
const LOAD_PATHS = [
  'node_modules',
  'projects/igniteui-angular',
  'projects/igniteui-angular/core/src/core/',
];

const THEMES = {
  SRC: 'projects/igniteui-angular/core/src/core/styles/themes/presets',
  DIST: '../dist/igniteui-angular/styles',
  THEMING: {
    SRC: 'projects/igniteui-angular/core/src/core/styles/',
    DIST: 'dist/igniteui-angular/lib/core/styles/',
  },
  CONFIG: {
    ...SHARED_SASS_CONFIG,
    loadPaths: LOAD_PATHS,
    sourceMap: true,
    sourceMapEmbed: true,
  },
};

const BASE_STYLES = {
  SRC: 'projects/igniteui-angular/**/*.styles.scss',
  CONFIG: {
    ...SHARED_SASS_CONFIG,
    loadPaths: LOAD_PATHS,
    sourceMap: false,
  },
};

const COMPONENT_STYLES = {
  SRC: 'projects/igniteui-angular/**/*.component.scss',
  IGNORE: '!projects/igniteui-angular/core/src/core/styles/**/*.scss',
  CONFIG: {
    ...SHARED_SASS_CONFIG,
    loadPaths: LOAD_PATHS,
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
  }),
  stripComments,
]);

function stripBom(s) {
  return s.charCodeAt(0) === 0xfeff ? s.slice(1) : s;
}

async function createFile(outputFile, content) {
  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, content, 'utf-8');
}

async function buildThemePresets() {
  const paths = await globby(`${THEMES.SRC}/**/*.scss`);
  const compiler = await sass.initAsyncCompiler();

  try {
    await Promise.all(
      paths.map(async (srcPath) => {
        const result = await compiler.compileAsync(srcPath, THEMES.CONFIG);
        const fileName = srcPath
          .replace(/\.scss$/, '.css')
          .replace(THEMES.SRC, '');

        let outCss = stripBom(postProcessor.process(result.css).css);

        const outputFile = DEST_DIR(fileName);

        // Write external source map alongside the CSS and reference it.
        if (result.sourceMap) {
          const mapFile = DEST_DIR('maps' + fileName + '.map');
          await createFile(mapFile, JSON.stringify(result.sourceMap));
          const relMap = path.relative(path.dirname(outputFile), mapFile);
          outCss += `\n\n/*# sourceMappingURL=${relMap} */`;
        }

        await createFile(outputFile, outCss);
      })
    );
  } finally {
    await compiler.dispose();
  }
}

export function createStylesBuilder(compiler) {
  // Reverse dependency map: absolute dep path -> Set of absolute entry point paths
  const depMap = new Map();

  // Forward map: absolute entry path -> Set of absolute dep paths
  const entryDeps = new Map();

  function trackDeps(loadedUrls, entryPath) {
    const absEntry = path.resolve(entryPath);
    let forward = entryDeps.get(absEntry);

    if (!forward) {
      forward = new Set();
      entryDeps.set(absEntry, forward);
    }

    for (const url of loadedUrls) {
      const dep = fileURLToPath(url);

      forward.add(dep);

      let reverse = depMap.get(dep);

      if (!reverse) {
        reverse = new Set();
        depMap.set(dep, reverse);
      }

      reverse.add(absEntry);
    }
  }

  function clearEntryDeps(absEntry) {
    const deps = entryDeps.get(absEntry);

    if (!deps) return;

    for (const dep of deps) {
      const reverse = depMap.get(dep);
      if (!reverse) continue;

      reverse.delete(absEntry);
      if (reverse.size === 0) depMap.delete(dep);
    }

    entryDeps.delete(absEntry);
  }

  async function compileComponent(srcPath) {
    const result = await compiler.compileAsync(srcPath, COMPONENT_STYLES.CONFIG);

    trackDeps(result.loadedUrls, srcPath);

    let css = stripBom(postProcessor.process(result.css).css);

    if (result.sourceMap) {
      const smBase64 = Buffer.from(JSON.stringify(result.sourceMap)).toString('base64');
      css += `\n\n/*# sourceMappingURL=data:application/json;charset=utf-8;base64,${smBase64} */`;
    }

    await createFile(srcPath.replace(/\.scss$/, '.css'), css);
  }

  async function compileBase(srcPath) {
    const result = await compiler.compileAsync(srcPath, BASE_STYLES.CONFIG);
    trackDeps(result.loadedUrls, srcPath);

    const css = stripBom(postProcessor.process(result.css).css);
    const exportName =
      path.basename(srcPath, '.styles.scss').toUpperCase().replace(/-/g, '_') + '_CSS';
    const ts = [
      '// Auto-generated — do not edit manually. Re-run build:styles to update.',
      `export const ${exportName} = ${JSON.stringify(css)};`,
      '',
    ].join('\n');

    const outPath = srcPath.replace(/\.scss$/, '.ts');
    const existing = await readFile(outPath, 'utf-8').catch(() => null);

    if (existing !== ts) await createFile(outPath, ts);
  }

  return {
    async build() {
      const [componentPaths, basePaths] = await Promise.all([
        globby([COMPONENT_STYLES.SRC, COMPONENT_STYLES.IGNORE]),
        globby(BASE_STYLES.SRC),
      ]);

      depMap.clear();
      entryDeps.clear();

      await Promise.all([
        ...componentPaths.map(compileComponent),
        ...basePaths.map(compileBase),
      ]);
    },

    async rebuild(changedPath) {
      const affected = depMap.get(path.resolve(changedPath));

      // Not in the dep map (new file, renamed, etc.) — fall back to full build
      if (!affected?.size) return this.build();

      await Promise.all(
        [...affected].map((absEntry) => {
          clearEntryDeps(absEntry);

          const relEntry = path.relative(process.cwd(), absEntry);

          return relEntry.endsWith('.component.scss')
            ? compileComponent(relEntry)
            : compileBase(relEntry);
        })
      );
    },
  };
}

export async function buildComponents(isProduction = false) {
  const start = performance.now();
  const compiler = await sass.initAsyncCompiler();

  try {
    await createStylesBuilder(compiler).build();
  } finally {
    await compiler.dispose();
  }

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
  try {
    await buildThemePresets();
  } catch (err) {
    report.error(err);
    throw err;
  }
  report.success(
    `Themes generated in ${((performance.now() - start) / 1000).toFixed(2)}s`
  );
}
