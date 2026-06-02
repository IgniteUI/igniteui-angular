import watch from 'node-watch';
import report from './report.mjs';
import { buildComponents } from './sass.mjs';

const watchOptions = {
  recursive: true,
  filter: (path) => {
    return /.(?:scss)$/.test(path);
  },
};

let updating = false;

watch(
  ['projects/igniteui-angular'],
  watchOptions,
  async (_, path) => {
    if (updating) {
      return;
    }

    report.warn(`Change detected: ${path}`);
    updating = true;

    try {
      await buildComponents();
    } catch (err) {
      report.error(err);
    }

    report.success('Styles rebuilt 🎨');
    updating = false;
  }
);

report.info('Styles watcher started...');
