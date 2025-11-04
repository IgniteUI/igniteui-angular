import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 6.0.1', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
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
            `;` +
            `import { IgxGridModule, IgxGridAPIService } from 'igniteui-angular/grid';`
        );
        const tree = await schematicRunner.runSchematic('migration-02', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts')).toEqual(
            `import { IgxGridComponent } from 'igniteui-angular/grids';;` +
            `import { IgxCsvExporterService } from 'igniteui-angular/core';;` +
            `import { IgxButtonDirective } from 'igniteui-angular/directives';;`
        );
        expect(tree.readContent('/testSrc/appPrefix/app.module.ts')).toEqual(
            `;` +
            `import { IgxGridModule, IgxGridAPIService } from 'igniteui-angular/grids';;`
        );
    });
});
