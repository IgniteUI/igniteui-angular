import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { normalize } from '@angular-devkit/core';
import {
    chain,
    Rule,
    SchematicContext,
    SchematicsException,
    Tree
} from '@angular-devkit/schematics';
import { filterSourceDirs } from '../common/filterSourceDirs';
import { getImportModulePositions } from '../common/tsUtils';
import { UpdateChanges } from '../common/UpdateChanges';

const version = '6.2.0';

export default function(): Rule {
    return (host: Tree, context: SchematicContext) => {
        context.logger.info(`Applying migration for Ignite UI for Angular to version ${version}`);

        const update = new UpdateChanges(__dirname, host, context);
        update.addCondition("igxIcon_is_material_name", function(matchedOwner: string): boolean {
            if (!matchedOwner) {
                return true;
            }

            const fontSetMatches = matchedOwner.match(new RegExp(`fontSet=(["'])(.+?)${'\\1'}`));
            if (fontSetMatches && fontSetMatches.length > 0) {
                const fontSet = fontSetMatches[fontSetMatches.length-1];
                return fontSet === 'material' || fontSet === 'material-icons';
            }

            return true;
        });
        update.applyChanges();
    };
}
