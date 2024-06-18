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

    it('should remove property `filterable` from `filteringOptions`', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-combo [filteringOptions]="{ filterable: false, caseSensitive: true }"></igx-combo>
        <igx-combo [filteringOptions]="{ caseSensitive: false, filterable: true }"></igx-combo>
        <igx-combo [filteringOptions]="{ filterable: myProp }"></igx-combo>
        <igx-simple-combo [filteringOptions]="{ caseSensitive: false, filterable: true }"></igx-simple-combo>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-combo [filteringOptions]="{ caseSensitive: true }"></igx-combo>
        <igx-combo [filteringOptions]="{ caseSensitive: false }"></igx-combo>
        <igx-combo ></igx-combo>
        <igx-simple-combo [filteringOptions]="{ caseSensitive: false }"></igx-simple-combo>
        `
        );
    });

    it('should remove filterable from the IComboFilteringOptions', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/combo-test.component.ts',
            `import { Component } from '@angular/core';
            import { IComboFilteringOptions } from "igniteui-angular";

            @Component({
                selector: "app-combo-test",
                styleUrls: ["./combo-test.component.scss"],
                templateUrl: "./combo-test.component.html"
            })
            export class ComboComponent {
                public filteringOptions1: IComboFilteringOptions = { caseSensitive: false, filterable: true, filteringKey: undefined };
                public filteringOptions2: IComboFilteringOptions = { filterable: true, caseSensitive: false };
                public filteringOptions3: IComboFilteringOptions = { caseSensitive: false, filterable: true };
                constructor(){}
            }
        `);

        const tree = await schematicRunner
            .runSchematic('migration-39', {}, appTree);

        const expectedContent =
            `import { Component } from '@angular/core';
            import { IComboFilteringOptions } from "igniteui-angular";

            @Component({
                selector: "app-combo-test",
                styleUrls: ["./combo-test.component.scss"],
                templateUrl: "./combo-test.component.html"
            })
            export class ComboComponent {
                public filteringOptions1: IComboFilteringOptions = { caseSensitive: false, filteringKey: undefined };
                public filteringOptions2: IComboFilteringOptions = { caseSensitive: false };
                public filteringOptions3: IComboFilteringOptions = { caseSensitive: false };
                constructor(){}
            }
        `;
        expect(
            tree.readContent(
                '/testSrc/appPrefix/component/combo-test.component.ts'
            )
        ).toEqual(expectedContent);
    });

    it('should remove property `filterable` from Combo component', async () => {
        appTree.create(`/testSrc/appPrefix/component/test.component.html`,
        `
        <igx-combo [filterable]="false"></igx-combo>
        <igx-combo filterable="true"></igx-combo>
        <igx-combo [filterable]="myProp"></igx-combo>
        `
        );

        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(
        `
        <igx-combo></igx-combo>
        <igx-combo></igx-combo>
        <igx-combo></igx-combo>
        `
        );
    });
});
