// eslint-disable-next-line import/no-extraneous-dependencies
import * as ts from 'typescript';
import * as tss from 'typescript/lib/tsserverlibrary';
import { Tree } from '@angular-devkit/schematics';
import { MemberChange } from './schema';
import { escapeRegExp } from './util';
import { Logger } from './tsLogger';
import { TSLanguageService } from './tsPlugin/TSLanguageService';

export const IG_PACKAGE_NAME = 'igniteui-angular';
export const NG_LANG_SERVICE_PACKAGE_NAME = '@angular/language-service';
export const NG_CORE_PACKAGE_NAME = '@angular/core';
export const CUSTOM_TS_PLUGIN_PATH = './tsPlugin';
export const CUSTOM_TS_PLUGIN_NAME = 'igx-ts-plugin';

enum SynaxTokens {
    ClosingParenthesis = ')',
    MemberAccess = '.',
    Question = '?'
}

/** Returns a source file */
// export function getFileSource(sourceText: string): ts.SourceFile {
//     return ts.createSourceFile('', sourceText, ts.ScriptTarget.Latest, true);
// }

export const getIdentifierPositions = (source: string | ts.SourceFile, name: string): Array<{ start: number; end: number }> => {
    if (typeof source === 'string') {
        source = ts.createSourceFile('', source, ts.ScriptTarget.Latest, true);
    }
    const positions = [];

    const checkIdentifier = (node: ts.Node): boolean => {
        if (!ts.isIdentifier(node) || !node.parent) {
            return false;
        }
        if (node.parent.kind === ts.SyntaxKind.PropertyDeclaration) {
            // `const identifier = ...`
            return false;
        }
        if (ts.isPropertyAssignment(node.parent) || ts.isPropertySignature(node.parent)) {
            // make sure it's not prop assign  `= { IgxClass: "fake"}`
            //                  definition `prop: { IgxClass: string; }`
            //                                     name: initializer
            if (node.parent.name.getText() === name) {
                return false;
            }
        }
        return node.text === name;
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
};

/** Returns the positions of import from module string literals  */
export const getImportModulePositions = (sourceText: string, startsWith: string): Array<{ start: number; end: number }> => {
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
};

/** Filters out statements to named imports (e.g. `import {x, y}`) from PACKAGE_IMPORT */
const namedImportFilter = (statement: ts.Statement) => {
    if (statement.kind === ts.SyntaxKind.ImportDeclaration &&
        ((statement as ts.ImportDeclaration).moduleSpecifier as ts.StringLiteral).text.endsWith(IG_PACKAGE_NAME)) {

        const clause = (statement as ts.ImportDeclaration).importClause;
        return clause && clause.namedBindings && clause.namedBindings.kind === ts.SyntaxKind.NamedImports;
    }
    return false;
};

export const getRenamePositions = (sourcePath: string, name: string, service: ts.LanguageService):
    Array<{ start: number; end: number }> => {

    const source = service.getProgram().getSourceFile(sourcePath);
    const positions = [];

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
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
};

export const findMatches = (content: string, toFind: string): number[] => {
    let matches: RegExpExecArray;
    const regex = new RegExp(escapeRegExp(toFind), 'g');
    const matchesPositions = [];
    do {
        matches = regex.exec(content);
        if (matches) {
            matchesPositions.push(matches.index);
        }
    } while (matches);

    return matchesPositions;
};

export const replaceMatch = (content: string, toReplace: string, replaceWith: string, index: number): string =>
    content.substring(0, index) +
    replaceWith +
    content.substring(index + toReplace.length, content.length);

//#region Language Service

/**
 * Create a TypeScript language service
 *
 * @param serviceHost A TypeScript language service host
 */
export const getLanguageService = (filePaths: string[], host: Tree, options: ts.CompilerOptions = {}): ts.LanguageService => {
    const fileVersions = new Map<string, number>();
    patchHostOverwrite(host, fileVersions);
    const servicesHost = {
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
        fileExists: fileName => filePaths.indexOf(fileName) !== -1
    };

    return ts.createLanguageService(servicesHost, ts.createDocumentRegistry());
};

const patchHostOverwrite = (host: Tree, fileVersions: Map<string, number>) => {
    const original = host.overwrite;
    host.overwrite = (path: string, content: Buffer | string) => {
        const version = fileVersions.get(path) || 0;
        fileVersions.set(path, version + 1);
        original.call(host, path, content);
    };
};

/**
 * Create a project service singleton that holds all projects within a directory tree
 *
 * @param serverHost Used by the tss to navigate the directory tree
 */
export const createProjectService = (serverHost: tss.server.ServerHost): tss.server.ProjectService => {
    // set traceToConsole to true to enable logging
    const logger = new Logger(false, tss.server.LogLevel.verbose);
    const projectService = new tss.server.ProjectService({
        host: serverHost,
        logger,
        /* not needed since we will run only migrations */
        cancellationToken: tss.server.nullCancellationToken,
        /* do not allow more than one InferredProject per project root */
        useSingleInferredProject: true,
        useInferredProjectPerProjectRoot: true,
        /* will load only global plug-ins */
        globalPlugins: [CUSTOM_TS_PLUGIN_NAME, NG_LANG_SERVICE_PACKAGE_NAME],
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
        pluginName: CUSTOM_TS_PLUGIN_NAME,
        configuration: {}
    });
    projectService.configurePlugin({
        pluginName: NG_LANG_SERVICE_PACKAGE_NAME,
        configuration: {
            ivy: true,
            angularOnly: false,
        },
    });

    return projectService;
};

/**
 * Attempts to get type definitions using the TypeScript Language Service.
 * Can fall back to a cached version of the TSLS.
 */
const getTypeDefinitions = (langServ: tss.LanguageService, entryPath: string, position: number): any =>
    /*
        getTypeScriptLanguageService is attached by us to the Typescript Language Service
        via a custom made plugin, it's sole purpose is to cache the language service and return it
        before any other plugins modify it
    */
    langServ.getTypeDefinitionAtPosition(entryPath, position)
    || (langServ as TSLanguageService).getTypeScriptLanguageService().getTypeDefinitionAtPosition(entryPath, position);

/**
 * Get type information about a TypeScript identifier
 *
 * @param langServ TypeScript/Angular LanguageService
 * @param entryPath path to file
 * @param position Index of identifier
 */
export const getTypeDefinitionAtPosition =
    (langServ: tss.LanguageService, entryPath: string, position: number): Pick<tss.DefinitionInfo, 'name' | 'fileName'> | null => {
        const definition = langServ.getDefinitionAndBoundSpan(entryPath, position)?.definitions[0];
        if (!definition) {
            return null;
        }

        if (definition.kind.toString() === 'reference') {
            // if the definition's kind is a reference, the identifier is a template variable referred in an internal/external template
            return langServ.getDefinitionAndBoundSpan(entryPath, definition.textSpan.start).definitions[0];
        }
        if (definition.kind.toString() === 'method') {
            return getMethodTypeDefinition(langServ, definition);
        }

        let typeDefs = getTypeDefinitions(langServ, definition.fileName || entryPath, definition.textSpan.start);
        // if there are no type definitions found, the identifier is a ts property, referred in an internal/external template
        // or is a reference in a decorator
        if (!typeDefs) {
            /*
             normally, the tsserver will consider non .ts files as external to the project
             however, we load .html files which we can handle with the Angular language service
             here we're only looking for definitions in a .ts source file
             we call the getSourceFile function which accesses a map of files, previously loaded by the tsserver
             at this point the map contains all .html files that we've included
             we have to ignore them, since the language service will attempt to parse them as .ts files
            */
            if (!definition.fileName.endsWith('.ts')) {
                return null;
            }

            const sourceFile = langServ.getProgram().getSourceFile(definition.fileName);
            if (!sourceFile) {
                return null;
            }

            // find the class declaration in the source file where the member that we want to migrate is declared
            // atm we are explicitly ignoring unnamed class declarations like - export default class { ... }
            const classDeclaration = sourceFile.statements
                .filter((m): m is tss.ClassDeclaration => m.kind === tss.SyntaxKind.ClassDeclaration)
                .find(m => m.name?.getText() === definition.containerName);

            if (!classDeclaration) {
                // there must be at least one class declaration in the .ts file and the property must belong to it
                return null;
            }

            const member: ts.ClassElement = classDeclaration.members.find(m => m.name.getText() === definition.name);
            if (!member?.name) {
                return null;
            }

            typeDefs = getTypeDefinitions(langServ, definition.fileName, member.name.getStart() + 1);
        }
        if (typeDefs?.length) {
            return typeDefs[0];
        }

        return null;
    };


/**
 * Determines if a member belongs to a type in the `igniteui-angular` toolkit.
 *
 * @param change The change that will be applied.
 * @param langServ The Typescript/Angular Language Service
 * @param entryPath Relative file path.
 * @param matchPosition The position of the identifier.
 */
export const isMemberIgniteUI =
    (change: MemberChange, langServ: tss.LanguageService, entryPath: string, matchPosition: number): boolean => {
        const content = langServ.getProgram().getSourceFile(entryPath).getText();
        matchPosition = shiftMatchPosition(matchPosition, content);
        const prevChar = content.substr(matchPosition - 1, 1);
        if (prevChar === SynaxTokens.ClosingParenthesis) {
            // methodCall().identifier
            matchPosition = langServ.getBraceMatchingAtPosition(entryPath, matchPosition - 1)[0]?.start ?? matchPosition;
        }

        const typeDef = getTypeDefinitionAtPosition(langServ, entryPath, matchPosition);
        if (!typeDef) {
            return false;
        }

        return typeDef.fileName.includes(IG_PACKAGE_NAME)
            && change.definedIn.indexOf(typeDef.name) !== -1;
    };

/**
 * Shifts the match position of the identifier to the left
 * until any character other than an empty string or a '.' is reached. #9347
 */
const shiftMatchPosition = (matchPosition: number, content: string): number => {
    do {
        matchPosition--;
    } while (matchPosition > 0 && !content[matchPosition - 1].trim()
        || content[matchPosition - 1] === SynaxTokens.MemberAccess
        || content[matchPosition - 1] === SynaxTokens.Question);
    return matchPosition;
};

/**
 * Looks up a method's definition return type.
 *
 * @param langServ The TypeScript LanguageService.
 * @param definition The method definition.
 */
const getMethodTypeDefinition = (langServ: tss.LanguageService, definition: tss.DefinitionInfo):
    Pick<tss.DefinitionInfo, 'name' | 'fileName'> | null => {
    // TODO: use typechecker for all the things?
    const sourceFile = langServ.getProgram().getSourceFile(definition.fileName);

    // find the class declaration in the source file where the method that we want to migrate is declared
    const classDeclaration = sourceFile.statements
        .filter((m): m is tss.ClassDeclaration => m.kind === tss.SyntaxKind.ClassDeclaration)
        .find(m => m.name?.getText() === definition.containerName);

    // find the node in the class declaration's members which represents the method
    const methodDeclaration = classDeclaration?.members
        .filter((m): m is tss.MethodDeclaration => m.kind === tss.SyntaxKind.MethodDeclaration)
        .find(m => m.name.getText() === definition.name);

    if (!methodDeclaration) {
        return null;
    }

    // use the TypeChecker to resolve implicit/explicit method return types
    const typeChecker = langServ.getProgram().getTypeChecker();
    const signature = typeChecker.getSignatureFromDeclaration(methodDeclaration);
    if (!signature) {
        return null;
    }

    const returnType = typeChecker.getReturnTypeOfSignature(signature);
    const name = returnType.symbol.escapedName.toString();
    if (returnType.symbol?.declarations?.length > 0) {
        // there should never be a case where a type is declared in more than one file
        /**
         * For union return types like T | null | undefined
         * and interesection return types like T & null & undefined
         * the TypeChecker ignores null and undefined and returns only T which is not
         * marked as a union or intersection type.
         *
         * For union and intersection types like T | R | C
         * the TypeChecker returns a TypeObject which is marked as union or intersection type.
         */
        const fileName = returnType.symbol.declarations[0].getSourceFile().fileName;
        return { name, fileName };
    }

    return null;
};

//#endregion
