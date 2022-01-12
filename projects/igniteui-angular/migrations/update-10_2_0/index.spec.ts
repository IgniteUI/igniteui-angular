import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import {
    SchematicTestRunner,
    UnitTestTree,
} from '@angular-devkit/schematics/testing';

fdescribe('Update 10.2.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner(
        'ig-migrate',
        path.join(__dirname, '../migration-collection.json')
    );
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                root: '',
                sourceRoot: '/src',
            },
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix',
            },
        },
    };
    const TSConfig = {
        compilerOptions: {
            baseUrl: "./",
            importHelpers: true,
            module: "es2020",
            outDir: "./dist/out-tsc",
            sourceMap: true,
            moduleResolution: "node",
            target: "es2015",
            rootDir: "."
        },
        angularCompilerOptions: {
            generateDeepReexports: true,
            strictTemplates: true,
            fullTemplateTypeCheck: true,
            strictInjectionParameters: true
        }
    };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
        appTree.create('/tsconfig.json', JSON.stringify(TSConfig));
        appTree.create('/src/main.ts', "");
    });

    it('should remove the type property if the value is not a valid type', async () => {
        appTree.create(
            '/src/appPrefix/component/test.component.html',
            // eslint-disable-next-line max-len
            `<igx-input-group type="line"></igx-input-group><igx-input-group type="box"></igx-input-group><igx-input-group type="border"></igx-input-group><igx-input-group type="search"></igx-input-group><igx-input-group type="bootstrap"></igx-input-group><igx-input-group type="fluent"></igx-input-group><igx-input-group type="fluent_search"></igx-input-group><igx-input-group type="indigo"></igx-input-group><igx-input-group type='bootstrap'></igx-input-group><igx-input-group type='fluent'></igx-input-group><igx-input-group type='fluent_search'></igx-input-group><igx-input-group type='indigo'></igx-input-group>`
        );

        const tree = await schematicRunner
            .runSchematicAsync('migration-17', {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/src/appPrefix/component/test.component.html')
        // eslint-disable-next-line max-len
        ).toEqual(`<igx-input-group type="line"></igx-input-group><igx-input-group type="box"></igx-input-group><igx-input-group type="border"></igx-input-group><igx-input-group type="search"></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group>`);
    });

    it('should replace selectedRows() with selectedRows in ts files', async () => {
        appTree.create('/src/appPrefix/component/test.component.ts',
`import {
    IgxGridComponent,
    IgxTreeGridComponent,
    IgxHierarchicalGridComponent,
    IgxGridModule,
    IgxTreeGridModule,
    IgxHierarchicalGridModule,
} from '../../../dist/igniteui-angular';
import { Component, NgModule } from '@angular/core';

@Component({
    templateUrl: './test.component.html'
})

export class MyClass {
    public grid: IgxGridComponent;
    public tgrid: IgxTreeGridComponent;
    public hgrid: IgxHierarchicalGridComponent;

    public myFunction() {
        const selectedRowData = this.grid.selectedRows();
        const selectedRowData2 = this.tgrid.selectedRows();
        const selectedRowData3 = this.hgrid.selectedRows();
    }
}
@NgModule({
    declarations: [MyClass],
    exports: [MyClass],
    imports: [IgxGridModule, IgxTreeGridModule, IgxHierarchicalGridModule]
})
export class MyGridModule { }
`);

        appTree.create('/src/appPrefix/component/test.component.html',
`<igx-grid #grid></igx-grid>
    <button (click)="grid.selectedRows()">Selected Rows Grid</button>
<igx-tree-grid #tgrid></igx-tree-grid>
    <button (click)="tgrid.selectedRows()">Selected Rows Tree Grid</button>
<igx-hierarchical-grid #hgrid></igx-hierarchical-grid>
    <button (click)="hgrid.selectedRows()"> Selected Rows Hierarchical Grid</button>
`);

        const tree = await schematicRunner
                    .runSchematicAsync('migration-17', {}, appTree)
                    .toPromise();

        const expectedTSContent =
`import {
    IgxGridComponent,
    IgxTreeGridComponent,
    IgxHierarchicalGridComponent,
    IgxGridModule,
    IgxTreeGridModule,
    IgxHierarchicalGridModule,
} from '../../../dist/igniteui-angular';
import { Component, NgModule } from '@angular/core';

@Component({
    templateUrl: './test.component.html'
})

export class MyClass {
    public grid: IgxGridComponent;
    public tgrid: IgxTreeGridComponent;
    public hgrid: IgxHierarchicalGridComponent;

    public myFunction() {
        const selectedRowData = this.grid.selectedRows;
        const selectedRowData2 = this.tgrid.selectedRows;
        const selectedRowData3 = this.hgrid.selectedRows;
    }
}
@NgModule({
    declarations: [MyClass],
    exports: [MyClass],
    imports: [IgxGridModule, IgxTreeGridModule, IgxHierarchicalGridModule]
})
export class MyGridModule { }
`
        const expectedHTMLContent =
`<igx-grid #grid></igx-grid>
    <button (click)="grid.selectedRows">Selected Rows Grid</button>
<igx-tree-grid #tgrid></igx-tree-grid>
    <button (click)="tgrid.selectedRows">Selected Rows Tree Grid</button>
<igx-hierarchical-grid #hgrid></igx-hierarchical-grid>
    <button (click)="hgrid.selectedRows"> Selected Rows Hierarchical Grid</button>
`

        expect(
            tree.readContent('/src/appPrefix/component/test.component.ts')
        ).toEqual(expectedTSContent);

        expect(
            tree.readContent('/src/appPrefix/component/test.component.html')
        ).toEqual(expectedHTMLContent)
    });

    it('Should remove references to deprecated `panel` property of `IExpansionPanelEventArgs`', async () => {
        appTree.create(
            '/src/appPrefix/component/expansion-test.component.ts',
`import { IExpansionPanelEventArgs, IgxExpansionPanelComponent } from '../../../dist/igniteui-angular';

export class ExpansionTestComponent {
    public panel: IgxExpansionPanelComponent;

    public onPanelOpened(event: IExpansionPanelEventArgs) {
        console.log(event.panel);
    }
}`
        );
        const tree = await schematicRunner
            .runSchematicAsync('migration-17', {}, appTree)
            .toPromise();
        const expectedContent =
`import { IExpansionPanelEventArgs, IgxExpansionPanelComponent } from '../../../dist/igniteui-angular';

export class ExpansionTestComponent {
    public panel: IgxExpansionPanelComponent;

    public onPanelOpened(event: IExpansionPanelEventArgs) {
        console.log(event.owner);
    }
}`;
        expect(
                tree.readContent('/src/appPrefix/component/expansion-test.component.ts')
            ).toEqual(expectedContent);
    });
});
