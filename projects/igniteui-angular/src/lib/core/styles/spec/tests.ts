import * as path from 'path';
import * as sassTrue from 'sass-true';
import {} from 'jasmine';

const file = path.join(__dirname, '_index.scss');
sassTrue.runSass({ file, includePaths: ['node_modules'] }, { describe, it });
