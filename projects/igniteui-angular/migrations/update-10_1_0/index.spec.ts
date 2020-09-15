import * as path from 'path';

// tslint:disable:no-implicit-dependencies
import { virtualFs } from '@angular-devkit/core';
import { EmptyTree } from '@angular-devkit/schematics';
// tslint:disable-next-line:no-submodule-imports
import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing';

describe('Update 10.1.0', () => {
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

    it('should upgrade the igx-action-icon to igx-navbar-action', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/custom.component.html',
            `<igx-navbar title="Test title">
            <igx-action-icon>
            <igx-icon>arrow_back</igx-icon>
            </igx-action-icon>
            </igx-navbar>`);
        const tree = await schematicRunner.runSchematicAsync('migration-16', {}, appTree)
            .toPromise();

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

        const tree = await schematicRunner.runSchematicAsync('migration-16', {}, appTree).toPromise();

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

        const tree = await schematicRunner.runSchematicAsync('migration-16', {}, appTree).toPromise();
        expect(tree.readContent('/testSrc/appPrefix/component/drop.component.ts'))
            .toEqual(expectedFileContent);
    });

    it('should replace onDataPreLoad with onScroll ', async () => {
        appTree.create(
            `/testSrc/appPrefix/component/tree-grid.component.html`,
            '<igx-tree-grid (onDataPreLoad)="handleEvent($event)"></igx-tree-grid>'
        );

        const tree = await schematicRunner.runSchematicAsync('migration-16', {}, appTree)
            .toPromise();

        expect(tree.readContent('/testSrc/appPrefix/component/tree-grid.component.html'))
            .toEqual('<igx-tree-grid (onScroll)="handleEvent($event)"></igx-tree-grid>');

    });

    fit('should replace selectedRows() with selectedRows in ts files', async () => {
        appTree.create(
            '/testSrc/appPrefix/component/grid-base.directive.ts',
            `import { Directive } from '@angular/core';
            @Directive({
                selector: '[igxGridBaseComponent]'
            })
            export class GridBaseDirective {
                public get selectedRows {
                    return null;
                }
            }`);
        appTree.create(
            '/testSrc/appPrefix/component/grid.component.ts',
            `import { Component } from '@angular/core';
            import { GridBaseDirective } from './grid-base.directive.ts';
            @Component({
                template: '<div>Grid</div>',
                selector: 'igx-grid'
            })
            export class IgxGridComponent extends GridBaseDirective { }`);

        appTree.create(
            '/testSrc/appPrefix/component/grid-sample.component.ts',
            `import { Component, ViewChild } from '@angular/core';
            import { IgxGridComponent } from './grid.component.ts';
            @Component({
                template: '<igx-grid #grid1></igx-grid>',
                selector: 'grid-sample-component'
            })
            export class GridSampleComponent {
                @ViewChild('grid1')
                public grid: IgxGridComponent;

                public selectedRows() {
                    return this.grid.selectedRows();
                }
            }`);

        appTree.create(
            '/testSrc/appPrefix/component/grid-sample.module.ts',
            `import { GridSampleComponent } from './grid.component-sample.ts';
            import { GridBaseDirective } from './grid-base.directive.ts';
            import { IgxGridComponent } from './grid.component.ts';
            import { NgModule } from '@angular/core';
            @NgModule({
                declarations: [GridSampleComponent, GridBaseDirective, IgxGridComponent]
            })
            export class GridSampleModule { }`);

        appTree.create(
            '/testSrc/appPrefix/component/tsconfig.json',
            `{
                "compilerOptions": {
                    "module": "commonjs",
                    "target": "es6",
                    "outDir": "/"
                },
                "plugins": [
                    {"name": "@angular/language-service"}
                ]
            }`
        );

        const tree = await schematicRunner.runSchematicAsync('migration-16', {}, appTree).toPromise();
    });
});
