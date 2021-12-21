import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import {
    SchematicTestRunner,
    UnitTestTree,
} from '@angular-devkit/schematics/testing';

describe('Update 10.2.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner(
        'ig-migrate',
        path.join(__dirname, '../migration-collection.json')
    );
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
                sourceRoot: '/testSrc',
            },
        },
        schematics: {
            '@schematics/angular:component': {
                prefix: 'appPrefix',
            },
        },
    };

    beforeEach(() => {
        appTree = new UnitTestTree(new EmptyTree());
        appTree.create('/angular.json', JSON.stringify(configJson));
    });

    it('should remove the type property if the value is not a valid type', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/test.component.html',
            // eslint-disable-next-line max-len
            `<igx-input-group type="line"></igx-input-group><igx-input-group type="box"></igx-input-group><igx-input-group type="border"></igx-input-group><igx-input-group type="search"></igx-input-group><igx-input-group type="bootstrap"></igx-input-group><igx-input-group type="fluent"></igx-input-group><igx-input-group type="fluent_search"></igx-input-group><igx-input-group type="indigo"></igx-input-group><igx-input-group type='bootstrap'></igx-input-group><igx-input-group type='fluent'></igx-input-group><igx-input-group type='fluent_search'></igx-input-group><igx-input-group type='indigo'></igx-input-group>`
        );

        const tree = await schematicRunner
            .runSchematicAsync('migration-17', {}, appTree)
            .toPromise();
        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        // eslint-disable-next-line max-len
        ).toEqual(`<igx-input-group type="line"></igx-input-group><igx-input-group type="box"></igx-input-group><igx-input-group type="border"></igx-input-group><igx-input-group type="search"></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group><igx-input-group></igx-input-group>`);
    });

    it('should replace selectedRows() with selectedRows in ts files', async () => {
        appTree.create('/testSrc/appPrefix/component/test.component.ts',
`import {
    IgxGridComponent,
    IgxTreeGridComponent,
    IgxHierarchicalGridComponent
} from '../../../dist/igniteui-angular';

export class MyClass {
    public grid: IgxGridComponent;
    public tgrid: IgxTreeGridComponent;
    public hgrid: IgxHierarchicalGridComponent;

    public myFunction() {
        const selectedRowData = this.grid.selectedRows();
        const selectedRowData2 = this.tgrid.selectedRows();
        const selectedRowData3 = this.hgrid.selectedRows();
    }
}`);

        const tree = await schematicRunner
            .runSchematicAsync('migration-17', {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.ts')
        ).toEqual(
`import {
    IgxGridComponent,
    IgxTreeGridComponent,
    IgxHierarchicalGridComponent
} from '../../../dist/igniteui-angular';

export class MyClass {
    public grid: IgxGridComponent;
    public tgrid: IgxTreeGridComponent;
    public hgrid: IgxHierarchicalGridComponent;

    public myFunction() {
        const selectedRowData = this.grid.selectedRows;
        const selectedRowData2 = this.tgrid.selectedRows;
        const selectedRowData3 = this.hgrid.selectedRows;
    }
}`);

    });

    it('Should remove references to deprecated `panel` property of `IExpansionPanelEventArgs`', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/expansion-test.component.ts',
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
                tree.readContent('/testSrc/appPrefix/component/expansion-test.component.ts')
            ).toEqual(expectedContent);
    });
});
