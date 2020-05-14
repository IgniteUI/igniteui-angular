import {
    Rule,
    SchematicContext,
    Tree
} from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '9.1.0';

export default function(): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

        const update = new UpdateChanges(__dirname, host, context);
        update.addValueTransform('rowSelectable_is_deprecated', function(oldValue: string): string {

            switch (oldValue) {
                case 'true':
                    return '\'multiple\'';
                case 'false':
                    return '\'none\'';
                default:
                    return `${oldValue} ? 'multiple' : 'none' `;
            }
        });
        update.applyChanges();
    };
}
