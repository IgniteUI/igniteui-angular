import type {
    FileVisitor,
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import * as ts from 'typescript';
import { IG_PACKAGE_NAME, IG_LICENSED_PACKAGE_NAME, igNamedImportFilter } from '../common/tsUtils';

const version = '22.1.0';

// Exports that moved to a different entry point in 22.1.0.
// Keyed by exported symbol -> { from: source entry point, to: target entry point }.
const EXPORT_MOVES = new Map<string, { from: string; to: string }>([
    // IgxSummaryOperand definitions moved from grids/core to core
    ['IgxSummaryOperand', { from: 'grids/core', to: 'core' }],
    ['IgxNumberSummaryOperand', { from: 'grids/core', to: 'core' }],
    ['IgxDateSummaryOperand', { from: 'grids/core', to: 'core' }],
    ['IgxTimeSummaryOperand', { from: 'grids/core', to: 'core' }],
    // Selection/transaction types moved from grids/core to core
    ['GridSelectionRange', { from: 'grids/core', to: 'core' }],
    ['ISelectionNode', { from: 'grids/core', to: 'core' }],
    ['IMultiRowLayoutNode', { from: 'grids/core', to: 'core' }],
    ['ISelectionKeyboardState', { from: 'grids/core', to: 'core' }],
    ['ISelectionPointerState', { from: 'grids/core', to: 'core' }],
    ['IColumnSelectionState', { from: 'grids/core', to: 'core' }],
    ['SelectionState', { from: 'grids/core', to: 'core' }],
    ['IgxGridTransaction', { from: 'grids/core', to: 'core' }],
    // IGroupingDoneEventArgs moved from grids/grid to grids/core
    ['IGroupingDoneEventArgs', { from: 'grids/grid', to: 'grids/core' }]
]);

// Distinct source entry points we need to inspect, e.g. 'grids/core', 'grids/grid'.
const SOURCE_ENTRY_POINTS = [...new Set([...EXPORT_MOVES.values()].map(m => m.from))];

/**
 * Resolves an import module specifier to its base package and entry point,
 * e.g. `igniteui-angular/grids/core` -> { basePackage: 'igniteui-angular', entry: 'grids/core' }.
 * Returns null for specifiers that are not an Ignite UI entry point.
 */
function resolveEntryPoint(importPath: string): { basePackage: string; entry: string } | null {
    for (const basePackage of [IG_PACKAGE_NAME, IG_LICENSED_PACKAGE_NAME]) {
        if (importPath.startsWith(`${basePackage}/`)) {
            return { basePackage, entry: importPath.substring(basePackage.length + 1) };
        }
    }
    return null;
}

interface ImportSpecifierInfo {
    /** Imported symbol name, used for sorting and move lookup. */
    key: string;
    /** Rendered specifier text, including any inline `type` modifier and alias. */
    text: string;
}

interface IgImportInfo {
    node: ts.ImportDeclaration;
    basePackage: string;
    entry: string;
    isTypeOnly: boolean;
    specifiers: ImportSpecifierInfo[];
}

/** Sorts specifiers alphabetically by their imported symbol name. */
const sortByName = (a: ImportSpecifierInfo, b: ImportSpecifierInfo) =>
    a.key < b.key ? -1 : a.key > b.key ? 1 : 0;

/** Collects Ignite UI named imports from the file, in source order. */
function collectIgImports(sourceFile: ts.SourceFile): IgImportInfo[] {
    const imports: IgImportInfo[] = [];

    const visit = (node: ts.Node) => {
        if (ts.isImportDeclaration(node) && igNamedImportFilter(node)) {
            const resolved = resolveEntryPoint((node.moduleSpecifier as ts.StringLiteral).text);
            if (resolved) {
                const namedBindings = node.importClause.namedBindings as ts.NamedImports;
                const specifiers = namedBindings.elements.map(element => {
                    const name = element.name.text;
                    const alias = element.propertyName?.text;
                    const importName = alias || name;
                    const typePrefix = element.isTypeOnly ? 'type ' : '';
                    const specifier = alias ? `${importName} as ${name}` : importName;
                    return { key: importName, text: `${typePrefix}${specifier}` };
                });
                imports.push({
                    node,
                    basePackage: resolved.basePackage,
                    entry: resolved.entry,
                    isTypeOnly: node.importClause.phaseModifier === ts.SyntaxKind.TypeKeyword,
                    specifiers
                });
            }
        }
        ts.forEachChild(node, visit);
    };

    visit(sourceFile);
    return imports;
}

function migrateFile(filePath: string, content: string): string {
    const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
    );

    const imports = collectIgImports(sourceFile);

    // The full module path a specifier ends up in, or null if it stays where it is.
    const movedTo = (imp: IgImportInfo, spec: ImportSpecifierInfo): string | null => {
        const move = EXPORT_MOVES.get(spec.key);
        return move && move.from === imp.entry ? `${imp.basePackage}/${move.to}` : null;
    };

    // A stable key per output import: its `type` modifier plus module path.
    const importKey = (path: string, isTypeOnly: boolean) => `${isTypeOnly ? 'type ' : ''}${path}`;

    // Imports (module path + type modifier) that gain a moved specifier.
    const mergeTargets = new Set<string>();
    for (const imp of imports) {
        for (const spec of imp.specifiers) {
            const to = movedTo(imp, spec);
            if (to) {
                mergeTargets.add(importKey(to, imp.isTypeOnly));
            }
        }
    }

    // Nothing moves in this file.
    if (mergeTargets.size === 0) {
        return content;
    }

    // Rewrite imports that lose a specifier (sources) or receive one (merge targets).
    const participating = imports.filter(imp =>
        imp.specifiers.some(spec => movedTo(imp, spec)) ||
        mergeTargets.has(importKey(`${imp.basePackage}/${imp.entry}`, imp.isTypeOnly))
    );

    // Collect the surviving specifiers per output import, retained ones before moved ones.
    const groups = new Map<string, { path: string; isTypeOnly: boolean; specifiers: ImportSpecifierInfo[] }>();
    const add = (path: string, isTypeOnly: boolean, spec: ImportSpecifierInfo) => {
        const key = importKey(path, isTypeOnly);
        (groups.get(key) ?? groups.set(key, { path, isTypeOnly, specifiers: [] }).get(key)!).specifiers.push(spec);
    };

    for (const imp of participating) {
        const from = `${imp.basePackage}/${imp.entry}`;
        for (const spec of imp.specifiers) {
            if (!movedTo(imp, spec)) {
                add(from, imp.isTypeOnly, spec);
            }
        }
        for (const spec of imp.specifiers) {
            const to = movedTo(imp, spec);
            if (to) {
                add(to, imp.isTypeOnly, spec);
            }
        }
    }

    const newImports = [...groups.values()].map(group => {
        const typeModifier = group.isTypeOnly ? 'type ' : '';
        const specifiers = group.specifiers.sort(sortByName).map(s => s.text).join(', ');
        return `import ${typeModifier}{ ${specifiers} } from '${group.path}';`;
    });

    // Replace the first participating declaration with the merged imports; drop the rest.
    const anchor = participating[0];
    const changes: { start: number, end: number, replacement: string }[] = [
        { start: anchor.node.getStart(sourceFile), end: anchor.node.getEnd(), replacement: newImports.join('\n') },
        ...participating.slice(1).map(imp => ({
            start: imp.node.getFullStart(),
            end: imp.node.getEnd(),
            replacement: ''
        }))
    ];

    // Apply changes in reverse order to maintain positions.
    changes.sort((a, b) => b.start - a.start);

    let result = content;
    for (const change of changes) {
        result = result.substring(0, change.start) + change.replacement + result.substring(change.end);
    }

    return result;
}

