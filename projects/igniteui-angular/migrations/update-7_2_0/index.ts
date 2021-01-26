import {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { UpdateChanges } from '../common/UpdateChanges';
import { addResetCss } from '../../schematics/ng-add/add-normalize';

const version = '7.2.0';

export default (): Rule => (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    // add normalize:
    if (addResetCss(host)) {
        context.addTask(new NodePackageInstallTask());
    }
};
