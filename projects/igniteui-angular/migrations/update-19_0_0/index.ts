import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { BoundPropertyObject, InputPropertyType, UpdateChanges } from '../common/UpdateChanges';

const version = '19.0.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);
    const update = new UpdateChanges(__dirname, host, context);

    update.addValueTransform('rename_indicators_orientation', (args: BoundPropertyObject): void => {
        if (args.bindingType === InputPropertyType.EVAL) {
            args.value = args.value === '\'top\'' ? '\'start\'' : '\'end\'';
        } else {
            args.value = args.value === 'top' ? 'start' : 'end';
        }
    });

    update.applyChanges();
};
