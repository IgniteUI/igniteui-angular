import type {
    FileVisitor,
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '22.2.0';

/**
 * Summary cells now take their border width from the grid itself, so the `grid-summary-theme`
 * width properties are gone. A value set through one of the removed CSS custom properties is
 * moved to the grid property that now drives it - the grid-summary border styles and colors
 * are unaffected.
 */
const cssPropRenames = new Map<string, string>([
    ['grid-summary-border-width', 'grid-header-border-width'],
    ['grid-summary-pinned-border-width', 'grid-pinned-border-width']
]);

const renameCssProps = (content: string): string => {
    let result = content;
    for (const [name, replacement] of cssPropRenames) {
        result = result.replace(
            new RegExp(String.raw`--(igx?)-${name}\b`, 'g'),
            (_match, prefix: string) => `--${prefix}-${replacement}`
        );
    }
    return result;
};

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    const migrated: string[] = [];
    const visit: FileVisitor = (filePath) => {
        if (!/\.(scss|sass|css)$/.test(filePath) || filePath.includes('node_modules') || filePath.includes('dist')) {
            return;
        }

        const content = host.read(filePath)?.toString();
        if (!content || !content.includes('-grid-summary-')) {
            return;
        }

        const result = renameCssProps(content);
        if (result !== content) {
            host.overwrite(filePath, result);
            migrated.push(filePath);
        }
    };

    host.visit(visit);

    if (migrated.length) {
        context.logger.info(
            'The grid-summary border width is no longer themable on its own - a summary border always has ' +
            'the width of the grid column border it continues. The following files had their custom ' +
            'properties renamed to the grid properties that now drive them, which also affects the ' +
            'grid\'s own borders:'
        );
        for (const [name, replacement] of cssPropRenames) {
            context.logger.info(`  - --ig-${name} -> --ig-${replacement}`);
        }
        for (const filePath of migrated) {
            context.logger.info(`  ✓ Migrated ${filePath}`);
        }
    }
};
