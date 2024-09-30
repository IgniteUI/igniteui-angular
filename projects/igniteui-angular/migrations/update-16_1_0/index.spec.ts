import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '16.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
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
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
        `
        import { IgxComboComponent, IgxSimpleComboComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxComboComponent, { read: IgxComboComponent })
            public combo: IgxComboComponent;
            @ViewChild(IgxSimpleComboComponent, { read: IgxSimpleComboComponent })
            public simpleCombo: IgxSimpleComboComponent;
            public ngAfterViewInit() {
                const comboDisplayValue = this.combo.value;
                const comboSelectionValue = this.combo.selection;
                const simpleComboDisplayValue = this.simpleCombo.value;
                const simpleComboSelectionValue = this.simpleCombo.selection;
            }
        }
        `);

        const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
        `
        import { IgxComboComponent, IgxSimpleComboComponent } from 'igniteui-angular';
        export class MyClass {
            @ViewChild(IgxComboComponent, { read: IgxComboComponent })
            public combo: IgxComboComponent;
            @ViewChild(IgxSimpleComboComponent, { read: IgxSimpleComboComponent })
            public simpleCombo: IgxSimpleComboComponent;
            public ngAfterViewInit() {
                const comboDisplayValue = this.combo.displayValue;
                const comboSelectionValue = this.combo.value;
                const simpleComboDisplayValue = this.simpleCombo.displayValue;
                const simpleComboSelectionValue = this.simpleCombo.value;
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
