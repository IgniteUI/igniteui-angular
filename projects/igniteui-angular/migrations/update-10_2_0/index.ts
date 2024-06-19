import type { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '10.2.0';

export default (): Rule => async (host: Tree, context: SchematicContext) => {
    context.logger.info(
        `Applying migration for Ignite UI for Angular to version ${version}`
    );

    const update = new UpdateChanges(__dirname, host, context);

    update.addCondition('type_is_invalid', (
        matchedOwner: string
    ): boolean => {
        if (!matchedOwner) {
            return true;
        }

        const attrMatch = matchedOwner.match(
            new RegExp(`type=(["'])(.+?)${'\\1'}`)
        );

        if (attrMatch?.length > 0) {
            const attr = attrMatch[0];

            return (
                attr.includes('bootstrap') ||
                attr.includes('fluent') ||
                attr.includes('indigo')
            );
        }

        return true;
    });

    update.applyChanges();
};