/** Fast-path check: does the file import from any of the source entry points we migrate? */
function hasRelevantImport(content: string): boolean {
    return SOURCE_ENTRY_POINTS.some(entry =>
        [IG_PACKAGE_NAME, IG_LICENSED_PACKAGE_NAME].some(basePackage =>
            content.includes(`from '${basePackage}/${entry}'`) ||
            content.includes(`from "${basePackage}/${entry}"`)
        )
    );
}

export default function migrate(): Rule {
    return async (host: Tree, context: SchematicContext) => {
        context.logger.info(`Applying optional import migration for Ignite UI for Angular to version ${version}`);
        context.logger.info('Migrating imports to new entry points...');

        const visit: FileVisitor = (filePath) => {
            // Only process TypeScript files
            if (!filePath.endsWith('.ts')) {
                return;
            }

            // Skip node_modules and dist
            if (filePath.includes('node_modules') || filePath.includes('dist')) {
                return;
            }

            const content = host.read(filePath);
            if (!content) {
                return;
            }

            const originalContent = content.toString();

            // Check if file imports from any migrated source entry point
            if (!hasRelevantImport(originalContent)) {
                return;
            }

            const migratedContent = migrateFile(filePath, originalContent);

            if (migratedContent !== originalContent) {
                host.overwrite(filePath, migratedContent);
                context.logger.info(`  ✓ Migrated ${filePath}`);
            }
        };

        host.visit(visit);

        context.logger.info('Migration complete!');
        context.logger.info('Breaking changes:');
        for (const [symbol, move] of EXPORT_MOVES) {
            context.logger.info(`  - ${symbol} moved from ${IG_PACKAGE_NAME}/${move.from} to ${IG_PACKAGE_NAME}/${move.to}`);
        }
    };
}
