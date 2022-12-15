import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '15.0.4';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                root: '/',
                sourceRoot: '/testSrc',
                architect: {
                    build: {
                      options: {
                      }
                    }
                }
            }
        },
        version: 1
    };
    const configJson_15 = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                root: '/',
                sourceRoot: '/testSrc',
                architect: {
                    build: {
                        options: {
                            stylePreprocessorOptions: {
                                includePaths: ["node_modules"]
                            }
                        }
                    }
                }
            }
        },
        version: 1
    };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    const migrationName = 'migration-27';

    it(`should add igniteui-theming to pacakage json and configure it`, async () => {
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(JSON.parse(JSON.stringify(tree.readContent('angular.json')))).toEqual(JSON.stringify(configJson_15));
    });
});
