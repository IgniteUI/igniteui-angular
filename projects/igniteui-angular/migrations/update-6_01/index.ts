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

export default function(): Rule {
    return (host: Tree, context: SchematicContext) => {

        context.logger.info('Applying migration for Ignite UI for Angular to version 6.0.1');
        return chain([
            filterSourceDirs(host, context),
            // tslint:disable-next-line:no-shadowed-variable
            (host: Tree, context: SchematicContext) => {
                const update = new UpdateChanges(__dirname, host, context);
                // update.applyChanges();

                // rename submodule imports
                for (const entry of update.tsFiles) {
                    let content = entry.content.toString();
                    if (content.indexOf('igniteui-angular/') !== -1) {
                        const pos = getImportModulePositions(content, 'igniteui-angular/');
                        for (let i = pos.length; i--;) {
                            content = content.slice(0, pos[i].start) + 'igniteui-angular' + content.slice(pos[i].end);
                        }
                        host.overwrite(entry.path, content);
                    }
                }
            }
        ])(host, context);

    };
}
