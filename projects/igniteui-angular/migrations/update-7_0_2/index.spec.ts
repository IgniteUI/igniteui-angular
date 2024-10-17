import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 7.0.2', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should remove .forRoot() from imports', async () => {
        appTree.create(
            '/testSrc/appPrefix/module/test.module.ts',
            `@NgModule({
                declarations: components,
                imports: [
                    IgxIconModule.forRoot(),
                    IgxGridModule.forRoot(),
                    IgxTreeGridModule,
                    module1
                ],
                providers: [
                    LocalService,
                ],
                bootstrap: [AppComponent]
            })
            export class AppModule { }`);

        const tree = await schematicRunner.runSchematic('migration-07', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/module/test.module.ts'))
            .toEqual(
            `@NgModule({
                declarations: components,
                imports: [
                    IgxIconModule,
                    IgxGridModule.forRoot(),
                    IgxTreeGridModule,
                    module1
                ],
                providers: [
                    LocalService,
                ],
                bootstrap: [AppComponent]
            })
            export class AppModule { }`);
    });
});
