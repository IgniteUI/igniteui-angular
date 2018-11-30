import { normalize, experimental } from '@angular-devkit/core';
import * as path from 'path';
import { Tree } from '@angular-devkit/schematics';

const configPaths = ['/.angular.json', '/angular.json'];

export function getProjectPaths(config: experimental.workspace.WorkspaceSchema, appendPrefix = true): string[] {
    const sourceDirs = [];
    let globalPrefix;

    if (config.schematics && config.schematics['@schematics/angular:component']) {
        // updated projects have global prefix rather than per-project:
        globalPrefix = config.schematics['@schematics/angular:component'].prefix;
    }
    const projects = getProjects(config);
    for (const proj of projects) {
        let sourcePath = path.join('/', proj.sourceRoot);
        if ( appendPrefix && (proj.prefix || globalPrefix) ) {
            sourcePath = path.join(sourcePath, proj.prefix || globalPrefix);
        }
        sourceDirs.push(normalize(sourcePath));
    }
    return sourceDirs;
}

export function getWorkspacePath(host: Tree): string {
    return configPaths.find(x => host.exists(x));
}

export function getWorkspace(host: Tree): experimental.workspace.WorkspaceSchema {
    const configPath = getWorkspacePath(host);
    if (configPath) {
        return JSON.parse(host.read(configPath).toString());
    }
    return null;
}

export function getProjects(config: experimental.workspace.WorkspaceSchema): experimental.workspace.WorkspaceProject[] {
    const projects: experimental.workspace.WorkspaceProject[] = [];

    for (const projName of Object.keys(config.projects)) {
        const proj = config.projects[projName];
        if (proj.architect && proj.architect.e2e) {
            // filter out e2e apps
            continue;
        }
        projects.push(proj);
    }
    return projects;
}

export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
