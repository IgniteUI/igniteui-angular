import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { By } from '@angular/platform-browser';
import {
    IgxGridLiteComponent,
    IgxGridLiteDataPipelineConfiguration,
    IgxGridLiteFilteringExpression,
    IgxGridLiteSortingExpression,
    IgxGridLiteSortingOptions
} from './grid-lite.component';
import {
    IgxGridLiteColumnComponent,
    IgxGridLiteCellTemplateDirective,
    IgxGridLiteHeaderTemplateDirective,
    IgxGridLiteColumnConfiguration,
    IgxGridLiteColumnSortConfiguration
} from './grid-lite-column.component';

describe('IgxGridLiteComponent', () => {
    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                IgxGridLiteComponent,
                IgxGridLiteColumnComponent
            ]
        }).compileComponents();
    }));

    describe('Basic', () => {
        it('should initialize grid with data and columns', async () => {
            const fixture = TestBed.createComponent(BasicGridComponent);
            fixture.detectChanges();
            await setUp(fixture);
            fixture.detectChanges();

            const gridElement = fixture.debugElement.query(By.directive(IgxGridLiteComponent));
            expect(gridElement).toBeTruthy();

            const columnElements = fixture.debugElement.queryAll(By.directive(IgxGridLiteColumnComponent));
            expect(columnElements.length).toBe(3);
        });

        it('should render grid with auto-generate enabled', async () => {
            const fixture = TestBed.createComponent(GridComponentAutogenerate);
            fixture.detectChanges();
            await setUp(fixture);
            fixture.detectChanges();

            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            expect(gridElement).toBeTruthy();
            expect(gridElement.autoGenerate).toBeTrue();
            expect(gridElement.columns.length).toBe(5);
        });

        it('should update grid data when data input changes', async () => {
            const fixture = TestBed.createComponent(BasicGridComponent);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const newData: TestData[] = [
                { id: 99, name: 'Z', active: true, importance: 'high', address: { city: 'Boston', code: 2101 } }
            ];
            fixture.componentInstance.data = newData;
            fixture.detectChanges();
            await fixture.whenStable();

            expect(gridComponent.dataView.length).toBe(1);
            expect(gridComponent.rows.length).toBe(1);
        });

        it('should update sortingExpressions model and emit sorted output when sorted event fires', async () => {
            const fixture = TestBed.createComponent(BasicGridComponent);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            const sortedSpy = jasmine.createSpy('sorted');

            gridElement.addEventListener('sorted', sortedSpy);
            expect(gridComponent.sortingExpressions()).toEqual([]);

            // Simulate the web component emitting the sorted event
            const expressions: IgxGridLiteSortingExpression<TestData>[] = [
                { key: 'name', direction: 'ascending' }
            ];
            gridElement.sortingExpressions = expressions;
            gridElement.dispatchEvent(new CustomEvent('sorted', { detail: expressions }));
            fixture.detectChanges();

            expect(sortedSpy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: expressions }));
            expect(gridComponent.sortingExpressions().length).toBe(1);
            expect(gridComponent.sortingExpressions()[0].key).toBe('name');

            gridComponent.sortingExpressions.set([]);
            fixture.detectChanges();
            expect(gridElement.sortingExpressions).toEqual([]);
        });

        it('should update filteringExpressions model and emit filtered output when filtered event fires', async () => {
            const fixture = TestBed.createComponent(BasicGridComponent);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            const filteredSpy = jasmine.createSpy('filtered');

            gridElement.addEventListener('filtered', filteredSpy);
            expect(gridComponent.filteringExpressions()).toEqual([]);

            // Simulate the web component emitting the filtered event
            const expressions: IgxGridLiteFilteringExpression<TestData>[] = [
                { key: 'active', condition: 'true', searchTerm: true }
            ];
            gridElement.filterExpressions = expressions;
            gridElement.dispatchEvent(new CustomEvent('filtered', { detail: expressions }));
            fixture.detectChanges();

            expect(filteredSpy).toHaveBeenCalledOnceWith(jasmine.objectContaining({ detail: expressions }));
            expect(gridComponent.filteringExpressions().length).toBe(1);
            expect(gridComponent.filteringExpressions()[0].key).toBe('active');

            gridComponent.filteringExpressions.set([]);
            fixture.detectChanges();
            expect(gridElement.filterExpressions).toEqual([]);
        });

        it('should set the adopt-root-styles attribute on the host element', async () => {
            const fixture = TestBed.createComponent(BasicGridComponent);
            fixture.detectChanges();
            await setUp(fixture);

            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            expect(gridElement.hasAttribute('adopt-root-styles')).toBeTrue();
            expect(gridElement.adoptRootStyles).toBeTrue();
        });

        it('should expose the column configuration through the columns getter', async () => {
            const fixture = TestBed.createComponent(BasicGridComponent);
            fixture.detectChanges();
            await setUp(fixture);

            const columns = fixture.componentInstance.grid().columns;
            expect(columns.map(c => c.field)).toEqual(['id', 'name', 'active']);
            expect(columns.map(c => c.header)).toEqual(['ID', 'Name', 'Active']);
            expect(columns.map(c => c.dataType)).toEqual(['number', 'string', 'boolean']);
        });

        it('should fall back to empty collections when the underlying element returns no state', async () => {
            const fixture = TestBed.createComponent(BasicGridComponent);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            spyOnProperty(gridElement, 'columns', 'get').and.returnValue(undefined);
            spyOnProperty(gridElement, 'rows', 'get').and.returnValue(undefined);
            spyOnProperty(gridElement, 'dataView', 'get').and.returnValue(undefined);

            expect(gridComponent.columns).toEqual([]);
            expect(gridComponent.rows).toEqual([]);
            expect(gridComponent.dataView).toEqual([]);
        });

        it('should reset the expression models to empty arrays when the element reports no state on sorted/filtered', async () => {
            const fixture = TestBed.createComponent(BasicGridComponent);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            gridComponent.sortingExpressions.set([{ key: 'id', direction: 'ascending' }]);
            gridComponent.filteringExpressions.set([{ key: 'active', condition: 'true' }]);
            fixture.detectChanges();

            spyOnProperty(gridElement, 'sortingExpressions', 'get').and.returnValue(undefined);
            spyOnProperty(gridElement, 'filterExpressions', 'get').and.returnValue(undefined);
            gridElement.dispatchEvent(new CustomEvent('sorted'));
            gridElement.dispatchEvent(new CustomEvent('filtered'));

            expect(gridComponent.sortingExpressions()).toEqual([]);
            expect(gridComponent.filteringExpressions()).toEqual([]);

            // the empty models match the (missing) element state, so nothing is re-applied
            const clearSortSpy = spyOn(gridElement, 'clearSort').and.callThrough();
            const clearFilterSpy = spyOn(gridElement, 'clearFilter').and.callThrough();
            fixture.detectChanges();
            expect(clearSortSpy).not.toHaveBeenCalled();
            expect(clearFilterSpy).not.toHaveBeenCalled();
        });
    });

    describe('Inputs', () => {
        it('should pass the default sorting options to the grid element', async () => {
            const fixture = TestBed.createComponent(BasicGridComponent);
            fixture.detectChanges();
            await setUp(fixture);

            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            expect(fixture.componentInstance.grid().sortingOptions()).toEqual({ mode: 'multiple' });
            expect(gridElement.sortingOptions).toEqual({ mode: 'multiple' });
        });

        it('should keep multiple sort expressions when sorting from the UI in multiple mode', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.detectChanges();
            await setUp(fixture);

            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            await sortFromHeader(gridElement, 0);
            await sortFromHeader(gridElement, 1);
            fixture.detectChanges();

            expect(gridElement.sortingExpressions.map((e: IgxGridLiteSortingExpression<TestData>) => e.key)).toEqual(['id', 'name']);
            expect(fixture.componentInstance.sortingState.map(e => e.key)).toEqual(['id', 'name']);
        });

        it('should keep a single sort expression when sorting from the UI in single mode', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.componentInstance.sortingOptions = { mode: 'single' };
            fixture.detectChanges();
            await setUp(fixture);

            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            expect(gridElement.sortingOptions).toEqual({ mode: 'single' });

            await sortFromHeader(gridElement, 0);
            await sortFromHeader(gridElement, 1);
            fixture.detectChanges();

            expect(gridElement.sortingExpressions.map((e: IgxGridLiteSortingExpression<TestData>) => e.key)).toEqual(['name']);
            expect(fixture.componentInstance.sortingState.map(e => e.key)).toEqual(['name']);
        });

        it('should transform a string autoGenerate attribute to a boolean', async () => {
            const fixture = TestBed.createComponent(GridComponentAutogenerateAttribute);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            expect(gridComponent.autoGenerate()).toBeTrue();
            expect(gridComponent.columns.map(c => c.field)).toEqual(['id', 'name', 'active', 'importance', 'address']);
        });

        it('should use the sort and filter hooks of the dataPipelineConfiguration', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            const filterHook = jasmine.createSpy('filter').and.callFake(({ data }) => Promise.resolve(data.filter((r: TestData) => r.importance === 'high')));
            const sortHook = jasmine.createSpy('sort').and.callFake(({ data }) => [...data].reverse());
            fixture.componentInstance.pipeline = { filter: filterHook, sort: sortHook };
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            gridComponent.sort({ key: 'id', direction: 'ascending' });
            await settle(fixture);

            expect(gridElement.dataPipelineConfiguration).toBe(fixture.componentInstance.pipeline);
            expect(filterHook).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'filter', grid: gridElement }));
            expect(sortHook).toHaveBeenCalledWith(jasmine.objectContaining({ type: 'sort', grid: gridElement }));
            expect(gridComponent.dataView.map(r => r.id)).toEqual([8, 5]);
        });
    });

    describe('Public API', () => {
        let fixture: ComponentFixture<GridComponentFeatures>;
        let gridComponent: IgxGridLiteComponent<TestData>;
        let gridElement: any;

        beforeEach(async () => {
            fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.detectChanges();
            await setUp(fixture);
            gridComponent = fixture.componentInstance.grid();
            gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
        });

        it('should sort the data view through the sort method', async () => {
            gridComponent.sort({ key: 'id', direction: 'descending' });
            await settle(fixture);

            expect(gridComponent.dataView.map(r => r.id)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
            expect(gridElement.sortingExpressions.length).toBe(1);
            expect(gridElement.sortingExpressions[0]).toEqual(jasmine.objectContaining({ key: 'id', direction: 'descending' }));
        });

        it('should sort by multiple expressions through the sort method', async () => {
            gridComponent.sort([
                { key: 'importance', direction: 'ascending' },
                { key: 'id', direction: 'descending' }
            ]);
            await settle(fixture);

            expect(gridElement.sortingExpressions.map((e: IgxGridLiteSortingExpression<TestData>) => e.key)).toEqual(['importance', 'id']);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([8, 5, 7, 4, 2, 6, 3, 1]);
        });

        it('should clear a single column sort through the clearSort method', async () => {
            gridComponent.sort([
                { key: 'importance', direction: 'ascending' },
                { key: 'id', direction: 'descending' }
            ]);
            await settle(fixture);

            gridComponent.clearSort('importance');
            await settle(fixture);

            expect(gridElement.sortingExpressions.map((e: IgxGridLiteSortingExpression<TestData>) => e.key)).toEqual(['id']);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
        });

        it('should clear all sorting through the clearSort method', async () => {
            gridComponent.sort([
                { key: 'importance', direction: 'ascending' },
                { key: 'id', direction: 'descending' }
            ]);
            await settle(fixture);

            gridComponent.clearSort();
            await settle(fixture);

            expect(gridElement.sortingExpressions).toEqual([]);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        });

        it('should filter the data view through the filter method', async () => {
            gridComponent.filter({ key: 'active', condition: 'true' });
            await settle(fixture);

            expect(gridComponent.dataView.map(r => r.id)).toEqual([3, 5, 7, 8]);
            expect(gridElement.filterExpressions.length).toBe(1);
            expect(gridElement.filterExpressions[0].key).toBe('active');
        });

        it('should filter by multiple expressions through the filter method', async () => {
            gridComponent.filter([
                { key: 'active', condition: 'true' },
                { key: 'name', condition: 'equals', searchTerm: 'c' }
            ]);
            await settle(fixture);

            expect(gridComponent.dataView.map(r => r.id)).toEqual([3, 7]);
            expect(gridElement.filterExpressions.map((e: IgxGridLiteFilteringExpression<TestData>) => e.key)).toEqual(['active', 'name']);
        });

        it('should ignore filter expressions for columns not present in the grid', async () => {
            gridComponent.filter({ key: 'importance', condition: 'equals', searchTerm: 'high' });
            await settle(fixture);

            expect(gridComponent.dataView.length).toBe(8);
            expect(gridElement.filterExpressions).toEqual([]);
        });

        it('should clear a single column filter through the clearFilter method', async () => {
            gridComponent.filter([
                { key: 'active', condition: 'true' },
                { key: 'name', condition: 'equals', searchTerm: 'c' }
            ]);
            await settle(fixture);

            gridComponent.clearFilter('name');
            await settle(fixture);

            expect(gridElement.filterExpressions.map((e: IgxGridLiteFilteringExpression<TestData>) => e.key)).toEqual(['active']);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([3, 5, 7, 8]);
        });

        it('should clear all filtering through the clearFilter method', async () => {
            gridComponent.filter([
                { key: 'active', condition: 'true' },
                { key: 'name', condition: 'equals', searchTerm: 'c' }
            ]);
            await settle(fixture);

            gridComponent.clearFilter();
            await settle(fixture);

            expect(gridElement.filterExpressions).toEqual([]);
            expect(gridComponent.dataView.length).toBe(8);
        });

        it('should return a column configuration by field or index through the getColumn method', () => {
            expect(gridComponent.getColumn('name')).toEqual(jasmine.objectContaining({ field: 'name', header: 'Name' }));
            expect(gridComponent.getColumn(0)).toEqual(jasmine.objectContaining({ field: 'id', header: 'ID' }));
            expect(gridComponent.getColumn('importance')).toBeUndefined();
            expect(gridComponent.getColumn(10)).toBeUndefined();
        });

        it('should navigate to and activate a cell through navigateTo with options', async () => {
            await gridComponent.navigateTo(2, { column: 'name', activate: true });
            await settle(fixture);

            const cell = getRow(gridComponent, 2).cells.find(c => c.column.field === 'name');
            expect(cell.active).toBeTrue();
            expect(getActiveCells(gridComponent).length).toBe(1);
        });

        it('should navigate to and activate a cell through the deprecated navigateTo signature', async () => {
            await gridComponent.navigateTo(1, 'id', true);
            await settle(fixture);

            const cell = getRow(gridComponent, 1).cells.find(c => c.column.field === 'id');
            expect(cell.active).toBeTrue();
            expect(getActiveCells(gridComponent).length).toBe(1);
        });

        it('should not activate a cell when navigating without activation', async () => {
            await gridComponent.navigateTo(3, { column: 'active' });
            await settle(fixture);

            expect(getActiveCells(gridComponent).length).toBe(0);
        });

        it('should forward navigateTo arguments to the grid element', async () => {
            const navigateSpy = spyOn(gridElement, 'navigateTo').and.resolveTo();

            await gridComponent.navigateTo(4, { column: 'name', activate: true });
            expect(navigateSpy).toHaveBeenCalledWith(4, { column: 'name', activate: true }, undefined);

            await gridComponent.navigateTo(5, 'id', false);
            expect(navigateSpy).toHaveBeenCalledWith(5, 'id', false);
        });
    });

    describe('Two-way binding', () => {
        it('should apply initial sorting and filtering expressions bound from the parent', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.componentInstance.sortingState = [{ key: 'id', direction: 'descending' }];
            fixture.componentInstance.filterState = [{ key: 'active', condition: 'true' }];
            fixture.detectChanges();
            await setUp(fixture);
            await settle(fixture);

            const gridComponent = fixture.componentInstance.grid();
            expect(gridComponent.dataView.map(r => r.id)).toEqual([8, 7, 5, 3]);
        });

        it('should re-apply sorting when the parent updates the bound sortingExpressions', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            fixture.componentInstance.sortingState = [{ key: 'id', direction: 'descending' }];
            fixture.detectChanges();
            await settle(fixture);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);

            fixture.componentInstance.sortingState = [{ key: 'name', direction: 'ascending' }];
            fixture.detectChanges();
            await settle(fixture);
            expect(gridElement.sortingExpressions.map((e: IgxGridLiteSortingExpression<TestData>) => e.key)).toEqual(['name']);
            expect(gridComponent.dataView.map(r => r.name)).toEqual(['A', 'a', 'B', 'b', 'C', 'c', 'D', 'd']);
        });

        it('should re-apply filtering when the parent updates the bound filteringExpressions', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            fixture.componentInstance.filterState = [{ key: 'active', condition: 'true' }];
            fixture.detectChanges();
            await settle(fixture);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([3, 5, 7, 8]);

            fixture.componentInstance.filterState = [{ key: 'id', condition: 'greaterThan', searchTerm: 6 }];
            fixture.detectChanges();
            await settle(fixture);
            expect(gridElement.filterExpressions.map((e: IgxGridLiteFilteringExpression<TestData>) => e.key)).toEqual(['id']);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([7, 8]);
        });

        it('should not reset the grid state when setting empty expressions over an empty state', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.detectChanges();
            await setUp(fixture);

            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            const clearSortSpy = spyOn(gridElement, 'clearSort').and.callThrough();
            const clearFilterSpy = spyOn(gridElement, 'clearFilter').and.callThrough();

            fixture.componentInstance.sortingState = [];
            fixture.componentInstance.filterState = [];
            fixture.detectChanges();

            expect(clearSortSpy).not.toHaveBeenCalled();
            expect(clearFilterSpy).not.toHaveBeenCalled();
        });

        it('should update the parent sortingExpressions when sorting from the UI', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');

            await sortFromHeader(gridElement, 0);
            fixture.detectChanges();
            expect(fixture.componentInstance.sortingState).toEqual([jasmine.objectContaining({ key: 'id', direction: 'ascending' })]);

            await sortFromHeader(gridElement, 0);
            fixture.detectChanges();
            await settle(fixture);
            expect(fixture.componentInstance.sortingState).toEqual([jasmine.objectContaining({ key: 'id', direction: 'descending' })]);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);

            await sortFromHeader(gridElement, 0);
            fixture.detectChanges();
            await settle(fixture);
            expect(fixture.componentInstance.sortingState).toEqual([]);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
        });

        it('should update the parent filteringExpressions when a filtered event fires', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');

            gridComponent.filter({ key: 'active', condition: 'true' });
            await settle(fixture);
            gridElement.dispatchEvent(new CustomEvent('filtered', { detail: { key: 'active', state: gridElement.filterExpressions } }));
            fixture.detectChanges();
            await settle(fixture);

            expect(fixture.componentInstance.filterState.length).toBe(1);
            expect(fixture.componentInstance.filterState[0].key).toBe('active');
            expect(gridComponent.dataView.map(r => r.id)).toEqual([3, 5, 7, 8]);
        });

        it('should not re-apply the sort state or re-run the data pipeline after sorting from the UI', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            const sortHook = jasmine.createSpy('sort').and.callFake(({ data }) => data);
            fixture.componentInstance.pipeline = { sort: sortHook };
            fixture.detectChanges();
            await setUp(fixture);
            await settle(fixture);

            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            const clearSortSpy = spyOn(gridElement, 'clearSort').and.callThrough();
            const sortSpy = spyOn(gridElement, 'sort').and.callThrough();
            sortHook.calls.reset();

            await sortFromHeader(gridElement, 0);
            fixture.detectChanges();
            await settle(fixture);

            expect(fixture.componentInstance.sortingState).toEqual([jasmine.objectContaining({ key: 'id', direction: 'ascending' })]);
            expect(clearSortSpy).not.toHaveBeenCalled();
            expect(sortSpy).not.toHaveBeenCalled();
            expect(sortHook).toHaveBeenCalledTimes(1);
        });

        it('should not re-apply the filter state or re-run the data pipeline after a filtered event', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            const filterHook = jasmine.createSpy('filter').and.callFake(({ data }) => data);
            fixture.componentInstance.pipeline = { filter: filterHook };
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            gridComponent.filter({ key: 'active', condition: 'true' });
            await settle(fixture);

            const clearFilterSpy = spyOn(gridElement, 'clearFilter').and.callThrough();
            const filterSpy = spyOn(gridElement, 'filter').and.callThrough();
            filterHook.calls.reset();

            // the grid emits `filtered` once a UI filter operation has been applied to its state
            gridElement.dispatchEvent(new CustomEvent('filtered', { detail: { key: 'active', state: gridElement.filterExpressions } }));
            fixture.detectChanges();
            await settle(fixture);

            expect(fixture.componentInstance.filterState).toEqual([jasmine.objectContaining({ key: 'active' })]);
            expect(clearFilterSpy).not.toHaveBeenCalled();
            expect(filterSpy).not.toHaveBeenCalled();
            expect(filterHook).not.toHaveBeenCalled();
        });

        it('should not re-apply expressions bound from the parent that match the current grid state', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            gridComponent.sort({ key: 'id', direction: 'descending' });
            gridComponent.filter({ key: 'active', condition: 'true' });
            await settle(fixture);

            const clearSortSpy = spyOn(gridElement, 'clearSort').and.callThrough();
            const clearFilterSpy = spyOn(gridElement, 'clearFilter').and.callThrough();

            // new array and object instances holding the same state as the grid
            fixture.componentInstance.sortingState = gridElement.sortingExpressions;
            fixture.componentInstance.filterState = gridElement.filterExpressions;
            fixture.detectChanges();
            await settle(fixture);

            expect(clearSortSpy).not.toHaveBeenCalled();
            expect(clearFilterSpy).not.toHaveBeenCalled();
            expect(gridComponent.dataView.map(r => r.id)).toEqual([8, 7, 5, 3]);
        });

        it('should re-apply expressions bound from the parent that differ from the current grid state', async () => {
            const fixture = TestBed.createComponent(GridComponentFeatures);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            gridComponent.sort({ key: 'id', direction: 'descending' });
            await settle(fixture);

            // same key, different direction
            fixture.componentInstance.sortingState = gridElement.sortingExpressions.map(
                (e: IgxGridLiteSortingExpression<TestData>) => ({ ...e, direction: 'ascending' })
            );
            fixture.detectChanges();
            await settle(fixture);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);

            // same expressions, different priority order
            gridComponent.sort({ key: 'active', direction: 'ascending' });
            await settle(fixture);
            const reordered = [...gridElement.sortingExpressions].reverse();
            fixture.componentInstance.sortingState = reordered;
            fixture.detectChanges();
            await settle(fixture);
            expect(gridElement.sortingExpressions.map((e: IgxGridLiteSortingExpression<TestData>) => e.key)).toEqual(['active', 'id']);
            expect(gridComponent.dataView.map(r => r.id)).toEqual([1, 2, 4, 6, 3, 5, 7, 8]);
        });
    });

    describe('Column configuration', () => {
        it('should pass all column inputs to the grid column configuration', async () => {
            const fixture = TestBed.createComponent(GridComponentColumnInputs);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            const column = gridComponent.getColumn('name');
            expect(column).toEqual(jasmine.objectContaining({
                field: 'name',
                header: 'Name',
                dataType: 'string',
                width: '250px',
                hidden: false,
                resizable: true,
                sortable: true,
                sortingCaseSensitive: true,
                filterable: true,
                filteringCaseSensitive: true
            }));
            expect(column.sortConfiguration).toBe(fixture.componentInstance.sortConfiguration);

            const idColumn = gridComponent.getColumn('id');
            expect(idColumn).toEqual(jasmine.objectContaining({
                dataType: 'number',
                hidden: true,
                resizable: false,
                sortable: false,
                sortingCaseSensitive: false,
                filterable: false,
                filteringCaseSensitive: false
            }));
            expect(idColumn.width).toBeUndefined();
            expect(idColumn.sortConfiguration).toBeUndefined();
        });

        it('should use the string data type by default', async () => {
            const fixture = TestBed.createComponent(GridComponentColumnInputs);
            fixture.detectChanges();
            await setUp(fixture);

            expect(fixture.componentInstance.grid().getColumn('active').dataType).toBe('string');
        });

        it('should update the column configuration when column inputs change', async () => {
            const fixture = TestBed.createComponent(GridComponentColumnInputs);
            fixture.detectChanges();
            await setUp(fixture);

            fixture.componentInstance.idHidden = false;
            fixture.componentInstance.nameHeader = 'Full name';
            fixture.componentInstance.nameWidth = '300px';
            fixture.detectChanges();
            await settle(fixture);

            const gridComponent = fixture.componentInstance.grid();
            expect(gridComponent.getColumn('id').hidden).toBeFalse();
            expect(gridComponent.getColumn('name').header).toBe('Full name');
            expect(gridComponent.getColumn('name').width).toBe('300px');
        });

        it('should not render hidden columns', async () => {
            const fixture = TestBed.createComponent(GridComponentColumnInputs);
            fixture.detectChanges();
            await setUp(fixture);

            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            const headerRow = gridElement.renderRoot.querySelector('igc-grid-lite-header-row');
            expect(headerRow.headers.map((h: any) => h.column.field)).toEqual(['name', 'active']);
            expect(fixture.componentInstance.grid().rows[0].cells.map(c => c.column.field)).toEqual(['name', 'active']);
        });

        it('should apply the column sortConfiguration comparer when sorting', async () => {
            const fixture = TestBed.createComponent(GridComponentColumnInputs);
            fixture.detectChanges();
            await setUp(fixture);

            const gridComponent = fixture.componentInstance.grid();
            gridComponent.sort({ key: 'name', direction: 'ascending' });
            await settle(fixture);

            expect(fixture.componentInstance.comparer).toHaveBeenCalled();
            expect(gridComponent.dataView.map(r => r.name)).toEqual(['d', 'c', 'b', 'a', 'D', 'C', 'B', 'A']);
        });

        it('should render a filter row only when a column is filterable', async () => {
            const filterableFixture = TestBed.createComponent(GridComponentColumnInputs);
            filterableFixture.detectChanges();
            await setUp(filterableFixture);
            const filterableGrid = filterableFixture.nativeElement.querySelector('igx-grid-lite');
            expect(filterableGrid.renderRoot.querySelector('igc-grid-lite-filter-row')).toBeTruthy();

            const basicFixture = TestBed.createComponent(BasicGridComponent);
            basicFixture.detectChanges();
            await setUp(basicFixture);
            const basicGrid = basicFixture.nativeElement.querySelector('igx-grid-lite');
            expect(basicGrid.renderRoot.querySelector('igc-grid-lite-filter-row')).toBeNull();
        });
    });

    describe('Templates', () => {

        function get(element: any, selector: string) {
            return element.renderRoot.querySelector(selector);
        }

        it('should render custom header and cell templates when set as inputs', async () => {
            const fixture = TestBed.createComponent(GridComponentTemplate);
            fixture.detectChanges();

            await setUp(fixture);
            fixture.detectChanges();
            const gridComponent: IgxGridLiteComponent<TestData> = fixture.componentInstance.grid();


            // Check header template
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            const headerRow = get(gridElement, 'igc-grid-lite-header-row');
            const headerCell = headerRow.headers.at(0);
            const headerText = get(headerCell, '[part~="title"]').innerText;
            expect(headerText).toEqual('Name (Custom)');

            // check cell template
            const cell = gridComponent.rows[0].cells[1];
            const content = get(cell, 'span').innerText;
            expect(content).toEqual('No');
        });

        it('should render custom header and cell templates when set as a column child', async () => {
            const fixture = TestBed.createComponent(GridComponentTemplate);
            fixture.detectChanges();
            await setUp(fixture);
            fixture.detectChanges();
            const gridComponent: IgxGridLiteComponent<TestData> = fixture.componentInstance.grid();


            // Check header template
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
            const headerRow = get(gridElement, 'igc-grid-lite-header-row');
            const headerCell = headerRow.headers.at(2);
            const headerText = get(headerCell, '[part~="title"]').innerText;
            expect(headerText).toEqual('Importance (Custom Inline)');

            // check cell template
            const cell = gridComponent.rows[0].cells[3];
            const content = get(cell, 'span').innerText;
            expect(content).toEqual('New York, 10001');
        });

        it('should expose the full cell context to cell templates', async () => {
            const fixture = TestBed.createComponent(GridComponentTemplate);
            fixture.detectChanges();
            await setUp(fixture);
            fixture.detectChanges();
            const gridComponent: IgxGridLiteComponent<TestData> = fixture.componentInstance.grid();

            const cell = gridComponent.rows[1].cells[4];
            expect(get(cell, 'span').innerText).toEqual('importance: low (row B)');
        });

        it('should reuse the header template view when the header re-renders', async () => {
            const fixture = TestBed.createComponent(GridComponentTemplate);
            fixture.detectChanges();
            await setUp(fixture);
            fixture.detectChanges();
            const gridComponent: IgxGridLiteComponent<TestData> = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');

            const headerTitle = get(get(gridElement, 'igc-grid-lite-header-row').headers.at(0), '[part~="title"] div');
            expect(headerTitle.innerText).toEqual('Name (Custom)');

            // sorting re-renders the headers and calls the header template function again
            gridComponent.sort({ key: 'name', direction: 'descending' });
            await settle(fixture);

            const rerenderedTitle = get(get(gridElement, 'igc-grid-lite-header-row').headers.at(0), '[part~="title"] div');
            expect(rerenderedTitle).toBe(headerTitle);
            expect(rerenderedTitle.innerText).toEqual('Name (Custom)');
        });

        it('should reuse cell template views per data record and update their context', async () => {
            const fixture = TestBed.createComponent(GridComponentTemplate);
            fixture.detectChanges();
            await setUp(fixture);
            fixture.detectChanges();
            const gridComponent: IgxGridLiteComponent<TestData> = fixture.componentInstance.grid();

            const record = fixture.componentInstance.data[0];
            const initialSpan = get(gridComponent.rows[0].cells[1], 'span');
            expect(initialSpan.innerText).toEqual('No');

            // mutate the record in place and rebind a new data array holding the same record reference
            record.active = true;
            fixture.componentInstance.data = [...fixture.componentInstance.data];
            fixture.detectChanges();
            await settle(fixture);
            fixture.detectChanges();

            const updatedSpan = get(gridComponent.rows[0].cells[1], 'span');
            expect(updatedSpan.innerText).toEqual('Yes');
            expect(gridComponent.rows[0].data).toBe(record);
        });

        it('should render the reused cell template views in the new order after sorting', async () => {
            const fixture = TestBed.createComponent(GridComponentTemplate);
            fixture.detectChanges();
            await setUp(fixture);
            fixture.detectChanges();
            const gridComponent: IgxGridLiteComponent<TestData> = fixture.componentInstance.grid();

            gridComponent.sort({ key: 'active', direction: 'descending' });
            await settle(fixture);
            fixture.detectChanges();

            const values = gridComponent.rows.map(row => get(row.cells[1], 'span').innerText);
            expect(values).toEqual(['Yes', 'Yes', 'Yes', 'Yes', 'No', 'No', 'No', 'No']);
            const addresses = gridComponent.rows.map(row => get(row.cells[3], 'span').innerText);
            expect(addresses[0]).toEqual(`${gridComponent.dataView[0].address.city}, ${gridComponent.dataView[0].address.code}`);
        });

        it('should destroy old views and use the new template when the templates change', async () => {
            const fixture = TestBed.createComponent(GridComponentTemplate);
            fixture.detectChanges();
            await setUp(fixture);
            fixture.detectChanges();
            const gridComponent: IgxGridLiteComponent<TestData> = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');

            const oldHeader = get(get(gridElement, 'igc-grid-lite-header-row').headers.at(0), '[part~="title"] div');
            const oldCell = get(gridComponent.rows[0].cells[1], 'span');
            expect(oldHeader.isConnected).toBeTrue();
            expect(oldCell.isConnected).toBeTrue();

            fixture.componentInstance.useAltTemplates = true;
            fixture.detectChanges();
            await settle(fixture);
            fixture.detectChanges();

            expect(oldHeader.isConnected).toBeFalse();
            expect(oldCell.isConnected).toBeFalse();

            const newHeader = get(get(gridElement, 'igc-grid-lite-header-row').headers.at(0), '[part~="title"] div');
            expect(newHeader.innerText).toEqual('Name (Alt)');
            expect(get(gridComponent.rows[0].cells[1], 'span').innerText).toEqual('Alt: false');
        });

        it('should destroy the template views when the grid is destroyed', async () => {
            const fixture = TestBed.createComponent(GridComponentTemplate);
            fixture.detectChanges();
            await setUp(fixture);
            fixture.detectChanges();
            const gridComponent: IgxGridLiteComponent<TestData> = fixture.componentInstance.grid();
            const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');

            const header = get(get(gridElement, 'igc-grid-lite-header-row').headers.at(0), '[part~="title"] div');
            const cell = get(gridComponent.rows[0].cells[1], 'span');

            fixture.destroy();

            expect(header.isConnected).toBeFalse();
            expect(cell.isConnected).toBeFalse();
        });

        it('should narrow the template context through the template context guards', () => {
            const ctx = { $implicit: 'value' };
            expect(IgxGridLiteHeaderTemplateDirective.ngTemplateContextGuard(null, ctx)).toBeTrue();
            expect(IgxGridLiteCellTemplateDirective.ngTemplateContextGuard(null, ctx)).toBeTrue();
        });
    });
});


