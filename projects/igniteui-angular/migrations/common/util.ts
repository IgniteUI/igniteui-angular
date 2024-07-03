import { normalize } from '@angular-devkit/core';
import * as path from 'path';
import type { SchematicContext, Tree } from '@angular-devkit/schematics';
import type { WorkspaceSchema, WorkspaceProject } from '@schematics/angular/utility/workspace-models';
import { execSync } from 'child_process';
import type {
    Attribute,
    Block,
    BlockParameter,
    Comment,
    Element,
    Expansion,
    ExpansionCase,
    HtmlParser,
    HtmlTagDefinition,
    LetDeclaration,
    Node,
    Text,
    Visitor
} from '@angular/compiler';

const configPaths = ['/.angular.json', '/angular.json'];

export const getProjectPaths = (config: WorkspaceSchema): string[] => {
    const sourceDirs = [];

    const projects = getProjects(config);
    for (const proj of projects) {
        const sourcePath = path.join('/', proj.sourceRoot);
        sourceDirs.push(normalize(sourcePath));
    }
    return sourceDirs;
};

export const getWorkspacePath = (host: Tree): string => configPaths.find(x => host.exists(x));

export const getWorkspace = (host: Tree): WorkspaceSchema => {
    const configPath = getWorkspacePath(host);
    if (configPath) {
        return JSON.parse(host.read(configPath).toString());
    }
    return null;
};

export const getProjects = (config: WorkspaceSchema): WorkspaceProject[] => {
    const projects: WorkspaceProject[] = [];

    for (const projName of Object.keys(config.projects)) {
        const proj = config.projects[projName];
        if ((proj.architect && proj.architect.e2e && !proj.architect.build)) {
            // skip old style e2e-only projects
            continue;
        }
        projects.push(proj);
    }
    return projects;
};

export const escapeRegExp = (string) => string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string

export const replaceMatch = (content: string, toReplace: string, replaceWith: string, index: number): string =>
    content.substring(0, index) +
    replaceWith +
    content.substring(index + toReplace.length, content.length);

export const supports = (name: string): boolean => {
    try {
        execSync(`${name} --version`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
};

export const getPackageManager = (host: Tree) => {
    const hasYarn = supports('yarn');
    const hasYarnLock = host.exists('yarn.lock');
    if (hasYarn && hasYarnLock) {
        return 'yarn';
    }
    return 'npm';
};

export const canResolvePackage = (pkg: string): boolean => {
    try {
        // attempt resolve in child process to keep result out of package.json cache
        // otherwise resolve will not read the json again (after install) and won't load the main correctly
        // https://stackoverflow.com/questions/59865584/how-to-invalidate-cached-require-resolve-results
        execSync(`node -e "require.resolve('${pkg}');"`, { stdio: 'ignore' });
        return true;
    } catch {
        return false;
    }
};

export const getPackageVersion = (pkg: string): string => {
    let version = null;
    try {
        version = require(path.posix.join(pkg, 'package.json'))?.version;
    } catch {
        return version;
    }

    return version;
};

export const tryInstallPackage = (context: SchematicContext, packageManager: string, pkg: string) => {
    try {
        context.logger.debug(`Installing ${pkg} via ${packageManager}.`);
        switch (packageManager) {
            case 'yarn':
                execSync(`${packageManager} add ${pkg}`, { stdio: 'ignore' });
                break;
            case 'npm':
                execSync(`${packageManager} i ${pkg} --no-save --no-audit`, { stdio: 'ignore' });
                break;
        }
        context.logger.debug(`${pkg} installed successfully.`);
    } catch (e) {
        context.logger.warn(`Could not install ${pkg}.`, e);
    }
};

export const tryUninstallPackage = (context: SchematicContext, packageManager: string, pkg: string) => {
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
            .warn(`Could not uninstall ${pkg}, you may want to uninstall it manually.`, e);
    }
};

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
    node?: Element;
}


export class FileChange {

    constructor(
        public position = 0,
        public text = '',
        public replaceText = '',
        public type: 'insert' | 'replace' = 'insert'
    ) { }

    public apply(content: string) {
        if (this.type === 'insert') {
            return `${content.substring(0, this.position)}${this.text}${content.substring(this.position)}`;
        }
        return replaceMatch(content, this.replaceText, this.text, this.position);
    }
}

/**
 * Parses an Angular template file/content and returns an array of the root nodes of the file.
 * TODO: Maybe make async and dynamically import the HtmlParser
 * @param host
 * @param filePath
 * @param encoding
 */
export const parseFile = (parser: HtmlParser, host: Tree, filePath: string, encoding: BufferEncoding = 'utf8') =>
    parser.parse(host.read(filePath).toString(encoding), filePath).rootNodes;
