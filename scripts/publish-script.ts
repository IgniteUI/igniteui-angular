import * as child_process from 'child_process';
import * as path from 'path';
import * as util from 'util';
const dist = '../dist/';

const projectNames = ['igniteui-angular', 'igniteui-angular-extras'];
const exec = util.promisify(child_process.exec);

projectNames.forEach( async(project) => {
    const cwd = path.join(__dirname, `${dist + project}`);
    const {stdout, stderr} = await exec(`npm publish --tag ${process.env.NPM_TAG}`, {cwd});
    if (stderr) {
        throw new Error(`error: ${stderr}`);
      }
      console.log(`Number of files ${stdout}`);
});
