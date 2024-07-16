import * as path from 'path';

import type { Tree } from '@angular-devkit/schematics';
import { addPackageToPkgJson } from '../utils/dependency-handler';
import { JsonArray, workspaces } from '@angular-devkit/core';
import { ProjectType } from '../utils/util';

const resetPackage = { 'minireset.css': '~0.0.4' };

export const cssImport = 'node_modules/minireset.css/minireset.css';
export const scssImport =
    `// CSS Reset, comment out if not required or using a different module\n`
    + `@import 'minireset.css/minireset';\n`;


export const addResetCss = (workspace: workspaces.WorkspaceDefinition, host: Tree): boolean => {
    let status = false;
    let addPackage;
    const styleExts = ['scss', 'sass', 'css', 'less', 'styl'];
    workspace.projects.forEach(project => {
        const styleExt = styleExts.find(ext => host.exists(path.posix.join(project.sourceRoot, `styles.${ext}`)));
        if (!styleExt) {
            return;
        }
        const stylesFile = path.posix.join(project.sourceRoot, `styles.${styleExt}`);

        switch (styleExt) {
            case 'sass':
            case 'scss':
                let content = host.read(stylesFile).toString();
                if (content.indexOf(`minireset.css/minireset`) === -1) {
                    content = scssImport + content;
                    host.overwrite(stylesFile, content);
                    addPackage = resetPackage;
                }
                break;
            case 'css':
            case 'less':
            case 'styl':
                const build = project.targets.get('build');
                if (!build || project.extensions['projectType'] !== ProjectType.Application) {
                    return;
                }
                if (build.options.styles) {
                    build.options.styles =
                        [cssImport, ...build.options.styles as JsonArray];
                } else {
                    build.options.styles = [cssImport];
                }
                addPackage = resetPackage;
                break;
            default:
                break;
        }
    });

    if (addPackage) {
        const name = Object.keys(resetPackage)[0];
        status = addPackageToPkgJson(host, name, resetPackage[name], 'dependencies');
    }

    return status;
};
