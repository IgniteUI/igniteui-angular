import { FileEntry, SchematicContext, Tree, FileVisitor } from '@angular-devkit/schematics';
import { WorkspaceSchema } from '@schematics/angular/utility/workspace-models';

import * as fs from 'fs';
import * as path from 'path';
import {
    ClassChanges, BindingChanges, SelectorChange,
    SelectorChanges, ThemePropertyChanges, ImportsChanges, MemberChanges
} from './schema';
import { getLanguageService, getRenamePositions, getLanguageServiceHost } from './tsUtils';
import { getProjectPaths, getWorkspace, getProjects, escapeRegExp } from './util';
import { ServerHost } from './ServerHost';
import { Logger } from './TSLogger';
import ts = require('typescript/lib/tsserverlibrary');

export enum InputPropertyType {
    EVAL = 'eval',
    STRING = 'string'
}
declare type TransformFunction = (args: BoundPropertyObject) => void;
export interface BoundPropertyObject {
    value: string;
    bindingType: InputPropertyType;
}

// tslint:disable:arrow-parens
export class UpdateChanges {
    public projectService: ts.server.ProjectService;
    protected serverHost: ServerHost;
    protected workspace: WorkspaceSchema;
    protected sourcePaths: string[];
    protected classChanges: ClassChanges;
    protected outputChanges: BindingChanges;
    protected inputChanges: BindingChanges;
    protected selectorChanges: SelectorChanges;
    protected themePropsChanges: ThemePropertyChanges;
    protected importsChanges: ImportsChanges;
    protected membersChanges: MemberChanges;
    protected conditionFunctions: Map<string, Function> = new Map<string, Function>();
    protected valueTransforms: Map<string, TransformFunction> = new Map<string, TransformFunction>();

