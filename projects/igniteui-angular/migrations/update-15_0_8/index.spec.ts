import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '15.0.8';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
    });

    const migrationName = 'migration-28';

    it('should rename the $size property to the $scrollbar-size', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$custom-scrollbar: scrollbar-theme(
                $size: 10px,
            );`
        );

        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$custom-scrollbar: scrollbar-theme(
                $scrollbar-size: 10px
            );`
        );
    });
});
