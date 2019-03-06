import * as path from 'path';

import { Tree } from '@angular-devkit/schematics';
import { getWorkspace, getWorkspacePath } from '@schematics/angular/utility/config';
import { WorkspaceProject, ProjectType } from '@schematics/angular/utility/workspace-models';

const cssPackage = { 'normalize.css': '^8.0.1' };
const scssPackage = { 'normalize-scss': '^7.0.1' };

export const cssImport = 'node_modules/normalize.css/normalize.css';
export const scssImport = `@import "~/normalize-scss/sass/normalize";\n`
    + `// Standard CSS normalize, comment out if not required or using a different module\n`
    + `@include normalize();\n`;

export const scssBoxSizing =
    `*, *::before, *::after {\n`
    + `    box-sizing: border-box;\n`
    + `}\n\n`;

export const sassBoxSizing =
    `*, *::before, *::after \n`
    + `    box-sizing: border-box\n\n`;

export function addNormalizeCss(host: Tree): boolean {
    const config = getWorkspace(host);
    const project = config.projects[config.defaultProject] as WorkspaceProject<ProjectType.Application>;
    let addPackage;

    const styleExts = ['css', 'scss', 'sass'];
    const styleExt = styleExts.find(ext => host.exists(path.posix.join(project.sourceRoot, `styles.${ext}`)));
    if (!styleExt) {
        return false;
    }
    const stylesFile = path.posix.join(project.sourceRoot, `styles.${styleExt}`);

    let stylesContent = host.read(stylesFile).toString();
    let boxSizeStyle = scssBoxSizing;

    switch (styleExt) {
    case 'sass':
        boxSizeStyle = sassBoxSizing;
        /* falls through */
    case 'scss':
        if (stylesContent.indexOf(`@include normalize();`) === -1) {
            stylesContent = scssImport + boxSizeStyle + stylesContent;
            host.overwrite(stylesFile, stylesContent);
            addPackage = scssPackage;
        }
        break;
    case 'css':
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
        stylesContent =
            `/* Box sizing reset and normalize.css (in angular.json styles), remove if not required or using a different module */\n`
            + scssBoxSizing
            + stylesContent;
        host.overwrite(stylesFile, stylesContent);
        host.overwrite(getWorkspacePath(host), JSON.stringify(config, null, 2));
        addPackage = cssPackage;
        break;
    default:
        break;
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