type Importance = 'low' | 'medium' | 'high';
interface TestData {
    id: number;
    name: string;
    active: boolean;
    importance: Importance;
    address: {
        city: string;
        code: number;
    };
}

@Component({
    template: `
        <igx-grid-lite [data]="data" #grid [autoGenerate]="shouldAutoGenerate">
            @for(column of columns; track column.field) {
                <igx-grid-lite-column
                    [field]="column.field"
                    [header]="column.header"
                    [dataType]="column.dataType"
                >
                </igx-grid-lite-column>
            }
        </igx-grid-lite>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridLiteComponent, IgxGridLiteColumnComponent]
})
class BasicGridComponent {
    public grid = viewChild<IgxGridLiteComponent<TestData>>('grid');
    public data: TestData[] = [
        {
            id: 1,
            name: 'A',
            active: false,
            importance: 'medium',
            address: { city: 'New York', code: 10001 },
        },
        {
            id: 2,
            name: 'B',
            active: false,
            importance: 'low',
            address: { city: 'Los Angeles', code: 90001 },
        },
        {
            id: 3,
            name: 'C',
            active: true,
            importance: 'medium',
            address: { city: 'Chicago', code: 60601 },
        },
        {
            id: 4,
            name: 'D',
            active: false,
            importance: 'low',
            address: { city: 'New York', code: 10002 },
        },
        { id: 5, name: 'a', active: true, importance: 'high', address: { city: 'Chicago', code: 60602 } },
        {
            id: 6,
            name: 'b',
            active: false,
            importance: 'medium',
            address: { city: 'Los Angeles', code: 90002 },
        },
        { id: 7, name: 'c', active: true, importance: 'low', address: { city: 'New York', code: 10003 } },
        { id: 8, name: 'd', active: true, importance: 'high', address: { city: 'Chicago', code: 60603 } },
    ];
    public columns: IgxGridLiteColumnConfiguration<TestData>[] = [
        { field: 'id', header: 'ID', dataType: 'number' },
        { field: 'name', header: 'Name', dataType: 'string' },
        { field: 'active', header: 'Active', dataType: 'boolean' }
    ]
    public shouldAutoGenerate = true;
}

@Component({
    template: `
        <igx-grid-lite [data]="data" #grid [autoGenerate]="shouldAutoGenerate">
        </igx-grid-lite>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridLiteComponent, IgxGridLiteColumnComponent]
})
class GridComponentAutogenerate extends BasicGridComponent {
    public override shouldAutoGenerate = true;
    public override columns = [];
}


