import * as child_process from 'child_process';
import * as path from 'path';
const dist = '../dist/';

const projectNames = ['igniteui-angular', 'igniteui-angular-extras'];

projectNames.forEach( (project) => {
    const cwd = path.join(__dirname, `${dist + project}`);
    child_process.execSync(`npm publish --tag ${process.env.NPM_TAG}`, {cwd});
});
