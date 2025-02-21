import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { BoundPropertyObject, InputPropertyType, UpdateChanges } from '../common/UpdateChanges';

const version = '19.1.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const update = new UpdateChanges(__dirname, host, context);

    update.addValueTransform('fields_to_entities', (args: BoundPropertyObject): void => {
        args.bindingType = InputPropertyType.EVAL;
        args.value = `[{ name: '', fields: ${args.value}}]`;
    });

    // remove igx_query_builder_title from resources
    for (const entryPath of update.tsFiles) {
        let content = host.read(entryPath).toString();
        const regex = new RegExp(String.raw`,?\s*igx_query_builder_title\s*:\s*'[^']*'`, 'g');

        if (regex.test(content)) {
            content = content.replace(regex, '');
            host.overwrite(entryPath, content);
        }
    }

    update.applyChanges();
};
