import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '18.1.3';

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
                            styles: [
                                "/testSrc/styles.scss"
                            ] as (string | object)[]
                        }
                    }
                }
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
        appTree.create('/testSrc/styles.scss', `
@use "mockStyles.scss";
@forward something;
`);
    });

    const migrationName = 'migration-40';

    it('should migrate scrollbar theme', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$my-scrollbar: scrollbar-theme(
                $scrollbar-size: 16px,
                $thumb-background: blue,
                $track-background: black,
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$my-scrollbar: scrollbar-theme(
                $sb-size: 16px,
                $sb-thumb-bg-color: blue,
                $sb-track-bg-color: black,
            );`
        );
    });
});