    private _templateFiles: string[] = [];
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
            this._service = getLanguageService(this.serviceHost);
        }
        return this._service;
    }

    private _serviceHost: ts.LanguageServiceHost;
    public get serviceHost(): ts.LanguageServiceHost {
        if (!this._serviceHost) {
            this._serviceHost = getLanguageServiceHost([...this.tsFiles, ...this.templateFiles], this.host);
        }
        return this._serviceHost;
    }

    /**
     * Create a new base schematic to apply changes
     * @param rootPath Root folder for the schematic to read configs, pass __dirname
     */
    constructor(private rootPath: string, private host: Tree, private context?: SchematicContext) {
        this.workspace = getWorkspace(host);
        this.sourcePaths = getProjectPaths(this.workspace);

        this.selectorChanges = this.loadConfig('selectors.json');
        this.classChanges = this.loadConfig('classes.json');
        this.outputChanges = this.loadConfig('outputs.json');
        this.inputChanges = this.loadConfig('inputs.json');
        this.themePropsChanges = this.loadConfig('theme-props.json');
        this.importsChanges = this.loadConfig('imports.json');
        this.membersChanges = this.loadConfig('members.json');
        this.serverHost = new ServerHost(this.host);
        this.projectService = this.createProjectService();
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
                this.updateBindings(entryPath, this.inputChanges, BindingType.input);
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
        if (this.membersChanges && this.membersChanges.changes.length) {
            for (const entryPath of this.tsFiles) {
                this.updateClassMembers(entryPath, this.membersChanges);
            }
        }
    }

    private updateClassMembers(entryPath: string, memberChanges: MemberChanges) {
        let content = this.host.read(entryPath).toString();
        for (const change of memberChanges.changes) {
            if (!change.replaceWith) { continue; }
            const regex = this.toRegExp(change.definition, 'g');
            let matches: RegExpExecArray;
            while ((matches = regex.exec(content)) !== null) {
                // move 2 indices to the right of the start of the match be sure we're getting the correct info
                const info = this.getQuickInfoAtPosition(entryPath, matches.index + 2);
                const target = info?.displayParts
                    .filter(p => p.kind === 'className' || p.kind === 'interfaceName')[0];
                if (target && target.text === change.owner.className) {
                    content = this.replaceMatch(content, change.replaceWith, matches);
                }
            }
        }

        this.host.overwrite(entryPath, content);
    }

    /** Apply configured changes to the Host Tree */
    public applyChanges() {
        this.updateTemplateFiles();
        this.updateTsFiles();

        /** Sass files */
        if (this.themePropsChanges && this.themePropsChanges.changes.length) {
            for (const entryPath of this.sassFiles) {
                this.updateThemeProps(entryPath);
            }
        }
    }

    /** Add condition function. */
    public addCondition(conditionName: string, callback: (ownerMatch: string) => boolean) {
        this.conditionFunctions.set(conditionName, callback);
    }

    public addValueTransform(functionName: string, callback: TransformFunction) {
        this.valueTransforms.set(functionName, callback);
    }

    public getQuickInfoAtPosition(entryPath: string, position: number): ts.QuickInfo {
        const langServ = this.getDefaultLanguageService(entryPath);
        return langServ.getQuickInfoAtPosition(entryPath, position);
    }

    public getCompletionsAtPosition(entryPath: string, position: number, options: ts.GetCompletionsAtPositionOptions)
        : ts.WithMetadata<ts.CompletionInfo> {
        const langServ = this.getDefaultLanguageService(entryPath);
        return langServ.getCompletionsAtPosition(entryPath, position, options);
    }

    public getDefinitionAndBoundSpan(entryPath: string, position: number): ts.DefinitionInfoAndBoundSpan {
        const langServ = this.getDefaultLanguageService(entryPath);
        return langServ.getDefinitionAndBoundSpan(entryPath, position);
    }

    public getSemanticDiagnostics(entryPath: string): ts.Diagnostic[] {
        const langServ = this.getDefaultLanguageService(entryPath);
        return langServ.getSemanticDiagnostics(entryPath);
    }

    public getReferencesAtPosition(entryPath: string, position: number): ts.ReferenceEntry[] {
        const langServ = this.getDefaultLanguageService(entryPath);
        return langServ.getReferencesAtPosition(entryPath, position);
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
                    regSource = String.raw`\<(\/?)${change.selector}`;
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
        for (const change of this.classChanges.changes) {
            if (fileContent.indexOf(change.name) !== -1) {
                const positions = getRenamePositions(entryPath, change.name, this.service);
                // loop backwards to preserve positions
                for (let i = positions.length; i--;) {
                    const pos = positions[i];
                    fileContent = fileContent.slice(0, pos.start) + change.replaceWith + fileContent.slice(pos.end);
                }
                if (positions.length) {
                    this.host.overwrite(entryPath, fileContent);
                }
            }
        }
    }

    protected updateBindings(entryPath: string, bindChanges: BindingChanges, type = BindingType.output) {
        let fileContent = this.host.read(entryPath).toString();
        let overwrite = false;

        for (const change of bindChanges.changes) {
            if (fileContent.indexOf(change.owner.selector) === -1 || fileContent.indexOf(change.name) === -1) {
                continue;
            }

            let base: string;
            let replace: string;
            let groups = 1;
            let searchPattern;

            if (type === BindingType.output) {
                replace = `(${change.replaceWith})=$1$2$1`;
            } else {
                base = String.raw`\(${change.name}\)=(["'])(.*?)\1`;
                // Match both bound - [name] - and regular - name
                base = String.raw`(\s\[?)${change.name}(\s*\]?=)(["'])(.*?)\3`;
                replace = String.raw`$1${change.replaceWith}$2$3$4$3`;
                groups = 3;
            }

            let reg = new RegExp(base, 'g');
            if (change.remove || change.moveBetweenElementTags) {
                // Group match (\1) as variable as it looks like octal escape (error in strict)
                reg = new RegExp(String.raw`\s*${base}(?=\s|\>)`, 'g');
                replace = '';
            }
            switch (change.owner.type) {
                case 'component':
                    searchPattern = String.raw`\<${change.owner.selector}[^\>]*\>`;
                    break;
                case 'directive':
                    searchPattern = String.raw`\<[^\>]*[\s\[]${change.owner.selector}[^\>]*\>`;
                    break;
            }

            const matches = fileContent.match(new RegExp(searchPattern, 'g'));

            for (const match of matches) {
                let replaceStatement = replace;
                if (!this.areConditionsFulfiled(match, change.conditions)) {
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
        for (const change of this.themePropsChanges.changes) {
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
                        const reg = new RegExp(String.raw`^\s*${name}:`);
                        const opening = `${change.owner}(`;
                        const closing = /\s*\);$/.exec(match).pop();
                        const body = match.substr(opening.length, match.length - opening.length - closing.length);

                        let params = this.splitFunctionProps(body);
                        params = params.reduce((arr, param) => {
                            if (reg.test(param)) {
                                if (!change.remove) {
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

    private loadConfig(configJson: string) {
        const filePath = path.join(this.rootPath, 'changes', configJson);
        if (fs.existsSync(filePath)) {
            return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }
    }

    private areConditionsFulfiled(match: string, conditions: string[]): boolean {
        if (conditions) {
            for (const condition of conditions) {
                if (this.conditionFunctions && this.conditionFunctions.has(condition)) {
                    const callback = this.conditionFunctions.get(condition);
                    if (callback && !callback(match)) {
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

    private createProjectService(): ts.server.ProjectService {
        // set traceToConsole to true to enable logging
        const logger = new Logger(false, ts.server.LogLevel.verbose);
        const projectService = new ts.server.ProjectService({
            host: this.serverHost,
            logger: logger,
            cancellationToken: ts.server.nullCancellationToken,
            useSingleInferredProject: true,
            useInferredProjectPerProjectRoot: true,
            typingsInstaller: ts.server.nullTypingsInstaller,
            suppressDiagnosticEvents: true,
            globalPlugins: ['@angular/language-service'],
            eventHandler: () => { },
            allowLocalPluginLoads: false
        });
        projectService.setHostConfiguration({
            formatOptions: projectService.getHostFormatCodeOptions(),
            extraFileExtensions: [
                {
                    extension: '.html',
                    isMixedContent: false,
                    scriptKind: ts.ScriptKind.External,
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

    private getDefaultLanguageService(entryPath: string): ts.LanguageService | undefined {
        const scriptInfo = this.projectService.getOrCreateScriptInfoForNormalizedPath(ts.server.asNormalizedPath(entryPath), false);
        this.projectService.openClientFile(scriptInfo.fileName);
        const project = this.projectService.findProject(scriptInfo.containingProjects[0].projectName);
        // TODO: check if file is already in project?
        project.addMissingFileRoot(scriptInfo.fileName);
        return project.getLanguageService();
    }

    private toRegExp(str: string, flags?: string): RegExp {
        const escapeChars = /[|\\{}()[\]^$+*?.]/g;
        return new RegExp(str.replace(escapeChars, '\\$&'), flags);
    }

    private replaceMatch(content: string, replaceWith: string, matches: RegExpExecArray): string {
        return content.substring(0, matches.index)
            + replaceWith
            + content.substring(matches.index + matches[0].length, content.length);
    }
}

export enum BindingType {
    output,
    input
}
