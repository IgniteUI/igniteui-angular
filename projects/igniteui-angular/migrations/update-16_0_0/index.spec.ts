import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '16.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
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
