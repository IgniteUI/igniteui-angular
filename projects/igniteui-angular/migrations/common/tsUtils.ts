// tslint:disable-next-line:no-implicit-dependencies
import * as ts from 'typescript';
import * as tss from 'typescript/lib/tsserverlibrary';
import { Tree } from '@angular-devkit/schematics';
import { MemberChange } from './schema';
import { escapeRegExp } from './util';
import { Logger } from './tsLogger';

export const PACKAGE_IMPORT = 'igniteui-angular';

/** Returns an source file */
// export function getFileSource(sourceText: string): ts.SourceFile {
//     return ts.createSourceFile('', sourceText, ts.ScriptTarget.Latest, true);
// }

export function getIdentifierPositions(sourceText: string, name: string): Array<{ start: number, end: number }> {
    const source = ts.createSourceFile('', sourceText, ts.ScriptTarget.Latest, true);
    const positions = [];

    const checkIdentifier = (node: ts.Node): boolean => {
        if (node.kind !== ts.SyntaxKind.Identifier || !node.parent) {
            return false;
        }
        if (node.parent.kind === ts.SyntaxKind.PropertyDeclaration) {
            return false;
        }
        if (node.parent.kind === ts.SyntaxKind.PropertyAssignment ||
            node.parent.kind === ts.SyntaxKind.PropertySignature) {
            // make sure it's not prop assign  `= { IgxClass: "fake"}`
            //                  definition `prop: { IgxClass: string; }`
            //                                     name: initializer
            const propAssign: ts.PropertyAssignment | ts.PropertySignature = node.parent as ts.PropertyAssignment | ts.PropertySignature;
            if (propAssign.name.getText() === name) {
                return false;
            }
        }
        return (node as ts.Identifier).text === name;
    };

    const findIdentifiers = (node: ts.Node) => {
        if (checkIdentifier(node)) {
            // Use `.getStart()` as node.pos includes the space(s) before the identifier text
            positions.push({ start: node.getStart(), end: node.end });
        }
        ts.forEachChild(node, findIdentifiers);
    };
    source.forEachChild(findIdentifiers);
    return positions;
}

/** Returns the positions of import from module string literals  */
export function getImportModulePositions(sourceText: string, startsWith: string): Array<{ start: number, end: number }> {
    const source = ts.createSourceFile('', sourceText, ts.ScriptTarget.Latest, true);
    const positions = [];

    for (const statement of source.statements) {
        if (statement.kind === ts.SyntaxKind.ImportDeclaration) {
            const specifier = (statement as ts.ImportDeclaration).moduleSpecifier as ts.StringLiteral;
            if (specifier.text.startsWith(startsWith)) {
                // string literal pos will include quotes, trim with 1
                positions.push({ start: specifier.getStart() + 1, end: specifier.end - 1 });
            }
        }
    }
    return positions;
}

/** Filters out statements to named imports (e.g. `import {x, y}`) from PACKAGE_IMPORT */
const namedImportFilter = (statement: ts.Statement) => {
    if (statement.kind === ts.SyntaxKind.ImportDeclaration &&
        ((statement as ts.ImportDeclaration).moduleSpecifier as ts.StringLiteral).text === PACKAGE_IMPORT) {

        const clause = (statement as ts.ImportDeclaration).importClause;
        return clause && clause.namedBindings && clause.namedBindings.kind === ts.SyntaxKind.NamedImports;
    }
    return false;
};

export function getRenamePositions(sourcePath: string, name: string, service: ts.LanguageService):
    Array<{ start: number, end: number }> {

    const source = service.getProgram().getSourceFile(sourcePath);
    const positions = [];

    const imports = source.statements.filter(<(a: ts.Statement) => a is ts.ImportDeclaration>namedImportFilter);
    if (!imports.length) {
        return positions;
    }
    const elements: ts.NodeArray<ts.ImportSpecifier> =
        imports
            .map(x => (x.importClause.namedBindings as ts.NamedImports).elements)
            .reduce((prev, current) => prev.concat(current) as unknown as ts.NodeArray<ts.ImportSpecifier>);

    for (const elem of elements) {
        if (elem.propertyName && elem.propertyName.text === name) {
            // alias imports `igxClass as smth` -> <propertyName> as <name>
            // other references are only for the name portion
            positions.push({ start: elem.propertyName.getStart(), end: elem.propertyName.getEnd() });
            break;
        }

        if (!elem.propertyName && elem.name.text === name) {
            const renames = service.findRenameLocations(sourcePath, elem.name.getStart(), false, false, false);
            if (renames) {
                const renamesPos = renames.map(x => ({ start: x.textSpan.start, end: x.textSpan.start + x.textSpan.length }));
                positions.push(...renamesPos);
            }
        }
    }

    return positions;
}

