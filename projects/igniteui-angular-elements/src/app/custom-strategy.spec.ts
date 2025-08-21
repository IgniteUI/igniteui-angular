import { IgxColumnComponent, IgxGridComponent, IgxHierarchicalGridComponent } from 'igniteui-angular';
import { html } from 'lit';
import { firstValueFrom, fromEvent, skip, timer } from 'rxjs';
import { ComponentRefKey, IgcNgElement } from './custom-strategy';
import hgridData from '../assets/data/projects-hgrid.js';
import { SampleTestData } from 'igniteui-angular/src/lib/test-utils/sample-test-data.spec';
import {
    IgcGridComponent,
    IgcHierarchicalGridComponent,
    IgcPivotGridComponent,
    IgcColumnComponent,
    IgcPaginatorComponent,
    IgcGridStateComponent,
    IgcColumnLayoutComponent,
} from './components';
import { defineComponents } from '../utils/register';

/**
 * Wait for all elements to be fully initialized and their query updates to complete
 * @param elements Array of IgcNgElement instances to wait for
 * @param timeoutMs Optional timeout in milliseconds (default: 5000)
 */
async function waitForElementsReady(elements: IgcNgElement[], timeoutMs: number = 5000): Promise<void> {
    const timeout = timer(timeoutMs).toPromise();
    const initPromises = elements.map(async (element) => {
        try {
            // Wait for component ref to be ready
            await element.ngElementStrategy[ComponentRefKey];
            // Wait for any pending query updates
            if (typeof (element.ngElementStrategy as any).waitForQueryUpdates === 'function') {
                await (element.ngElementStrategy as any).waitForQueryUpdates();
            }
        } catch (error) {
            // Element might not have the strategy or methods, just continue
            console.warn('Element initialization warning:', error);
        }
    });
    
    await Promise.race([
        Promise.all(initPromises),
        timeout.then(() => { throw new Error(`Elements initialization timed out after ${timeoutMs}ms`); })
    ]);
}

/**
 * Wait for a single element to be fully initialized and its query updates to complete
 * @param element IgcNgElement instance to wait for
 * @param timeoutMs Optional timeout in milliseconds (default: 5000)
 */
async function waitForElementReady(element: IgcNgElement, timeoutMs: number = 5000): Promise<void> {
    await waitForElementsReady([element], timeoutMs);
}

describe('Elements: ', () => {
    let testContainer: HTMLDivElement;

    beforeAll(async () =>{
        defineComponents(
            IgcGridComponent,
            IgcHierarchicalGridComponent,
            IgcPivotGridComponent,
            IgcColumnComponent,
            IgcColumnLayoutComponent,
            IgcPaginatorComponent,
            IgcGridStateComponent,
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

            // Wait for both elements to be fully initialized and query updates to complete
            await waitForElementsReady([gridEl, columnEl]);

            const gridComponent = (await gridEl.ngElementStrategy[ComponentRefKey]).instance as IgxGridComponent;
            const columnComponent = (await columnEl.ngElementStrategy[ComponentRefKey]).instance as IgxColumnComponent;
            expect(gridComponent.columnList.toArray()).toContain(columnComponent);

            columnEl.remove();
            // Wait for the query update after removal
            await (gridEl.ngElementStrategy as any).waitForQueryUpdates();
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

            // Wait for grid and column to be fully initialized
            await waitForElementsReady([gridEl as unknown as IgcNgElement, columnEl]);

            // sigh (。﹏。*)
            (gridEl as any).toggleRow('1');
            await waitForElementReady(gridEl as unknown as IgcNgElement);

            let detailGrid = document.querySelector<IgcNgElement>('#child1');
            expect(detailGrid).toBeDefined();
            let detailGridComponent = (await detailGrid?.ngElementStrategy[ComponentRefKey])?.instance as IgxGridComponent;
            expect(detailGridComponent).toBeDefined();

            // close and re-expand row detail:
            (gridEl as any).toggleRow('1');
            await waitForElementReady(gridEl as unknown as IgcNgElement);
            (gridEl as any).toggleRow('1');
            await waitForElementReady(gridEl as unknown as IgcNgElement);

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

            // Wait for all elements to be fully initialized and query updates to complete
            await waitForElementsReady([hgridEl, columnProjectId, columnName, columnStartDate]);

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

            // First grid template eval (includes pipes, not a fixed time) projects child nodes and attach them back to the DOM.
            // That sets up the paginator and runs another template w/ pipes, rendered won't do, so wait for second data changed
            await firstValueFrom(fromEvent(gridEl, 'dataChanged').pipe(skip(1)));

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

            // Wait for all elements to be fully initialized and query updates to complete
            await waitForElementsReady([gridEl as unknown as IgcNgElement, columnID as unknown as IgcNgElement, columnName as unknown as IgcNgElement]);

            const header = document.getElementsByTagName("igx-grid-header").item(0) as HTMLElement;
            expect(header.innerText).toEqual('Templated ProductID');
        });

        it(`should initialize pivot grid with state persistence component`, async () => {
            const gridEl = document.createElement("igc-pivot-grid");

            const stateComponent = document.createElement("igc-grid-state");

            gridEl.appendChild(stateComponent);

            testContainer.appendChild(gridEl);

            // Wait for all elements to be fully initialized and query updates to complete
            await waitForElementsReady([gridEl as unknown as IgcNgElement, stateComponent as unknown as IgcNgElement]);
            expect(() => stateComponent.getStateAsString()).not.toThrow();
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
            const thirdGroup = document.querySelector<IgcNgElement>('igc-column-layout[header="Product Stock"]');
            const secondGroup = document.querySelector<IgcNgElement>('igc-column-layout[header="Product Details"]');
            
            // Wait for all elements to be fully initialized
            const allElements = [grid, thirdGroup, secondGroup, ...Array.from(document.querySelectorAll<IgcNgElement>('igc-column'))];
            await waitForElementsReady(allElements.filter(el => el) as IgcNgElement[]);

            expect(grid.columns.length).toEqual(8);
            expect(grid.getColumnByName('ProductID')).toBeTruthy();
            expect(grid.getColumnByVisibleIndex(1).field).toEqual('ProductName');

            grid.removeChild(secondGroup);
            // Wait for query updates after removal
            await (grid.ngElementStrategy as any).waitForQueryUpdates();

            expect(grid.columns.length).toEqual(4);
            expect(grid.getColumnByName('ProductID')).toBeTruthy();
            expect(grid.getColumnByVisibleIndex(1).field).toEqual('InStock');

            // TODO: secondGroup can't be re-used
            const newGroup = document.createElement('igc-column-layout');
            const newColumn = document.createElement('igc-column');
            newColumn.setAttribute('field', 'ProductName');
            newGroup.appendChild(newColumn);
            grid.insertBefore(newGroup, thirdGroup);
            // Wait for new elements to be initialized and query updates to complete
            await waitForElementsReady([newGroup as unknown as IgcNgElement, newColumn as unknown as IgcNgElement]);

            expect(grid.columns.length).toEqual(6);
            expect(grid.getColumnByVisibleIndex(1).field).toEqual('ProductName');
        });
    });
});
