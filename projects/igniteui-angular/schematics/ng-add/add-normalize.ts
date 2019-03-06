import * as path from 'path';

import { Tree } from '@angular-devkit/schematics';
import { getWorkspace, getWorkspacePath } from '@schematics/angular/utility/config';
import { WorkspaceProject, ProjectType } from '@schematics/angular/utility/workspace-models';

const cssPackage = { 'normalize.css': '^8.0.1' };
const scssPackage = { 'normalize-scss': '^7.0.1' };

export const cssImport = 'node_modules/normalize.css/normalize.css';
export const scssImport = `@import "../node_modules/normalize-scss/sass/normalize";\n`
    + `/* Standard CSS normalize, comment out if not required or using a different module */`
    + `@include normalize();\n`;

export function addNormalizeCss(host: Tree): boolean {
    const config = getWorkspace(host);
    const project = config.projects[config.defaultProject] as WorkspaceProject<ProjectType.Application>;
    let addPackage;

    const styleFiles = [path.posix.join(project.sourceRoot, `styles.scss`), path.posix.join(project.sourceRoot, `styles.sass`)];
    const stylesFile = styleFiles.find(filePath => host.exists(filePath));

    if (stylesFile) {
        let content = host.read(stylesFile).toString();
        if (content.indexOf(`@include normalize();`) === -1) {
            content = scssImport + content;
            host.overwrite(stylesFile, content);
            addPackage = scssPackage;
        }
    } else {
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
        addPackage = cssPackage;
    }

    if (addPackage) {
        const targetFile = 'package.json';
        if (host.exists(targetFile)) {
            const pkgJson = JSON.parse(host.read(targetFile).toString());
            pkgJson.dependencies = Object.assign({}, addPackage, pkgJson.dependencies);
            host.overwrite(targetFile, JSON.stringify(pkgJson, null, 2) + '\n');
            return true;
        }
    }
    return false;
}
