import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import { BoundPropertyObject, InputPropertyType, UpdateChanges } from "../common/UpdateChanges";

const version = "18.0.0";

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`,
    );
    const update = new UpdateChanges(__dirname, host, context);

    update.addValueTransform('pivotConfigurationUI_to_pivotUI', (args: BoundPropertyObject): void => {
        args.bindingType = InputPropertyType.EVAL;

        switch (args.value) {
            case 'true':
                args.value = '{ showConfiguration: true }';
                break;
            case 'false':
                args.value = '{ showConfiguration: false }';
                break;
            default:
                args.value = `{ showConfiguration: ${args.value} }`;
        }
    });

    update.applyChanges();
};
