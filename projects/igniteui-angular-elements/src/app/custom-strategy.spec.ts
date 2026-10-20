import { ApplicationRef, ViewContainerRef } from '@angular/core';
import { IgxActionStripComponent, IgxColumnComponent, IgxGridComponent, IgxHierarchicalGridComponent, IgxRowIslandComponent, PivotGridType, SortingDirection } from 'igniteui-angular';
import { html } from 'lit';
import { firstValueFrom, fromEvent, timer } from 'rxjs';
import { ComponentRefKey, IgcNgElement } from './custom-strategy';
import { injector } from '../utils/injector-ref';
import hgridData from '../assets/data/projects-hgrid.js';
import { SampleTestData } from 'igniteui-angular/test-utils/sample-test-data.spec';
import {
    IgcGridComponent,
    IgcHierarchicalGridComponent,
    IgcRowIslandComponent,
    IgcPivotGridComponent,
    IgcColumnComponent,
    IgcPaginatorComponent,
    IgcGridStateComponent,
    IgcColumnLayoutComponent,
    IgcActionStripComponent,
    IgcGridEditingActionsComponent,
    IgcPivotDataSelectorComponent,
    IgcGridToolbarComponent,
    IgcGridToolbarActionsComponent,
    IgcGridToolbarTitleComponent,
    IgcGridToolbarPinningComponent,
    IgcGridToolbarHidingComponent,
    IgcTreeGridComponent,
} from './components';
import { TemplateRefWrapper } from './wrapper/template-ref-wrapper';
import { defineComponents } from '../utils/register';
import { describe, beforeAll, beforeEach, afterEach, it, expect, vi } from 'vitest';

