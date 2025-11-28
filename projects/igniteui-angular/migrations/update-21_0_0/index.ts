import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '21.0.0';

export default function migrate(): Rule {
    return async (host: Tree, context: SchematicContext) => {
        context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

        const update = new UpdateChanges(__dirname, host, context);

        context.logger.info('The library now supports granular entry points for better tree-shaking.');
        context.logger.info('You can continue using the main entry point (igniteui-angular), or');
        context.logger.info('migrate to granular entry points by running:');
        context.logger.info('  ng update igniteui-angular --migrate-only --from=20.1.0 --to=21.0.0 --name=migration-51');

        update.applyChanges();
    };
}
