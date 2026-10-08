import * as path from 'path';

import { SchematicTestRunner, UnitTestTree } from '@angular-devkit/schematics/testing/index.js';
import { setupTestTree } from '../common/setup.spec';

const version = '23.0.0';

describe(`Update to ${version}`, () => {
    let appTree: UnitTestTree;
    const schematicRunner = new SchematicTestRunner('ig-migrate', path.join(__dirname, '../migration-collection.json'));
    const migrationName = 'migration-63';
    const templatePath = '/testSrc/appPrefix/component/test.component.html';
    const tsPath = '/testSrc/appPrefix/component/test.component.ts';
    const scssPath = '/testSrc/appPrefix/component/test.component.scss';

    beforeEach(() => {
        appTree = setupTestTree();
    });

    describe('templates', () => {
        it('should remove the `grid` input of the grid toolbar', async () => {
            appTree.create(templatePath,
                `<igx-grid-toolbar [grid]="childGrid"><igx-grid-toolbar-title>Title</igx-grid-toolbar-title></igx-grid-toolbar>`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(templatePath)).toEqual(
                `<igx-grid-toolbar><igx-grid-toolbar-title>Title</igx-grid-toolbar-title></igx-grid-toolbar>`);
        });

        it('should replace the query builder `fields` with `entities`', async () => {
            appTree.create(templatePath,
                `<igx-query-builder [fields]="[{ field: 'ID', dataType: 'number' }]"></igx-query-builder>`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(templatePath)).toEqual(
                `<igx-query-builder [entities]="[{ name: '', fields: [{ field: 'ID', dataType: 'number' }]}]"></igx-query-builder>`);
        });

        it('should remove the query builder header `showLegend` and `resourceStrings`', async () => {
            appTree.create(templatePath,
                `<igx-query-builder-header [title]="'Title'" [showLegend]="false" [resourceStrings]="strings"></igx-query-builder-header>`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(templatePath)).toEqual(
                `<igx-query-builder-header [title]="'Title'"></igx-query-builder-header>`);
        });

        it('should move the combo `searchPlaceholder` to the resource strings it overrode', async () => {
            appTree.create(templatePath,
                `<igx-combo [data]="items" searchPlaceholder="Search..."></igx-combo>
<igx-combo [data]="items" searchPlaceholder="Don't search"></igx-combo>
<igx-combo [data]="items" [searchPlaceholder]="placeholder"></igx-combo>
<igx-combo [data]="items" [searchPlaceholder]="'search' | translate"></igx-combo>`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(templatePath)).toEqual(
                `<igx-combo [data]="items" [resourceStrings]="{ igx_combo_filter_search_placeholder: 'Search...', igx_combo_addCustomValues_placeholder: 'Search...' }"></igx-combo>
<igx-combo [data]="items" [resourceStrings]="{ igx_combo_filter_search_placeholder: 'Don\\'t search', igx_combo_addCustomValues_placeholder: 'Don\\'t search' }"></igx-combo>
<igx-combo [data]="items" [resourceStrings]="{ igx_combo_filter_search_placeholder: placeholder, igx_combo_addCustomValues_placeholder: placeholder }"></igx-combo>
<igx-combo [data]="items" [resourceStrings]="{ igx_combo_filter_search_placeholder: ('search' | translate), igx_combo_addCustomValues_placeholder: ('search' | translate) }"></igx-combo>`);
        });

        it('should leave the combo `searchPlaceholder` when the combo already binds resource strings', async () => {
            const content = `<igx-combo [data]="items" searchPlaceholder="Search..." [resourceStrings]="strings"></igx-combo>`;
            appTree.create(templatePath, content);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(templatePath)).toEqual(content);
        });

        it('should replace the avatar `color` and `bgColor` with style bindings', async () => {
            appTree.create(templatePath,
                `<igx-avatar initials="AB" color="blue" bgColor="#ff0"></igx-avatar>
<igx-avatar initials="CD" [color]="textColor" [bgColor]="background"></igx-avatar>`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(templatePath)).toEqual(
                `<igx-avatar initials="AB" [style.color]="'blue'" [style.background]="'#ff0'"></igx-avatar>
<igx-avatar initials="CD" [style.color]="textColor" [style.background]="background"></igx-avatar>`);
        });

        it('should replace the carousel `top` and `bottom` indicators orientation', async () => {
            appTree.create(templatePath,
                `<igx-carousel indicatorsOrientation="bottom"></igx-carousel>
<igx-carousel indicatorsOrientation="top"></igx-carousel>
<igx-carousel [indicatorsOrientation]="'top'"></igx-carousel>
<igx-carousel [indicatorsOrientation]="orientation ?? CarouselIndicatorsOrientation.bottom"></igx-carousel>
<igx-carousel indicatorsOrientation="start"></igx-carousel>`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(templatePath)).toEqual(
                `<igx-carousel indicatorsOrientation="end"></igx-carousel>
<igx-carousel indicatorsOrientation="start"></igx-carousel>
<igx-carousel [indicatorsOrientation]="'start'"></igx-carousel>
<igx-carousel [indicatorsOrientation]="orientation ?? CarouselIndicatorsOrientation.end"></igx-carousel>
<igx-carousel indicatorsOrientation="start"></igx-carousel>`);
        });

        it('should not replace `top` and `bottom` literals that may not be the carousel orientation', async () => {
            const content = `<igx-carousel [indicatorsOrientation]="side === 'top' ? 'start' : 'end'"></igx-carousel>
<igx-carousel [indicatorsOrientation]="vertical ? 'start' : 'bottom'"></igx-carousel>`;
            appTree.create(templatePath, content);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(templatePath)).toEqual(content);
        });

        it('should replace `rowID` with `key` in row selector templates', async () => {
            appTree.create(templatePath,
                `<igx-grid [data]="data">
    <ng-template igxRowSelector let-rowContext>
        <span>{{ rowContext.rowID }}</span>
        <igx-checkbox (click)="onSelect(rowContext?.rowID)" [checked]="rowContext.selected"></igx-checkbox>
    </ng-template>
    <ng-template igxCell let-cell="cell">{{ cell.rowID }}</ng-template>
</igx-grid>`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(templatePath)).toEqual(
                `<igx-grid [data]="data">
    <ng-template igxRowSelector let-rowContext>
        <span>{{ rowContext.key }}</span>
        <igx-checkbox (click)="onSelect(rowContext?.key)" [checked]="rowContext.selected"></igx-checkbox>
    </ng-template>
    <ng-template igxCell let-cell="cell">{{ cell.rowID }}</ng-template>
</igx-grid>`);
        });
    });

    describe('TypeScript', () => {
        it('should replace `children.toArray()` of columns with `childColumns`', async () => {
            appTree.create(tsPath,
                `import { Component } from '@angular/core';
import { IgxColumnGroupComponent, ColumnType } from 'igniteui-angular';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public getColumns(columnGroup: IgxColumnGroupComponent, column: ColumnType) {
        return [...columnGroup.children.toArray(), ...column.children.toArray()];
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(tsPath)).toContain(
                `return [...columnGroup.childColumns, ...column.childColumns];`);
        });

        it('should rename `IForOfDataChangingEventArgs` to `IForOfDataChangeEventArgs`', async () => {
            appTree.create(tsPath,
                `import { Component } from '@angular/core';
import { IForOfDataChangingEventArgs } from 'igniteui-angular';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public onDataChanged(event: IForOfDataChangingEventArgs) {
        return event.containerSize;
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            const content = tree.readContent(tsPath);
            expect(content).toContain(`import { IForOfDataChangeEventArgs } from 'igniteui-angular';`);
            expect(content).toContain(`public onDataChanged(event: IForOfDataChangeEventArgs) {`);
        });

        it('should replace the removed grid event argument members', async () => {
            appTree.create(tsPath,
                `import { Component } from '@angular/core';
import {
    IGridEditDoneEventArgs, IGridEditEventArgs, IPinRowEventArgs, IRowDataCancelableEventArgs,
    IRowDataEventArgs, IRowToggleEventArgs, IPathSegment
} from 'igniteui-angular';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public onEditDone(event: IGridEditDoneEventArgs) {
        return [event.rowID, event.primaryKey, event.cellID.rowID];
    }
    public onEdit(event: IGridEditEventArgs) {
        return event.rowID;
    }
    public onRowPinning(event: IPinRowEventArgs) {
        return event.rowID;
    }
    public onRowAdded(event: IRowDataEventArgs) {
        return [event.data, event.primaryKey];
    }
    public onRowAdd(event: IRowDataCancelableEventArgs) {
        return [event.data, event.rowID];
    }
    public onRowToggle({ rowID, expanded }: IRowToggleEventArgs) {
        return rowID;
    }
    public getKey(path: IPathSegment) {
        const { rowID: key } = path;
        return key;
    }
    public other(item: { rowID: string, data: any }) {
        return [item.rowID, item.data];
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            const content = tree.readContent(tsPath);
            expect(content).toContain(`return [event.rowKey, event.rowKey, event.cellID.rowID];`);
            expect(content).toContain(`public onEdit(event: IGridEditEventArgs) {
        return event.rowKey;`);
            expect(content).toContain(`public onRowPinning(event: IPinRowEventArgs) {
        return event.rowKey;`);
            expect(content).toContain(`return [event.rowData, event.rowKey];`);
            expect(content).toContain(`public onRowAdd(event: IRowDataCancelableEventArgs) {
        return [event.rowData, event.rowKey];`);
            expect(content).toContain(`public onRowToggle({ rowKey: rowID, expanded }: IRowToggleEventArgs) {`);
            expect(content).toContain(`const { rowKey: key } = path;`);
            expect(content).toContain(`return [item.rowID, item.data];`);
        });

        it('should replace the paginator `isFirstPageDisabled` and `isLastPageDisabled`', async () => {
            appTree.create(tsPath,
                `import { Component } from '@angular/core';
import { IgxPaginatorComponent } from 'igniteui-angular';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public paginator: IgxPaginatorComponent;
    public isEdge() {
        return this.paginator.isFirstPageDisabled || this.paginator?.isLastPageDisabled;
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(tsPath)).toContain(
                `return this.paginator.isFirstPage || this.paginator?.isLastPage;`);
        });

        it('should replace the grid `shouldGenerate` with `autoGenerate`', async () => {
            appTree.create(tsPath,
                `import { Component } from '@angular/core';
import { IgxGridComponent, IgxTreeGridComponent, IgxHierarchicalGridComponent, IgxPivotGridComponent } from 'igniteui-angular';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public grid: IgxGridComponent;
    public treeGrid: IgxTreeGridComponent;
    public hierarchicalGrid: IgxHierarchicalGridComponent;
    public pivotGrid: IgxPivotGridComponent;

    public regenerate() {
        this.grid.shouldGenerate = true;
        this.treeGrid.shouldGenerate = false;
        this.hierarchicalGrid.shouldGenerate = true;
        this.pivotGrid.shouldGenerate = false;
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(tsPath)).toContain(
                `        this.grid.autoGenerate = true;
        this.treeGrid.autoGenerate = false;
        this.hierarchicalGrid.autoGenerate = true;
        this.pivotGrid.autoGenerate = false;`);
        });

        it('should replace the carousel `top` and `bottom` indicators orientation', async () => {
            appTree.create(tsPath,
                `import { Component } from '@angular/core';
import { CarouselIndicatorsOrientation, IgxCarouselComponent } from 'igniteui-angular';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public carousel: IgxCarouselComponent;
    public orientation = CarouselIndicatorsOrientation.bottom;
    public other = { top: 1, bottom: 2 };

    public toggle() {
        this.carousel.indicatorsOrientation = CarouselIndicatorsOrientation.top;
        this.carousel.indicatorsOrientation = 'bottom';
        return this.other.top + this.other.bottom;
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            const content = tree.readContent(tsPath);
            expect(content).toContain(`public orientation = CarouselIndicatorsOrientation.end;`);
            expect(content).toContain(`this.carousel.indicatorsOrientation = CarouselIndicatorsOrientation.start;`);
            expect(content).toContain(`this.carousel.indicatorsOrientation = 'end';`);
            expect(content).toContain(`return this.other.top + this.other.bottom;`);
        });

        it('should replace the icon service `registerFamilyAlias` with `setFamily`', async () => {
            appTree.create(tsPath,
                `import { Component, inject } from '@angular/core';
import { IgxIconService } from 'igniteui-angular';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    private iconService = inject(IgxIconService);

    constructor() {
        this.iconService.registerFamilyAlias('material');
        this.iconService.registerFamilyAlias('fa', 'fa-solid');
        this.iconService.registerFamilyAlias('custom', 'custom-icons', 'liga');
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            const content = tree.readContent(tsPath);
            expect(content).toContain(`this.iconService.setFamily('material', { className: 'material', type: 'font' });`);
            expect(content).toContain(`this.iconService.setFamily('fa', { className: 'fa-solid', type: 'font' });`);
            expect(content).toContain(`this.iconService.setFamily('custom', { className: 'custom-icons', type: 'liga' });`);
        });

        it('should apply the `registerFamilyAlias` defaults and leave calls with unsafe arguments', async () => {
            appTree.create(tsPath,
                `import { Component, inject } from '@angular/core';
import { IgxIconService } from 'igniteui-angular';

const FA_CLASS = 'fa-solid';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    private iconService = inject(IgxIconService);
    private className: string | undefined;

    constructor() {
        this.iconService.registerFamilyAlias('material', undefined, undefined);
        this.iconService.registerFamilyAlias('fa', FA_CLASS);
        this.iconService.registerFamilyAlias(this.getAlias());
        this.iconService.registerFamilyAlias('custom', this.className);
        this.iconService.registerFamilyAlias('a').registerFamilyAlias('b');
    }

    private getAlias() {
        return 'alias';
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            const content = tree.readContent(tsPath);
            expect(content).toContain(`this.iconService.setFamily('material', { className: 'material', type: 'font' });`);
            expect(content).toContain(`this.iconService.setFamily('fa', { className: FA_CLASS, type: 'font' });`);
            expect(content).toContain(`this.iconService.registerFamilyAlias(this.getAlias());`);
            expect(content).toContain(`this.iconService.registerFamilyAlias('custom', this.className);`);
            expect(content).toContain(`this.iconService.registerFamilyAlias('a').registerFamilyAlias('b');`);
        });

        it('should migrate removed members used in the receiver and arguments of a migrated call', async () => {
            appTree.create(tsPath,
                `import { Component } from '@angular/core';
import { FilteringExpressionsTree, IRowToggleEventArgs } from 'igniteui-angular';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public tree: FilteringExpressionsTree;

    public onRowToggle(event: IRowToggleEventArgs) {
        return this.tree.find(event.rowID);
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(tsPath)).toContain(`return ExpressionsTreeUtil.find(this.tree, event.rowKey);`);
        });

        it('should turn a type-only ExpressionsTreeUtil import into a value import', async () => {
            const createComponent = (imports: string) => `import { Component } from '@angular/core';
${imports}

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public tree: FilteringExpressionsTree;

    public getFilter() {
        return this.tree.find('ID');
    }
}`;
            appTree.create(tsPath, createComponent(
                `import { type ExpressionsTreeUtil, FilteringExpressionsTree } from 'igniteui-angular';`));
            let tree = await schematicRunner.runSchematic(migrationName, {}, appTree);
            expect(tree.readContent(tsPath)).toContain(
                `import { ExpressionsTreeUtil, FilteringExpressionsTree } from 'igniteui-angular';`);

            appTree.overwrite(tsPath, createComponent(
                `import type { ExpressionsTreeUtil, FilteringExpressionsTree } from 'igniteui-angular';`));
            tree = await schematicRunner.runSchematic(migrationName, {}, appTree);
            let content = tree.readContent(tsPath);
            expect(content).toContain(`import type { FilteringExpressionsTree } from 'igniteui-angular';
import { ExpressionsTreeUtil } from 'igniteui-angular';`);
            expect(content).toContain(`return ExpressionsTreeUtil.find(this.tree, 'ID');`);

            appTree.overwrite(tsPath, createComponent(
                `import type { ExpressionsTreeUtil } from 'igniteui-angular';
import type { FilteringExpressionsTree } from 'igniteui-angular';`));
            tree = await schematicRunner.runSchematic(migrationName, {}, appTree);
            content = tree.readContent(tsPath);
            expect(content).toContain(`import { ExpressionsTreeUtil } from 'igniteui-angular';
import type { FilteringExpressionsTree } from 'igniteui-angular';`);
        });

        it('should replace the filtering expressions tree `find` and `findIndex` with ExpressionsTreeUtil', async () => {
            appTree.create(tsPath,
                `import { Component } from '@angular/core';
import { FilteringExpressionsTree, IgxGridComponent } from 'igniteui-angular';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public grid: IgxGridComponent;
    public tree: FilteringExpressionsTree;

    public getFilters() {
        const index = this.tree.findIndex('Name');
        const names = ['Name'].find(n => n === 'Name');
        return [this.grid.filteringExpressionsTree.find('ID'), index, names];
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            const content = tree.readContent(tsPath);
            expect(content).toContain(`import { FilteringExpressionsTree, IgxGridComponent, ExpressionsTreeUtil } from 'igniteui-angular';`);
            expect(content).toContain(`const index = ExpressionsTreeUtil.findIndex(this.tree, 'Name');`);
            expect(content).toContain(`const names = ['Name'].find(n => n === 'Name');`);
            expect(content).toContain(`return [ExpressionsTreeUtil.find(this.grid.filteringExpressionsTree, 'ID'), index, names];`);
        });

        it('should add an ExpressionsTreeUtil import when there is no named import to extend', async () => {
            appTree.create(tsPath,
                `import { Component } from '@angular/core';
import type { IFilteringExpressionsTree } from 'igniteui-angular/core';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public hasFilter(tree: IFilteringExpressionsTree) {
        return tree.findIndex('ID') > -1 || !!tree.find('Name');
    }
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            const content = tree.readContent(tsPath);
            expect(content).toContain(`import type { IFilteringExpressionsTree } from 'igniteui-angular/core';
import { ExpressionsTreeUtil } from 'igniteui-angular/core';`);
            expect(content).toContain(
                `return ExpressionsTreeUtil.findIndex(tree, 'ID') > -1 || !!ExpressionsTreeUtil.find(tree, 'Name');`);
        });

        it('should leave the members with no replacement in place', async () => {
            const content = `import { Component } from '@angular/core';
import { IgxGridComponent, IgxStringFilteringOperand } from 'igniteui-angular';

@Component({
    selector: 'app-test',
    template: ''
})
export class TestComponent {
    public grid: IgxGridComponent;

    public filter(value: string) {
        this.grid.filterGlobal(value, IgxStringFilteringOperand.instance().condition('contains'));
    }
}`;
            appTree.create(tsPath, content);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(tsPath)).toEqual(content);
        });
    });

    describe('Sass', () => {
        it('should replace the removed global theme mixins with the theme mixin', async () => {
            appTree.create(scssPath,
                `@use 'igniteui-angular/theming' as *;

@include light-theme($my-palette);
.dark {
    @include dark-theme($my-palette, $exclude: (igx-grid), $roundness: 0);
}
.bootstrap {
    @include bootstrap-light-theme($palette: $my-palette, $elevation: false);
}
.bootstrap-dark {
    @include bootstrap-dark-theme($my-palette, (igx-avatar));
}
.fluent {
    @include fluent-light-theme(
        $palette: $my-palette,
        $roundness: 1
    );
}
.fluent-dark {
    @include fluent-dark-theme($my-palette);
}
.indigo {
    @include indigo-light-theme($my-palette);
}
.indigo-dark {
    @include indigo-dark-theme($palette: palette($primary: #09f, $secondary: #e41c77));
}`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(scssPath)).toEqual(
                `@use 'igniteui-angular/theming' as *;

@include theme($palette: $my-palette, $schema: $light-material-schema);
.dark {
    @include theme($palette: $my-palette, $schema: $dark-material-schema, $exclude: (igx-grid), $roundness: 0);
}
.bootstrap {
    @include theme($palette: $my-palette, $schema: $light-bootstrap-schema, $elevation: false);
}
.bootstrap-dark {
    @include theme($palette: $my-palette, $schema: $dark-bootstrap-schema, $exclude: (igx-avatar));
}
.fluent {
    @include theme(
        $palette: $my-palette,
        $schema: $light-fluent-schema,
        $roundness: 1
    );
}
.fluent-dark {
    @include theme($palette: $my-palette, $schema: $dark-fluent-schema);
}
.indigo {
    @include theme($palette: $my-palette, $schema: $light-indigo-schema, $elevations: $indigo-elevations);
}
.indigo-dark {
    @include theme($palette: palette($primary: #09f, $secondary: #e41c77), $schema: $dark-indigo-schema, $elevations: $indigo-elevations);
}`);
        });

        it('should replace the removed global theme mixins used through a namespace', async () => {
            appTree.create(scssPath,
                `@use '@infragistics/igniteui-angular/theming' as igx;

@include igx.indigo-light-theme(igx.$light-indigo-palette);
@include igx.light-theme(igx.$light-palette);`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(scssPath)).toEqual(
                `@use '@infragistics/igniteui-angular/theming' as igx;

@include igx.theme($palette: igx.$light-indigo-palette, $schema: igx.$light-indigo-schema, $elevations: igx.$indigo-elevations);
@include igx.theme($palette: igx.$light-material-palette, $schema: igx.$light-material-schema);`);
        });

        it('should not replace mixins that are not the library ones', async () => {
            const content = `@use 'igniteui-angular/theming' as igx;
@use 'my-themes' as *;

@mixin light-theme($palette) {
    color: red;
}
@include light-theme($my-palette);
.fin-dark-theme {
    @include dark-theme($my-palette);
}`;
            appTree.create(scssPath, content);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(scssPath)).toEqual(content);
        });

        it('should replace the removed palette variables', async () => {
            appTree.create(scssPath,
                `@use 'igniteui-angular/theming' as *;

@include theme($light-palette);
.dark {
    @include theme($palette: $dark-palette, $schema: $dark-material-schema);
}
$primary: color($default-palette, 'primary');
$my-light-palette-copy: $light-palette;`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(scssPath)).toEqual(
                `@use 'igniteui-angular/theming' as *;

@include theme($light-material-palette);
.dark {
    @include theme($palette: $dark-material-palette, $schema: $dark-material-schema);
}
$primary: color($light-material-palette, 'primary');
$my-light-palette-copy: $light-material-palette;`);
        });

        it('should not migrate Sass strings and comments', async () => {
            appTree.create(scssPath,
                `@use 'igniteui-angular/theming' as *;

// $light-palette: palette($primary: #09f, $secondary: #e41c77);
// @include light-theme($light-palette);
/* @include dark-theme($dark-palette); */
.note::after {
    content: '$light-palette and @include light-theme($palette)';
}
.label::before {
    content: "#{$default-palette}";
}
@include theme($light-palette);`);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(scssPath)).toEqual(
                `@use 'igniteui-angular/theming' as *;

// $light-palette: palette($primary: #09f, $secondary: #e41c77);
// @include light-theme($light-palette);
/* @include dark-theme($dark-palette); */
.note::after {
    content: '$light-palette and @include light-theme($palette)';
}
.label::before {
    content: "#{$light-material-palette}";
}
@include theme($light-material-palette);`);
        });

        it('should not replace palette variables declared by the application', async () => {
            const content = `@use 'igniteui-angular/theming' as *;

$light-palette: palette($primary: #09f, $secondary: #e41c77, $surface: #fff);
$dark-palette-variant: $dark-material-palette;

@include theme($light-palette);`;
            appTree.create(scssPath, content);
            const otherPath = '/testSrc/appPrefix/component/other.component.scss';
            const otherContent = `@use 'my-palettes' as *;

@include my-theme($dark-palette);`;
            appTree.create(otherPath, otherContent);

            const tree = await schematicRunner.runSchematic(migrationName, {}, appTree);

            expect(tree.readContent(scssPath)).toEqual(content);
            expect(tree.readContent(otherPath)).toEqual(otherContent);
        });
    });
});
