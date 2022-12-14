import {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { workspaces } from '@angular-devkit/core';
import { UpdateChanges } from '../common/UpdateChanges';
import { includeStylePreprocessorOptions } from '../../schematics/utils/dependency-handler';
import { createHost } from '../../schematics/utils/util';

const version = '15.0.4';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const update = new UpdateChanges(__dirname, host, context);

    const workspaceHost = createHost(host);
    const { workspace } = await workspaces.readWorkspace(host.root.path, workspaceHost);
    await includeStylePreprocessorOptions(workspaceHost, workspace, context, host);

    update.applyChanges();
};
