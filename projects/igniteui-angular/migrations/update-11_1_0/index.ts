import { Element } from '@angular/compiler';
import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';
import { FileChange, findElementNodes, getAttribute, getSourceOffset, hasAttribute, parseFile, serializeNodes } from '../common/util';

const version = '11.1.0';

export default function (): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info(
            `Applying migration for Ignite UI for Angular to version ${version}`
        );

        const update = new UpdateChanges(__dirname, host, context);

        // Remove the input properties
        update.applyChanges();
    };
}
