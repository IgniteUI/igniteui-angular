import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 10.1.0', () => {
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

    it('should upgrade the igx-action-icon to igx-navbar-action', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html',
            `<igx-navbar title="Test title">
            <igx-action-icon>
            <igx-icon>arrow_back</igx-icon>
            </igx-action-icon>
            </igx-navbar>`);
        const tree = await schematicRunner.runSchematicAsync('migration-16', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(
            `<igx-navbar title="Test title">
            <igx-navbar-action>
            <igx-icon>arrow_back</igx-icon>
            </igx-navbar-action>
            </igx-navbar>`);
    });

    it('should update IgxActionIconDirective to IgxNavbarActionDirective', async () => {
        appTree.create('/testSrc/appPrefix/component/custom.component.ts',
            `import { IgxActionIconDirective } from 'igniteui-angular';
            export class TestNavbar {
            @ViewChild(IgxActionIconDirective, { read: IgxActionIconDirective })
            private actionIcon: IgxActionIconDirective; }`);

        const tree = await schematicRunner.runSchematicAsync('migration-16', {}, appTree).toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.ts'))
            .toEqual(
                `import { IgxNavbarActionDirective } from 'igniteui-angular';
            export class TestNavbar {
            @ViewChild(IgxNavbarActionDirective, { read: IgxNavbarActionDirective })
            private actionIcon: IgxNavbarActionDirective; }`);
    });

});
