import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '21.1.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version} - CSS custom properties migration`);

    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    for (const entryPath of update.sassFiles) {
        let content = host.read(entryPath).toString();

        if (content.includes('--igx-')) {
            content = content.replace(/--igx-/g, '--ig-');
            host.overwrite(entryPath, content);
        }
    }
};
