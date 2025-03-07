import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '19.2.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-44';

    it('should remove igx-caroursel property `keyboardSupport` in template', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-carousel [keyboardSupport]="true"></igx-carousel>
        <igx-carousel [keyboardSupport]="false"></igx-carousel>
        <igx-carousel [keyboardSupport]="myProp"></igx-carousel>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-carousel></igx-carousel>
        <igx-carousel></igx-carousel>
        <igx-carousel></igx-carousel>
        `
        );
    });
});
