import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname, resolve, join } from 'path';
import sassdoc from 'sassdoc';
import { globby } from 'globby';
import getArgs from './get-args.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = resolve(__dirname, '..');

const DOCS_OUTPUT_PATH = join(rootDir, 'dist', 'igniteui-angular', 'docs');
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
  DEST: join(DOCS_OUTPUT_PATH, 'sass'),
};

function createSassdocConfig(options = {}) {
  return {
    dest: SASSDOC.DEST,
    theme: './node_modules/igniteui-sassdoc-theme',
    language: options.language || 'en',
    autofill: ['parameter', 'property'],
    environment: options.environment || 'production',
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

async function createDocsOutputDir() {
  try {
    if (!fs.existsSync(DOCS_OUTPUT_PATH)) {
      await fs.ensureDir(DOCS_OUTPUT_PATH);
      console.log(`Created output directory: ${DOCS_OUTPUT_PATH}`);
    }
  } catch (err) {
    console.error(`Error creating output directory: ${err.message}`);
    throw err;
  }
}

function cleanOutputDir() {
  fs.removeSync(SASSDOC.DEST);
  console.log(`Cleaned output directory: ${SASSDOC.DEST}`);
}

async function findFiles(patterns) {
  try {
    const files = await globby(patterns, {
      ignore: ['**/schemas/**/!(index|_index).scss'],
    });
    return files;
  } catch (err) {
    console.error(`Error finding files: ${err.message}`);
    throw err;
  }
}

async function processFiles(files, config) {
  try {
    await sassdoc(files, config);
    console.log(`SassDoc processing completed successfully`);
  } catch (err) {
    console.error(`Error processing SassDoc: ${err.message}`);
    throw err;
  }
}

async function build() {
  const { environment, language, mode } = getArgs();

  const config = createSassdocConfig({
    language,
    environment,
    localizationMode: mode,
  });

  const files = await findFiles(SASSDOC.PROJECT_PATHS);
  await processFiles(files, config);
}

async function main() {
  try {
    // Create output directory
    await createDocsOutputDir();

    // Clean output directory and build
    cleanOutputDir();
    await build();
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
}

main();
