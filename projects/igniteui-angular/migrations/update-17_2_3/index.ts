import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import { BoundPropertyObject, InputPropertyType, UpdateChanges } from "../common/UpdateChanges";

const version = "17.2.3";

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`,
    );
    const update = new UpdateChanges(__dirname, host, context);

    update.addValueTransform('vertical_to_orientation', (args: BoundPropertyObject): void => {
        args.bindingType = InputPropertyType.STRING;

        switch (args.value) {
            case 'true':
                args.value = 'vertical';
                break;
            case 'false':
                args.value = 'horizontal';
                break;
            default:
                args.value += ` ? 'vertical' : 'horizontal' `;
        }
    });

    update.applyChanges();
};