// export const parseFile = async (host: Tree, filePath: string, encoding = 'utf8') => {
//     const { HtmlParser } = await import('@angular/compiler')
//     return new HtmlParser().parse(host.read(filePath).toString(encoding), filePath).rootNodes;
// }

export const findElementNodes = (root: Node[], tag: string | string[]): Node[] => {
    const tags = new Set(Array.isArray(tag) ? tag : [tag]);
    return flatten(Array.isArray(root) ? root : [root])
        .filter((node: Element) => tags.has(node.name));
};

export const hasAttribute = (root: Element, attribute: string | string[]) => {
    const attrs = Array.isArray(attribute) ? attribute : [attribute];
    return !!root.attrs.find(a => attrs.includes(a.name));
};

export const getAttribute = (root: Element, attribute: string | string[]) => {
    const attrs = Array.isArray(attribute) ? attribute : [attribute];
    return root.attrs.filter(a => attrs.includes(a.name));
};

export const getSourceOffset = (element: Element): SourceOffset => {
    const { startSourceSpan, endSourceSpan } = element;
    return {
        startTag: { start: startSourceSpan.start.offset, end: startSourceSpan.end.offset },
        // V.S. May 11th, 2021: Tag could be self-closing
        endTag: { start: endSourceSpan?.start.offset, end: endSourceSpan?.end.offset },
        file: {
            content: startSourceSpan.start.file.content,
            url: startSourceSpan.start.file.url
        },
        node: element
    };
};


const isElement = (node: Node | Element): boolean => (node as Element).children !== undefined;

/**
 * Given an array of `Node` objects, flattens the ast tree to a single array.
 * De facto only `Element` type objects have children.
 *
 * @param list
 */
export const flatten = (list: Node[]) => {
    let r: Node[] = [];

    for (const node of list) {
        r.push(node);

        if (isElement(node)) {
            r = r.concat(flatten((node as Element).children));
        }
    }
    return r;
};

/**
 * https://github.com/angular/angular/blob/master/packages/compiler/test/ml_parser/util/util.ts
 *
 * May be useful for validating the output of our own migrations,
 */
class SerializerVisitor implements Visitor {

    /**
     *
     */
    constructor(private getHtmlTagDefinition: (tagName: string) => HtmlTagDefinition) { }

    public visitElement(element: Element, _context: any): any {
        if (this.getHtmlTagDefinition(element.name).isVoid) {
            return `<${element.name}${this._visitAll(element.attrs, ' ', ' ')}/>`;
        }

        return `<${element.name}${this._visitAll(element.attrs, ' ', ' ')}>${this._visitAll(element.children)}</${element.name}>`;
    }

    public visitAttribute(attribute: Attribute, _context: any): any {
        return attribute.value === '' ? `${attribute.name}` : `${attribute.name}="${attribute.value}"`;
    }

    public visitText(text: Text, _context: any): any {
        return text.value;
    }

    public visitComment(comment: Comment, _context: any): any {
        return `<!--${comment.value}-->`;
    }

    public visitExpansion(expansion: Expansion, _context: any): any {
        return `{${expansion.switchValue}, ${expansion.type},${this._visitAll(expansion.cases)}}`;
    }

    public visitExpansionCase(expansionCase: ExpansionCase, _context: any): any {
        return ` ${expansionCase.value} {${this._visitAll(expansionCase.expression)}}`;
    }

    public visitBlock(block: Block, _context: any) {
        const params =
            block.parameters.length === 0 ? ' ' : ` (${this._visitAll(block.parameters, ';', ' ')}) `;
        return `@${block.name}${params}{${this._visitAll(block.children)}}`;
    }

    public visitBlockParameter(parameter: BlockParameter, _context: any) {
        return parameter.expression;
    }

    public visitLetDeclaration(decl: LetDeclaration, _context: any) {
        return decl;
    }

    private _visitAll(nodes: Node[], separator = '', prefix = ''): string {
        return nodes.length > 0 ? prefix + nodes.map(a => a.visit(this, null)).join(separator) : '';
    }
}


export const serializeNodes = (nodes: Node[], getHtmlTagDefinition: (tagName: string) => HtmlTagDefinition): string[] => {
    return nodes.map(node => node.visit(new SerializerVisitor(getHtmlTagDefinition), null))
};

export const makeNgIf = (name: string, value: string) => name.startsWith('[') && value !== 'true';

export const stringifyAttributes = (attributes: Attribute[]) => {
    let stringAttributes = '';
    attributes.forEach(element => {
        // eslint-disable-next-line max-len
        stringAttributes = stringAttributes.concat(element.name.includes('#') ? ` ${element.name} ` : `${element.name}="${element.value}" `);
    });
    return stringAttributes;
};
