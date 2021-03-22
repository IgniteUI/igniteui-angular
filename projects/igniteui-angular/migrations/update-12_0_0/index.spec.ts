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

    it('should update avatar theme args', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`
$theme: igx-avatar-theme(
    $initials-background: white,
    $icon-background: green,
    $image-background: red,
    $initials-color: black,
    $icon-color: gold,
    $border-radius-round: 14px,
    $border-radius-square: 12px
);
`
        );

        const tree = await runner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`
$theme: igx-avatar-theme(
    $background: white,
    $color: black,
    $border-radius: 14px
);
`
        );
    });
});
