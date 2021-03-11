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

    it('should replace onProgressChanged with progressChanged in igx-linear-bar', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/linear.component.html`,
            `<igx-linear-bar [value]="currentValue" (onProgressChanged)="progressChange($event)"></igx-linear-bar>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/linear.component.html')).toEqual(
            `<igx-linear-bar [value]="currentValue" (progressChanged)="progressChange($event)"></igx-linear-bar>`
        );
    });

    it('should replace onProgressChanged with progressChanged in igx-circular-bar', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/circular.component.html`,
            `<igx-circular-bar [value]="currentValue" (onProgressChanged)="progressChange($event)"></igx-circular-bar>`
        );

        const tree = await runner.runSchematicAsync(migrationName, {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/circular.component.html')).toEqual(
            `<igx-circular-bar [value]="currentValue" (progressChanged)="progressChange($event)"></igx-circular-bar>`
        );
    });
});
