import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '18.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    const configJson = {
        projects: {
            testProj: {
                root: '/',
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    const migrationName = 'migration-38';

    it('should replace PivotGrid property `showPivotConfigurationUI` with `pivotUI`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-pivot-grid [showPivotConfigurationUI]="false"></igx-pivot-grid>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-pivot-grid [pivotUI]="{ showConfiguration: false }"></igx-pivot-grid>
        `
        );
    });

    it('should replace PivotGrid property `showPivotConfigurationUI` with `pivotUI`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-pivot-grid [showPivotConfigurationUI]="testProp"></igx-pivot-grid>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-pivot-grid [pivotUI]="{ showConfiguration: testProp }"></igx-pivot-grid>
        `
        );
    });
});
