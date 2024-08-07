import * as path from 'path';
import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '18.1.4';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
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

    const migrationName = 'migration-40';

    it('should remove hsla and hsl functions', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `.custom-body {
            	color: hsla(var(--ig-primary-A100));
            	background: hsla(var(--ig-gray-100));
            }
                
            .custom-header {
            	color: hsl(var(--ig-secondary-100));
            	background: hsl(var(--ig-gray-900));
            }`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
            `.custom-body {
            	color: var(--ig-primary-A100);
            	background: var(--ig-gray-100);
            }
                
            .custom-header {
            	color: var(--ig-secondary-100);
            	background: var(--ig-gray-900);
            }`
        );
    });
});