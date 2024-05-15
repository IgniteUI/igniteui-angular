import { Rule, SchematicContext, Tree } from "@angular-devkit/schematics";
import { BoundPropertyObject, InputPropertyType, UpdateChanges } from "../common/UpdateChanges";

const version = "17.2.2";

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`,
    );
    const update = new UpdateChanges(__dirname, host, context);
    update.applyChanges();
};
