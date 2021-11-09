import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '13.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
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

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    const migrationName = 'migration-22';
    const lineBreaksAndSpaceRegex = /\s/g;

    it('should rename CarouselAnimationType to HorizontalAnimationType', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
        import { CarouselAnimationType } from 'igniteui-angular';

        @Component({
            selector: 'animationType',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class AnimationType {
            public animationType: CarouselAnimationType = CarouselAnimationType.slide;
        }
        `);
        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        const expectedContent = `import { Component, ViewChild } from '@angular/core';
        import { HorizontalAnimationType } from 'igniteui-angular';

        @Component({
            selector: 'animationType',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class AnimationType {
            public animationType: HorizontalAnimationType = HorizontalAnimationType.slide;
        }
        `;

        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/test.component.ts'
            )
        ).toEqual(expectedContent);
    });
});
