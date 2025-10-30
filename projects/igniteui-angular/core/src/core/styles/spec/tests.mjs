import * as path from 'path';
import * as sassTrue from 'sass-true';
import { fileURLToPath } from "url";
import {} from 'jasmine';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const file = path.join(__dirname, '_index.scss');
sassTrue.runSass({ describe, it }, file, { loadPaths: ['node_modules'] });
