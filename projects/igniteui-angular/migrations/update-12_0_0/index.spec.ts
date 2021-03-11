import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update to 12.0.0', () => {
    let appTree: UnitTestTree;
    const runner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc'
            }
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix'
            }
        }
    };

    const migrationName = 'migration-20';

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should replace onValueChange and onValueChanged with valueChange and valueChanged in igx-slider', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/slider.component.html`,
            `<igx-slider
            (onValueChange)="someHandler($event)"
            (onValueChanged)="someHandler($event)"
            ></igx-slider>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/slider.component.html')).toEqual(
            `<igx-slider
            (valueChange)="someHandler($event)"
            (valueChanged)="someHandler($event)"
            ></igx-slider>`
        );
    });
});
