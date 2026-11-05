import { IgxStringFilteringOperand, SortingDirection } from 'igniteui-angular';
import { firstValueFrom, timer } from 'rxjs';
import { SampleTestData } from 'igniteui-angular/test-utils/sample-test-data.spec';
import { ComponentRefKey, IgcNgElement } from '../app/custom-strategy';
import { IgcColumnComponent, IgcGridComponent, IgcGridStateComponent } from '../app/components';
import { defineComponents } from '../utils/register';
import { IgxGridComponent } from './grids/grid.component';
import { IGridStateInfo, IgxGridStateComponent } from './state.component';
import { describe, beforeAll, beforeEach, afterEach, it, expect } from 'vitest';

describe('Elements: Grid state component', () => {
    let testContainer: HTMLDivElement;
    let gridEl: IgcNgElement & InstanceType<typeof IgcGridComponent>;
    let stateEl: IgcNgElement & InstanceType<typeof IgcGridStateComponent>;
    let grid: IgxGridComponent;
    let state: IgxGridStateComponent;

    const sortingState = () => [{ fieldName: 'ProductID', dir: SortingDirection.Desc, ignoreCase: false }];

    beforeAll(() => {
        defineComponents(IgcGridComponent, IgcColumnComponent, IgcGridStateComponent);
    });

    beforeEach(async () => {
        testContainer = document.createElement('div');
        document.body.appendChild(testContainer);
        testContainer.innerHTML = `
            <igc-grid id="testGrid" primary-key="ProductID">
                <igc-column field="ProductID" sortable="true"></igc-column>
                <igc-column field="ProductName" filterable="true"></igc-column>
                <igc-grid-state></igc-grid-state>
            </igc-grid>`;
        gridEl = testContainer.querySelector('#testGrid') as any;
        stateEl = testContainer.querySelector('igc-grid-state') as any;
        grid = (await gridEl.ngElementStrategy[ComponentRefKey]).instance;
        state = (await stateEl.ngElementStrategy[ComponentRefKey]).instance;
        gridEl.data = SampleTestData.foodProductData();
        // TODO: Better way to wait - potentially expose the queue or observable for update on the strategy
        await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 4));
    });

    afterEach(() => {
        document.body.removeChild(testContainer);
    });

    it('should be bound to its parent grid', () => {
        expect(state.grid).toBe(grid);
    });

    it('should get the state of all features by default', () => {
        grid.sort(sortingState());

        const gridState = stateEl.getState();

        expect(gridState.sorting).toMatchObject(sortingState());
        expect(gridState.columns.map(c => c.field)).toEqual(['ProductID', 'ProductName']);
        expect(gridState.filtering).toBeDefined();
        expect(gridState.rowSelection).toBeDefined();
    });

    it('should get the state of only the requested features', () => {
        grid.sort(sortingState());

        expect(Object.keys(stateEl.getState('sorting'))).toEqual(['sorting']);
        expect(Object.keys(stateEl.getState(['sorting', 'columns'])).sort()).toEqual(['columns', 'sorting']);

        const serialized = stateEl.getStateAsString(['sorting']);
        expect(JSON.parse(serialized)).toEqual({ sorting: sortingState() });
        expect(Object.keys(JSON.parse(stateEl.getStateAsString())).length).toBeGreaterThan(1);
    });

    it('should apply state of all or only of the requested features', () => {
        const gridState: IGridStateInfo = {
            sorting: sortingState(),
            moving: false
        };

        stateEl.applyState(gridState, ['moving']);
        expect(grid.sortingExpressions).toEqual([]);
        expect(grid.moving).toBe(false);

        stateEl.applyState(gridState);
        expect(grid.sortingExpressions).toMatchObject(sortingState());
        expect(grid.dataView[0].ProductID).toBe(Math.max(...gridEl.data.map(x => x.ProductID)));
    });

    it('should emit stateParsed when applying state from string and apply modifications to the parsed state', async () => {
        const parsedStates: IGridStateInfo[] = [];
        stateEl.addEventListener('stateParsed', (e: CustomEvent<IGridStateInfo>) => {
            parsedStates.push(structuredClone(e.detail));
            e.detail.sorting[0].dir = SortingDirection.Asc;
        });

        stateEl.applyStateFromString(JSON.stringify({ sorting: sortingState() }));

        expect(parsedStates).toEqual([{ sorting: sortingState() }]);
        expect(grid.sortingExpressions[0].dir).toBe(SortingDirection.Asc);

        grid.clearSort();
        stateEl.applyStateFromString(JSON.stringify({ sorting: sortingState(), moving: true }), 'moving');
        expect(grid.sortingExpressions).toEqual([]);
        expect(grid.moving).toBe(true);
    });

    it('should serialize Set search values of filtering expressions as arrays', () => {
        const condition = IgxStringFilteringOperand.instance().condition('in');
        grid.filter('ProductName', new Set(['Chai', 'Chang']), condition);

        const serialized = JSON.parse(stateEl.getStateAsString(['filtering']));
        const expression = serialized.filtering.filteringOperands[0].filteringOperands[0];

        expect(expression.searchVal).toEqual(['Chai', 'Chang']);
    });

    it('should omit externalObject values when serializing', () => {
        const callback = (key: string, value: any) => (state as any).stringifyCallback(key, value);
        const set = new Set([1, 2]);

        expect(callback('externalObject', { some: 'value' })).toBeUndefined();
        expect(callback('searchVal', set)).toEqual([1, 2]);
        expect(callback('searchVal', 'text')).toBe('text');
        expect(callback('other', set)).toBe(set);
    });

    it('should apply the state through the element API from a grid in another container', async () => {
        const otherContainer = document.createElement('div');
        document.body.appendChild(otherContainer);
        try {
            otherContainer.innerHTML = `
                <igc-grid primary-key="ProductID">
                    <igc-column field="ProductID" sortable="true"></igc-column>
                    <igc-grid-state></igc-grid-state>
                </igc-grid>`;
            const otherGridEl = otherContainer.querySelector<IgcNgElement>('igc-grid');
            const otherStateEl = otherContainer.querySelector<IgcNgElement & InstanceType<typeof IgcGridStateComponent>>('igc-grid-state');
            const otherGrid = (await otherGridEl.ngElementStrategy[ComponentRefKey]).instance as IgxGridComponent;
            await otherStateEl.ngElementStrategy[ComponentRefKey];
            await firstValueFrom(timer(10 /* SCHEDULE_DELAY */ * 4));

            grid.sort(sortingState());
            otherStateEl.applyStateFromString(stateEl.getStateAsString(['sorting']));

            expect(otherGrid.sortingExpressions).toMatchObject(sortingState());
        } finally {
            otherContainer.remove();
        }
    });
});
