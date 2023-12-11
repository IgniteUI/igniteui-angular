import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { getIdentifierPositions } from '../common/tsUtils';

const version = '10.1.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();

    // replace DropPosition.None with DropPosition.AfterDropTarget
    for (const entryPath of update.tsFiles) {
        let content = host.read(entryPath).toString();
        if (content.indexOf('DropPosition.None') !== -1) {
            const pos = getIdentifierPositions(content, 'DropPosition');
            for (let i = pos.length; i--;) {
                const end = pos[i].end + 5;
                const isMatch = content.slice(pos[i].start, end) === 'DropPosition.None';
                if (isMatch) {
                    content = content.slice(0, pos[i].start) + 'DropPosition.AfterDropTarget' + content.slice(end);
                }
            }
            host.overwrite(entryPath, content);
        }
    }
};
