import type {
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
    update.applyChanges();

    const workspaceHost = createHost(host);
    const { workspace } = await workspaces.readWorkspace(host.root.path, workspaceHost);
    await includeStylePreprocessorOptions(workspaceHost, workspace, context, host);
    await workspaces.writeWorkspace(workspace, workspaceHost);

    // replace CSS custom properties prefix from --igx to --ig and grays to gray
    const CUSTOM_CSS_PROPERTIES = [
        '--igx-primary-',
        '--igx-secondary-',
        '--igx-grays-',
        '--igx-surface-',
        '--igx-info-',
        '--igx-success-',
        '--igx-warn-',
        '--igx-error-',
        '--igx-radius-factor',
        '--igx-elevation',
        '--igx-font-family',
        '--igx-h(\\d)-',
        '--igx-subtitle-(\\d)-',
        '--igx-body-(\\d)-',
        '--igx-button-',
        '--igx-caption-',
        '--igx-overline-'
    ];
    for (const entryPath of update.sassFiles) {
        let content = host.read(entryPath).toString();
        CUSTOM_CSS_PROPERTIES.forEach(cssProperty => {
            const regex = new RegExp(cssProperty, 'g');
            if (regex.test(content)) {
                let newCssProperty = cssProperty.replace(/igx/g, 'ig');
                newCssProperty = newCssProperty.replace(/grays/g, 'gray');
                newCssProperty = newCssProperty.replace('(\\d)', '$1');
                content = content.replace(regex, newCssProperty);
                host.overwrite(entryPath, content);
            }
        });
    }
};
