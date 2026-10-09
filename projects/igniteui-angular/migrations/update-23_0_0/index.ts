import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import * as path from 'path';
import * as tss from 'typescript/lib/tsserverlibrary';
import { BoundPropertyObject, InputPropertyType, UpdateChanges } from '../common/UpdateChanges';
import { findElementNodes, getAttribute, hasAttribute } from '../common/util';
import { IG_LICENSED_PACKAGE_NAME, IG_PACKAGE_NAME, isIgniteuiImport } from '../common/tsUtils';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.cjs';
import type { Element, HtmlParser } from '@angular/compiler' with { "resolution-mode": "import" };

const version = '23.0.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const { HtmlParser } = await nativeImport('@angular/compiler');

    const update = new UpdateChanges(__dirname, host, context);

    // IgxQueryBuilderComponent: `fields` is replaced by `entities`
    update.addValueTransform('fields_to_entities', (args: BoundPropertyObject): void => {
        args.bindingType = InputPropertyType.EVAL;
        args.value = `[{ name: '', fields: ${args.value}}]`;
    });

    // IgxAvatarComponent: `color` and `bgColor` set the host `style.color` and `style.background`
    update.addValueTransform('avatar_color_to_style', (args: BoundPropertyObject): void => {
        if (args.bindingType === InputPropertyType.STRING) {
            args.bindingType = InputPropertyType.EVAL;
            args.value = `'${args.value}'`;
        }
    });

    // CarouselIndicatorsOrientation: `bottom` and `top` are replaced by `end` and `start`
    update.addValueTransform('indicators_orientation_top_bottom', (args: BoundPropertyObject): void => {
        if (args.bindingType === InputPropertyType.STRING) {
            args.value = INDICATORS_ORIENTATION[args.value.trim()] ?? args.value;
            return;
        }
        // a literal is replaced only when it is the whole binding, as elsewhere it may not be the orientation, e.g. `side === 'top'`
        const literal = args.value.trim().match(/^(['"])(top|bottom)\1$/);
        if (literal) {
            args.value = `${literal[1]}${INDICATORS_ORIENTATION[literal[2]]}${literal[1]}`;
            return;
        }
        args.value = args.value.replace(/\bCarouselIndicatorsOrientation\.(top|bottom)\b/g,
            (_, value) => `CarouselIndicatorsOrientation.${INDICATORS_ORIENTATION[value]}`);
        if (/(['"])(top|bottom)\1/.test(args.value)) {
            context.logger.warn(`Review the igx-carousel binding [indicatorsOrientation]="${args.value}": ` +
                'replace the removed `top` and `bottom` values with `start` and `end`.');
        }
    });

    update.applyChanges();

    const parser = new HtmlParser();
    migrateTypeScript(host, context, update);
    migrateRowSelectorTemplates(host, update, parser);
    migrateComboSearchPlaceholder(host, context, update, parser);
    migrateSass(host, context, update);
};

//#region TypeScript

/** A replacement of the `[start, end)` range of a file with `text`. */
interface TextChange {
    start: number;
    end: number;
    text: string;
}

/** Applies the changes from the end of the content, so a replacement starting where an insertion is made keeps the insertion before it. */
const applyTextChanges = (content: string, changes: TextChange[]) =>
    [...changes]
        .sort((a, b) => b.start - a.start || (b.end - b.start) - (a.end - a.start))
        .reduce((result, c) => result.substring(0, c.start) + c.text + result.substring(c.end), content);

/** A removed member, accessed on one of the `definedIn` types, renamed to `replaceWith` or reported when there's no replacement. */
interface RemovedMember {
    member: string;
    definedIn: string[];
    replaceWith?: string;
    /** Guidance logged for each access of a member that has no direct replacement */
    warning?: string;
}

const GRID_TYPES = [
    'GridType', 'IgxGridBaseDirective', 'IgxGridComponent', 'IgxTreeGridComponent',
    'IgxHierarchicalGridComponent', 'IgxRowIslandComponent', 'IgxPivotGridComponent'
];

const ROW_DATA_EVENT_ARGS = ['IRowDataEventArgs', 'IRowDataCancelableEventArgs'];

const REMOVED_MEMBERS: RemovedMember[] = [
    // deprecated in 15.1.0
    { member: 'rowID', replaceWith: 'key', definedIn: ['IgxRowSelectorTemplateDetails'] },
    // deprecated in 17.1.0
    {
        member: 'rowID', replaceWith: 'rowKey',
        definedIn: [
            'IGridEditDoneEventArgs', 'IRowDataCancelableEventArgs', 'IRowToggleEventArgs', 'IPinRowEventArgs', 'IgxAddRowParent', 'IPathSegment'
        ]
    },
    { member: 'primaryKey', replaceWith: 'rowKey', definedIn: ['IGridEditDoneEventArgs', ...ROW_DATA_EVENT_ARGS] },
    { member: 'data', replaceWith: 'rowData', definedIn: ROW_DATA_EVENT_ARGS },
    ...['cellID', 'column', 'oldValue', 'newValue', 'isAddRow'].map(member => ({
        member,
        definedIn: ['IRowDataCancelableEventArgs'],
        warning: `\`${member}\` was removed from IRowDataCancelableEventArgs, the rowAdd and rowDelete event arguments. ` +
            'Use `rowData` and `rowKey` instead.'
    })),
    // deprecated in 17.2.0
    ...['color', 'bgColor'].map(member => ({
        member,
        definedIn: ['IgxAvatarComponent'],
        warning: `IgxAvatarComponent \`${member}\` was removed. Style the avatar through the avatar theme or CSS instead.`
    })),
    // deprecated in 18.1.0
    { member: 'isFirstPageDisabled', replaceWith: 'isFirstPage', definedIn: ['IgxPaginatorComponent'] },
    { member: 'isLastPageDisabled', replaceWith: 'isLastPage', definedIn: ['IgxPaginatorComponent'] },
    // deprecated in 18.2.0
    { member: 'shouldGenerate', replaceWith: 'autoGenerate', definedIn: GRID_TYPES },
    {
        member: 'searchPlaceholder',
        definedIn: ['IgxComboComponent'],
        warning: 'IgxComboComponent `searchPlaceholder` was removed. ' +
            'Set the `igx_combo_filter_search_placeholder` and `igx_combo_addCustomValues_placeholder` resource strings instead.'
    },
    // deprecated in 19.0.0
    {
        member: 'filterGlobal',
        definedIn: [...GRID_TYPES, 'IgxFilteringService'],
        warning: '`filterGlobal` was removed. Filter the columns with `filter()` or set `filteringExpressionsTree` instead.'
    },
    // deprecated in 19.1.0
    { member: 'top', replaceWith: 'start', definedIn: ['CarouselIndicatorsOrientation'] },
    { member: 'bottom', replaceWith: 'end', definedIn: ['CarouselIndicatorsOrientation'] },
    {
        member: 'fields',
        definedIn: ['IgxQueryBuilderComponent'],
        warning: 'IgxQueryBuilderComponent `fields` was removed. Use `entities` instead, e.g. `[{ name: \'\', fields }]`.'
    },
    ...['showLegend', 'resourceStrings'].map(member => ({
        member,
        definedIn: ['IgxQueryBuilderHeaderComponent'],
        warning: `IgxQueryBuilderHeaderComponent \`${member}\` was removed.`
    })),
    // deprecated in 19.2.0
    {
        member: 'tabIndex',
        definedIn: ['IgxSlideComponent'],
        warning: 'IgxSlideComponent `tabIndex` was removed.'
    }
];

const INDICATORS_ORIENTATION = { top: 'start', bottom: 'end' };

/** Returns the language service of the project containing the file, loading its current content from the tree. */
const getLanguageService = (update: UpdateChanges, entryPath: string): tss.LanguageService | undefined => {
    const absPath = tss.server.toNormalizedPath(path.join(process.cwd(), entryPath));
    const projectService = update.projectService;
    const scriptInfo = projectService?.getOrCreateScriptInfoForNormalizedPath(absPath, false);
    if (!scriptInfo) {
        return undefined;
    }
    projectService.openClientFile(scriptInfo.fileName);
    // previous migration steps may have changed the file after it was loaded
    scriptInfo.reloadFromFile(absPath);
    const project = projectService.findProject(scriptInfo.containingProjects[0]?.getProjectName());
    if (!project) {
        return undefined;
    }
    project.addMissingFileRoot(scriptInfo.fileName);
    return project.getLanguageService();
};

const migrateTypeScript = (host: Tree, context: SchematicContext, update: UpdateChanges) => {
    const projectFiles = new Set(update.tsFiles.map(f => tss.server.toNormalizedPath(path.join(process.cwd(), f))));
    const memberNames = [...new Set(REMOVED_MEMBERS.map(m => m.member)), 'registerFamilyAlias', 'find', 'findIndex', 'indicatorsOrientation'];

    for (const entryPath of update.tsFiles) {
        const content = host.read(entryPath).toString();
        if (!content.includes(IG_PACKAGE_NAME) || !memberNames.some(m => content.includes(m))) {
            continue;
        }

        const langServ = getLanguageService(update, entryPath);
        const program = langServ?.getProgram();
        const sourceFile = program?.getSourceFile(tss.server.toNormalizedPath(path.join(process.cwd(), entryPath)));
        if (!sourceFile) {
            continue;
        }

        const checker = program.getTypeChecker();
        const changes: TextChange[] = [];
        /** The name `ExpressionsTreeUtil` is available under in the file, once its import is ensured */
        let util: string;
        const isLibrary = (declaration: tss.Declaration) => {
            const fileName = tss.server.toNormalizedPath(declaration.getSourceFile().fileName);
            return fileName.includes(IG_PACKAGE_NAME) && !projectFiles.has(fileName);
        };
        const typeMatches = (type: tss.Type, names: string[], seen = new Set<tss.Type>()): boolean => {
            if (!type || seen.has(type)) {
                return false;
            }
            seen.add(type);
            if (type.isUnionOrIntersection()) {
                return type.types.some(t => typeMatches(t, names, seen));
            }
            if (type.flags & tss.TypeFlags.TypeParameter) {
                return typeMatches(checker.getBaseConstraintOfType(type), names, seen);
            }
            const symbols = [type.aliasSymbol, type.getSymbol()].filter(s => !!s);
            if (symbols.some(s => names.includes(s.getName()) && s.declarations?.some(isLibrary))) {
                return true;
            }
            const target = (type as tss.TypeReference).target ?? type;
            return target.isClassOrInterface() && (checker.getBaseTypes(target) ?? []).some(t => typeMatches(t, names, seen));
        };
        const valueMatches = (node: tss.Expression, names: string[]) => {
            let symbol = checker.getSymbolAtLocation(node);
            if (symbol && symbol.flags & tss.SymbolFlags.Alias) {
                symbol = checker.getAliasedSymbol(symbol);
            }
            return !!symbol && names.includes(symbol.getName()) && !!symbol.declarations?.some(isLibrary);
        };
        const receiverMatches = (node: tss.Expression, names: string[]) =>
            typeMatches(checker.getTypeAtLocation(node), names) || valueMatches(node, names);
        const warn = (node: tss.Node, message: string) => {
            const { line } = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile));
            context.logger.warn(`${entryPath}:${line + 1}: ${message}`);
        };

        const visit = (node: tss.Node) => {
            if (tss.isCallExpression(node) && tss.isPropertyAccessExpression(node.expression)) {
                migrateCall(node, node.expression);
            }
            // the call migrations keep the receiver and argument text in place, so their removed members are migrated as well
            if (tss.isPropertyAccessExpression(node)) {
                migratePropertyAccess(node);
            } else if (tss.isBindingElement(node) && tss.isObjectBindingPattern(node.parent)) {
                migrateBindingElement(node, node.parent);
            } else if (tss.isBinaryExpression(node) && node.operatorToken.kind === tss.SyntaxKind.EqualsToken) {
                migrateIndicatorsOrientationAssignment(node);
            }
            tss.forEachChild(node, visit);
        };

        const migratePropertyAccess = (node: tss.PropertyAccessExpression) => {
            const name = node.name.text;
            const removed = REMOVED_MEMBERS.find(m => m.member === name && receiverMatches(node.expression, m.definedIn));
            if (!removed) {
                return;
            }
            if (removed.replaceWith) {
                changes.push({ start: node.name.getStart(sourceFile), end: node.name.getEnd(), text: removed.replaceWith });
            } else {
                warn(node, removed.warning);
            }
        };

        // `const { rowID } = args` and `({ rowID }: IRowToggleEventArgs) => ...`
        const migrateBindingElement = (node: tss.BindingElement, pattern: tss.ObjectBindingPattern) => {
            const property = node.propertyName ?? node.name;
            if (!tss.isIdentifier(property)) {
                return;
            }
            const type = checker.getTypeAtLocation(pattern);
            const removed = REMOVED_MEMBERS.find(m => m.member === property.text && typeMatches(type, m.definedIn));
            if (!removed) {
                return;
            }
            if (!removed.replaceWith) {
                warn(node, removed.warning);
            } else if (node.propertyName) {
                changes.push({ start: property.getStart(sourceFile), end: property.getEnd(), text: removed.replaceWith });
            } else {
                // keep the local name, as the code after the destructuring still refers to it
                changes.push({ start: property.getStart(sourceFile), end: property.getStart(sourceFile), text: `${removed.replaceWith}: ` });
            }
        };

        // `carousel.indicatorsOrientation = 'bottom'`
        const migrateIndicatorsOrientationAssignment = (node: tss.BinaryExpression) => {
            const { left, right } = node;
            if (tss.isPropertyAccessExpression(left) && left.name.text === 'indicatorsOrientation'
                && tss.isStringLiteralLike(right) && INDICATORS_ORIENTATION[right.text]
                && receiverMatches(left.expression, ['IgxCarouselComponent'])) {
                const quote = content[right.getStart(sourceFile)];
                changes.push({
                    start: right.getStart(sourceFile),
                    end: right.getEnd(),
                    text: `${quote}${INDICATORS_ORIENTATION[right.text]}${quote}`
                });
            }
        };

        /** Whether the expression can be evaluated more than once with the same result: a literal, identifier or property chain. */
        const isSideEffectFree = (node: tss.Expression): boolean =>
            tss.isStringLiteralLike(node) || tss.isIdentifier(node) || node.kind === tss.SyntaxKind.ThisKeyword
            || tss.isPropertyAccessExpression(node) && !node.questionDotToken && isSideEffectFree(node.expression);
        /** Whether the argument is omitted, applying the default value of the parameter. */
        const isOmitted = (node: tss.Expression | undefined) => !node
            || tss.isIdentifier(node) && node.text === 'undefined'
            || tss.isVoidExpression(node);
        /** Whether the argument is always a string, so that passing it on can't skip a parameter default. */
        const isDefinedString = (node: tss.Expression) => {
            if (tss.isStringLiteralLike(node)) {
                return true;
            }
            const type = checker.getTypeAtLocation(node);
            const types = type.isUnion() ? type.types : [type];
            return types.every(t => !!(t.flags & tss.TypeFlags.StringLike));
        };

        const migrateCall = (node: tss.CallExpression, callee: tss.PropertyAccessExpression) => {
            const name = callee.name.text;
            const receiver = callee.expression;

            // IgxIconService.registerFamilyAlias(alias, className = alias, type = 'font') -> setFamily(alias, { className, type })
            if (name === 'registerFamilyAlias' && receiverMatches(receiver, ['IgxIconService'])) {
                const [alias, className, type] = node.arguments;
                const migratable = tss.isExpressionStatement(node.parent) && node.arguments.length <= 3
                    // registerFamilyAlias returns the service, setFamily doesn't, so chained calls are left to the user
                    && alias && isSideEffectFree(alias) && isDefinedString(alias)
                    && [className, type].every(arg => isOmitted(arg) || isSideEffectFree(arg) && isDefinedString(arg));
                if (!migratable) {
                    warn(node, 'IgxIconService `registerFamilyAlias` was removed. Use `setFamily(alias, { className, type })` instead.');
                    return;
                }
                const text = (arg: tss.Expression) => arg.getText(sourceFile);
                const classNameText = isOmitted(className) ? text(alias) : text(className);
                const typeText = isOmitted(type) ? `'font'` : text(type);
                changes.push({ start: callee.name.getStart(sourceFile), end: callee.name.getEnd(), text: 'setFamily' });
                changes.push({
                    start: node.arguments.pos,
                    end: node.arguments.end,
                    text: `${text(alias)}, { className: ${classNameText}, type: ${typeText} }`
                });
                return;
            }

            // FilteringExpressionsTree.find(fieldName) -> ExpressionsTreeUtil.find(tree, fieldName)
            if ((name === 'find' || name === 'findIndex') && node.arguments.length === 1
                && receiverMatches(receiver, ['FilteringExpressionsTree', 'IFilteringExpressionsTree'])) {
                if (callee.questionDotToken || node.questionDotToken) {
                    warn(node, `FilteringExpressionsTree \`${name}\` was removed. Use \`ExpressionsTreeUtil.${name}(tree, fieldName)\` instead.`);
                    return;
                }
                // the file can have several calls, so its imports are only checked and updated once
                util ??= ensureExpressionsTreeUtilImport(sourceFile, changes);
                // `tree.find(` -> `ExpressionsTreeUtil.find(tree, `, leaving the receiver and the argument in place
                const receiverStart = receiver.getStart(sourceFile);
                changes.push({ start: receiverStart, end: receiverStart, text: `${util}.${name}(` });
                changes.push({ start: receiver.getEnd(), end: node.arguments.pos, text: ', ' });
            }
        };

        visit(sourceFile);

        if (changes.length) {
            host.overwrite(entryPath, applyTextChanges(content, changes));
        }
    }
};

/**
 * Returns the identifier `ExpressionsTreeUtil` is available under in the file,
 * adding it to an existing Ignite UI import, or a new one, when it isn't imported yet.
 */
const ensureExpressionsTreeUtilImport = (sourceFile: tss.SourceFile, changes: TextChange[]): string => {
    const name = 'ExpressionsTreeUtil';
    const igImports = sourceFile.statements
        .filter(tss.isImportDeclaration)
        .filter(i => tss.isStringLiteral(i.moduleSpecifier) && isIgniteuiImport(i.moduleSpecifier.text));

    for (const declaration of igImports) {
        const clause = declaration.importClause;
        const bindings = clause?.namedBindings;
        if (!bindings || !tss.isNamedImports(bindings)) {
            continue;
        }
        const elements = bindings.elements;
        const index = elements.findIndex(e => (e.propertyName ?? e.name).text === name);
        if (index === -1) {
            continue;
        }
        const existing = elements[index];
        if (existing.isTypeOnly) {
            // `import { type ExpressionsTreeUtil }` -> `import { ExpressionsTreeUtil }`
            const nameStart = (existing.propertyName ?? existing.name).getStart(sourceFile);
            changes.push({ start: existing.getStart(sourceFile), end: nameStart, text: '' });
        } else if (clause.isTypeOnly && elements.length === 1) {
            // `import type { ExpressionsTreeUtil }` -> `import { ExpressionsTreeUtil }`
            changes.push({ start: clause.getStart(sourceFile), end: bindings.getStart(sourceFile), text: '' });
        } else if (clause.isTypeOnly) {
            // move it out of the type-only import into a value import of the same module, so it isn't bound twice
            const [start, end] = index < elements.length - 1
                ? [existing.getStart(sourceFile), elements[index + 1].getStart(sourceFile)]
                : [elements[index - 1].getEnd(), existing.getEnd()];
            changes.push({ start, end, text: '' });
            const specifier = existing.getText(sourceFile);
            const moduleText = declaration.moduleSpecifier.getText(sourceFile);
            changes.push({ start: declaration.getEnd(), end: declaration.getEnd(), text: `\nimport { ${specifier} } from ${moduleText};` });
        }
        return existing.name.text;
    }

    // core holds the data operations, the package root re-exports it
    const target = igImports.find(i => {
        const bindings = i.importClause?.namedBindings;
        return /^(@infragistics\/)?igniteui-angular(\/core)?$/.test((i.moduleSpecifier as tss.StringLiteral).text)
            && !i.importClause?.isTypeOnly && !!bindings && tss.isNamedImports(bindings) && bindings.elements.length > 0;
    });
    if (target) {
        const elements = (target.importClause.namedBindings as tss.NamedImports).elements;
        const last = elements[elements.length - 1];
        changes.push({ start: last.getEnd(), end: last.getEnd(), text: `, ${name}` });
        return name;
    }

    const licensed = igImports.some(i => (i.moduleSpecifier as tss.StringLiteral).text.startsWith(IG_LICENSED_PACKAGE_NAME));
    const lastImport = igImports[igImports.length - 1];
    const position = lastImport ? lastImport.getEnd() : 0;
    const statement = `import { ${name} } from '${licensed ? IG_LICENSED_PACKAGE_NAME : IG_PACKAGE_NAME}/core';`;
    changes.push({ start: position, end: position, text: lastImport ? `\n${statement}` : `${statement}\n` });
    return name;
};

//#endregion

//#region Templates

/** Replaces `rowID` with `key` on the context of `igxRowSelector` templates */
const migrateRowSelectorTemplates = (host: Tree, update: UpdateChanges, parser: HtmlParser) => {
    for (const templatePath of update.templateFiles) {
        const content = host.read(templatePath).toString();
        if (!content.includes('igxRowSelector') || !content.includes('rowID')) {
            continue;
        }

        const changes: TextChange[] = [];
        const templates = findElementNodes(parser.parse(content, templatePath).rootNodes, 'ng-template')
            .filter(node => hasAttribute(node as Element, ['igxRowSelector', '[igxRowSelector]']));
        for (const template of templates as Element[]) {
            const contextNames = template.attrs
                .filter(a => a.name.startsWith('let-') && (!a.value || a.value === '$implicit'))
                .map(a => a.name.substring('let-'.length));
            const start = template.startSourceSpan.end.offset;
            const end = template.endSourceSpan?.start.offset ?? start;
            const body = content.substring(start, end);
            for (const contextName of contextNames) {
                const regex = new RegExp(String.raw`(\b${contextName}\??\.)rowID\b`, 'g');
                let match: RegExpExecArray;
                while ((match = regex.exec(body))) {
                    const position = start + match.index + match[1].length;
                    changes.push({ start: position, end: position + 'rowID'.length, text: 'key' });
                }
            }
        }

        if (changes.length) {
            host.overwrite(templatePath, applyTextChanges(content, changes));
        }
    }
};

/** The combo resource strings that `searchPlaceholder` overrode, with and without `disableFiltering` */
const COMBO_PLACEHOLDER_STRINGS = ['igx_combo_filter_search_placeholder', 'igx_combo_addCustomValues_placeholder'];

/** Moves the value of the removed IgxComboComponent `searchPlaceholder` into the `resourceStrings` it overrode */
const migrateComboSearchPlaceholder = (host: Tree, context: SchematicContext, update: UpdateChanges, parser: HtmlParser) => {
    for (const templatePath of update.templateFiles) {
        const content = host.read(templatePath).toString();
        if (!content.includes('igx-combo') || !content.includes('searchPlaceholder')) {
            continue;
        }

        const changes: TextChange[] = [];
        const combos = findElementNodes(parser.parse(content, templatePath).rootNodes, 'igx-combo') as Element[];
        for (const combo of combos) {
            const [placeholder] = getAttribute(combo, ['searchPlaceholder', '[searchPlaceholder]']);
            if (!placeholder) {
                continue;
            }
            const value = placeholder.value;
            const { line } = placeholder.sourceSpan.start;
            if (hasAttribute(combo, ['resourceStrings', '[resourceStrings]']) || value.includes('{{')) {
                context.logger.warn(`${templatePath}:${line + 1}: IgxComboComponent \`searchPlaceholder\` was removed. ` +
                    `Set the ${COMBO_PLACEHOLDER_STRINGS.map(s => `\`${s}\``).join(' and ')} resource strings instead.`);
                continue;
            }

            const valueStart = placeholder.valueSpan?.start.offset;
            const quote = valueStart !== undefined && content[valueStart - 1] === '\'' ? '\'' : '"';
            let expression: string;
            if (placeholder.name.startsWith('[')) {
                expression = value.includes('|') ? `(${value.trim()})` : value.trim();
            } else {
                const stringQuote = quote === '"' ? '\'' : '"';
                expression = `${stringQuote}${value.replace(/\\/g, '\\\\').replace(new RegExp(stringQuote, 'g'), `\\${stringQuote}`)}${stringQuote}`;
            }
            const strings = COMBO_PLACEHOLDER_STRINGS.map(s => `${s}: ${expression}`).join(', ');
            changes.push({
                start: placeholder.sourceSpan.start.offset,
                end: placeholder.sourceSpan.end.offset,
                text: `[resourceStrings]=${quote}{ ${strings} }${quote}`
            });
        }

        if (changes.length) {
            host.overwrite(templatePath, applyTextChanges(content, changes));
        }
    }
};

//#endregion

//#region Sass

/** Removed global theme wrappers and the `theme` mixin arguments that reproduce them */
const THEME_WRAPPERS: Record<string, { schema: string; elevations?: string }> = {
    'light-theme': { schema: 'light-material-schema' },
    'dark-theme': { schema: 'dark-material-schema' },
    'bootstrap-light-theme': { schema: 'light-bootstrap-schema' },
    'bootstrap-dark-theme': { schema: 'dark-bootstrap-schema' },
    'fluent-light-theme': { schema: 'light-fluent-schema' },
    'fluent-dark-theme': { schema: 'dark-fluent-schema' },
    'indigo-light-theme': { schema: 'light-indigo-schema', elevations: 'indigo-elevations' },
    'indigo-dark-theme': { schema: 'dark-indigo-schema', elevations: 'indigo-elevations' }
};

/** The positional parameters of the removed theme wrappers */
const THEME_WRAPPER_PARAMS = ['$palette', '$exclude', '$roundness', '$elevation'];

/** Removed palette variables and their replacements */
const PALETTES: Record<string, string> = {
    'default-palette': 'light-material-palette',
    'light-palette': 'light-material-palette',
    'dark-palette': 'dark-material-palette'
};

const IG_THEMING_MODULE = String.raw`~?(?:@infragistics\/)?igniteui-angular\/(?:theming|theme|lib\/core\/styles\/themes(?:\/index)?)`;

/** Returns the namespaces the Ignite UI theming module is used under and whether its members are available without one. */
const getThemingNamespaces = (content: string) => {
    const namespaces = new Set<string>();
    let global = new RegExp(String.raw`@import\s+(['"])${IG_THEMING_MODULE}\1`).test(content);
    const useRegex = new RegExp(String.raw`@use\s+(['"])(${IG_THEMING_MODULE})\1(?:\s+as\s+([\w-]+|\*))?`, 'g');
    let match: RegExpExecArray;
    while ((match = useRegex.exec(content))) {
        const alias = match[3] ?? match[2].split('/').pop();
        if (alias === '*') {
            global = true;
        } else {
            namespaces.add(alias);
        }
    }
    return { namespaces, global };
};

/**
 * Returns the content with its comments, and the text of its strings when `strings` is set, replaced by spaces,
 * so that offsets match the content and only code is matched. Interpolations (`#{...}`) in strings are kept, as they are code.
 */
const maskSass = (content: string, strings = true): string => {
    const result = content.split('');
    const blank = (from: number, to: number) => {
        for (let i = from; i < to; i++) {
            if (result[i] !== '\n') {
                result[i] = ' ';
            }
        }
    };
    let i = 0;
    while (i < content.length) {
        const char = content[i];
        if (char === '/' && content[i + 1] === '/') {
            const end = content.indexOf('\n', i);
            blank(i, end === -1 ? content.length : end);
            i = end === -1 ? content.length : end;
        } else if (char === '/' && content[i + 1] === '*') {
            const end = content.indexOf('*/', i + 2);
            blank(i, end === -1 ? content.length : end + 2);
            i = end === -1 ? content.length : end + 2;
        } else if (/^url\(/i.test(content.substring(i, i + 4)) && !/[\w-]/.test(content[i - 1] ?? '')) {
            // an unquoted url can contain `//`, which doesn't start a comment there
            const end = content.indexOf(')', i);
            i = end === -1 ? content.length : end + 1;
        } else if (char === '"' || char === '\'') {
            let j = i + 1;
            while (j < content.length && content[j] !== char && content[j] !== '\n') {
                if (content[j] === '\\') {
                    if (strings) {
                        blank(j, j + 2);
                    }
                    j += 2;
                } else if (content[j] === '#' && content[j + 1] === '{') {
                    const end = content.indexOf('}', j);
                    j = end === -1 ? content.length : end + 1;
                } else {
                    if (strings) {
                        blank(j, j + 1);
                    }
                    j++;
                }
            }
            i = j + 1;
        } else {
            i++;
        }
    }
    return result.join('');
};

/** Returns the index of the parenthesis closing the one at `start`, skipping strings and nested parentheses. */
const findClosingParenthesis = (content: string, start: number): number => {
    let depth = 0;
    let quote: string = null;
    for (let i = start; i < content.length; i++) {
        const char = content[i];
        if (quote) {
            if (char === quote && content[i - 1] !== '\\') {
                quote = null;
            }
        } else if (char === '"' || char === '\'') {
            quote = char;
        } else if (char === '(') {
            depth++;
        } else if (char === ')' && --depth === 0) {
            return i;
        }
    }
    return -1;
};

/** Splits a Sass argument list on its top-level commas. */
const splitArguments = (args: string): string[] => {
    const result: string[] = [];
    let depth = 0;
    let quote: string = null;
    let current = '';
    for (let i = 0; i < args.length; i++) {
        const char = args[i];
        if (quote) {
            if (char === quote && args[i - 1] !== '\\') {
                quote = null;
            }
        } else if (char === '"' || char === '\'') {
            quote = char;
        } else if (char === '(' || char === '[') {
            depth++;
        } else if (char === ')' || char === ']') {
            depth--;
        } else if (char === ',' && depth === 0) {
            result.push(current);
            current = '';
            continue;
        }
        current += char;
    }
    if (current.trim()) {
        result.push(current);
    }
    return result;
};

const escapeName = (name: string) => name.replace(/[-]/g, '[-_]');

/** Whether the file declares its own mixin or variable with the name, shadowing the library one. */
const declaresLocally = (content: string, kind: 'mixin' | 'variable', name: string) => kind === 'mixin'
    ? new RegExp(String.raw`(@mixin\s+|^\s*=)${escapeName(name)}\b`, 'm').test(content)
    : new RegExp(String.raw`^\s*\$${escapeName(name)}\s*:`, 'm').test(content);

const migrateSass = (host: Tree, context: SchematicContext, update: UpdateChanges) => {
    let migratedWrappers = false;
    for (const entryPath of update.sassFiles) {
        const original = host.read(entryPath).toString();
        const { namespaces, global } = getThemingNamespaces(maskSass(original, false));
        if (!global && !namespaces.size) {
            continue;
        }
        const prefixes = [...namespaces].map(ns => `${ns}.`);
        if (global) {
            prefixes.push('');
        }

        let content = original;
        // matched instead of the content, so that comments and strings aren't migrated, with the same offsets
        let code = maskSass(content);
        const changes: TextChange[] = [];

        // @include light-theme($palette, ...) -> @include theme($palette: $palette, $schema: $light-material-schema, ...)
        const wrappers = Object.keys(THEME_WRAPPERS).sort((a, b) => b.length - a.length).join('|');
        const includeRegex = new RegExp(String.raw`@include\s+(?:([\w-]+)\.)?(${wrappers})\s*\(`, 'g');
        let match: RegExpExecArray;
        while ((match = includeRegex.exec(code))) {
            const [, namespace, wrapper] = match;
            const prefix = namespace ? `${namespace}.` : '';
            if (!prefixes.includes(prefix) || !namespace && declaresLocally(code, 'mixin', wrapper)) {
                continue;
            }
            const open = match.index + match[0].length - 1;
            const close = findClosingParenthesis(code, open);
            if (close === -1) {
                continue;
            }
            const args = splitArguments(content.substring(open + 1, close));
            if (args.some(a => a.trim().endsWith('...'))) {
                context.logger.warn(`${entryPath}: replace the removed \`${wrapper}\` mixin with the \`theme\` mixin manually.`);
                continue;
            }

            const named = args.map((arg, i) => {
                const text = arg.trim();
                return /^\$[\w-]+\s*:/.test(text) ? text : `${THEME_WRAPPER_PARAMS[i]}: ${text}`;
            });
            const { schema, elevations } = THEME_WRAPPERS[wrapper];
            const paletteIndex = named.findIndex(a => /^\$palette\s*:/.test(a));
            named.splice(paletteIndex + 1, 0, `$schema: ${prefix}$${schema}`);
            if (elevations) {
                named.push(`$elevations: ${prefix}$${elevations}`);
            }

            const multiline = args.length > 0 && args[0].includes('\n');
            const indent = multiline ? args[0].match(/\n([ \t]*)/)[1] : '';
            const closingIndent = multiline ? (content.substring(open + 1, close).match(/\n([ \t]*)$/)?.[1] ?? '') : '';
            const argList = multiline
                ? `\n${named.map(a => `${indent}${a}`).join(',\n')}\n${closingIndent}`
                : named.join(', ');
            const nameStart = match.index + match[0].indexOf(wrapper, namespace ? namespace.length : 0);
            changes.push({ start: nameStart, end: close + 1, text: `theme(${argList})` });
            migratedWrappers = true;
        }
        if (changes.length) {
            content = applyTextChanges(content, changes);
            code = maskSass(content);
        }

        // $light-palette -> $light-material-palette
        const paletteChanges: TextChange[] = [];
        for (const [palette, replacement] of Object.entries(PALETTES)) {
            const local = declaresLocally(code, 'variable', palette);
            const paletteRegex = new RegExp(String.raw`(^|[^\w$.-]|([\w-]+)\.)\$${palette}(?![\w-])`, 'g');
            while ((match = paletteRegex.exec(code))) {
                const [text, before, namespace] = match;
                const library = namespace ? namespaces.has(namespace) : global && !local;
                if (library) {
                    const start = match.index + before.length + 1;
                    paletteChanges.push({ start, end: match.index + text.length, text: replacement });
                }
            }
        }
        content = applyTextChanges(content, paletteChanges);

        if (content !== original) {
            host.overwrite(entryPath, content);
        }
    }

    if (migratedWrappers) {
        context.logger.info('The removed global theme mixins were replaced with the `theme` mixin. ' +
            'Unlike the removed mixins, `theme` uses the gray and surface colors of the palette you pass as they are, so review the results.');
    }
};

//#endregion
