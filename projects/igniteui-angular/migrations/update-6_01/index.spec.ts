import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 6.0.1', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
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

    it('should update submodule imports', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { IgxGridComponent } from 'igniteui-angular/main';` +
            `import { IgxCsvExporterService } from 'igniteui-angular/services/csv/csv-exporter';` +
            `import { IgxButtonDirective } from   'igniteui-angular/directives/button/button.directive';`
        );
        appTree.create(
            '/testSrc/appPrefix/app.module.ts',
            `import { } from 'igniteui-angular';` +
            `import { IgxGridModule, IgxGridAPIService } from 'igniteui-angular/grid';`
        );
        const tree = await schematicRunner.runSchematicAsync('migration-02', {}, appTree)
            .toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts')).toEqual(
            `import { IgxGridComponent } from 'igniteui-angular';` +
            `import { IgxCsvExporterService } from 'igniteui-angular';` +
            `import { IgxButtonDirective } from   'igniteui-angular';`
        );
        expect(tree.readContent('/testSrc/appPrefix/app.module.ts')).toEqual(
            `import { } from 'igniteui-angular';` +
            `import { IgxGridModule, IgxGridAPIService } from 'igniteui-angular';`
        );
    });
});
