import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

const version = '13.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    const migrationName = 'migration-23';

    it('should remove columns` movable prop and enable grid`s moving prop if there is movable columns', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
<igx-grid>
  <igx-column [movable]="true"></igx-column>
  <igx-column></igx-column>
</igx-grid>
`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
<igx-grid [moving]="true">
  <igx-column ></igx-column>
  <igx-column></igx-column>
</igx-grid>
`
        );
    });

    it('should remove columns` movable prop and don`t set the grid`s moving prop if there isn`t movable columns', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
<igx-grid>
  <igx-column [movable]="false"></igx-column>
  <igx-column></igx-column>
</igx-grid>
`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
<igx-grid>
  <igx-column ></igx-column>
  <igx-column></igx-column>
</igx-grid>
`
        );
    });

    it('should rename @import to @use', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.scss`,
`@import '~igniteui-angular/lib/core/styles/themes/index';`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss').replace(/\n|\r\n/g, '')
        ).toEqual(
`/* Line added via automated migrations. */
@use "igniteui-angular/theming" as *;`.replace(/\n|\r\n/g, '')
        );
    });


    it('should remove columns` and column-groups` movable prop and set the accurate moving prop to the grid', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
<igx-grid>
    <igx-column [movable]="true"></igx-column>
    <igx-column-group [movable]="true">
        <igx-column [movable]="true"></igx-column>
        <igx-column-group [movable]="true">
            <igx-column [movable]="true"></igx-column>
        </igx-column-group>
    </igx-column-group>
    <igx-column-group>
        <igx-column-group [movable]="true">
            <igx-column></igx-column>
        </igx-column-group>
    </igx-column-group>
    <igx-column [movable]="false"></igx-column>
</igx-grid>
`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.html')
        ).toEqual(
            `
<igx-grid [moving]="true">
    <igx-column ></igx-column>
    <igx-column-group >
        <igx-column ></igx-column>
        <igx-column-group >
            <igx-column ></igx-column>
        </igx-column-group>
    </igx-column-group>
    <igx-column-group>
        <igx-column-group >
            <igx-column></igx-column>
        </igx-column-group>
    </igx-column-group>
    <igx-column ></igx-column>
</igx-grid>
`
        );
    });

    it('should remove columns` movable prop and enable grid`s moving prop in multiple files', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test1.component.html`,
            `
<igx-grid>
    <igx-column [movable]="true"></igx-column>
    <igx-column></igx-column>
</igx-grid>
`
        );
        appTree.create(
            `/testSrc/appPrefix/component/test2.component.html`,
            `
<igx-grid>
    <igx-column [movable]="true"></igx-column>
</igx-grid>
`
        );

        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);
        expect(
            tree.readContent('/testSrc/appPrefix/component/test1.component.html')
        ).toEqual(
            `
<igx-grid [moving]="true">
    <igx-column ></igx-column>
    <igx-column></igx-column>
</igx-grid>
`
        );
        expect(
            tree.readContent('/testSrc/appPrefix/component/test2.component.html')
        ).toEqual(
            `
<igx-grid [moving]="true">
    <igx-column ></igx-column>
</igx-grid>
`
        );
    });

    it('should rename hgridAPI to gridAPI for hierarchical grids', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/test.component.html`,
            `
<igx-hierarchical-grid #hgrid (gridCreated)="console.log(hgrid.hgridAPI.getChildGrids())">
</igx-hierarchical-grid>
`
        );
        appTree.create(
            `/testSrc/appPrefix/component/test.component.ts`,
            `
import { Component } from '@angular/core';
import {
    IgxHierarchicalGridComponent
} from 'igniteui-angular';
@Component({
    selector: 'test.component',
    templateUrl: 'test.component.html',
    standalone: true,
    imports: [IgxHierarchicalGridComponent]
})
export class TestComponent {
    public childGrid: IgxHierarchicalGridComponent;
    public get hasChildTransactions(): boolean {
        return this.childGrid.hgridAPI.getChildGrids().length > 0;
    }
}
`
        );
        const tree = await schematicRunner
            .runSchematic(migrationName, {}, appTree);

            expect(
                tree.readContent('/testSrc/appPrefix/component/test.component.html')
            ).toEqual(
`
<igx-hierarchical-grid #hgrid (gridCreated)="console.log(hgrid.gridAPI.getChildGrids())">
</igx-hierarchical-grid>
`
            );

            expect(
                tree.readContent('/testSrc/appPrefix/component/test.component.ts')
            ).toEqual(
                `
import { Component } from '@angular/core';
import {
    IgxHierarchicalGridComponent
} from 'igniteui-angular';
@Component({
    selector: 'test.component',
    templateUrl: 'test.component.html',
    standalone: true,
    imports: [IgxHierarchicalGridComponent]
})
export class TestComponent {
    public childGrid: IgxHierarchicalGridComponent;
    public get hasChildTransactions(): boolean {
        return this.childGrid.gridAPI.getChildGrids().length > 0;
    }
}
`
            );
    });

});
