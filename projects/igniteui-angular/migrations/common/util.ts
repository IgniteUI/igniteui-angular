import { normalize } from '@angular-devkit/core';
import * as path from 'path';
import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceSchema, WorkspaceProject, ProjectType } from '@schematics/angular/utility/workspace-models';
import { execSync } from 'child_process';

const configPaths = ['/.angular.json', '/angular.json'];

export function getProjectPaths(config: WorkspaceSchema, appendPrefix = true): string[] {
    const sourceDirs = [];

    const projects = getProjects(config);
    for (const proj of projects) {
        let sourcePath = path.join('/', proj.sourceRoot);
        if (appendPrefix && (proj.prefix)) {
            sourcePath = path.join(sourcePath, proj.prefix);
        }
        sourceDirs.push(normalize(sourcePath));
    }
    return sourceDirs;
}

export function getWorkspacePath(host: Tree): string {
    return configPaths.find(x => host.exists(x));
}

export function getWorkspace(host: Tree): WorkspaceSchema {
    const configPath = getWorkspacePath(host);
    if (configPath) {
        return JSON.parse(host.read(configPath).toString());
    }
    return null;
}

export function getProjects(config: WorkspaceSchema): WorkspaceProject<ProjectType.Application>[] {
    const projects: WorkspaceProject<ProjectType.Application>[] = [];

    for (const projName of Object.keys(config.projects)) {
        const proj = config.projects[projName];
        if ((proj.projectType && proj.projectType !== ProjectType.Application) ||
            (proj.architect && proj.architect.e2e && !proj.architect.build)) {
            continue;
        }
        projects.push(proj as WorkspaceProject<ProjectType.Application>);
    }
    return projects;
}

export function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function supports(name: string): boolean {
    try {
        execSync(`${name} --version`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
}

export function getPackageManager(host: Tree) {
    const hasYarn = supports('yarn');
    const hasYarnLock = host.exists('yarn.lock');
    if (hasYarn && hasYarnLock) {
        return 'yarn';
    }
    return 'npm';
}

export function canResolvePackage(pkg: string): boolean {
    let modulePath;
    try {
        modulePath = require.resolve(pkg);
    } finally {
        return !!modulePath;
    }
}

export function tryInstallPackage(context: SchematicContext, packageManager: string, pkg: string) {
    try {
        context.logger.debug(`Installing ${pkg} via ${packageManager}.`);
        switch (packageManager) {
            case 'yarn':
                execSync(`${packageManager} add ${pkg} --no-lock-file`, { stdio: 'ignore' });
                break;
            case 'npm':
                execSync(`${packageManager} i ${pkg} --no-save`, { stdio: 'ignore' });
                break;
        }
        context.logger.debug(`${pkg} installed successfully.`);
    } catch (e) {
        context.logger.warn(`Could not install ${pkg}.`, JSON.parse(e));
    }
}

export function tryUninstallPackage(context: SchematicContext, packageManager: string, pkg: string) {
    try {
        context.logger.debug(`Uninstalling ${pkg} via ${packageManager}`);
        switch (packageManager) {
            case 'yarn':
                execSync(`${packageManager} remove ${pkg}`, { stdio: 'ignore' });
                break;
            case 'npm':
                execSync(`${packageManager} uninstall ${pkg} --no-save`, { stdio: 'ignore' });
                break;
        }
        context.logger.debug(`${pkg} uninstalled successfully.`);
    } catch (e) {
        context.logger
            .warn(`Could not uninstall ${pkg}, you may want to uninstall it manually.`, JSON.parse(e));
    }
}