describe('Elements: ', () => {
    let testContainer: HTMLDivElement;

    beforeAll(async () => {
        defineComponents(
            IgcGridComponent,
            IgcHierarchicalGridComponent,
            IgcRowIslandComponent,
            IgcPivotGridComponent,
            IgcPivotDataSelectorComponent,
            IgcColumnComponent,
            IgcColumnLayoutComponent,
            IgcPaginatorComponent,
            IgcGridStateComponent,
            IgcActionStripComponent,
            IgcGridEditingActionsComponent,
            IgcGridToolbarComponent,
            IgcGridToolbarActionsComponent,
            IgcGridToolbarTitleComponent,
            IgcGridToolbarPinningComponent,
            IgcGridToolbarHidingComponent,
            IgcTreeGridComponent
        );
    });

    beforeEach(async () => {
        testContainer = document.createElement('div');
        document.body.appendChild(testContainer);
    });

    afterEach(() => {
        document.body.removeChild(testContainer);
    });

    describe('IgxCustomNgElementStrategy', () => {
        // TODO: Use the config to exercise all component relations, prop handling, etc
        // OR test strategy handling with dummy test component + config
        it(`should populate parent's content query`, async () => {
            const gridEl = document.createElement("igc-grid") as any as IgcNgElement;
            testContainer.appendChild(gridEl);
            const columnEl = document.createElement("igc-column") as IgcNgElement;
            gridEl.appendChild(columnEl);

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 4));

            const gridComponent = (await gridEl.ngElementStrategy[ComponentRefKey]).instance as IgxGridComponent;
            const columnComponent = (await columnEl.ngElementStrategy[ComponentRefKey]).instance as IgxColumnComponent;
            expect(gridComponent.columnList.toArray()).toContain(columnComponent);

            columnEl.remove();
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY: DESTROY + QUERY */ * 4));
            expect(gridComponent.columnList.toArray()).toEqual([]);
        });

        it(`should keep IgcNgElement instance in template of another IgcNgElement #15678`, async () => {
            const gridEl = document.createElement("igc-grid");
            testContainer.appendChild(gridEl);
            const columnEl = document.createElement("igc-column") as IgcNgElement;
            gridEl.appendChild(columnEl);
            gridEl.primaryKey = 'id';
            gridEl.data = [{ id: '1' }];
            (gridEl as any).detailTemplate = (ctx) => {
                return html `<div>
                    <igc-grid id="child${ctx.implicit.id}"></igc-grid>
                </div>`;
            };

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));

            // sigh (。﹏。*)
            (gridEl as any).toggleRow('1');
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));

            let detailGrid = document.querySelector<IgcNgElement>('#child1');
            expect(detailGrid).toBeDefined();
            let detailGridComponent = (await detailGrid?.ngElementStrategy[ComponentRefKey])?.instance as IgxGridComponent;
            expect(detailGridComponent).toBeDefined();

            // close and re-expand row detail:
            (gridEl as any).toggleRow('1');
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));
            (gridEl as any).toggleRow('1');
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));

            detailGrid = document.querySelector<IgcNgElement>('#child1');
            expect(detailGrid).toBeDefined();
            detailGridComponent = (await detailGrid?.ngElementStrategy[ComponentRefKey])?.instance as IgxGridComponent;
            expect(detailGridComponent, "Detail child grid was destroyed on re-expand").toBeDefined();
        });
    });

    describe('Grid integration scenarios.', () => {
        it(`should populate hgrid's view initially when there are no layouts`, async () => {
            const hgridEl = document.createElement("igc-hierarchical-grid") as any as IgcNgElement;
            testContainer.appendChild(hgridEl);

            const columnProjectId = document.createElement("igc-column") as IgcNgElement;
            columnProjectId.setAttribute("field", "ProjectId");
            hgridEl.appendChild(columnProjectId);
            const columnName = document.createElement("igc-column") as IgcNgElement;
            columnName.setAttribute("field", "Name");
            hgridEl.appendChild(columnName);
            const columnStartDate = document.createElement("igc-column") as IgcNgElement;
            columnStartDate.setAttribute("field", "StartDate");
            hgridEl.appendChild(columnStartDate);

            const hgridComponent = (await hgridEl.ngElementStrategy[ComponentRefKey]).instance as IgxHierarchicalGridComponent;
            hgridComponent.data = hgridData;

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));

            expect(hgridComponent.dataView.length).toBeGreaterThan(0);
        });

        it('should register a nested row island under its parent row island', async () => {
            testContainer.innerHTML = `
            <igc-hierarchical-grid id="testHGrid" primary-key="ProjectId">
                <igc-column field="ProjectId"></igc-column>
                <igc-column field="Name"></igc-column>
                <igc-row-island id="developers" child-data-key="Developers" primary-key="DeveloperId">
                    <igc-column field="DeveloperId"></igc-column>
                    <igc-column field="Name"></igc-column>
                    <igc-row-island id="machines" child-data-key="VirtualMachines">
                        <igc-column field="VirtualMachineId"></igc-column>
                    </igc-row-island>
                </igc-row-island>
            </igc-hierarchical-grid>`;
            const hgridEl = document.querySelector<IgcNgElement>('#testHGrid');
            const hgrid = (await hgridEl.ngElementStrategy[ComponentRefKey]).instance as IgxHierarchicalGridComponent;
            const rowIsland = (await document.querySelector<IgcNgElement>('#developers').ngElementStrategy[ComponentRefKey])
                .instance as IgxRowIslandComponent;
            const nestedRowIsland = (await document.querySelector<IgcNgElement>('#machines').ngElementStrategy[ComponentRefKey])
                .instance as IgxRowIslandComponent;
            hgrid.data = hgridData;

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 4));

            expect(nestedRowIsland.parentIsland).toBe(rowIsland);
            expect(nestedRowIsland.id).toBe('igx-row-island-Developers-VirtualMachines');
            expect(nestedRowIsland.rowIslandAPI.get(nestedRowIsland.id)).toBe(nestedRowIsland);
            expect(rowIsland.rowIslandAPI.getChildRowIsland('VirtualMachines')).toBe(nestedRowIsland);
            expect(hgrid.gridAPI.getChildRowIsland('Developers')).toBe(rowIsland);
            expect(hgrid.gridAPI.getChildRowIsland('VirtualMachines')).toBeUndefined();

            hgrid.expandRow(hgridData[0].ProjectId);
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 4));
            const childGrid = hgrid.gridAPI.getChildGrids(false)[0] as IgxHierarchicalGridComponent;
            childGrid.expandRow(hgridData[0].Developers[0].DeveloperId);
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 4));
            const nestedChildGrid = childGrid.gridAPI.getChildGrids(false)[0] as IgxHierarchicalGridComponent;

            expect(nestedChildGrid.data).toBe(hgridData[0].Developers[0].VirtualMachines);
            expect(rowIsland.rowIslandAPI.getChildGrids(true)).toEqual([childGrid, nestedChildGrid]);
        });

        it(`should populate grid's view initially with paginator added`, async () => {
            const gridEl = document.createElement("igc-grid");

            const columnID = document.createElement("igc-column");
            columnID.setAttribute("field", "ProductID");
            gridEl.appendChild(columnID);
            const columnName = document.createElement("igc-column");
            columnName.setAttribute("field", "ProductName");
            gridEl.appendChild(columnName);

            const paginator = document.createElement("igc-paginator");
            paginator.setAttribute("per-page", "3");
            gridEl.appendChild(paginator);

            gridEl.data = SampleTestData.foodProductData();
            testContainer.appendChild(gridEl);

            // `childrenResolved` fires once the projected paginator is attached to the grid's
            // content query; the grid then re-renders with it on the next scheduled tick, so wait
            // for that render too rather than assuming it already happened.
            await firstValueFrom(fromEvent(gridEl, "childrenResolved"));
            await firstValueFrom(fromEvent(gridEl, "dataChanged"));

            expect(gridEl.dataView.length).toEqual(3);
            expect(paginator.totalRecords).toEqual(gridEl.data.length);
        });

        it(`should correctly apply column template when set through event`, async () => {
            const gridEl = document.createElement("igc-grid");

            const columnID = document.createElement("igc-column");
            columnID.setAttribute("field", "ProductID");
            gridEl.appendChild(columnID);
            const columnName = document.createElement("igc-column");
            columnName.setAttribute("field", "ProductName");
            gridEl.appendChild(columnName);

            gridEl.data = SampleTestData.foodProductData();
            gridEl.addEventListener("columnInit", (args: CustomEvent<any>) => {
                args.detail.headerTemplate = (ctx) => html `<span>Templated ${args.detail.field}</span>`;
            });
            testContainer.appendChild(gridEl);

            // `childrenResolved` fires once the columns are attached, the templated header is
            // rendered on the tick after that.
            await firstValueFrom(fromEvent(gridEl, "childrenResolved"));
            await firstValueFrom(fromEvent(gridEl, "dataChanged"));

            const header = document.getElementsByTagName("igx-grid-header").item(0) as HTMLElement;
            expect(header.innerText).toEqual('Templated ProductID');
        });

        it(`should initialize pivot grid with state persistence component`, async () => {
            const gridEl = document.createElement("igc-pivot-grid");

            const stateComponent = document.createElement("igc-grid-state");

            gridEl.appendChild(stateComponent);

            testContainer.appendChild(gridEl);

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));
            expect(() => stateComponent.getStateAsString()).not.toThrow();
        });

        it(`should initialize pivot grid with pivot selector`, async () => {
            const innerHtml = `
            <igc-pivot-grid id="testGrid">
            </igc-pivot-grid>
            <igc-pivot-data-selector></igc-pivot-data-selector>
            `;
            testContainer.innerHTML = innerHtml;

            const grid = document.querySelector<IgcNgElement & InstanceType<typeof IgcPivotGridComponent>>('#testGrid');
            expect(grid).toBeTruthy();
            const pivotSelector = document.querySelector<IgcNgElement & InstanceType<typeof IgcPivotDataSelectorComponent>>('igc-pivot-data-selector');
            expect(pivotSelector).toBeTruthy();
            pivotSelector!.grid = grid as PivotGridType;
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));
            grid!.data = [
                { country: 'Bulgaria', city: 'Sofia', unitsSold: 12 },
                { country: 'USA', city: 'New York', unitsSold: 20 }
            ];
            grid!.pivotConfiguration = {
                columns: [{ memberName: 'country', enabled: true }],
                rows: [{ memberName: 'city', enabled: true }],
                values: [{
                    member: 'unitsSold',
                    aggregate: {
                        key: 'SUM',
                        aggregator: (_members, data) => (data ?? []).reduce((sum, value) => sum + value.unitsSold, 0),
                        label: 'Sum'
                    },
                    enabled: true
                }]
            };
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));
            expect(pivotSelector!.querySelectorAll('igx-list-item').length).toBeGreaterThan(0);
        });

        it(`should allow manipulating projected columns through the DOM`, async () => {
            const innerHtml = `
            <igc-grid id="testGrid" primary-key="ProductID">
                <igc-column-layout header="Product ID">
                    <igc-column row-start="1" col-start="1" row-end="3" field="ProductID" header="Product ID" width="25%"></igc-column>
                </igc-column-layout>
                <igc-column-layout header="Product Details">
                    <igc-column row-start="1" col-start="1" col-end="3" field="ProductName" header="Product Name"></igc-column>
                    <igc-column row-start="2" col-start="1" col-end="2" field="CategoryName" header="Category Name" groupable="true"></igc-column>
                    <igc-column row-start="2" col-start="2" col-end="3" field="ImageUrl"></igc-column>
                </igc-column-layout>
                <igc-column-layout header="Product Stock">
                    <igc-column row-start="1" col-start="1" col-end="3" field="InStock" header="In Stock" width="25%"></igc-column>
                </igc-column-layout>
            </igc-grid>`;
            testContainer.innerHTML = innerHtml;

            const grid = document.querySelector<IgcNgElement & InstanceType<typeof IgcGridComponent>>('#testGrid');

            await firstValueFrom(fromEvent(grid, "childrenResolved"));

            const thirdGroup = document.querySelector<IgcNgElement>('igc-column-layout[header="Product Stock"]');
            const secondGroup = document.querySelector<IgcNgElement>('igc-column-layout[header="Product Details"]');

            // The custom strategy projects the DOM columns into the grid asynchronously; a fixed
            // SCHEDULE_DELAY wait is too short when grid init is slow, so poll until the column
            // count settles instead of guessing how long it takes.
            const waitForColumns = async (expected: number) => {
                for (let waited = 0; waited < 3000 && grid?.columns?.length !== expected; waited += 20) {
                    await firstValueFrom(timer(20));
                }
            };

            await waitForColumns(8);
            expect(grid.columns.length).toEqual(8);
            expect(grid.getColumnByName('ProductID')).toBeTruthy();
            expect(grid.getColumnByVisibleIndex(1).field).toEqual('ProductName');

            grid.removeChild(secondGroup);

            await firstValueFrom(fromEvent(grid, "childrenResolved"));

            expect(grid.columns.length).toEqual(4);
            expect(grid.getColumnByName('ProductID')).toBeTruthy();
            expect(grid.getColumnByVisibleIndex(1).field).toEqual('InStock');

            // TODO: secondGroup can't be re-used
            const newGroup = document.createElement('igc-column-layout');
            const newColumn = document.createElement('igc-column');
            newColumn.setAttribute('field', 'ProductName');
            newGroup.appendChild(newColumn);
            grid.insertBefore(newGroup, thirdGroup);

            await firstValueFrom(fromEvent(grid, "childrenResolved"));

            expect(grid.columns.length).toEqual(6);
            expect(grid.getColumnByVisibleIndex(1).field).toEqual('ProductName');
        });

        it('should populate action strip actionButtons content query.', async () => {
            const innerHtml = `
            <igc-grid id="testGrid" auto-generate>
            <igc-action-strip id="testStrip">
                <igc-grid-editing-actions add-row="true"></igc-grid-editing-actions>
            </igc-action-strip>
            </igc-grid>`;
            testContainer.innerHTML = innerHtml;

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            const actionStrip = document.querySelector<IgcNgElement>('#testStrip');
            const actionStripComponent = (await actionStrip.ngElementStrategy[ComponentRefKey]).instance as IgxActionStripComponent;
            // Poll until the projected action buttons populate the content query — a fixed wait is
            // too short when component init is slow.
            for (let waited = 0; waited < 3000 && actionStripComponent.actionButtons.toArray().length === 0; waited += 20) {
                await firstValueFrom(timer(20));
            }
            expect(actionStripComponent.actionButtons.toArray().length).toBeGreaterThan(0);
        });

        it('should not destroy action strip when row it is shown in is destroyed or cached.', async () => {
            const innerHtml = `
            <igc-grid id="testGrid" auto-generate>
            <igc-action-strip id="testStrip">
                <igc-grid-editing-actions add-row="true"></igc-grid-editing-actions>
            </igc-action-strip>
            </igc-grid>`;
            testContainer.innerHTML = innerHtml;

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            const grid = document.querySelector<IgcNgElement & InstanceType<typeof IgcGridComponent>>('#testGrid');
            const actionStrip = document.querySelector<IgcNgElement & InstanceType<typeof IgcActionStripComponent>>('#testStrip');
            grid.data = SampleTestData.foodProductData();

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            let row = grid.dataRowList.toArray()[0];
            actionStrip.show(row);
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            expect(actionStrip.hidden).toBe(false);

            grid.data = [];
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            // row destroyed
            expect((row.cdr as any).destroyed).toBe(true);
            // action strip still in DOM, only hidden.
            expect(actionStrip.hidden).toBe(true);
            expect(actionStrip.isConnected).toBe(true);

            grid.data = SampleTestData.foodProductData();
            grid.groupBy({ fieldName: 'InStock', dir: 1, ignoreCase: false });

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            row = grid.dataRowList.toArray()[0];
            actionStrip.show(row);
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            expect(actionStrip.hidden).toBe(false);

            // collapse all data rows, leave only groups
            grid.toggleAllGroupRows();

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            // row not destroyed, but also not in dom anymore
            expect((row.cdr as any).destroyed).toBe(false);
            expect(row.element.nativeElement.isConnected).toBe(false);

            // action strip still in DOM, only hidden.
            expect(actionStrip.hidden).toBe(true);
            expect(actionStrip.isConnected).toBe(true);
        });

        it('should attach nested elements into the parent view instead of as separate application roots', async () => {
            testContainer.innerHTML = `
            <igc-grid id="testGrid">
                <igc-grid-toolbar>
                    <igc-grid-toolbar-title>Title</igc-grid-toolbar-title>
                    <igc-grid-toolbar-actions>
                        <igc-grid-toolbar-hiding></igc-grid-toolbar-hiding>
                        <igc-grid-toolbar-pinning></igc-grid-toolbar-pinning>
                    </igc-grid-toolbar-actions>
                </igc-grid-toolbar>
                <igc-column field="ProductID"></igc-column>
                <igc-column field="ProductName"></igc-column>
                <igc-paginator per-page="5"></igc-paginator>
            </igc-grid>`;

            const gridEl = document.querySelector<IgcNgElement & InstanceType<typeof IgcGridComponent>>('#testGrid')!;

            await firstValueFrom(fromEvent(gridEl, "childrenResolved"));

            const elementOf = (selector: string) =>
                selector === 'igc-grid' ? gridEl : gridEl.querySelector<IgcNgElement>(selector);
            const hostViewOf = async (selector: string) =>
                (await (elementOf(selector))?.ngElementStrategy[ComponentRefKey])?.hostView;
            // the view container each element inserts its children's views into
            const anchorOf = async (selector: string) =>
                (await (elementOf(selector))?.ngElementStrategy[ComponentRefKey])?.injector.get(ViewContainerRef);
            // views the ApplicationRef ticks directly; anything else is reached through its parent
            const rootViews = (injector.get(ApplicationRef) as any)._views as unknown[];

            // no element parent to attach to, so the grid stays a root
            expect(rootViews.includes(await hostViewOf('igc-grid'))).toBe(true);

            // each nested element's view lives in its parent element's container, not in the app's roots
            const expectedParents = {
                'igc-grid-toolbar': 'igc-grid',
                'igc-grid-toolbar-title': 'igc-grid-toolbar',
                'igc-grid-toolbar-actions': 'igc-grid-toolbar',
                'igc-grid-toolbar-hiding': 'igc-grid-toolbar-actions',
                'igc-grid-toolbar-pinning': 'igc-grid-toolbar-actions',
                'igc-column': 'igc-grid',
                'igc-paginator': 'igc-grid'
            };

            for (const [selector, parentSelector] of Object.entries(expectedParents)) {
                const hostView = await hostViewOf(selector);
                expect(rootViews.includes(hostView), `${selector} should not be attached as a separate root view`)
                    .toBe(false);
                expect((await anchorOf(parentSelector))?.indexOf(hostView!),
                    `${selector} should be attached in the view of ${parentSelector}`)
                    .toBeGreaterThan(-1);
            }
        });

        it('should preserve the DOM position of nested elements when attaching them to the parent view', async () => {
            // the attach moves the element next to the parent's host element, so it has to be put back
            testContainer.innerHTML = `
            <igc-grid id="testGrid">
                <igc-grid-toolbar>
                    <igc-grid-toolbar-title>Title</igc-grid-toolbar-title>
                    <igc-grid-toolbar-actions>
                        <igc-grid-toolbar-hiding></igc-grid-toolbar-hiding>
                        <igc-grid-toolbar-pinning></igc-grid-toolbar-pinning>
                    </igc-grid-toolbar-actions>
                </igc-grid-toolbar>
                <igc-column field="ProductID"></igc-column>
                <igc-column field="ProductName"></igc-column>
                <igc-paginator per-page="5"></igc-paginator>
            </igc-grid>`;

            const gridEl = document.querySelector<IgcNgElement & InstanceType<typeof IgcGridComponent>>('#testGrid')!;

            await firstValueFrom(fromEvent(gridEl, "childrenResolved"));

            // nothing stranded next to the grid, where the insert temporarily moves elements
            expect(Array.from(testContainer.children).map(x => x.tagName)).toEqual(['IGC-GRID']);

            const toolbarEl = gridEl.querySelector<HTMLElement>('igc-grid-toolbar');
            const actionsEl = gridEl.querySelector<HTMLElement>('igc-grid-toolbar-actions');
            const paginatorEl = gridEl.querySelector<HTMLElement>('igc-paginator');

            expect(toolbarEl?.parentElement).toBe(gridEl);
            expect(toolbarEl?.querySelector<HTMLElement>('igc-grid-toolbar-title')?.parentElement).toBe(toolbarEl);
            expect(actionsEl?.parentElement).toBe(toolbarEl);
            expect(Array.from(gridEl?.querySelectorAll('igc-column') || []).every(x => x.parentElement === gridEl)).toBe(true);

            // sibling order kept as authored
            expect(Array.from(actionsEl?.children || []).map(x => x.tagName))
                .toEqual(['IGC-GRID-TOOLBAR-HIDING', 'IGC-GRID-TOOLBAR-PINNING']);

            // the paginator is projected deeper (into the footer) - that spot survives the attach too
            expect(gridEl?.contains(paginatorEl)).toBe(true);
            expect(paginatorEl?.parentElement).not.toBe(gridEl);
        });

        it('should refresh a nested toolbar action when only the parent grid is marked for check', async () => {
            testContainer.innerHTML = `
            <igc-grid id="testGrid">
                <igc-grid-toolbar>
                    <igc-grid-toolbar-actions>
                        <igc-grid-toolbar-pinning></igc-grid-toolbar-pinning>
                    </igc-grid-toolbar-actions>
                </igc-grid-toolbar>
                <igc-column field="ProductID"></igc-column>
                <igc-column field="ProductName"></igc-column>
            </igc-grid>`;

            const gridEl = document.querySelector<IgcNgElement & InstanceType<typeof IgcGridComponent>>('#testGrid')!;

            await firstValueFrom(fromEvent(gridEl, "childrenResolved"));

            const pinnedCount = () => gridEl.querySelector('igc-grid-toolbar-pinning span')?.textContent.trim();
            expect(pinnedCount()).toEqual('0');

            gridEl.pinColumn('ProductID');
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));
            expect(pinnedCount()).toEqual('1');

            gridEl.unpinColumn('ProductID');
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));
            expect(pinnedCount()).toEqual('0');
        });

        it('should update the UI correctly after invoking a method', async () => {
            // Regression coverage for UI updates after removing the zone.js dependency.
            const gridEl = document.createElement("igc-grid");
            const columnID = document.createElement("igc-column");
            columnID.setAttribute("field", "ProductID");
            gridEl.appendChild(columnID);
            const columnName = document.createElement("igc-column");
            columnName.setAttribute("field", "ProductName");
            gridEl.appendChild(columnName);

            gridEl.data = SampleTestData.foodProductData();
            testContainer.appendChild(gridEl);

            await firstValueFrom(fromEvent(gridEl, "childrenResolved"));
            await firstValueFrom(fromEvent(gridEl, "dataChanged"));

            const HIGHLIGHT_ACTIVE_CSS_CLASS = '.igx-highlight__active';
            gridEl.findNext("Ch", false ,false);
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));

            // verify that a cell is highlighted
            let highlightedCell = gridEl.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(highlightedCell).not.toBeNull();

            gridEl.clearSearch();
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));

            // verify that no cell is highlighted after clearing the search
            highlightedCell = gridEl.querySelector(HIGHLIGHT_ACTIVE_CSS_CLASS);
            expect(highlightedCell).toBeNull();
        });

        it('should emit columnsAutogenerated and selectedRowsChange for tree grid', async () => {
            const treeGridEl = document.createElement('igc-tree-grid') as IgcNgElement & InstanceType<typeof IgcTreeGridComponent>;
            treeGridEl.autoGenerate = true;
            treeGridEl.primaryKey = 'ID';
            treeGridEl.childDataKey = 'Employees';

            testContainer.appendChild(treeGridEl);
            await treeGridEl.ngElementStrategy[ComponentRefKey];
            const autoGenerated = firstValueFrom(fromEvent<CustomEvent>(treeGridEl, 'columnsAutogenerated'));
            // TODO: setting data before the tree grid is initialized throws with autoGenerate
            treeGridEl.data = SampleTestData.employeeSmallTreeData();

            const columns = (await autoGenerated).detail.columns as IgxColumnComponent[];
            expect(columns.map(c => c.field)).toEqual(['ID', 'Name', 'HireDate', 'Age']);

            const selectionChanged = firstValueFrom(fromEvent<CustomEvent>(treeGridEl, 'selectedRowsChange'));
            treeGridEl.selectRows([147]);
            expect((await selectionChanged).detail).toEqual([147]);
        });

        it('should emit columnsAutogenerated and selectedRowsChange for grid', async () => {
            const gridEl = document.createElement('igc-grid');
            gridEl.autoGenerate = true;
            gridEl.primaryKey = 'ProductID';
            gridEl.data = SampleTestData.foodProductData();
            const autoGenerated = firstValueFrom(fromEvent<CustomEvent>(gridEl, 'columnsAutogenerated'));

            testContainer.appendChild(gridEl);

            const columns = (await autoGenerated).detail.columns as IgxColumnComponent[];
            expect(columns.map(c => c.field)).toContain('ProductName');

            const selectionChanged = firstValueFrom(fromEvent<CustomEvent>(gridEl, 'selectedRowsChange'));
            gridEl.selectRows([1, 2]);
            expect((await selectionChanged).detail).toEqual([1, 2]);
        });
    });

    describe('Element property handling.', () => {
        let gridEl: IgcNgElement & InstanceType<typeof IgcGridComponent>;
        let grid: IgxGridComponent;

        beforeEach(async () => {
            gridEl = document.createElement('igc-grid') as IgcNgElement & InstanceType<typeof IgcGridComponent>;
            testContainer.appendChild(gridEl);
            grid = (await gridEl.ngElementStrategy[ComponentRefKey]).instance;
        });

        it('should wrap template functions in template refs and return the original function', async () => {
            const emptyTemplate = () => html`<span class="test-empty">Nothing here</span>`;

            gridEl.emptyGridTemplate = emptyTemplate as any;

            const templateRef = grid.emptyGridTemplate;
            expect(templateRef).toBeInstanceOf(TemplateRefWrapper);
            expect(gridEl.emptyGridTemplate).toBe(emptyTemplate);

            // setting the same function again should keep the same template ref
            gridEl.emptyGridTemplate = emptyTemplate as any;
            expect(grid.emptyGridTemplate).toBe(templateRef);

            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));
            expect(gridEl.querySelector('.test-empty')?.textContent).toBe('Nothing here');

            const otherTemplate = () => html`<span class="test-empty">Still nothing</span>`;
            gridEl.emptyGridTemplate = otherTemplate as any;
            expect(grid.emptyGridTemplate).not.toBe(templateRef);
            expect(gridEl.emptyGridTemplate).toBe(otherTemplate);
        });

        it('should tie Elements rendered in templates to the component lifecycle', async () => {
            gridEl.emptyGridTemplate = (() => html`<igc-paginator id="templatePaginator"></igc-paginator>`) as any;

            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 2));

            const templatePaginator = gridEl.querySelector<IgcNgElement>('#templatePaginator');
            expect(templatePaginator).toBeTruthy();
            expect((templatePaginator.ngElementStrategy as any).angularParent.instance).toBe(grid);
        });

        it('should coerce bool and numeric props', async () => {
            const columnEl = document.createElement('igc-column') as IgcNgElement & InstanceType<typeof IgcColumnComponent>;
            columnEl.setAttribute('field', 'ProductID');
            gridEl.appendChild(columnEl);
            const column = (await columnEl.ngElementStrategy[ComponentRefKey]).instance as IgxColumnComponent;

            (columnEl as any).hidden = 'true';
            expect(column.hidden).toBe(true);
            (columnEl as any).hidden = 'false';
            expect(column.hidden).toBe(false);
            (columnEl as any).hidden = '';
            expect(column.hidden).toBe(true);
            (columnEl as any).hidden = null;
            expect(column.hidden).toBe(false);

            (columnEl as any).rowStart = '2';
            expect(column.rowStart).toBe(2);
            (columnEl as any).rowStart = 'not a number';
            expect(column.rowStart).toBe('not a number');
        });

        it('should hide opened toggle components in the grid on grid scroll', () => {
            const createToggle = () => {
                const toggle = document.createElement('div') as HTMLDivElement & { hide: () => void };
                toggle.hide = vi.fn();
                gridEl.appendChild(toggle);
                return toggle;
            };
            const toggle = createToggle();
            const nonToggle = createToggle();
            const detachedToggle = createToggle();

            const scroll = () => gridEl.dispatchEvent(new CustomEvent('gridScroll'));
            const open = (el: HTMLElement, detail = {}) => el.dispatchEvent(new CustomEvent('igcOpened', { bubbles: true, detail }));

            // nothing opened, nothing to hide
            scroll();

            open(toggle);
            open(nonToggle, { owner: 'combo' });
            open(detachedToggle);
            detachedToggle.remove();
            scroll();

            expect(toggle.hide).toHaveBeenCalledTimes(1);
            expect(nonToggle.hide).not.toHaveBeenCalled();
            expect(detachedToggle.hide).not.toHaveBeenCalled();

            // opened toggles are cleared after hiding
            scroll();
            expect(toggle.hide).toHaveBeenCalledTimes(1);
        });

        it('should stop handling grid popups once the grid is destroyed', async () => {
            const toggle = document.createElement('div') as HTMLDivElement & { hide: () => void };
            toggle.hide = vi.fn();
            gridEl.appendChild(toggle);
            toggle.dispatchEvent(new CustomEvent('igcOpened', { bubbles: true, detail: {} }));

            gridEl.remove();
            await firstValueFrom(timer(10 /* DESTROY_DELAY */ * 2));
            testContainer.appendChild(toggle);
            gridEl.dispatchEvent(new CustomEvent('gridScroll'));

            expect(toggle.hide).not.toHaveBeenCalled();
        });
    });

    describe('Event args component proxies.', () => {
        let gridEl: IgcNgElement & InstanceType<typeof IgcGridComponent>;
        let strategy: any;
        let column: IgxColumnComponent;

        beforeEach(async () => {
            testContainer.innerHTML = `
            <igc-grid id="testGrid">
                <igc-column field="ProductID"></igc-column>
                <igc-column field="ProductName"></igc-column>
                <igc-paginator></igc-paginator>
            </igc-grid>`;
            gridEl = testContainer.querySelector('#testGrid') as any;
            strategy = gridEl.ngElementStrategy;
            await firstValueFrom(fromEvent(gridEl, 'childrenResolved'));
            column = gridEl.columns[0] as IgxColumnComponent;
        });

        it('should wrap components with template props in a proxy that converts templates', () => {
            const { value: proxy, hasProxies } = strategy.createProxyForComponentValue(column, 1);
            expect(hasProxies).toBe(true);
            expect(proxy).not.toBe(column);

            const headerTemplate = () => html`<span>Header</span>`;
            proxy.headerTemplate = headerTemplate;
            const templateRef = column.headerTemplate;
            expect(templateRef).toBeInstanceOf(TemplateRefWrapper);
            expect(strategy.templateWrapper.getTemplateFunction(templateRef)).toBe(headerTemplate);

            // same template function keeps the existing ref
            proxy.headerTemplate = headerTemplate;
            expect(column.headerTemplate).toBe(templateRef);

            // non-template props are set as is
            proxy.header = 'Custom header';
            expect(column.header).toBe('Custom header');
        });

        it('should replace components nested in event args objects with proxies', () => {
            const args = { column, owner: null, nested: { column } };

            const { value, hasProxies } = strategy.createProxyForComponentValue(args, 1);

            expect(hasProxies).toBe(true);
            expect(value).toBe(args);
            expect(value.owner).toBeNull();
            expect(value.column).not.toBe(column);
            expect(value.column.field).toBe(column.field);
            expect(value.nested.column).not.toBe(column);
        });

        it('should not proxy values beyond the max depth, events, arrays without components or components without template props', () => {
            const paginator = gridEl.querySelector<IgcNgElement>('igc-paginator');
            const paginatorInstance = (paginator.ngElementStrategy as any).componentRef.instance;
            const event = new Event('test');
            const deep = { a: { b: { c: { column } } } };
            const plainArray = [{ field: 'ProductID' }];

            expect(strategy.createProxyForComponentValue(column, 4)).toEqual({ value: column, hasProxies: false });
            expect(strategy.createProxyForComponentValue(event, 1)).toEqual({ value: event, hasProxies: false });
            expect(strategy.createProxyForComponentValue([], 1)).toEqual({ value: [], hasProxies: false });
            expect(strategy.createProxyForComponentValue(plainArray, 1)).toEqual({ value: plainArray, hasProxies: false });
            expect(strategy.createProxyForComponentValue(paginatorInstance, 1)).toEqual({ value: paginatorInstance, hasProxies: false });

            const { hasProxies } = strategy.createProxyForComponentValue(deep, 1);
            expect(hasProxies).toBe(false);
            expect(deep.a.b.c.column).toBe(column);
        });

        it('should only patch columnInit event args', () => {
            const args = { column };

            expect(strategy.patchOutputComponents('rendered', args)).toBe(args);
            expect(args.column).toBe(column);
            expect(strategy.patchOutputComponents('columnInit', column)).not.toBe(column);
        });
    });

    describe('Hierarchical grid integration.', () => {
        let hgridEl: IgcNgElement & InstanceType<typeof IgcHierarchicalGridComponent>;
        let rowIslandEl: IgcNgElement & InstanceType<typeof IgcRowIslandComponent>;
        let hgrid: IgxHierarchicalGridComponent;

        const waitFor = async (condition: () => boolean) => {
            for (let waited = 0; waited < 3000 && !condition(); waited += 20) {
                await firstValueFrom(timer(20));
            }
        };

        beforeEach(async () => {
            testContainer.innerHTML = `
            <igc-hierarchical-grid id="testHGrid" primary-key="ProjectId">
                <igc-column field="ProjectId"></igc-column>
                <igc-column field="Name"></igc-column>
                <igc-row-island id="developers" child-data-key="Developers" primary-key="DeveloperId" auto-generate="true">
                </igc-row-island>
            </igc-hierarchical-grid>`;
            hgridEl = testContainer.querySelector('#testHGrid');
            rowIslandEl = testContainer.querySelector('#developers');
            hgrid = (await hgridEl.ngElementStrategy[ComponentRefKey]).instance;
            await rowIslandEl.ngElementStrategy[ComponentRefKey];
            hgrid.data = hgridData;
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 4));
        });

        const expandFirstRow = async () => {
            hgrid.expandRow(hgridData[0].ProjectId);
            await waitFor(() => hgrid.gridAPI.getChildGrids(false).length > 0);
            return hgrid.gridAPI.getChildGrids(false)[0] as IgxHierarchicalGridComponent;
        };

        it('should re-emit child grid events on the row island with the child grid as owner', async () => {
            const childGrid = await expandFirstRow();
            expect(childGrid.columns.map(c => c.field)).toContain('DeveloperId');

            // events without args are re-emitted with the owner only
            const rangeSelected = firstValueFrom(fromEvent<CustomEvent>(rowIslandEl, 'rangeSelected'));
            childGrid.rangeSelected.emit();
            expect((await rangeSelected).detail).toEqual({ owner: childGrid });

            const sortingDone = firstValueFrom(fromEvent<CustomEvent>(rowIslandEl, 'sortingDone'));
            childGrid.sort({ fieldName: 'DeveloperId', dir: SortingDirection.Desc, ignoreCase: false });
            const sortingArgs = (await sortingDone).detail;
            expect(sortingArgs.owner).toBe(childGrid);
        });

        it('should emit selectedRowsChange for hierarchical grid', async () => {
            const selectionChanged = firstValueFrom(fromEvent<CustomEvent>(hgridEl, 'selectedRowsChange'));
            hgridEl.selectRows([hgridData[0].ProjectId]);

            expect((await selectionChanged).detail).toEqual([hgridData[0].ProjectId]);
        });

        it('should apply row island input changes to existing child grids', async () => {
            const childGrid = await expandFirstRow();
            expect(childGrid.allowFiltering).toBe(false);

            rowIslandEl.allowFiltering = true;
            await waitFor(() => childGrid.allowFiltering);

            expect(childGrid.allowFiltering).toBe(true);
        });

        it('should render the row island paginator template in child grids and keep it in the root paginator query', async () => {
            rowIslandEl.paginatorTemplate = (() => html`<igc-paginator per-page="2"></igc-paginator>`) as any;
            const childGrid = await expandFirstRow();

            await waitFor(() => !!childGrid.paginator && hgrid.paginatorList?.length > 0);

            const paginatorEl = childGrid.nativeElement.querySelector<IgcNgElement>('igc-paginator');
            expect(paginatorEl).toBeTruthy();
            const paginator = (await paginatorEl.ngElementStrategy[ComponentRefKey]).instance;
            expect(childGrid.paginator).toBe(paginator);
            expect(hgrid.paginatorList.toArray()).toContain(paginator);
            expect((hgridEl.ngElementStrategy as any).cachedChildComponents.get('paginatorList')).toContain(paginator);
            await waitFor(() => childGrid.dataView.length === 2);
            expect(childGrid.dataView.length).toBe(2);

            // collapsing detaches the cached child grid from the DOM, the paginator stays registered and alive
            hgrid.collapseRow(hgridData[0].ProjectId);
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 4));
            expect(paginatorEl.isConnected).toBe(false);
            expect(hgrid.paginatorList.toArray()).toContain(paginator);
            expect((paginatorEl.ngElementStrategy as any).componentRef).toBeTruthy();

            hgrid.expandRow(hgridData[0].ProjectId);
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 4));
            expect(childGrid.paginator).toBe(paginator);
        });
    });
});
