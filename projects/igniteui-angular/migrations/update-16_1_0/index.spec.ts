import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '16.1.0';

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

    const migrationName = 'migration-31';

    it('Should replace IgxStepSubTitleDirective with IgxStepSubtitleDirective', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.ts',
            `import { Component, ViewChild } from '@angular/core';
        import { IgxStepSubTitleDirective } from 'igniteui-angular';

        @Component({
            selector: 'test-component',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class TestComponent {
            stepper: IgxStepperComponent;
            @ViewChild(IgxStepSubTitleDirective)
            public title: IgxStepSubTitleDirective;
        }
        `);
        const tree = await schematicRunner.runSchematic(migrationName, { shouldInvokeLS: false }, appTree);

        const expectedContent = `import { Component, ViewChild } from '@angular/core';
        import { IgxStepSubtitleDirective } from 'igniteui-angular';

        @Component({
            selector: 'test-component',
            templateUrl: './test.component.html',
            styleUrls: ['./test.component.scss']
        })
        export class TestComponent {
            stepper: IgxStepperComponent;
            @ViewChild(IgxStepSubtitleDirective)
            public title: IgxStepSubtitleDirective;
        }
        `;
        expect(tree.readContent('/testSrc/appPrefix/component/test.component.ts')).toEqual(expectedContent);
    });

    it('should update IgxStepSubTitle selectors', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-stepper>
                <igx-step>
                   <p igxStepTitle>Home</p>
                   <p igxStepSubTitle>Home Sub Title</p>
                </igx-step>
            </igx-stepper>`);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
            `<igx-stepper>
                <igx-step>
                   <p igxStepTitle>Home</p>
                   <p igxStepSubtitle>Home Sub Title</p>
                </igx-step>
            </igx-stepper>`);

    });

    it('Should properly rename value property to displayValue and selection to value', async () => {
        pending('set up tests for migrations through lang service');
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { IgxComboComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxComboComponent, { read: IgxComboComponent })
            public combo: IgxComboComponent;
            @ViewChild(IgxSimpleComboComponent, { read: IgxSimpleComboComponent })
            public simpleCombo: IgxSimpleComboComponent;
            public ngAfterViewInit() {
                const comboDisplayValue = combo.value;
                const comboSelectionValue = combo.selection;
                const simpleComboDisplayValue = simpleCombo.value;
                const simpleComboSelectionValue = simpleCombo.selection;
            }
        }
        `);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
        `
        import { IgxComboComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxComboComponent, { read: IgxComboComponent })
            public combo: IgxComboComponent;
            @ViewChild(IgxSimpleComboComponent, { read: IgxSimpleComboComponent })
            public simpleCombo: IgxSimpleComboComponent;
            public ngAfterViewInit() {
                const comboDisplayValue = combo.displayValue;
                const comboSelectionValue = combo.value;
                const simpleComboDisplayValue = simpleCombo.displayValue;
                const simpleComboSelectionValue = simpleCombo.value;
            }
        }
        `
        );
    });

    it('Should remove button-group multiSelection property set to "true" and replace it with selectionMode property set to "multi"', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `<igx-buttongroup [multiSelection]="true">
                <button igxButton>
                    Button 1
                </button>
                <button igxButton>
                    Button 2
                </button>
            </igx-buttongroup>`);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
            `<igx-buttongroup [selectionMode]="'multi'">
                <button igxButton>
                    Button 1
                </button>
                <button igxButton>
                    Button 2
                </button>
            </igx-buttongroup>`);
    });

    it('Should remove button-group multiSelection property set to "false"', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            `<igx-buttongroup [multiSelection]="false">
                <button igxButton>
                    Button 1
                </button>
                <button igxButton>
                    Button 2
                </button>
            </igx-buttongroup>`);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html'))
            .toEqual(
            `<igx-buttongroup >
                <button igxButton>
                    Button 1
                </button>
                <button igxButton>
                    Button 2
                </button>
            </igx-buttongroup>`);
    });

    it('Should not update button-group without multiSelection prop', async () => {
        const content = `<igx-buttongroup alignment="horizontal">
                <button igxButton>
                    Button 1
                </button>
                <button igxButton>
                    Button 2
                </button>
            </igx-buttongroup>
            <igx-buttongroup>
                <button igxButton>
                    Button 1
                </button>
            </igx-buttongroup>`;

        appTree.create(`/testSrc/appPrefix/component/test.component.html`, content);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/test.component.html')).toEqual(content);
    });
});
