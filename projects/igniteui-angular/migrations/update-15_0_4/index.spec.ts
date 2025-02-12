import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { ProjectType } from '../../schematics/utils/util';
import { setupTestTree } from '../common/setup.spec';

const version = '15.0.4';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
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
        appTree = setupTestTree(configJson);
    });

    const migrationName = 'migration-27';

    it(`should add igniteui-theming to pacakage json and configure it`, async () => {
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(JSON.parse(JSON.stringify(tree.readContent('angular.json')))).toContain("stylePreprocessorOptions");
    });

    it(`should not add igniteui-theming to library pacakage json and configure it`, async () => {
        appTree.overwrite('/angular.json', JSON.stringify(configJsonLib));
        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(JSON.parse(JSON.stringify(tree.readContent('angular.json')))).not.toContain("stylePreprocessorOptions");
    });
});
