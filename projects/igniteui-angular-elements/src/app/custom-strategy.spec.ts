import { ApplicationRef } from '@angular/core';
import { IgxActionStripComponent, IgxColumnComponent, IgxGridComponent, IgxHierarchicalGridComponent, PivotGridType } from 'igniteui-angular';
import { html } from 'lit';
import { firstValueFrom, fromEvent, timer } from 'rxjs';
import { ComponentRefKey, IgcNgElement } from './custom-strategy';
import { injector } from '../utils/injector-ref';
import hgridData from '../assets/data/projects-hgrid.js';
import { SampleTestData } from 'igniteui-angular/test-utils/sample-test-data.spec';
import {
    IgcGridComponent,
    IgcHierarchicalGridComponent,
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
} from './components';
import { defineComponents } from '../utils/register';

describe('Elements: ', () => {
    let testContainer: HTMLDivElement;

    beforeAll(async () =>{
        defineComponents(
            IgcGridComponent,
            IgcHierarchicalGridComponent,
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
            IgcGridToolbarHidingComponent
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
                return html`<div>
                    <igc-grid id="child${ctx.implicit.id}"></igc-grid>
                </div>`;
            }

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
            expect(detailGridComponent).toBeDefined("Detail child grid was destroyed on re-expand");
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
                args.detail.headerTemplate = (ctx) => html`<span>Templated ${args.detail.field}</span>`;
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

        it('should not destroy action strip when row it is shown in is destroyed or cached.', async() => {
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

            expect(actionStrip.hidden).toBeFalse();

            grid.data = [];
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

           // row destroyed
            expect((row.cdr as any).destroyed).toBeTrue();
            // action strip still in DOM, only hidden.
            expect(actionStrip.hidden).toBeTrue();
            expect(actionStrip.isConnected).toBeTrue();

            grid.data = SampleTestData.foodProductData();
            grid.groupBy({ fieldName: 'InStock', dir: 1, ignoreCase: false });

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            row = grid.dataRowList.toArray()[0];
            actionStrip.show(row);
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            expect(actionStrip.hidden).toBeFalse();

            // collapse all data rows, leave only groups
            grid.toggleAllGroupRows();

            // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 3));

            // row not destroyed, but also not in dom anymore
            expect((row.cdr as any).destroyed).toBeFalse();
            expect(row.element.nativeElement.isConnected).toBe(false);

             // action strip still in DOM, only hidden.
            expect(actionStrip.hidden).toBeTrue();
            expect(actionStrip.isConnected).toBeTrue();
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

            const gridEl = document.querySelector<IgcNgElement & InstanceType<typeof IgcGridComponent>>('#testGrid');

            await firstValueFrom(fromEvent(gridEl, "childrenResolved"));

            const hostViewOf = async (selector: string) =>
                (await gridEl.querySelector<IgcNgElement>(selector).ngElementStrategy[ComponentRefKey]).hostView;
            // views the ApplicationRef ticks directly; anything else is reached through its parent
            const rootViews = (injector.get(ApplicationRef) as any)._views as unknown[];

            // no element parent to attach to, so the grid stays a root
            expect(rootViews.includes((await gridEl.ngElementStrategy[ComponentRefKey]).hostView)).toBeTrue();

            for (const selector of ['igc-grid-toolbar', 'igc-grid-toolbar-title', 'igc-grid-toolbar-actions',
                'igc-grid-toolbar-hiding', 'igc-grid-toolbar-pinning', 'igc-column', 'igc-paginator']) {
                expect(rootViews.includes(await hostViewOf(selector)))
                    .withContext(`${selector} should not be attached as a separate root view`).toBeFalse();
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

            const gridEl = document.querySelector<IgcNgElement & InstanceType<typeof IgcGridComponent>>('#testGrid');

            await firstValueFrom(fromEvent(gridEl, "childrenResolved"));

            // nothing stranded next to the grid, where the insert temporarily moves elements
            expect(Array.from(testContainer.children).map(x => x.tagName)).toEqual(['IGC-GRID']);

            const toolbarEl = gridEl.querySelector<HTMLElement>('igc-grid-toolbar');
            const actionsEl = gridEl.querySelector<HTMLElement>('igc-grid-toolbar-actions');
            const paginatorEl = gridEl.querySelector<HTMLElement>('igc-paginator');

            expect(toolbarEl.parentElement).toBe(gridEl);
            expect(gridEl.querySelector<HTMLElement>('igc-grid-toolbar-title').parentElement).toBe(toolbarEl);
            expect(actionsEl.parentElement).toBe(toolbarEl);
            expect(Array.from(gridEl.querySelectorAll('igc-column')).every(x => x.parentElement === gridEl)).toBeTrue();

            // sibling order kept as authored
            expect(Array.from(actionsEl.children).map(x => x.tagName))
                .toEqual(['IGC-GRID-TOOLBAR-HIDING', 'IGC-GRID-TOOLBAR-PINNING']);

            // the paginator is projected deeper (into the footer) - that spot survives the attach too
            expect(gridEl.contains(paginatorEl)).toBeTrue();
            expect(paginatorEl.parentElement).not.toBe(gridEl);
        });

        it('should refresh a nested toolbar action when only the parent grid is marked for check', async () => {
            // nothing reaches the toolbar action here - no input, no event. It re-renders only because the
            // grid's own `notifyChanges()` reaches it through the view hierarchy.
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

            const gridEl = document.querySelector<IgcNgElement & InstanceType<typeof IgcGridComponent>>('#testGrid');

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
    });
});
