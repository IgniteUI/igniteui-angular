import watch from 'node-watch';
import * as sass from 'sass-embedded';
import report from './report.mjs';
import { createStylesBuilder } from './sass.mjs';
import getArgs from './get-args.mjs';

const { 'no-initial': skipInitial } = getArgs();

const compiler = await sass.initAsyncCompiler();
const builder = createStylesBuilder(compiler);

if (!skipInitial) {
  await builder.build();
}

const watcher = watch(
  ['projects/igniteui-angular'],
  { recursive: true, filter: (p) => /\.scss$/.test(p) },
  async (_, changedPath) => {
    report.warn(`Change detected: ${changedPath}`);

    try {
      await builder.rebuild(changedPath);
    } catch (err) {
      report.error(err);
    }

    report.success('Styles rebuilt 🎨');
  }
);

watcher.on('close', () => compiler.dispose());
report.info('Styles watcher started...');
