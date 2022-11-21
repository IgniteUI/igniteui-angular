import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 7.0.2', () => {
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

        const tree = await schematicRunner.runSchematicAsync('migration-07', {}, appTree)
            .toPromise();
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
