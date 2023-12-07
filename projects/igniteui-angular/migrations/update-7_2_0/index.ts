import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { NodePackageInstallTask } from '@angular-devkit/schematics/tasks';
import { UpdateChanges } from '../common/UpdateChanges';
import { addResetCss } from '../../schematics/ng-add/add-normalize';
import { createHost } from '../../schematics/utils/util';
import { workspaces } from '@angular-devkit/core';

const version = '7.2.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    // add normalize:
    const workspaceHost = createHost(host);
    const { workspace } = await workspaces.readWorkspace(host.root.path, workspaceHost);
    if (addResetCss(workspace, host)) {
        context.addTask(new NodePackageInstallTask());
    }

    await workspaces.writeWorkspace(workspace, workspaceHost);
};
