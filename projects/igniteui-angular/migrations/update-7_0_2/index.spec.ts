import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 7.0.2', () => {
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

    it('should remove .forRoot() from imports', done => {
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

        const tree = schematicRunner.runSchematic('migration-07', {}, appTree);
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

        done();
    });
});
