import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '16.0.0';

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

    const migrationName = 'migration-30';

    it('Should replace IgxProcessBarTextTemplateDirective with IgxProgressBarTextTemplateDirective', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
        import { IgxProcessBarTextTemplateDirective } from 'igniteui-angular';

        @Component({
            selector: 'test-component',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class TestComponent {
            toolbar: IgxGridToolbarComponent;
            @ViewChild(IgxProcessBarTextTemplateDirective)
            public title: IgxProcessBarTextTemplateDirective;
        }
        `);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        const expectedContent = `import { Component, ViewChild } from '@angular/core';
        import { IgxProgressBarTextTemplateDirective } from 'igniteui-angular';

        @Component({
            selector: 'test-component',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class TestComponent {
            toolbar: IgxGridToolbarComponent;
            @ViewChild(IgxProgressBarTextTemplateDirective)
            public title: IgxProgressBarTextTemplateDirective;
        }
        `;
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts')).toEqual(expectedContent);
    });
});
