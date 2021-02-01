import * as path from 'path';
import * as sassTrue from 'sass-true';

const file = path.join(__dirname, '_index.scss');
sassTrue.runSass({ file }, { describe, it });
