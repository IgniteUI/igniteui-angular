import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '19.1.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();
};