export function findMatches(content: string, change: MemberChange): number[] {
    let matches: RegExpExecArray;
    const regex = new RegExp(escapeRegExp(change.member), 'g');
    const matchesPositions = [];
    do {
        matches = regex.exec(content);
        if (matches) {
            matchesPositions.push(matches.index);
        }
    } while (matches);

    return matchesPositions;
}

export function replaceMatch(content: string, toReplace: string, replaceWith: string, index: number): string {
    return content.substring(0, index)
        + replaceWith
        + content.substring(index + toReplace.length, content.length);
}

//#region Language Service

/**
 * Create a TypeScript language service
 * @param serviceHost A TypeScript language service host
 */
export function getLanguageService(servicesHost: ts.LanguageServiceHost): ts.LanguageService {
    return ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
}

/**
 * Create a TypeScript language service host
 * @param filePaths Paths for files to include for the language service host
 * @param host Virtual FS host
 * @param options Typescript compiler options for the service
 */
export function getLanguageServiceHost(filePaths: string[], host: Tree, options: ts.CompilerOptions = {}): ts.LanguageServiceHost {
    const fileVersions = new Map<string, number>();
    patchHostOverwrite(host, fileVersions);
    return {
        getCompilationSettings: () => options,
        getScriptFileNames: () => filePaths,
        getScriptVersion: fileName => {
            // return host.actions.filter(x => x.path === fileName && x.kind !== 'c').length.toString();
            const version = fileVersions.get(fileName) || 0;
            return version.toString();
        },
        getScriptSnapshot: fileName => {
            if (!host.exists(fileName)) {
                return undefined;
            }
            return ts.ScriptSnapshot.fromString(host.read(fileName).toString());
        },
        getCurrentDirectory: () => process.cwd(),
        getDefaultLibFileName: opts => ts.getDefaultLibFilePath(opts),
        fileExists: fileName => {
            return filePaths.indexOf(fileName) !== -1;
        }
    };
}

function patchHostOverwrite(host: Tree, fileVersions: Map<string, number>) {
    const original = host.overwrite;
    host.overwrite = (path: string, content: Buffer | string) => {
        const version = fileVersions.get(path) || 0;
        fileVersions.set(path, version + 1);
        original.call(host, path, content);
    };
}

export function createProjectService(serverHost: tss.server.ServerHost): tss.server.ProjectService {
    // set traceToConsole to true to enable logging
    const logger = new Logger(false, tss.server.LogLevel.verbose);
    const projectService = new tss.server.ProjectService({
        host: serverHost,
        logger: logger,
        /* not needed since we will run only migrations */
        cancellationToken: tss.server.nullCancellationToken,
        /* do not allow more than one InferredProject per project root */
        useSingleInferredProject: true,
        useInferredProjectPerProjectRoot: true,
        /* will load only global plug-ins */
        globalPlugins: ['@angular/language-service'],
        allowLocalPluginLoads: false,
        typingsInstaller: tss.server.nullTypingsInstaller
    });
    projectService.setHostConfiguration({
        formatOptions: projectService.getHostFormatCodeOptions(),
        extraFileExtensions: [
            {
                extension: '.html',
                isMixedContent: false,
                scriptKind: tss.ScriptKind.External,
            }
        ]
    });
    projectService.configurePlugin({
        pluginName: '@angular/language-service',
        configuration: {
            angularOnly: false,
        },
    });

    return projectService;
}

export function getTypeDefinitionAtPosition(langServ: tss.LanguageService, entryPath: string, position: number): tss.DefinitionInfo | null {
    const definition = langServ.getDefinitionAndBoundSpan(entryPath, position)?.definitions[0];
    if (!definition) { return null; }
    if (definition.kind.toString() === 'reference') {
        // template variable in an internal/external template
        return langServ.getDefinitionAndBoundSpan(entryPath, definition.textSpan.start).definitions[0];
    }
    let typeDefs = langServ.getTypeDefinitionAtPosition(entryPath, definition.textSpan.start);
    if (!typeDefs) {
        // ts property referred in an internal/external template
        const classDeclaration = langServ
            .getProgram()
            .getSourceFile(definition.fileName)
            .statements
                .filter(<(a: ts.Statement) => a is ts.ClassDeclaration>(m => m.kind === ts.SyntaxKind.ClassDeclaration))
                .find(m => m.name.getText() === definition.containerName);
        const member: ts.ClassElement = classDeclaration
            .members
            .find(m => m.name.getText() === definition.name);
        if (!member || !member.name) { return null; }
        typeDefs = langServ.getTypeDefinitionAtPosition(definition.fileName, member.name.getStart() + 1);
    }
    if (typeDefs?.length) {
        return typeDefs[0];
    }

    return null;
}

//#endregion
