import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { ProjectType } from '../../schematics/utils/util';

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
    const configJsonLib = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                root: '/',
                sourceRoot: '/testSrc',
                prefix: 'lib',
                projectType: ProjectType.Library,
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

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
    });

    const migrationName = 'migration-28';

    it(`should add igniteui-theming to pacakage json and configure it`, async () => {
        appTree.create('/angular.json', JSON.stringify(configJson));
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(JSON.parse(JSON.stringify(tree.readContent('angular.json')))).toContain("stylePreprocessorOptions");
    });

    it(`should not add igniteui-theming to library pacakage json and configure it`, async () => {
        appTree.create('/angular.json', JSON.stringify(configJsonLib));
        const tree = await schematicRunner.runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(JSON.parse(JSON.stringify(tree.readContent('angular.json')))).not.toContain("stylePreprocessorOptions");
    });
});
