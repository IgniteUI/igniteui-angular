import * as path from 'path';

import { Tree } from '@angular-devkit/schematics';
import { getWorkspace, getWorkspacePath } from '@schematics/angular/utility/config';
import { WorkspaceProject, ProjectType } from '@schematics/angular/utility/workspace-models';
import { addPackageToPkgJson } from '../utils/dependency-handler';

const resetPackage = { 'minireset.css': '~0.0.4' };

export const cssImport = 'node_modules/minireset.css/minireset.css';
export const scssImport =
    `// CSS Reset, comment out if not required or using a different module\n`
    + `@import '~minireset.css/minireset';\n`;


export const addResetCss = (host: Tree): boolean => {
    const config = getWorkspace(host);
    const project = config.projects[config.defaultProject] as WorkspaceProject<ProjectType.Application>;
    let addPackage;

    const styleExts = ['scss', 'sass', 'css', 'less', 'styl'];
    const styleExt = styleExts.find(ext => host.exists(path.posix.join(project.sourceRoot, `styles.${ext}`)));
    if (!styleExt) {
        return false;
    }
    const stylesFile = path.posix.join(project.sourceRoot, `styles.${styleExt}`);

    switch (styleExt) {
    case 'sass':
    case 'scss':
        let content = host.read(stylesFile).toString();
        if (content.indexOf(`~minireset.css/minireset`) === -1) {
            content = scssImport + content;
            host.overwrite(stylesFile, content);
            addPackage = resetPackage;
        }
        break;
    case 'css':
    case 'less':
    case 'styl':
        if (!project.architect ||
            !project.architect.build ||
            project.projectType !== ProjectType.Application) {
            return false;
        }
        if (project.architect.build.options.styles) {
            project.architect.build.options.styles =
                [cssImport, ...project.architect.build.options.styles];
        } else {
            project.architect.build.options.styles = [cssImport];
        }
        host.overwrite(getWorkspacePath(host), JSON.stringify(config, null, 2));
        addPackage = resetPackage;
        break;
    default:
        break;
    }

    if (addPackage) {
        const name = Object.keys(resetPackage)[0];
        return addPackageToPkgJson(host, name, resetPackage[name], 'dependencies');
    }
    return false;
};
