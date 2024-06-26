import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '18.1.0';

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

    const migrationName = 'migration-39';

    it('should migrate calendar theme', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
            `$my-cal: calendar-theme(
                $month-hover-foreground: wheat,
                $year-hover-foreground: red,
                $month-hover-background: black,
                $year-hover-background: black,
                $month-current-foreground: wheat,
                $year-current-foreground: red,
                $month-current-background: black,
                $year-current-background: black,
                $month-current-hover-foreground: wheat,
                $year-current-hover-foreground: wheat,
                $month-current-hover-background: black,
                $year-current-hover-background: black,
                $month-selected-foreground: wheat,
                $year-selected-foreground: wheat,
                $month-selected-background: black,
                $year-selected-background: black,
                $month-selected-hover-foreground: wheat,
                $year-selected-hover-foreground: wheat,
                $month-selected-hover-background: black,
                $year-selected-hover-background: black,
                $month-selected-current-foreground: wheat,
                $year-selected-current-foreground: wheat,
                $month-selected-current-background: black,
                $year-selected-current-background: black,
                $month-selected-current-hover-foreground: wheat,
                $year-selected-current-hover-foreground: wheat,
                $month-selected-current-hover-background: black,
                $year-selected-current-hover-background: black,
                $current-outline-color: wheat,
                $current-hover-outline-color: wheat,
                $current-focus-outline-color: wheat,
                $selected-outline-color: wheat,
                $selected-hover-outline-color: wheat,
                $selected-focus-outline-color: wheat,
                $selected-current-outline-color: wheat,
                $selected-current-outline-hover-color: wheat,
                $selected-current-outline-focus-color: wheat,
                $month-year-border-radius: 2px
            );`
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.scss')).toEqual(
            `$my-cal: calendar-theme(
                $ym-hover-foreground: wheat,
                $ym-hover-background: black,
                $ym-current-foreground: wheat,
                $ym-current-background: black,
                $ym-current-hover-foreground: wheat,
                $ym-current-hover-background: black,
                $ym-selected-foreground: wheat,
                $ym-selected-background: black,
                $ym-selected-hover-foreground: wheat,
                $ym-selected-hover-background: black,
                $ym-selected-current-foreground: wheat,
                $ym-selected-current-background: black,
                $ym-selected-current-hover-foreground: wheat,
                $ym-selected-current-hover-background: black,
                $ym-current-outline-color: wheat,
                $ym-current-outline-hover-color: wheat,
                $ym-current-outline-focus-color: wheat,
                $ym-selected-outline-color: wheat,
                $ym-selected-hover-outline-color: wheat,
                $ym-selected-focus-outline-color: wheat,
                $ym-selected-current-outline-color: wheat,
                $ym-selected-current-outline-hover-color: wheat,
                $ym-selected-current-outline-focus-color: wheat,
                $ym-border-radius: 2px
            );`
        );
    });

});
