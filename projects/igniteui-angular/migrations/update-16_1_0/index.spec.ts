import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '16.1.0';

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

    const migrationName = 'migration-31';

    it('Should replace IgxStepSubTitleDirective with IgxStepSubtitleDirective', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
        import { IgxStepSubTitleDirective } from 'igniteui-angular';

        @Component({
            selector: 'test-component',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class TestComponent {
            stepper: IgxStepperComponent;
            @ViewChild(IgxStepSubTitleDirective)
            public title: IgxStepSubTitleDirective;
        }
        `);
        const tree = await schematicRunner.runSchematicAsync(migrationName, { shouldInvokeLS: false }, appTree).toPromise();

        const expectedContent = `import { Component, ViewChild } from '@angular/core';
        import { IgxStepSubtitleDirective } from 'igniteui-angular';

        @Component({
            selector: 'test-component',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class TestComponent {
            stepper: IgxStepperComponent;
            @ViewChild(IgxStepSubtitleDirective)
            public title: IgxStepSubtitleDirective;
        }
        `;
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts')).toEqual(expectedContent);
    });

    it('should update IgxStepSubTitle selectors', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-stepper>
                <igx-step>
                   <p igxStepTitle>Home</p>
                   <p igxStepSubTitle>Home Sub Title</p>                   
                </igx-step>
            </igx-stepper>`);

        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
            `<igx-stepper>
                <igx-step>
                   <p igxStepTitle>Home</p>
                   <p igxStepSubtitle>Home Sub Title</p>                   
                </igx-step>
            </igx-stepper>`);

    });
});
