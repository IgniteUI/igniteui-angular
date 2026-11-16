import * as path from 'path';
import * as sassTrue from 'sass-true';
import { fileURLToPath } from "url";
import {} from 'jasmine';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '_index.scss');
// sass-embedded's sync compiler can garble multi-byte output
sassTrue.runSass({ describe, it, sass: 'sass' }, file, { loadPaths: ['node_modules'] });
