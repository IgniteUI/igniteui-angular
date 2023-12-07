import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { getImportModulePositions } from '../common/tsUtils';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '6.0.1';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    // update.applyChanges();

    // rename submodule imports
    for (const entryPath of update.tsFiles) {
        let content = host.read(entryPath).toString();
        if (content.indexOf('igniteui-angular/') !== -1) {
            const pos = getImportModulePositions(content, 'igniteui-angular/');
            for (let i = pos.length; i--;) {
                content = content.slice(0, pos[i].start) + 'igniteui-angular' + content.slice(pos[i].end);
            }
            host.overwrite(entryPath, content);
        }
    }
};
