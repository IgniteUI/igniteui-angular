import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import * as semver from 'semver';

const projectNames = ['igniteui-angular', 'igniteui-angular-extras'];


function applyVersion()  {
    const version = semver.parse(process.argv[process.argv.length - 1]).version;
    const dist = '../dist/';
    projectNames.forEach(projectName => {
        const pckgJsonLocation = path.join(__dirname, `${dist + projectName}/package.json`);
        const pckgJson = JSON.parse(readFileSync(pckgJsonLocation,  'utf8'));
        pckgJson['version'] = version;

        const possiblePeerDependencies = projectNames.filter( name => name !== projectName);

        possiblePeerDependencies.forEach(pD => {
            if (pckgJson.peerDependencies[pD]) {
                const prefix = pckgJson.peerDependencies[pD].match(/[~\^]/g);
                pckgJson.peerDependencies[pD] = `${prefix ? prefix[0] : ''}${version}`;
            }
        });
        writeFileSync(pckgJsonLocation, JSON.stringify(pckgJson, null, 2) + '\n');
    });
}
applyVersion();
