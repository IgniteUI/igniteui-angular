import { normalize } from '@angular-devkit/core';
import * as path from 'path';
import { SchematicContext, Tree } from '@angular-devkit/schematics';
import { WorkspaceSchema, WorkspaceProject, ProjectType } from '@schematics/angular/utility/workspace-models';
import { execSync } from 'child_process';
import {
    Attribute,
    Comment,
    Element,
    Expansion,
    ExpansionCase,
    getHtmlTagDefinition,
    HtmlParser,
    Node,
    Text,
    Visitor
} from '@angular/compiler';

const configPaths = ['/.angular.json', '/angular.json'];

export function getProjectPaths(config: WorkspaceSchema, appendPrefix = true): string[] {
    const sourceDirs = [];
    let globalPrefix;

    if (config.schematics && config.schematics['@schematics/angular:component']) {
        // updated projects have global prefix rather than per-project:
        globalPrefix = config.schematics['@schematics/angular:component'].prefix;
    }
    const projects = getProjects(config);
    for (const proj of projects) {
        let sourcePath = path.join('/', proj.sourceRoot);
        if (appendPrefix && (proj.prefix || globalPrefix)) {
            sourcePath = path.join(sourcePath, proj.prefix || globalPrefix);
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

interface TagOffset {
    start: number;
    end: number;
}

export interface SourceOffset {
    startTag: TagOffset;
    endTag: TagOffset;
    file: {
        content: string;
        url: string;
    };
}

export type FileChange = [number, string, number];

/**
 * Parses an Angular template file/content and returns an array of the root nodes of the file.
 *
 * @param host
 * @param filePath
 * @param encoding
 */
export function parseFile(host: Tree, filePath: string, encoding = 'utf8') {
    return new HtmlParser().parse(host.read(filePath).toString(encoding), filePath).rootNodes;
}

export function findElementNodes(root: Node[], tag: string | string[]): Node[] {
    const tags = new Set(Array.isArray(tag) ? tag : [tag]);
    return flatten(Array.isArray(root) ? root : [root])
        .filter((node: Element) => tags.has(node.name));
}

export function getSourceOffset(element: Element): SourceOffset {
    const { startSourceSpan, endSourceSpan } = element;
    return {
        startTag: { start: startSourceSpan.start.offset, end: startSourceSpan.end.offset },
        endTag: { start: endSourceSpan.start.offset, end: endSourceSpan.end.offset },
        file: {
            content: startSourceSpan.start.file.content,
            url: startSourceSpan.start.file.url
        }
    };
}

export function generateFileChange(start: TagOffset, content: string): FileChange {
    return [start.end, content, content.length];
}

function isElement(node: Node | Element): node is Element {
    return (node as Element).children !== undefined;
}

/**
 * Given an array of `Node` objects, flattens the ast tree to a single array.
 * De facto only `Element` type objects have children.
 *
 * @param list
 */
export function flatten(list: Node[]) {
    let node: Node;
    let r: Node[] = [];

    for (let i = 0; i < list.length; i++) {
        node = list[i];
        r.push(node);

        if (isElement(node)) {
            r = r.concat(flatten(node.children));
        }
    }
    return r;
}

/**
 * https://github.com/angular/angular/blob/master/packages/compiler/test/ml_parser/util/util.ts
 *
 * May be useful for validating the output of our own migrations,
 */
class SerializerVisitor implements Visitor {

    visitElement(element: Element, context: any): any {
        if (getHtmlTagDefinition(element.name).isVoid) {
            return `<${element.name}${this._visitAll(element.attrs, ' ')}/>`;
        }

        return `<${element.name}${this._visitAll(element.attrs, ' ')}>${this._visitAll(element.children)}</${element.name}>`;
    }

    visitAttribute(attribute: Attribute, context: any): any {
        return `${attribute.name}="${attribute.value}"`;
    }

    visitText(text: Text, context: any): any {
        return text.value;
    }

    visitComment(comment: Comment, context: any): any {
        return `<!--${comment.value}-->`;
    }

    visitExpansion(expansion: Expansion, context: any): any {
        return `{${expansion.switchValue}, ${expansion.type},${this._visitAll(expansion.cases)}}`;
    }

    visitExpansionCase(expansionCase: ExpansionCase, context: any): any {
        return ` ${expansionCase.value} {${this._visitAll(expansionCase.expression)}}`;
    }

    private _visitAll(nodes: Node[], join: string = ''): string {
        if (nodes.length === 0) {
            return '';
        }
        return join + nodes.map(a => a.visit(this, null)).join(join);
    }
}


export function serializeNodes(nodes: Node[]): string[] {
    return nodes.map(node => node.visit(new SerializerVisitor(), null));
}
