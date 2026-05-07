import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '21.2.2';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`,
    );
    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    for (const entryPath of update.sassFiles) {
        let content = host.read(entryPath).toString();
        let migrated = content;

        // grid-theme: --ig-grid-filtering-dialog-background → --ig-query-builder-background
        migrated = migrated.replace(/--ig-grid-filtering-dialog-background\b/g, '--ig-query-builder-background');

        // column-actions-theme CSS variable rename
        migrated = migrated.replace(/--ig-column-actions-background-color\b/g, '--ig-column-actions-background');

        // grid-toolbar-theme CSS variable rename
        migrated = migrated.replace(/--ig-grid-toolbar-background-color\b/g, '--ig-grid-toolbar-background');

        // paginator-theme CSS variable renames
        migrated = migrated.replace(/--ig-paginator-text-color\b/g, '--ig-paginator-foreground');
        migrated = migrated.replace(/--ig-paginator-background-color\b/g, '--ig-paginator-background');

        if (migrated !== content) {
            host.overwrite(entryPath, migrated);
            context.logger.info(`  ✓ Migrated ${entryPath}`);
        }
    }
};
