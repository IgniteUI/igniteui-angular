import * as path from 'path';
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';
import { setupTestTree } from '../common/setup.spec';

describe('Update 10.1.0', () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));

    beforeEach(() => {
        appTree = setupTestTree();
    });

    it('should upgrade the igx-action-icon to igx-navbar-action', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html',
            `<igx-navbar title="Test title">
            <igx-action-icon>
            <igx-icon>arrow_back</igx-icon>
            </igx-action-icon>
            </igx-navbar>`);
        const tree = await schematicRunner.runSchematic('migration-16', {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.html'))
            .toEqual(
            `<igx-navbar title="Test title">
            <igx-navbar-action>
            <igx-icon>arrow_back</igx-icon>
            </igx-navbar-action>
            </igx-navbar>`);
    });

    it('should update IgxActionIconDirective to IgxNavbarActionDirective', async () => {
        appTree.create('/testSrc/appPrefix/component/custom.component.ts',
            `import { IgxActionIconDirective } from 'igniteui-angular';
            export class TestNavbar {
            @ViewChild(IgxActionIconDirective, { read: IgxActionIconDirective })
            private actionIcon: IgxActionIconDirective; }`);

        const tree = await schematicRunner.runSchematic('migration-16', {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/custom.component.ts'))
            .toEqual(
            `import { IgxNavbarActionDirective } from 'igniteui-angular';
            export class TestNavbar {
            @ViewChild(IgxNavbarActionDirective, { read: IgxNavbarActionDirective })
            private actionIcon: IgxNavbarActionDirective; }`);
    });

    it('should update DropPosition.None', async () => {
        const origFileContent =
            `import { Component, Injectable, ViewChild } from "@angular/core";` +
            `import { IgxGridComponent, DropPosition } from "igniteui-angular";` +
            `import { IgxColumnComponent } from "igniteui-angular";\r\n` +
            `@Component({` +
            `    providers: [RemoteService]` +
            `})` +
            `export class GridSampleComponent {` +
            `    @ViewChild("grid1", { read: IgxGridComponent }) public grid1: IgxGridComponent;` +
            `    public move() {` +
            `        const column: IgxColumnComponent = this.grid1.columns[0];` +
            `        const column2: IgxColumnComponent = this.grid1.columns[1];` +
            `        this.grid1.moveColumn(col1, col2, DropPosition.None);` +
            `    }` +
            `}`;
        const expectedFileContent =
            `import { Component, Injectable, ViewChild } from "@angular/core";` +
            `import { IgxGridComponent, DropPosition } from "igniteui-angular";` +
            `import { IgxColumnComponent } from "igniteui-angular";\r\n` +
            `@Component({` +
            `    providers: [RemoteService]` +
            `})` +
            `export class GridSampleComponent {` +
            `    @ViewChild("grid1", { read: IgxGridComponent }) public grid1: IgxGridComponent;` +
            `    public move() {` +
            `        const column: IgxColumnComponent = this.grid1.columns[0];` +
            `        const column2: IgxColumnComponent = this.grid1.columns[1];` +
            `        this.grid1.moveColumn(col1, col2, DropPosition.AfterDropTarget);` +
            `    }` +
            `}`;
        appTree.create(
            '/testSrc/appPrefix/component/drop.component.ts',
            origFileContent);

        const tree = await schematicRunner.runSchematic('migration-16', {}, appTree);
        expect(tree.readContent('/testSrc/appPrefix/component/drop.component.ts'))
            .toEqual(expectedFileContent);
    });

    it('should replace onDataPreLoad with onScroll ', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/tree-grid.component.html`,
            '<igx-tree-grid (onDataPreLoad)="handleEvent($event)"></igx-tree-grid>'
        );

        const tree = await schematicRunner.runSchematic('migration-16', {}, appTree);

        expect(tree.readContent('/testSrc/appPrefix/component/tree-grid.component.html'))
            .toEqual('<igx-tree-grid (onScroll)="handleEvent($event)"></igx-tree-grid>');

    });
});