@Component({
    template: `
        <igx-grid-lite [data]="data" #grid [autoGenerate]="shouldAutoGenerate">
            <igx-grid-lite-column [field]="'name'" [header]="'Name'" [headerTemplate]="useAltTemplates ? altHeaderTemplate : headerTemplate"></igx-grid-lite-column>
            <igx-grid-lite-column [field]="'active'" [header]="'Active'" [cellTemplate]="useAltTemplates ? altBodyTemplate : bodyTemplate"></igx-grid-lite-column>
            <igx-grid-lite-column [field]="'importance'" [header]="'Importance'">
                <ng-template igxGridLiteHeader let-column>
                    <div>{{column.header}} (Custom Inline)</div>
                </ng-template>
            </igx-grid-lite-column>
            <igx-grid-lite-column [field]="'address'" [header]="'Full address'">
                <ng-template igxGridLiteCell let-value>
                    <span>{{value.city}}, {{value.code}}</span>
                </ng-template>
            </igx-grid-lite-column>
            <igx-grid-lite-column [field]="'id'" [header]="'Context'">
                <ng-template igxGridLiteCell let-column="column" let-row="row">
                    <span>importance: {{row.data.importance}} (row {{row.data.name}})</span>
                </ng-template>
            </igx-grid-lite-column>

            <ng-template igxGridLiteHeader let-column #headerTemplate>
                <div>{{column.header}} (Custom)</div>
            </ng-template>

            <ng-template igxGridLiteCell let-value let-column="column" #bodyTemplate>
                @if (value === true) {
                    <span>Yes</span>
                } @else {
                    <span>No</span>
                }
            </ng-template>

            <ng-template igxGridLiteHeader let-column #altHeaderTemplate>
                <div>{{column.header}} (Alt)</div>
            </ng-template>

            <ng-template igxGridLiteCell let-value #altBodyTemplate>
                <span>Alt: {{value}}</span>
            </ng-template>
        </igx-grid-lite>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridLiteComponent, IgxGridLiteColumnComponent, IgxGridLiteCellTemplateDirective, IgxGridLiteHeaderTemplateDirective]
})
class GridComponentTemplate extends BasicGridComponent {
    public useAltTemplates = false;
}

@Component({
    template: `
        <igx-grid-lite [data]="data" autoGenerate #grid>
        </igx-grid-lite>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridLiteComponent]
})
class GridComponentAutogenerateAttribute extends BasicGridComponent {
}

