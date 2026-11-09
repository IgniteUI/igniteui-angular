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
import {
    argumentName, leadingCommentsEnd, lineEnding, maskComments, maskNonCode, splitArguments
} from '../common/sass/scanner';
import { SassStylesheet } from '../common/sass/stylesheet';
// use bare specifier to escape the schematics encapsulation for the dynamic import:
import { nativeImport } from 'igniteui-angular/migrations/common/import-helper.cjs';
import type { Element, HtmlParser } from '@angular/compiler' with { "resolution-mode": "import" };
import type * as AngularCompiler from '@angular/compiler' with { "resolution-mode": "import" };

const version = '23.0.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const compiler = await nativeImport('@angular/compiler');

    const update = new UpdateChanges(__dirname, host, context);

    // IgxQueryBuilderComponent: `fields` is replaced by `entities`
    update.addValueTransform('fields_to_entities', (args: BoundPropertyObject): void => {
        args.bindingType = InputPropertyType.EVAL;
        args.value = `[{ name: '', fields: ${args.value}}]`;
    });

    // IgxAvatarComponent: `color` and `bgColor` set the host `style.color` and `style.background`
    update.addValueTransform('avatar_color_to_style', (args: BoundPropertyObject): void => {
        if (args.bindingType !== InputPropertyType.STRING) {
            return;
        }
        // `color="{{ textColor }}"` -> `[style.color]="textColor"`
        const interpolation = args.value.match(/^\s*\{\{([\s\S]*?)\}\}\s*$/);
        if (interpolation && !interpolation[1].includes('{{')) {
            args.bindingType = InputPropertyType.EVAL;
            args.value = interpolation[1].trim();
        } else if (!args.value.includes('{{')) {
            // text around an interpolation, as in `bgColor="#{{ hex }}"`, keeps it a style interpolation
            args.bindingType = InputPropertyType.EVAL;
            // the string literal uses the other quote, so it doesn't end the attribute value
            const stringQuote = args.quote === '\'' ? '"' : '\'';
            args.value = `${stringQuote}${args.value.replace(/\\/g, '\\\\').replace(new RegExp(stringQuote, 'g'), `\\${stringQuote}`)}${stringQuote}`;
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

    migrateTypeScript(host, context, update);
    migrateTemplateExpressions(host, context, update, compiler);
    migrateComboSearchPlaceholder(host, context, update, new compiler.HtmlParser());
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

/**
 * Removed members whose names are distinct enough to look for in files that don't import Ignite UI,
 * as such a file can still reach the library types through local code, such as a base class.
 */
const DISTINCT_MEMBERS = [
    'rowID', 'primaryKey', 'isFirstPageDisabled', 'isLastPageDisabled', 'shouldGenerate', 'filterGlobal', 'registerFamilyAlias',
    'searchPlaceholder'
];

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
        // the type checker tells the library members apart, this only skips the files that can't use any
        const candidates = content.includes(IG_PACKAGE_NAME) ? memberNames : DISTINCT_MEMBERS;
        if (!candidates.some(m => content.includes(m))) {
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
        /** Removed ranges, whose content is dropped together with any change in it */
        const removals: TextChange[] = [];
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
        /** Whether the type comes from the licensed package, for a file that reaches it through local code only */
        const isLicensed = (type: tss.Type) => !!type.getSymbol()?.declarations?.some(d =>
            isLibrary(d) && tss.server.toNormalizedPath(d.getSourceFile().fileName).includes(IG_LICENSED_PACKAGE_NAME));
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
            } else if (tss.isObjectLiteralExpression(node)) {
                migrateObjectLiteral(node);
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

        // `const path: IPathSegment = { rowID: id }`, which no longer type checks against the type
        const migrateObjectLiteral = (node: tss.ObjectLiteralExpression) => {
            const type = checker.getContextualType(node);
            if (!type) {
                return;
            }
            const properties = node.properties;
            const names = properties.map(p => (tss.isPropertyAssignment(p) || tss.isShorthandPropertyAssignment(p))
                && (tss.isIdentifier(p.name) || tss.isStringLiteral(p.name)) ? p.name.text : undefined);
            properties.forEach((property, index) => {
                const name = names[index];
                const removed = name && REMOVED_MEMBERS.find(m => m.member === name && typeMatches(type, m.definedIn));
                if (!removed) {
                    return;
                }
                if (!removed.replaceWith) {
                    warn(property, removed.warning);
                } else if (names.includes(removed.replaceWith)) {
                    // the literal sets the replacement already, so the removed property goes, with the comma separating it
                    const [start, end] = index < properties.length - 1
                        ? [property.getStart(sourceFile), properties[index + 1].getStart(sourceFile)]
                        : index > 0
                            ? [properties[index - 1].getEnd(), property.getEnd()]
                            : [property.getStart(sourceFile), property.getEnd()];
                    removals.push({ start, end, text: '' });
                } else if (tss.isShorthandPropertyAssignment(property)) {
                    // `{ rowID }` -> `{ rowKey: rowID }`, keeping the variable it reads
                    const start = property.name.getStart(sourceFile);
                    changes.push({ start, end: start, text: `${removed.replaceWith}: ` });
                } else {
                    changes.push({ start: property.name.getStart(sourceFile), end: property.name.getEnd(), text: removed.replaceWith });
                }
            });
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
                    // an omitted class name repeats the alias, which for a property access can run a getter twice
                    && (!isOmitted(className) || tss.isStringLiteralLike(alias) || tss.isIdentifier(alias))
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
                // `tree?.find(...)` and `grid?.filteringExpressionsTree.find(...)` short-circuit, which a function call wouldn't
                if (tss.isOptionalChain(node)) {
                    warn(node, `FilteringExpressionsTree \`${name}\` was removed. Use \`ExpressionsTreeUtil.${name}(tree, fieldName)\` instead.`);
                    return;
                }
                // the file can have several calls, so its imports are only checked and updated once
                util ??= ensureExpressionsTreeUtilImport(sourceFile, changes, isLicensed(checker.getTypeAtLocation(receiver)));
                // `tree.find(` -> `ExpressionsTreeUtil.find(tree, `, leaving the receiver and the argument in place
                const receiverStart = receiver.getStart(sourceFile);
                changes.push({ start: receiverStart, end: receiverStart, text: `${util}.${name}(` });
                changes.push({ start: receiver.getEnd(), end: node.arguments.pos, text: ', ' });
            }
        };

        visit(sourceFile);

        // an insertion where a removal ends is outside of it, as it applies after the removed text
        const kept = changes.filter(c => !removals.some(r => r.start <= c.start && c.end <= r.end && c.start < r.end));
        if (kept.length || removals.length) {
            host.overwrite(entryPath, applyTextChanges(content, [...kept, ...removals]));
        }
    }
};

/**
 * Returns the identifier `ExpressionsTreeUtil` is available under in the file,
 * adding it to an existing Ignite UI import, or a new one, when it isn't imported yet.
 * `licensed` tells the package a file without Ignite UI imports gets the tree from.
 */
const ensureExpressionsTreeUtilImport = (sourceFile: tss.SourceFile, changes: TextChange[], licensed: boolean): string => {
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

    // the file can declare or import another `ExpressionsTreeUtil`, so the import gets a free alias then
    const declared = getTopLevelNames(sourceFile);
    let local = name;
    for (let i = 1; declared.has(local); i++) {
        local = `Igx${name}${i > 1 ? i : ''}`;
    }
    const specifier = local === name ? name : `${name} as ${local}`;

    // core holds the data operations, the package root re-exports it
    const target = igImports.find(i => {
        const bindings = i.importClause?.namedBindings;
        return /^(@infragistics\/)?igniteui-angular(\/core)?$/.test((i.moduleSpecifier as tss.StringLiteral).text)
            && !i.importClause?.isTypeOnly && !!bindings && tss.isNamedImports(bindings) && bindings.elements.length > 0;
    });
    if (target) {
        const elements = (target.importClause.namedBindings as tss.NamedImports).elements;
        const last = elements[elements.length - 1];
        changes.push({ start: last.getEnd(), end: last.getEnd(), text: `, ${specifier}` });
        return local;
    }

    const fromLicensed = igImports.length
        ? igImports.some(i => (i.moduleSpecifier as tss.StringLiteral).text.startsWith(IG_LICENSED_PACKAGE_NAME))
        : licensed;
    const lastImport = igImports[igImports.length - 1];
    const position = lastImport ? lastImport.getEnd() : 0;
    const statement = `import { ${specifier} } from '${fromLicensed ? IG_LICENSED_PACKAGE_NAME : IG_PACKAGE_NAME}/core';`;
    changes.push({ start: position, end: position, text: lastImport ? `\n${statement}` : `${statement}\n` });
    return local;
};

/** Returns the names the file binds at its top level, through its imports and declarations. */
const getTopLevelNames = (sourceFile: tss.SourceFile): Set<string> => {
    const names = new Set<string>();
    const addBinding = (binding: tss.BindingName) => {
        if (tss.isIdentifier(binding)) {
            names.add(binding.text);
        } else {
            binding.elements.forEach(e => !tss.isOmittedExpression(e) && addBinding(e.name));
        }
    };
    for (const statement of sourceFile.statements) {
        if (tss.isImportDeclaration(statement)) {
            const clause = statement.importClause;
            const bindings = clause?.namedBindings;
            if (clause?.name) {
                names.add(clause.name.text);
            }
            if (bindings && tss.isNamespaceImport(bindings)) {
                names.add(bindings.name.text);
            } else if (bindings && tss.isNamedImports(bindings)) {
                bindings.elements.forEach(e => names.add(e.name.text));
            }
        } else if (tss.isVariableStatement(statement)) {
            statement.declarationList.declarations.forEach(d => addBinding(d.name));
        } else {
            // classes, functions, enums, interfaces, type aliases, namespaces and `import x = require()`
            const declarationName = (statement as tss.DeclarationStatement).name;
            if (declarationName && tss.isIdentifier(declarationName)) {
                names.add(declarationName.text);
            }
        }
    }
    return names;
};

//#endregion

//#region Templates

/** The components a template reference variable (`#ref`) on these elements holds, by the type defining their removed members */
const ELEMENT_TYPES: Record<string, string> = {
    'igx-grid': 'IgxGridComponent',
    'igx-tree-grid': 'IgxTreeGridComponent',
    'igx-hierarchical-grid': 'IgxHierarchicalGridComponent',
    'igx-row-island': 'IgxRowIslandComponent',
    'igx-pivot-grid': 'IgxPivotGridComponent',
    'igx-paginator': 'IgxPaginatorComponent',
    'igx-combo': 'IgxComboComponent',
    'igx-avatar': 'IgxAvatarComponent',
    'igx-query-builder': 'IgxQueryBuilderComponent',
    'igx-query-builder-header': 'IgxQueryBuilderHeaderComponent',
    'igx-slide': 'IgxSlideComponent'
};

const GRID_ELEMENTS = ['igx-grid', 'igx-tree-grid', 'igx-hierarchical-grid', 'igx-row-island', 'igx-pivot-grid'];

const GRID_EDIT_EVENT_ARGS = ['IGridEditEventArgs', 'IGridEditDoneEventArgs'];
const GRID_EDIT_DONE_EVENT_ARGS = ['IGridEditDoneEventArgs'];
const ROW_DATA_CANCELABLE_EVENT_ARGS = ['IRowDataCancelableEventArgs', 'IRowDataEventArgs'];

/** The `$event` types of the grid outputs with removed members, together with the types they extend */
const GRID_OUTPUT_TYPES: Record<string, string[]> = {
    rowAdd: ROW_DATA_CANCELABLE_EVENT_ARGS,
    rowDelete: ROW_DATA_CANCELABLE_EVENT_ARGS,
    rowAdded: ['IRowDataEventArgs'],
    rowDeleted: ['IRowDataEventArgs'],
    cellEditEnter: GRID_EDIT_EVENT_ARGS,
    cellEdit: GRID_EDIT_EVENT_ARGS,
    rowEditEnter: GRID_EDIT_EVENT_ARGS,
    rowEdit: GRID_EDIT_EVENT_ARGS,
    cellEditDone: GRID_EDIT_DONE_EVENT_ARGS,
    cellEditExit: GRID_EDIT_DONE_EVENT_ARGS,
    rowEditDone: GRID_EDIT_DONE_EVENT_ARGS,
    rowEditExit: GRID_EDIT_DONE_EVENT_ARGS,
    rowToggle: ['IRowToggleEventArgs'],
    rowPinning: ['IPinRowEventArgs'],
    rowPinned: ['IPinRowEventArgs']
};

/** Removed members distinct enough to report where a template reads them from something it can't type, such as a component property */
const UNTYPED_TEMPLATE_MEMBERS = ['isFirstPageDisabled', 'isLastPageDisabled', 'shouldGenerate', 'filterGlobal'];

/**
 * Replaces the removed members template expressions read from what the template itself types: the
 * `igxRowSelector` context, the `$event` of grid outputs and template references to Ignite UI components.
 * The expressions are parsed, so strings and other variables of the same name are left alone. Other reads
 * of removed members distinct to the library, such as from component properties, are reported instead.
 */
const migrateTemplateExpressions = (host: Tree, context: SchematicContext, update: UpdateChanges, compiler: typeof AngularCompiler) => {
    const { ImplicitReceiver, PropertyRead, RecursiveAstVisitor, TmplAstRecursiveVisitor, parseTemplate, tmplAstVisitAll } = compiler;
    /** The types each name of a scope holds, null for a name the template doesn't type */
    type Scope = Map<string, string[] | null>;

    for (const templatePath of update.templateFiles) {
        const content = host.read(templatePath).toString();
        if (!REMOVED_MEMBERS.some(m => content.includes(m.member))) {
            continue;
        }

        const { nodes } = parseTemplate(content, templatePath, { preserveWhitespaces: true });
        const changes: TextChange[] = [];
        const warn = (offset: number, message: string) => {
            const line = content.substring(0, offset).split('\n').length;
            context.logger.warn(`${templatePath}:${line}: ${message}`);
        };

        // references are available in the whole template, also before the element declaring them
        const references: Scope = new Map();
        class ReferenceCollector extends TmplAstRecursiveVisitor {
            public override visitElement(element: AngularCompiler.TmplAstElement) {
                for (const reference of element.references) {
                    // a reference with a value, such as `#toggle="igxToggle"`, holds a directive rather than the component
                    const type = !reference.value && ELEMENT_TYPES[element.name];
                    references.set(reference.name, type ? [type] : null);
                }
                super.visitElement(element);
            }
        }
        tmplAstVisitAll(new ReferenceCollector(), nodes);

        const scopes: Scope[] = [references, new Map()];
        /** The elements whose bindings are visited, innermost last */
        const owners: string[] = [];
        const resolve = (name: string) => [...scopes].reverse().find(scope => scope.has(name))?.get(name) ?? null;
        const declare = (names: string[], type: (name: string) => string[] | null = () => null): Scope =>
            new Map(names.map(name => [name, type(name)]));

        const migrateRead = (ast: AngularCompiler.PropertyRead | AngularCompiler.SafePropertyRead) => {
            const receiver = ast.receiver;
            const types = receiver instanceof PropertyRead && receiver.receiver instanceof ImplicitReceiver ? resolve(receiver.name) : null;
            const removed = types && REMOVED_MEMBERS.find(m => m.member === ast.name && m.definedIn.some(t => types.includes(t)));
            if (removed?.replaceWith) {
                changes.push({ start: ast.nameSpan.start, end: ast.nameSpan.end, text: removed.replaceWith });
            } else if (removed) {
                warn(ast.nameSpan.start, removed.warning);
            } else if (!types && UNTYPED_TEMPLATE_MEMBERS.includes(ast.name)) {
                const member = REMOVED_MEMBERS.find(m => m.member === ast.name);
                warn(ast.nameSpan.start, member.warning ??
                    `\`${ast.name}\` was removed from ${member.definedIn[0]}. Replace it with \`${member.replaceWith}\` where it is read from one.`);
            }
        };

        class ExpressionVisitor extends RecursiveAstVisitor {
            public override visitPropertyRead(ast: AngularCompiler.PropertyRead, visitContext: any) {
                migrateRead(ast);
                return super.visitPropertyRead(ast, visitContext);
            }
            public override visitSafePropertyRead(ast: AngularCompiler.SafePropertyRead, visitContext: any) {
                migrateRead(ast);
                return super.visitSafePropertyRead(ast, visitContext);
            }
        }
        const expressions = new ExpressionVisitor();

        class TemplateVisitor extends TmplAstRecursiveVisitor {
            public override visitElement(element: AngularCompiler.TmplAstElement) {
                owners.push(element.name);
                super.visitElement(element);
                owners.pop();
            }
            public override visitTemplate(template: AngularCompiler.TmplAstTemplate) {
                // the bindings of the template read the scope around it, its content also the variables it declares
                owners.push(template.tagName);
                tmplAstVisitAll(this, [...template.templateAttrs, ...template.inputs, ...template.outputs]);
                owners.pop();
                const rowSelector = [...template.attributes, ...template.inputs].some(a => a.name === 'igxRowSelector');
                const contextVariables = template.variables.filter(v => !v.value || v.value === '$implicit').map(v => v.name);
                scopes.push(declare(template.variables.map(v => v.name),
                    name => rowSelector && contextVariables.includes(name) ? ['IgxRowSelectorTemplateDetails'] : null));
                tmplAstVisitAll(this, template.children);
                scopes.pop();
            }
            public override visitBoundText(text: AngularCompiler.TmplAstBoundText) {
                text.value.visit(expressions);
            }
            public override visitBoundAttribute(attribute: AngularCompiler.TmplAstBoundAttribute) {
                attribute.value.visit(expressions);
            }
            public override visitBoundEvent(event: AngularCompiler.TmplAstBoundEvent) {
                const owner = owners[owners.length - 1];
                scopes.push(declare(['$event'], () => GRID_ELEMENTS.includes(owner) ? GRID_OUTPUT_TYPES[event.name] ?? null : null));
                event.handler.visit(expressions);
                scopes.pop();
            }
            public override visitForLoopBlock(block: AngularCompiler.TmplAstForLoopBlock) {
                block.expression.visit(expressions);
                scopes.push(declare([block.item, ...block.contextVariables].map(v => v.name)));
                block.trackBy?.visit(expressions);
                tmplAstVisitAll(this, block.children);
                scopes.pop();
                block.empty?.visit(this);
            }
            public override visitIfBlockBranch(branch: AngularCompiler.TmplAstIfBlockBranch) {
                branch.expression?.visit(expressions);
                scopes.push(declare(branch.expressionAlias ? [branch.expressionAlias.name] : []));
                tmplAstVisitAll(this, branch.children);
                scopes.pop();
            }
            public override visitSwitchBlock(block: AngularCompiler.TmplAstSwitchBlock) {
                block.expression.visit(expressions);
                super.visitSwitchBlock(block);
            }
            public override visitSwitchBlockCase(block: AngularCompiler.TmplAstSwitchBlockCase) {
                block.expression?.visit(expressions);
                super.visitSwitchBlockCase(block);
            }
            public override visitLetDeclaration(declaration: AngularCompiler.TmplAstLetDeclaration) {
                declaration.value.visit(expressions);
                scopes[scopes.length - 1].set(declaration.name, null);
            }
        }
        tmplAstVisitAll(new TemplateVisitor(), nodes);

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

            const valueSpan = placeholder.valueSpan;
            const quote = valueSpan && content[valueSpan.start.offset - 1] === '\'' ? '\'' : '"';
            let expression: string;
            if (placeholder.name.startsWith('[')) {
                // the parser decodes the entities of the value, so a bound expression is moved as it is written
                const source = valueSpan ? content.substring(valueSpan.start.offset, valueSpan.end.offset).trim() : value.trim();
                expression = value.includes('|') ? `(${source})` : source;
            } else {
                const stringQuote = quote === '"' ? '\'' : '"';
                const literal = `${stringQuote}${value.replace(/\\/g, '\\\\').replace(new RegExp(stringQuote, 'g'), `\\${stringQuote}`)}${stringQuote}`;
                // encode the decoded text again, so that a quote in it doesn't end the attribute
                expression = literal.replace(/&/g, '&amp;').replace(new RegExp(quote, 'g'), quote === '"' ? '&quot;' : '&#39;');
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

/** An argument of a removed theme wrapper, with the comments around it. */
interface ThemeArgument {
    /** Comments on the lines before the argument */
    leading?: string;
    /** The argument, by name */
    code: string;
    /** A comment after the argument, on its line */
    trailing?: string;
}

/** A comment starting on the line an argument list part starts on, after the comma ending the previous argument. */
const SAME_LINE_COMMENT = /^[ \t]*(\/\/[^\r\n]*|\/\*[\s\S]*?\*\/)/;

/**
 * Returns the arguments of a removed theme wrapper call, passing the positional ones by name,
 * or null when the call spreads its arguments, which can't be named.
 */
const themeArguments = (body: string): ThemeArgument[] | null => {
    const args: ThemeArgument[] = [];
    for (let [index, part] of splitArguments(body).entries()) {
        const previous = args[args.length - 1];
        const sameLine = previous && SAME_LINE_COMMENT.exec(part);
        if (sameLine) {
            // `$palette: $p, // comment` describes the argument before the comma
            previous.trailing = [previous.trailing, sameLine[1]].filter(Boolean).join(' ');
            part = part.substring(sameLine[0].length);
        }
        const codeStart = leadingCommentsEnd(part);
        const rest = part.substring(codeStart);
        // comments are masked by whitespace, so the code ends before any comment closing the argument
        const codeEnd = maskComments(rest).trimEnd().length;
        const code = rest.substring(0, codeEnd);
        const leading = part.substring(0, codeStart).trim();
        const trailing = rest.substring(codeEnd).trim();
        if (!code) {
            // a trailing comma leaves an empty last part, whose comments go with the argument before it
            if (previous && (leading || trailing)) {
                previous.trailing = [previous.trailing, leading, trailing].filter(Boolean).join(' ');
            }
            continue;
        }
        if (code.endsWith('...')) {
            return null;
        }
        args.push({ leading, code: argumentName(code) ? code : `${THEME_WRAPPER_PARAMS[index]}: ${code}`, trailing });
    }
    return args;
};

/**
 * Formats the arguments of the `theme` mixin replacing a wrapper call with the `body` arguments:
 * one per line in the indentation of the call, when it has them on their own lines, or on a single line.
 */
const formatThemeArguments = (body: string, args: ThemeArgument[], eol: string): string => {
    const lineComment = args.some(a => a.leading || a.trailing?.includes('//'));
    if (!/^\s*\n/.test(body) && !lineComment) {
        return args.map(a => [a.leading, a.code].filter(Boolean).join(' ') + (a.trailing ? ` ${a.trailing}` : '')).join(', ');
    }

    const indent = /\n([ \t]*)\S/.exec(body)?.[1] ?? '';
    // a line comment after the last argument would hide the closing bracket on its line
    const closing = /\r?\n[ \t]*$/.exec(body)?.[0] ?? (args[args.length - 1].trailing?.includes('//') ? eol : '');
    const lines = args.map((arg, i) => {
        const leading = arg.leading ? `${indent}${arg.leading.replace(/\r?\n[ \t]*/g, eol + indent)}${eol}` : '';
        const comma = i < args.length - 1 ? ',' : '';
        return `${leading}${indent}${arg.code}${comma}${arg.trailing ? ` ${arg.trailing}` : ''}`;
    });
    return `${eol}${lines.join(eol)}${closing}`;
};

/** Whether the file declares its own variable with the name, shadowing the library one. */
const declaresVariable = (code: string, name: string) =>
    new RegExp(String.raw`^\s*\$${name.replace(/[-]/g, '[-_]')}\s*:`, 'm').test(code);

const migrateSass = (host: Tree, context: SchematicContext, update: UpdateChanges) => {
    let migratedWrappers = false;
    for (const entryPath of update.sassFiles) {
        const original = host.read(entryPath).toString();
        const { namespaces, global } = getThemingNamespaces(maskComments(original));
        if (!global && !namespaces.size) {
            continue;
        }
        const prefixes = [...namespaces].map(ns => `${ns}.`);
        if (global) {
            prefixes.push('');
        }
        const eol = lineEnding(original);
        const lineOf = (offset: number) => original.substring(0, offset).split('\n').length;

        // @include light-theme($palette, ...) -> @include theme($palette: $palette, $schema: $light-material-schema, ...)
        // the stylesheet finds `@include` and the indented `+` includes, leaving those of mixins it declares itself
        const sheet = new SassStylesheet(original, entryPath.endsWith('.sass'));
        const changes: TextChange[] = [];
        for (const [wrapper, { schema, elevations }] of Object.entries(THEME_WRAPPERS)) {
            for (const include of sheet.findIncludes(wrapper, 'exact')) {
                const prefix = include.namespace ? `${include.namespace}.` : '';
                if (!prefixes.includes(prefix) || include.bodyStart === undefined) {
                    continue;
                }
                const body = original.substring(include.bodyStart, include.bodyEnd);
                const args = themeArguments(body);
                if (!args) {
                    context.logger.warn(`${entryPath}:${lineOf(include.start)}: ` +
                        `replace the removed \`${wrapper}\` mixin with the \`theme\` mixin manually.`);
                    continue;
                }

                const paletteIndex = args.findIndex(a => argumentName(a.code) === '$palette');
                args.splice(paletteIndex + 1, 0, { code: `$schema: ${prefix}$${schema}` });
                if (elevations) {
                    args.push({ code: `$elevations: ${prefix}$${elevations}` });
                }
                changes.push({
                    start: include.nameStart,
                    end: include.bodyEnd + 1,
                    text: `theme(${formatThemeArguments(body, args, eol)})`
                });
                migratedWrappers = true;
            }
        }
        const content = applyTextChanges(original, changes);

        // $light-palette -> $light-material-palette
        // strings, comments and URLs are masked, while interpolations, which are code, are kept
        const code = maskNonCode(content, true);
        const paletteChanges: TextChange[] = [];
        for (const [palette, replacement] of Object.entries(PALETTES)) {
            const local = declaresVariable(code, palette);
            const paletteRegex = new RegExp(String.raw`(^|[^\w$.-]|([\w-]+)\.)\$${palette}(?![\w-])`, 'g');
            let match: RegExpExecArray;
            while ((match = paletteRegex.exec(code))) {
                const [text, before, namespace] = match;
                const library = namespace ? namespaces.has(namespace) : global && !local;
                if (library) {
                    const start = match.index + before.length + 1;
                    paletteChanges.push({ start, end: match.index + text.length, text: replacement });
                }
            }
        }
        const migrated = applyTextChanges(content, paletteChanges);

        if (migrated !== original) {
            host.overwrite(entryPath, migrated);
        }
    }

    if (migratedWrappers) {
        context.logger.info('The removed global theme mixins were replaced with the `theme` mixin. ' +
            'Unlike the removed mixins, `theme` uses the gray and surface colors of the palette you pass as they are, so review the results.');
    }
};

//#endregion
