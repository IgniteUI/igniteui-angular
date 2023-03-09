import {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { Options } from '../../schematics/interfaces/options';
import { BoundPropertyObject, InputPropertyType, UpdateChanges } from '../common/UpdateChanges';

const version = '15.1.0';

export default (options: Options): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

    const update = new UpdateChanges(__dirname, host, context);
    update.shouldInvokeLS = options['shouldInvokeLS'];
    update.addValueTransform('roundShape_is_deprecated', (args: BoundPropertyObject): void => {
        args.bindingType = InputPropertyType.STRING;

        switch (args.value) {
            case 'true':
                args.value = 'circle';
                break;
            case 'false':
                args.value = 'square';
                break;
            default:
                args.value += ` ? 'circle' : 'square' `;
        }
    });
    update.applyChanges();
};
