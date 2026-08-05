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

function migrateImportDeclaration(node: ts.ImportDeclaration, sourceFile: ts.SourceFile): { start: number, end: number, replacement: string } | null {
    if (!igNamedImportFilter(node)) {
        return null;
    }

    const importPath = node.moduleSpecifier.text;
    const namedBindings = node.importClause.namedBindings;

    // Only process imports coming from a known source entry point for this migration
    const source = resolveEntryPoint(importPath);
    if (!source || !SOURCE_ENTRY_POINTS.includes(source.entry)) {
        return null;
    }

    // Group moved imports by target entry point; keep everything else where it is
    const entryPointGroups = new Map<string, string[]>();
    const remaining: string[] = [];

    for (const element of namedBindings.elements) {
        const name = element.name.text;
        const alias = element.propertyName?.text;
        const importName = alias || name;

        const fullImport = alias ? `${importName} as ${name}` : importName;

        // Check if this import moved out of the current source entry point
        const move = EXPORT_MOVES.get(importName);
        if (move && move.from === source.entry) {
            if (!entryPointGroups.has(move.to)) {
                entryPointGroups.set(move.to, []);
            }
            entryPointGroups.get(move.to)!.push(fullImport);
        } else {
            // Keep in the original entry point
            remaining.push(fullImport);
        }
    }

    // If nothing changed, return null
    if (entryPointGroups.size === 0) {
        return null;
    }

    // Generate new import statements
    const newImports: string[] = [];

    // Add remaining imports for the original entry point first
    if (remaining.length > 0) {
        const sortedImports = remaining.sort();
        newImports.push(`import { ${sortedImports.join(', ')} } from '${importPath}';`);
    }

    // Add moved imports
    for (const [entryPoint, imports] of entryPointGroups) {
        const sortedImports = imports.sort();
        newImports.push(`import { ${sortedImports.join(', ')} } from '${source.basePackage}/${entryPoint}';`);
    }

    return {
        start: node.getStart(sourceFile),
        end: node.getEnd(),
        replacement: newImports.join('\n')
    };
}

function migrateFile(filePath: string, content: string): string {
    const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
    );

    const changes: { start: number, end: number, replacement: string }[] = [];

    function visit(node: ts.Node) {
        if (ts.isImportDeclaration(node)) {
            const change = migrateImportDeclaration(node, sourceFile);
            if (change) {
                changes.push(change);
            }
        }

        ts.forEachChild(node, visit);
    }

    visit(sourceFile);

    // Apply changes in reverse order to maintain positions
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