@Component({
    template: `
        <igx-grid-lite #grid
            [data]="data"
            [sortingOptions]="sortingOptions"
            [dataPipelineConfiguration]="pipeline"
            [(sortingExpressions)]="sortingState"
            [(filteringExpressions)]="filterState">
            <igx-grid-lite-column field="id" header="ID" [dataType]="'number'" sortable></igx-grid-lite-column>
            <igx-grid-lite-column field="name" header="Name" sortable></igx-grid-lite-column>
            <igx-grid-lite-column field="active" header="Active" [dataType]="'boolean'" sortable></igx-grid-lite-column>
        </igx-grid-lite>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridLiteComponent, IgxGridLiteColumnComponent]
})
class GridComponentFeatures extends BasicGridComponent {
    public sortingOptions: IgxGridLiteSortingOptions = { mode: 'multiple' };
    public pipeline: IgxGridLiteDataPipelineConfiguration<TestData>;
    public sortingState: IgxGridLiteSortingExpression<TestData>[] = [];
    public filterState: IgxGridLiteFilteringExpression<TestData>[] = [];
}

@Component({
    template: `
        <igx-grid-lite [data]="data" #grid>
            <igx-grid-lite-column field="id" [dataType]="'number'" [hidden]="idHidden"></igx-grid-lite-column>
            <igx-grid-lite-column
                field="name"
                [header]="nameHeader"
                [width]="nameWidth"
                [sortConfiguration]="sortConfiguration"
                resizable
                sortable
                sortingCaseSensitive
                filterable
                filteringCaseSensitive
            ></igx-grid-lite-column>
            <igx-grid-lite-column field="active"></igx-grid-lite-column>
        </igx-grid-lite>
    `,
    standalone: true,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridLiteComponent, IgxGridLiteColumnComponent]
})
class GridComponentColumnInputs extends BasicGridComponent {
    public idHidden = true;
    public nameHeader = 'Name';
    public nameWidth = '250px';
    /** Reverse code point order to make the custom comparer observable in the result. */
    public comparer = jasmine.createSpy('comparer').and.callFake((a: string, b: string) => a < b ? 1 : a > b ? -1 : 0);
    public sortConfiguration: IgxGridLiteColumnSortConfiguration<TestData> = { comparer: this.comparer };
}

async function setUp(fixture: ComponentFixture<any>) {
    await customElements.whenDefined('igx-grid-lite');

    const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
    const gridBody = gridElement?.renderRoot.querySelector('igc-grid-lite-virtualizer');
    if (gridBody?.updateComplete) {
        await gridBody.updateComplete;
    }
}

/** Waits for the grid data pipeline and the rendering of the rows to complete. */
async function settle(fixture: ComponentFixture<any>) {
    const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
    await gridElement._pipelineComplete;
    const virtualizer = gridElement.renderRoot.querySelector('igc-grid-lite-virtualizer');
    await virtualizer?.updateComplete;
    await new Promise(resolve => requestAnimationFrame(resolve));
    await Promise.all(gridElement.rows.map((row: any) => row.updateComplete));
    await Promise.all(gridElement.rows.flatMap((row: any) => row.cells.map((cell: any) => cell.updateComplete)));
    const headerRow = gridElement.renderRoot.querySelector('igc-grid-lite-header-row');
    await headerRow?.updateComplete;
    await Promise.all((headerRow?.headers ?? []).map((header: any) => header.updateComplete));
}

/** Clicks the sort action of the header at the given index and waits for the `sorted` event. */
async function sortFromHeader(gridElement: any, index: number) {
    const sorted = new Promise(resolve => gridElement.addEventListener('sorted', resolve, { once: true }));
    const header = gridElement.renderRoot.querySelector('igc-grid-lite-header-row').headers.at(index);
    header.renderRoot.querySelector('[part~="action"]').click();
    await sorted;
}

function getRow(grid: IgxGridLiteComponent<TestData>, index: number) {
    return grid.rows.find(row => row.index === index);
}

function getActiveCells(grid: IgxGridLiteComponent<TestData>) {
    return grid.rows.flatMap(row => row.cells).filter(cell => cell.active);
}
