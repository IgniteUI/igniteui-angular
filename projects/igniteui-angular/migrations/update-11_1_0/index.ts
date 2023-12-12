import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import type { Options } from '../../schematics/interfaces/options';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '11.1.0';

export default (options: Options): Rule =>
    async (host: Tree, context: SchematicContext) => {
        context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

        const update = new UpdateChanges(__dirname, host, context);
        update.shouldInvokeLS = options['shouldInvokeLS']
        update.applyChanges();
    };
