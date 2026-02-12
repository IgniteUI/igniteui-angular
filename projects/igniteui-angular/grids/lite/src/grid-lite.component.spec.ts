import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, viewChild } from '@angular/core';
import { By } from '@angular/platform-browser';
import { IgxGridLiteComponent, IgxGridLiteFilteringExpression, IgxGridLiteSortingExpression } from './grid-lite.component';
import { IgxGridLiteColumnComponent, IgxGridLiteCellTemplateDirective, IgxGridLiteHeaderTemplateDirective, IgxGridLiteColumnConfiguration } from './grid-lite-column.component';

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
    imports: [IgxGridLiteComponent, IgxGridLiteColumnComponent]
})
class GridComponentAutogenerate extends BasicGridComponent {
    public override shouldAutoGenerate = true;
    public override columns = [];
}


@Component({
    template: `
        <igx-grid-lite [data]="data" #grid [autoGenerate]="shouldAutoGenerate">
            <igx-grid-lite-column [field]="'name'" [header]="'Name'" [headerTemplate]="headerTemplate"></igx-grid-lite-column>
            <igx-grid-lite-column [field]="'active'" [header]="'Active'" [cellTemplate]="bodyTemplate"></igx-grid-lite-column>
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
        </igx-grid-lite>
    `,
    standalone: true,
    imports: [IgxGridLiteComponent, IgxGridLiteColumnComponent, IgxGridLiteCellTemplateDirective, IgxGridLiteHeaderTemplateDirective]
})
class GridComponentTemplate extends BasicGridComponent {
}

async function setUp(fixture: ComponentFixture<any>) {
    await customElements.whenDefined('igc-grid-lite');

    const gridElement = fixture.nativeElement.querySelector('igx-grid-lite');
    const gridBody = gridElement?.renderRoot.querySelector('igc-virtualizer');
    if (gridBody?.updateComplete) {
        await gridBody.updateComplete;
    }
}
