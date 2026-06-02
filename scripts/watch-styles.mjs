import watch from 'node-watch';
import * as sass from 'sass-embedded';
import report from './report.mjs';
import { buildComponentStyles, buildBaseStyles } from './sass.mjs';

const watchOptions = {
  recursive: true,
  filter: (path) => {
    return /.(?:scss)$/.test(path);
  },
};

let updating = false;
const compiler = await sass.initAsyncCompiler();

const watcher = watch(
  ['projects/igniteui-angular'],
  watchOptions,
  async (_, path) => {
    if (updating) {
      return;
    }

    report.warn(`Change detected: ${path}`);
    updating = true;

    try {
      await Promise.all([buildComponentStyles(), buildBaseStyles()]);
    } catch (err) {
      report.error(err);
    }

    report.success('Styles rebuilt 🎨');
    updating = false;
  }
);

watcher.on('close', () => compiler.dispose());

report.info('Styles watcher started...');
