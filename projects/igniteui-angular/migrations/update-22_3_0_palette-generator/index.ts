import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '22.3.0';

/**
 * Ignite UI Theming 30 builds palettes with the `fitted` generator by default. Existing
 * `palette()` calls are pinned to the `legacy` generator, so they keep producing the colors, and
 * the runtime behavior, they had before the update.
 */
export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();
};
