import * as path from 'path';

import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

const version = '13.1.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const configJson = {
        defaultProject: 'testProj',
        projects: {
            testProj: {
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
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

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
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

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
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

        expect(
            tree.readContent('/testSrc/appPrefix/component/test.component.scss')
        ).toEqual(
`@use "igniteui-angular/theming" as igniteui;`
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
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

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
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();
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
        pending('set up tests for migrations through lang service');
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
import {
    IgxHierarchicalGridComponent
} from 'igniteui-angular';
@Component({
    selector: 'test.component',
    templateUrl: 'test.component.html'
})
export class TestComponent {
    public get hasChildTransactions(): boolean {
        return this.childGrid.gridAPI.getChildGrids().length > 0;
    }
}
`
        );
        const tree = await schematicRunner
            .runSchematicAsync(migrationName, {}, appTree)
            .toPromise();

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
import {
    IgxHierarchicalGridComponent
} from 'igniteui-angular';
@Component({
    selector: 'test.component',
    templateUrl: 'test.component.html'
})
export class TestComponent {
    public get hasChildTransactions(): boolean {
        return this.childGrid.gridAPI.getChildGrids().length > 0;
    }
`
            );
    });

});
