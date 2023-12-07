import type {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges, InputPropertyType, BoundPropertyObject } from '../common/UpdateChanges';

const version = '9.1.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    update.addValueTransform('rowSelectable_is_deprecated', (args: BoundPropertyObject): void => {
        if (args.bindingType === InputPropertyType.EVAL) {
            switch (args.value) {
                case 'true':
                    args.value = 'multiple';
                    args.bindingType = InputPropertyType.STRING;
                    break;
                case 'false':
                    args.value = 'none';
                    args.bindingType = InputPropertyType.STRING;
                    break;
                default:
                    args.value += ` ? 'multiple' : 'none' `;
            }
        } else {
            args.value = 'multiple';
        }
    });
    update.applyChanges();
};
