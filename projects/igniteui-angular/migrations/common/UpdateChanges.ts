import * as fs from 'fs';
import * as path from 'path';
import * as ts from 'typescript';
import * as tss from 'typescript/lib/tsserverlibrary';
import type { SchematicContext, Tree, FileVisitor } from '@angular-devkit/schematics';
import type { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';
import {
    ClassChanges, BindingChanges, SelectorChange,
    SelectorChanges, ThemeChanges, ImportsChanges, MemberChanges, ThemeChange, ThemeType
} from './schema';
import {
    getLanguageService, getRenamePositions, getIdentifierPositions,
    isMemberIgniteUI, NG_LANG_SERVICE_PACKAGE_NAME, NG_CORE_PACKAGE_NAME, findMatches
} from './tsUtils';
import {
    getProjectPaths, getWorkspace, getProjects, escapeRegExp, replaceMatch,
    getPackageManager, canResolvePackage, tryInstallPackage, tryUninstallPackage, getPackageVersion
} from './util';
import { ServerHost } from './ServerHost';
import { serviceContainer } from './project-service-container';

const TSCONFIG_PATH = 'tsconfig.json';

export enum InputPropertyType {
    EVAL = 'eval',
    STRING = 'string'
}
declare type TransformFunction = (args: BoundPropertyObject) => void;
export interface BoundPropertyObject {
    value: string;
    bindingType: InputPropertyType;
}

interface AppliedChange {
    overwrite: boolean,
    fileContent: string
}

/* eslint-disable arrow-parens */
export class UpdateChanges {
    protected tsconfigPath = TSCONFIG_PATH;

    public _shouldInvokeLS = true;
    public get shouldInvokeLS(): boolean {
        return this._shouldInvokeLS;
    }
    public set shouldInvokeLS(val: boolean) {
        if (val === undefined || val === null) {
            // call LS by default
            this.shouldInvokeLS = true;
            return;
        }
        this._shouldInvokeLS = val;
    }

    public get projectService(): tss.server.ProjectService {
        const projectService = serviceContainer.projectService;
        if (!serviceContainer.configured) {
            this.configureForAngularLS(projectService);
            serviceContainer.configured = true;
        }

        return projectService;
    }

    protected get serverHost(): ServerHost {
        return serviceContainer.serverHost;
    }
    protected workspace: WorkspaceSchema;
    protected sourcePaths: string[];
    protected classChanges: ClassChanges;
    protected outputChanges: BindingChanges;
    protected inputChanges: BindingChanges;
    protected selectorChanges: SelectorChanges;
    protected themeChanges: ThemeChanges;
    protected importsChanges: ImportsChanges;
    protected membersChanges: MemberChanges;
    protected conditionFunctions: Map<string, (...args) => any> = new Map<string, (...args) => any>();
    protected valueTransforms: Map<string, TransformFunction> = new Map<string, TransformFunction>();

    private _templateFiles: string[] = [];
    private _initialTsConfig = '';

    public get templateFiles(): string[] {
        if (!this._templateFiles.length) {
            // https://github.com/angular/devkit/blob/master/packages/angular_devkit/schematics/src/tree/filesystem.ts
            this.sourceDirsVisitor((fulPath, entry) => {
                if (fulPath.endsWith('component.html')) {
                    this._templateFiles.push(entry.path);
                }
            });
        }
        return this._templateFiles;
    }

    private _tsFiles: string[] = [];
    public get tsFiles(): string[] {
        if (!this._tsFiles.length) {
            this.sourceDirsVisitor((fulPath, entry) => {
                if (fulPath.endsWith('.ts')) {
                    this._tsFiles.push(entry.path);
                }
            });
        }
        return this._tsFiles;
    }

    private _sassFiles: string[] = [];
    /** Sass (both .scss and .sass) files in the project being updated. */
    public get sassFiles(): string[] {
        if (!this._sassFiles.length) {
            // files can be outside the app prefix, so start from sourceRoot
            // also ignore schematics `styleext` as Sass can be used regardless
            const sourceDirs = getProjects(this.workspace).map(x => x.sourceRoot).filter(x => x);
            this.sourceDirsVisitor((fulPath, entry) => {
                if (fulPath.endsWith('.scss') || fulPath.endsWith('.sass')) {
                    this._sassFiles.push(entry.path);
                }
            }, sourceDirs);
        }
        return this._sassFiles;
    }

    private _service: ts.LanguageService;
    public get service(): ts.LanguageService {
        if (!this._service) {
            this._service = getLanguageService(this.tsFiles, this.host);
        }
        return this._service;
    }

    private _packageManager: 'npm' | 'yarn';
    private get packageManager(): 'npm' | 'yarn' {
        if (!this._packageManager) {
            this._packageManager = getPackageManager(this.host);
        }

        return this._packageManager;
    }

    /**
     * Create a new base schematic to apply changes
     *
     * @param rootPath Root folder for the schematic to read configs, pass __dirname
     */
    constructor(private rootPath: string, private host: Tree, private context?: SchematicContext) {
        this.workspace = getWorkspace(host);
        this.sourcePaths = getProjectPaths(this.workspace);

        this.selectorChanges = this.loadConfig('selectors.json');
        this.classChanges = this.loadConfig('classes.json');
        this.outputChanges = this.loadConfig('outputs.json');
        this.inputChanges = this.loadConfig('inputs.json');
        this.themeChanges = this.loadConfig('theme-changes.json');
        this.importsChanges = this.loadConfig('imports.json');
        this.membersChanges = this.loadConfig('members.json');
        // update LS server host with the schematics tree:
        this.serverHost.host = this.host;
    }

    /** Apply configured changes to the Host Tree */
    public applyChanges() {
        const shouldInstallPkg = this.membersChanges && this.membersChanges.changes.length
            && !canResolvePackage(NG_LANG_SERVICE_PACKAGE_NAME);
        if (shouldInstallPkg) {
            this.context.logger.info(`Installing temporary migration dependencies via ${this.packageManager}.`);
            // try and get an appropriate version of the package to install
            let targetVersion = getPackageVersion(NG_CORE_PACKAGE_NAME) || 'latest';
            if (targetVersion.startsWith('11')) {
                // TODO: Temporary restrict 11 LS version, till update for new module loading
                targetVersion = '11.0.0';
            }
            tryInstallPackage(this.context, this.packageManager, `${NG_LANG_SERVICE_PACKAGE_NAME}@${targetVersion}`);
        }

        this.updateTemplateFiles();
        this.updateTsFiles();
        if (this.shouldInvokeLS) {
            this.updateMembers();
        }
        /** Sass files */
        if (this.themeChanges && this.themeChanges.changes.length) {
            for (const entryPath of this.sassFiles) {
                this.updateThemeProps(entryPath);
                this.updateSassVariables(entryPath);
                this.updateSassFunctionsAndMixins(entryPath);
            }
        }

        if (shouldInstallPkg) {
            this.context.logger.info(`Cleaning up temporary migration dependencies.`);
            tryUninstallPackage(this.context, this.packageManager, NG_LANG_SERVICE_PACKAGE_NAME);
        }

        // if tsconfig.json was patched, restore it
        if (this._initialTsConfig !== '') {
            this.host.overwrite(this.tsconfigPath, this._initialTsConfig);
        }

    }

    /** Add condition function. */
    public addCondition(conditionName: string, callback: (ownerMatch: string, path: string) => boolean) {
        this.conditionFunctions.set(conditionName, callback);
    }

    public addValueTransform(functionName: string, callback: TransformFunction) {
        this.valueTransforms.set(functionName, callback);
    }

    /** Path must be absolute. If calling externally, use this.getAbsolutePath */
    protected getDefaultLanguageService(entryPath: string): tss.LanguageService | undefined {
        const project = this.getDefaultProjectForFile(entryPath);
        return project?.getLanguageService();
    }

    protected updateSelectors(entryPath: string) {
        let fileContent = this.host.read(entryPath).toString();
        let overwrite = false;
        for (const change of this.selectorChanges.changes) {
            let searchPttrn = change.type === 'component' ? '<' : '';
            searchPttrn += change.selector;
            if (fileContent.indexOf(searchPttrn) !== -1) {
                fileContent = this.applySelectorChange(fileContent, change);
                overwrite = true;
            }
        }
        if (overwrite) {
            this.host.overwrite(entryPath, fileContent);
        }
    }

    protected applySelectorChange(fileContent: string, change: SelectorChange): string {
        let regSource: string;
        let replace: string;
        switch (change.type) {
            case 'component':
                if (change.remove) {
                    regSource = String.raw`\<${change.selector}[\s\S]*?\<\/${change.selector}\>`;
                    replace = '';
                } else {
                    regSource = String.raw`\<(\/?)${change.selector}(?=[\s\>])`;
                    replace = `<$1${change.replaceWith}`;
                }
                break;
            case 'directive':
                if (change.remove) {
                    // Group match (\2) as variable as it looks like octal escape (error in strict)
                    regSource = String.raw`\s*?\[?${change.selector}\]?(=(["']).*?${'\\2'}(?=\s|\>))?`;
                    replace = '';
                } else {
                    regSource = change.selector;
                    replace = change.replaceWith;
                }
                break;
            default:
                break;
        }
        fileContent = fileContent.replace(new RegExp(regSource, 'g'), replace);
        return fileContent;
    }

    protected updateClasses(entryPath: string) {
        let fileContent = this.host.read(entryPath).toString();
        const alreadyReplaced = new Set<string>();
        for (const change of this.classChanges.changes) {
            if (fileContent.indexOf(change.name) !== -1) {
                const positions = getRenamePositions(entryPath, change.name, this.service);
                // loop backwards to preserve positions
                for (let i = positions.length; i--;) {
                    const pos = positions[i];
                    // V.S. 18th May 2021: If several classes are renamed w/ the same import, erase them
                    // TODO: Refactor to make use of TSLS API instead of string replace
                    if (i === 0 && alreadyReplaced.has(change.replaceWith)) {
                        // only match the first trailing white space, right after the replace position
                        const trailingCommaWhiteSpace = new RegExp(/,([\s]*)(?=(\s}))/);
                        let afterReplace = fileContent.slice(pos.end);
                        const beforeReplace = fileContent.slice(0, pos.start);
                        const leadingComma = afterReplace[0] === ',' ? 1 : 0;
                        // recalculate if needed
                        afterReplace = !leadingComma ? afterReplace : fileContent.slice(pos.end + leadingComma);
                        const doubleSpaceReplace =
                            beforeReplace[beforeReplace.length - 1].match(/\s/) !== null && afterReplace[0].match(/\s/) !== null ?
                                1 :
                                0;
                        fileContent = (fileContent.slice(0, pos.start - doubleSpaceReplace) +
                            '' +
                            afterReplace).replace(trailingCommaWhiteSpace, '');
                    } else {
                        fileContent = fileContent.slice(0, pos.start) + change.replaceWith + fileContent.slice(pos.end);
                    }
                }
                if (positions.length) {
                    // using a set should be a lot quicker that getting position for renames of replace
                    alreadyReplaced.add(change.replaceWith);
                    this.host.overwrite(entryPath, fileContent);
                }
            }
        }
    }

    protected updateBindings(entryPath: string, bindChanges: BindingChanges, type = BindingType.Output) {
        let fileContent = this.host.read(entryPath).toString();
        let overwrite = false;

        for (const change of bindChanges.changes) {
            if (fileContent.indexOf(change.owner.selector) === -1 || fileContent.indexOf(change.name) === -1) {
                continue;
            }

            let base: string;
            let replace: string;
            let searchPattern;

            if (type === BindingType.Output) {
                base = String.raw`\(${change.name}\)=(["'])(.*?)\1`;
                replace = `(${change.replaceWith})=$1$2$1`;
            } else {
                // Match both bound - [name] - and regular - name
                base = String.raw`(\s\[?)${change.name}(\s*\]?=)(["'])(.*?)\3`;
                replace = String.raw`$1${change.replaceWith}$2$3$4$3`;
            }

            let reg = new RegExp(base, 'g');
            if (change.remove || change.moveBetweenElementTags) {
                // Group match (\1) as variable as it looks like octal escape (error in strict)
                reg = new RegExp(String.raw`\s*${base}(?=\s|\>)`, 'g');
                replace = '';
            }
            switch (change.owner.type) {
                case 'component':
                    searchPattern = String.raw`\<${change.owner.selector}(?=[\s\>])[^\>]*\>`;
                    break;
                case 'directive':
                    searchPattern = String.raw`\<[^\>]*[\s\[]${change.owner.selector}[^\>]*\>`;
                    break;
            }

            const matches = fileContent.match(new RegExp(searchPattern, 'g'));
            if (!matches) {
                continue;
            }

            for (const match of matches) {
                let replaceStatement = replace;
                if (!this.areConditionsFulfilled(match, change.conditions, entryPath)) {
                    continue;
                }

                if (change.moveBetweenElementTags) {
                    const moveMatch = match.match(reg);
                    fileContent = this.copyPropertyValueBetweenElementTags(fileContent, match, moveMatch);
                }

                if (change.valueTransform) {
                    const regExpMatch = match.match(new RegExp(base));
                    const bindingType = regExpMatch && regExpMatch[1].endsWith('[') ? InputPropertyType.EVAL : InputPropertyType.STRING;
                    if (regExpMatch) {
                        const value = regExpMatch[4];
                        const transform = this.valueTransforms.get(change.valueTransform);
                        const args = { value, bindingType };
                        transform(args);
                        if (args.bindingType !== bindingType) {
                            replaceStatement = args.bindingType === InputPropertyType.EVAL ?
                                replaceStatement.replace(`$1`, `$1[`).replace(`$2`, `]$2`) :
                                replaceStatement.replace(`$1`,
                                    regExpMatch[1].replace('[', '')).replace('$2', regExpMatch[2].replace(']', ''));

                        }
                        replaceStatement = replaceStatement.replace('$4', args.value);
                    }
                }

                fileContent = fileContent.replace(
                    match,
                    match.replace(reg, replaceStatement)
                );
            }
            overwrite = true;
        }
        if (overwrite) {
            this.host.overwrite(entryPath, fileContent);
        }
    }

    protected updateThemeProps(entryPath: string) {
        let fileContent = this.host.read(entryPath).toString();
        let overwrite = false;
        for (const change of this.themeChanges.changes) {
            if (change.type !== ThemeType.Property) {
                continue;
            }
            if (fileContent.indexOf(change.owner) !== -1) {
                /** owner-func:( * ); */
                const searchPattern = String.raw`${change.owner}\([\s\S]+?\);`;
                const matches = fileContent.match(new RegExp(searchPattern, 'g'));
                if (!matches) {
                    continue;
                }
                for (const match of matches) {
                    if (match.indexOf(change.name) !== -1) {
                        const name = change.name.replace('$', '\\$');
                        const replaceWith = change.replaceWith?.replace('$', '\\$');
                        const reg = new RegExp(String.raw`^\s*${name}:`);
                        const existing = new RegExp(String.raw`${replaceWith}:`);
                        const opening = `${change.owner}(`;
                        const closing = /\s*\);$/.exec(match).pop();
                        const body = match.substr(opening.length, match.length - opening.length - closing.length);

                        let params = this.splitFunctionProps(body);
                        params = params.reduce((arr, param) => {
                            if (reg.test(param)) {
                                const duplicate = !!replaceWith && arr.some(p => existing.test(p));

                                if (!change.remove && !duplicate) {
                                    arr.push(param.replace(change.name, change.replaceWith));
                                }
                            } else {
                                arr.push(param);
                            }
                            return arr;
                        }, []);

                        fileContent = fileContent.replace(
                            match,
                            opening + params.join(',') + closing
                        );
                        overwrite = true;
                    }
                }
            }
        }
        if (overwrite) {
            this.host.overwrite(entryPath, fileContent);
        }
    }

    protected isNamedArgument(fileContent: string, i: number, occurrences: number[], change: ThemeChange) {
        const openingBrackets = [];
        const closingBrackets = [];
        if (fileContent[(occurrences[i] + change.name.length)] !== ':'
            || (fileContent[(occurrences[i] + change.name.length)] === ' '
                && fileContent[(occurrences[i] + change.name.length) + 1] === ':')) {
            return false;
        }
        for (let j = occurrences[i]; j >= 0; j--) {
            if (fileContent[j] === ')') {
                closingBrackets.push(fileContent[j]);
            } else if (fileContent[j] === '(') {
                openingBrackets.push(fileContent[j]);
            }
        }

        return openingBrackets.length !== closingBrackets.length;
    }

    protected updateSassVariables(entryPath: string) {
        let fileContent = this.host.read(entryPath).toString();
        let overwrite = false;
        const allowedStartCharacters = new RegExp(/(:|,)\s?/, 'g');
        // eslint-disable-next-line no-control-regex
        const allowedEndCharacters = new RegExp('[;),: \r\n]', 'g');
        for (const change of this.themeChanges.changes) {
            if (change.type !== ThemeType.Variable) {
                continue;
            }
            if (!('owner' in change)) {
                const occurrences = findMatches(fileContent, change.name);
                for (let i = occurrences.length - 1; i >= 0; i--) {
                    const allowedStartEnd = fileContent[occurrences[i] - 1].match(allowedStartCharacters)
                        || fileContent[(occurrences[i] + change.name.length)].match(allowedEndCharacters);
                    if (allowedStartEnd && !this.isNamedArgument(fileContent, i, occurrences, change as ThemeChange)) {
                        fileContent = replaceMatch(fileContent, change.name, change.replaceWith, occurrences[i]);
                        overwrite = true;
                    }
                }
            }
        }
        if (overwrite) {
            this.host.overwrite(entryPath, fileContent);
        }
    }

    protected updateSassFunctionsAndMixins(entryPath: string) {
        const aliases = this.getAliases(entryPath);
        let fileContent = this.host.read(entryPath).toString();
        let overwrite = false;
        for (const change of this.themeChanges.changes) {
            if (change.type !== ThemeType.Function && change.type !== ThemeType.Mixin) {
                continue;
            }

            let occurrences: number[] = [];
            if (aliases.length > 0 && !aliases.includes('*')) {
                aliases.forEach(a => occurrences = occurrences.concat(findMatches(fileContent, a + '.' + change.name)));
                if (occurrences.length > 0) {
                    ({ overwrite, fileContent } = this.tryReplaceScssFunctionWithAlias(occurrences, aliases, fileContent, change, overwrite));
                    continue;
                }
            }

            occurrences = findMatches(fileContent, change.name);
            if (occurrences.length > 0) {
                ({ overwrite, fileContent } = this.tryReplaceScssFunction(occurrences, fileContent, change, overwrite));
            }
        }
        if (overwrite) {
            this.host.overwrite(entryPath, fileContent);
        }
    }

    protected getAliases(entryPath: string) {
        const fileContent = this.host.read(entryPath).toString();
        // B.P. 18/05/22 #11577 - Use RegEx to distinguish themed imports.
        const matchers = [
            /@use(\s+)('|")igniteui-angular\/theming\2\1as\1(\w+)/g,
            /@use(\s+)('|")igniteui-angular\/theme\2\1as\1(\w+)/g,
            /@use(\s+)('|")igniteui-angular\/lib\/core\/styles\/themes\/index\2\1as\1(\w+)/g
        ];

        const aliases = [];
        matchers.forEach(m => {
            const match = m.exec(fileContent);
            if (match) {
                aliases.push(match[3]); // access the captured alias
            }
        });

        return aliases;
    }

    protected updateImports(entryPath: string) {
        let fileContent = this.host.read(entryPath).toString();
        let overwrite = false;

        for (const change of this.importsChanges.changes) {
            if (fileContent.indexOf(change.name) === -1) {
                continue;
            }

            const replace = escapeRegExp(change.replaceWith);
            const base = escapeRegExp(change.name);
            const reg = new RegExp(base, 'g');

            fileContent = fileContent.replace(reg, replace);
            overwrite = true;
        }
        if (overwrite) {
            this.host.overwrite(entryPath, fileContent);
        }
    }

    protected updateClassMembers(entryPath: string, memberChanges: MemberChanges): void {
        let content = this.host.read(entryPath).toString();
        const absPath = tss.server.toNormalizedPath(path.join(process.cwd(), entryPath));
        // use the absolute path for ALL LS operations
        // do not overwrite the entryPath, as Tree operations require relative paths
        const changes = new Set<{ change; position }>();
        let langServ: tss.LanguageService;
        for (const change of memberChanges.changes) {
            if (!content.includes(change.member)) {
                continue;
            }

            langServ = langServ || this.getDefaultLanguageService(absPath);
            if (!langServ) {
                return;
            }
            let matches: number[];
            if (entryPath.endsWith('.ts')) {
                const source = langServ.getProgram().getSourceFile(absPath);
                matches = getIdentifierPositions(source, change.member).map(x => x.start);
            } else {
                matches = findMatches(content, `.${change.member}`).map(pos => pos + 1);
            }
            for (const matchPosition of matches) {
                if (isMemberIgniteUI(change, langServ, absPath, matchPosition)) {
                    changes.add({ change, position: matchPosition });
                }
            }
        }

        const changesArr = Array.from(changes).sort((c, c1) => c.position - c1.position).reverse();
        for (const fileChange of changesArr) {
            content = replaceMatch(content, fileChange.change.member,
                fileChange.change.replaceWith, fileChange.position);
        }

        if (changes.size) {
            this.host.overwrite(entryPath, content);
        }
    }

    // TODO: combine both functions
    private tryReplaceScssFunctionWithAlias(occurrences: number[], aliases: string[], fileContent: string, change: ThemeChange, overwrite: boolean): AppliedChange {
        for (const alias of aliases) {
            const aliasLength = alias.length + 1; // + 1 because of the dot - alias.member
            for (let i = occurrences.length - 1; i >= 0; i--) {
                const isOpenParenthesis = fileContent[occurrences[i] + aliasLength + change.name.length] === '(';
                if (isOpenParenthesis) {
                    fileContent = replaceMatch(fileContent, change.name, change.replaceWith, occurrences[i] + aliasLength);
                    overwrite = true;
                }
            }
        }

        return { overwrite, fileContent };
    }
    private tryReplaceScssFunction(occurrences: number[], fileContent: string, change: ThemeChange, overwrite: boolean): AppliedChange {
        for (let i = occurrences.length - 1; i >= 0; i--) {
            const isOpenParenthesis = fileContent[occurrences[i] + change.name.length] === '(';
            if (isOpenParenthesis) {
                fileContent = replaceMatch(fileContent, change.name, change.replaceWith, occurrences[i]);
                overwrite = true;
            }
        }

        return { overwrite, fileContent };
    }

    private patchTsConfig(): void {
        this.ensureTsConfigPath();
        if (this.serverHost.fileExists(this.tsconfigPath)) {
            let originalContent = '';
            try {
                originalContent = this.serverHost.readFile(this.tsconfigPath);
            } catch {
                this.context?.logger
                    .warn(`Could not read ${this.tsconfigPath}. Some Angular Ivy features might be unavailable during migrations.`);
                return;
            }
            let content;
            // use ts parser as it handles jsonc-style files w/ comments
            const result = ts.parseConfigFileTextToJson(this.tsconfigPath, originalContent);
            if (!result.error) {
                content = result.config;
            } else {
                this.context?.logger
                    .warn(`Could not parse ${this.tsconfigPath}. Angular Ivy language service might be unavailable during migrations.`);
                this.context?.logger
                    .warn(`Error:\n${result.error}`);
                return;
            }
            if (!content.angularCompilerOptions) {
                content.angularCompilerOptions = {};
            }
            if (!content.angularCompilerOptions.strictTemplates) {
                this.context?.logger
                    .info(`Adding 'angularCompilerOptions.strictTemplates' to ${this.tsconfigPath} for migration run.`);
                content.angularCompilerOptions.strictTemplates = true;
                this.host.overwrite(this.tsconfigPath, JSON.stringify(content));
                // store initial state and restore it once migrations are finished
                this._initialTsConfig = originalContent;
            }
        }
    }

    private ensureTsConfigPath(): void {
        if (this.host.exists(this.tsconfigPath)) {
            return;
        }

        // attempt to find a main tsconfig from workspace:
        const wsProject = Object.values(this.workspace.projects)[0];
        // technically could be per-project, but assuming there's at least one main tsconfig for IDE support
        const projectConfig = wsProject.architect?.build?.options['tsConfig'];

        if (!projectConfig || !this.host.exists(projectConfig)) {
            return;
        }
        if (path.posix.basename(projectConfig) === TSCONFIG_PATH) {
            // not project specific extended tsconfig, use directly
            this.tsconfigPath = projectConfig;
            return;
        }

        // look for base config through extends property
        const result = ts.parseConfigFileTextToJson(projectConfig, this.serverHost.readFile(projectConfig));
        if (!result.error && result.config.extends) {
            this.tsconfigPath = path.posix.join(path.posix.dirname(projectConfig), result.config.extends);
        }
    }

    private loadConfig(configJson: string) {
        const filePath = path.join(this.rootPath, 'changes', configJson);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    }

    private areConditionsFulfilled(match: string, conditions: string[], entryPath: string): boolean {
        if (conditions) {
            for (const condition of conditions) {
                if (this.conditionFunctions && this.conditionFunctions.has(condition)) {
                    const callback = this.conditionFunctions.get(condition);
                    if (callback && !callback(match, entryPath)) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    private copyPropertyValueBetweenElementTags(fileContent: string, ownerMatch: string, propertyMatchArray: RegExpMatchArray): string {
        if (ownerMatch && propertyMatchArray && propertyMatchArray.length > 0) {
            const propMatch = propertyMatchArray[0].trim();
            const propValueMatch = propMatch.match(new RegExp(`=(["'])(.+?)${'\\1'}`));
            if (propValueMatch && propValueMatch.length > 0) {
                const propValue = propValueMatch[propValueMatch.length - 1];

                if (propMatch.startsWith('[')) {
                    return fileContent.replace(ownerMatch, ownerMatch + `{{${propValue}}}`);
                } else {
                    return fileContent.replace(ownerMatch, ownerMatch + propValue);
                }
            }
        }

        return fileContent;
    }

    private sourceDirsVisitor(visitor: FileVisitor, dirs = this.sourcePaths) {
        for (const sourcePath of dirs) {
            const srcDir = this.host.getDir(sourcePath);
            srcDir.visit(visitor);
        }
    }

    /**
     * Safe split by `','`, considering possible inner function calls. E.g.:
     * ```
     * prop: inner-func(),
     * prop2: inner2(inner-param: 3, inner-param: inner-func(..))
     * ```
     */
    private splitFunctionProps(body: string): string[] {
        const parts = [];
        let lastIndex = 0;
        let level = 0;

        for (let i = 0; i < body.length; i++) {
            const char = body[i];
            switch (char) {
                case '(': level++; break;
                case ')': level--; break;
                case ',':
                    if (!level) {
                        parts.push(body.substring(lastIndex, i));
                        lastIndex = i + 1;
                    }
                    break;
                default:
                    break;
            }
        }
        parts.push(body.substring(lastIndex));
        return parts;
    }

    private updateTemplateFiles() {
        if (this.selectorChanges && this.selectorChanges.changes.length) {
            for (const entryPath of this.templateFiles) {
                this.updateSelectors(entryPath);
            }
        }
        if (this.outputChanges && this.outputChanges.changes.length) {
            // name change of output
            for (const entryPath of this.templateFiles) {
                this.updateBindings(entryPath, this.outputChanges);
            }
        }
        if (this.inputChanges && this.inputChanges.changes.length) {
            // name change of input
            for (const entryPath of this.templateFiles) {
                this.updateBindings(entryPath, this.inputChanges, BindingType.Input);
            }
        }
    }

    private updateTsFiles() {
        if (this.classChanges && this.classChanges.changes.length) {
            // change class name
            for (const entryPath of this.tsFiles) {
                this.updateClasses(entryPath);
            }
        }
        if (this.importsChanges && this.importsChanges.changes.length) {
            // TODO: move logic to 7.0.2 migration
            for (const entryPath of this.tsFiles) {
                this.updateImports(entryPath);
            }
        }
    }

    private updateMembers() {
        if (this.membersChanges && this.membersChanges.changes.length) {
            const dirs = [...this.templateFiles, ...this.tsFiles];
            for (const entryPath of dirs) {
                this.updateClassMembers(entryPath, this.membersChanges);
            }
        }
    }

    private getDefaultProjectForFile(entryPath: string): tss.server.Project {
        const scriptInfo = this.projectService?.getOrCreateScriptInfoForNormalizedPath(tss.server.asNormalizedPath(entryPath), false);
        if (!scriptInfo) {
            return null;
        }
        this.projectService.openClientFile(scriptInfo.fileName);
        const project = this.projectService.findProject(scriptInfo.containingProjects[0].getProjectName());
        project.addMissingFileRoot(scriptInfo.fileName);
        return project;
    }

    /**
     * Force Angular service to compile project on initial load w/ configured project
     * otherwise if the first compilation occurs on an HTML file the project won't have proper refs
     * and no actual angular metadata will be resolved for the rest of the migration
     */
    private configureForAngularLS(projectService: ts.server.ProjectService): void {
        // TODO: this pattern/issue might be obsolete
        const mainRelPath = this.getWorkspaceProjectEntryPath();
        if (!mainRelPath) {
            return;
        }

        // patch TSConfig so it includes angularOptions.strictTemplates
        // ivy ls requires this in order to function properly on templates
        this.patchTsConfig();
        const mainAbsPath = path.resolve(projectService.currentDirectory, mainRelPath);
        const scriptInfo = projectService.getOrCreateScriptInfoForNormalizedPath(tss.server.toNormalizedPath(mainAbsPath), false);
        projectService.openClientFile(scriptInfo.fileName);


        try {
            const project = projectService.findProject(scriptInfo.containingProjects[0].getProjectName());
            project.getLanguageService().getSemanticDiagnostics(mainAbsPath);
        } catch (err) {
            this.context.logger.warn(
                "An error occurred during TypeScript project service setup. Some migrations relying on language services might not be applied."
            );
        }
    }

    private getWorkspaceProjectEntryPath(): string | null {
        const projectKeys = Object.keys(this.workspace.projects);
        if (!projectKeys.length) {
            this.context.logger.info(
`Could not resolve project from directory ${this.serverHost.getCurrentDirectory()}. Some migrations may not be applied.`);
            return null;
        }

        // grab the first possible main path:
        for (const key of projectKeys) {
            const wsProject = this.workspace.projects[key];
            // intentionally compare against string values of the enum to avoid hard import
            if (wsProject.projectType == "application" && wsProject.architect?.build?.options) {
                return wsProject.architect.build.options['browser'] || wsProject.architect.build.options['main'];
            } else if (wsProject.projectType == "library") {
                // TODO: attempt to resolve from project ng-package.json or tsConfig
            }
        }

        return null;
    }
}

export enum BindingType {
    Output,
    Input
}
