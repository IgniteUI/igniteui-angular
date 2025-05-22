import fs from 'fs-extra';
import { Readable } from 'node:stream';
import { fileURLToPath } from 'url';
import path, { dirname, resolve, join } from 'path';
import sassdoc from 'sassdoc';
import { globby } from 'globby';
import getArgs from './get-args.mjs';
import { log, logError } from './logger.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');

const OUT_DIR = join(rootDir, 'dist', 'igniteui-angular', 'docs');
const SASSDOC = {
  PROJECT_PATHS: [
    join(
      rootDir,
      'projects',
      'igniteui-angular',
      'src',
      'lib',
      'core',
      'styles',
      '**',
      '*.scss'
    ),
    join(rootDir, 'node_modules', 'igniteui-theming', 'sass', '**', '*.scss'),
  ],
  DEST: join(OUT_DIR, 'sass'),
};

/**
 * Extracts the base directory from a glob pattern string.
 *
 * This function normalizes the path separators, finds the first occurrence
 * of any glob character ('*', '?', '['), and returns the directory path
 * up to (but not including) the first glob character. If no glob character
 * is found, it returns the directory name of the pattern.
 *
 * Example:
 *   getBaseFromGlob('assets/images/*.{png,jpg}') // returns 'assets/images'
 *   getBaseFromGlob('file.txt') // returns '.'
 *
 * @param {string} pattern - A glob pattern
 * @return {string} - The base directory
 */
function getBaseFromGlob(pattern) {
  pattern = pattern.replace(/\\/g, '/');

  const globCharIndex = Math.min(
    pattern.indexOf('*') !== -1 ? pattern.indexOf('*') : Infinity,
    pattern.indexOf('?') !== -1 ? pattern.indexOf('?') : Infinity,
    pattern.indexOf('[') !== -1 ? pattern.indexOf('[') : Infinity
  );

  if (globCharIndex === Infinity) {
    return path.dirname(pattern);
  }

  const beforeGlob = pattern.substring(0, globCharIndex);
  const lastSlashIndex = beforeGlob.lastIndexOf('/');

  if (lastSlashIndex === -1) {
    return '.';
  }

  return pattern.substring(0, lastSlashIndex);
}

/**
 * Creates a stream with properties the sassdoc parser needs for a given array of file paths.
 *
 * @param {string[]} filePaths - Array of file paths
 * @returns {NodeJS.ReadableStream} - A readable stream of file objects
 */
function createFileStream(filePaths, baseMap) {
  const stream = new Readable({ objectMode: true });

  let index = 0;
  stream._read = function () {
    if (index >= filePaths.length) {
      return this.push(null); // End of stream
    }

    const filepath = filePaths[index++];

    try {
      const base = baseMap[filepath] || path.dirname(filepath);
      const contents = fs.readFileSync(filepath, 'utf8');

      this.push({
        path: filepath,
        // [!IMPORTANT] - This is the path that will be used in the rendered documentation to link to the source code.
        relative: path.relative(base, filepath),
        contents: Buffer.from(contents),
        base: base,
        cwd: process.cwd(),
        isBuffer: function () {
          return true;
        },
        isStream: function () {
          return false;
        },
      });
    } catch (err) {
      logError('sassdoc', `Error reading file ${filepath}:`, err);
      this._read();
    }
  };

  return stream;
}

function createConfig(options = {}) {
  return {
    dest: SASSDOC.DEST,
    theme: './node_modules/igniteui-sassdoc-theme',
    language: options.language,
    autofill: ['parameter', 'property'],
    environment: options.environment,
    display: {
      alias: true,
      access: ['public'],
    },
    plugins: [
      {
        name: 'sassdoc-plugin-localization',
        path: './node_modules/sassdoc-plugin-localization/dist/index.js',
        options: {
          dir: options.localizationDir || 'extras/sassdoc',
          mode: options.localizationMode || 'both',
          languages: ['en', 'ja'],
        },
      },
    ],
    ...options,
  };
}

async function createOutputDir() {
  try {
    if (!fs.existsSync(OUT_DIR)) {
      await fs.ensureDir(OUT_DIR);
      log('sassdoc', `Created output directory: ${OUT_DIR}`);
    }
  } catch (err) {
    logError('sassdoc', `Error creating output directory: ${err.message}`);
    throw err;
  }
}

function cleanOutputDir() {
  fs.removeSync(SASSDOC.DEST);
  log('sassdoc', `Cleaned output directory: ${SASSDOC.DEST}`);
}

async function findFiles(patterns) {
  const baseMap = {};
  let files = [];

  for (const pattern of patterns) {
    const base = getBaseFromGlob(pattern);
    const _files = await globby(pattern, {
      ignore: ['**/schemas/**/!(index|_index).scss'],
    });

    _files.forEach((file) => {
      baseMap[file] = base;
    });

    files = [...files, ..._files];
  }

  return {
    files,
    baseMap,
  };
}

async function processFiles(files, baseMap, config) {
  try {
    const stream = createFileStream(files, baseMap);
    const env = sassdoc.ensureEnvironment(config);
    env.dest = config.dest;

    log('sassdoc', `Processing ${files.length} files...`);
    log('sassdoc', `Theme: ${config.theme || 'default'}`);
    log('sassdoc', `Destination: ${env.dest}`);

    const filter = sassdoc.parse(env);
    let parsedData = [];

    // Pipe our stream to sassdoc's parse filter
    const processPromise = new Promise((resolve, reject) => {
      stream
        .pipe(filter)
        .on('data', (data) => {
          parsedData = data;
        })
        .on('end', () => {
          log('sassdoc', `Parsing completed successfully.`);
          log('sassdoc', `Found ${parsedData.length} documented items.`);
          env.data = parsedData;
          resolve();
        })
        .on('error', (err) => {
          logError('sassdoc', `Parsing error: ${err.message}`);
          reject(err);
        });
    });

    await processPromise;

    /**
     * Manually handle theme rendering.
     * This provides the flexibility to replace the sassdoc parser in the future (if needed).
     */
    if (parsedData.length > 0) {
      await fs.ensureDir(env.dest);

      if (typeof env.theme === 'function') {
        await env.theme(env.dest, env);
        log('sassdoc', `Theme rendered successfully at ${env.dest}`);
      } else {
        throw new Error('Theme is not a function. Check your configuration.');
      }
    } else {
      log('sassdoc', 'No documented items found. No output generated.');
    }

    log('sassdoc', `Processing completed successfully.`);
  } catch (err) {
    logError('sassdoc', `Error processing SassDoc: ${err.message}`);
    throw err;
  }
}

async function build() {
  const { environment, language, mode } = getArgs();

  const config = createConfig({
    language,
    environment,
    localizationMode: mode,
  });

  const { files, baseMap } = await findFiles(SASSDOC.PROJECT_PATHS);
  await processFiles(files, baseMap, config);
}

async function main() {
  try {
    await createOutputDir();

    cleanOutputDir();
    await build();
  } catch (err) {
    logError('sassdoc', `Error: ${err.message}`);
    process.exit(1);
  }
}

main();
