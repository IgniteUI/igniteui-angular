import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, ComponentFixture, fakeAsync } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { resolveNestedPath } from '../../core/utils';
import { AfterViewInit, Component, DebugElement, ViewChild } from '@angular/core';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxComboComponent, IgxComboModule } from '../../combo/public_api';
import { IgxFocusModule } from '../../directives/focus/focus.directive';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IgxToggleModule } from '../../directives/toggle/toggle.directive';
import { IgxInputGroupModule } from '../../input-group/public_api';

function first<T>(array: T[]): T {
    return array[0];
}

const DATA = [
    {
        id: 0,
        user: {
            name: {
                first: 'John',
                last: 'Doe'
            },
            email: 'johndoe@mail.com',
            age: 30,
            address: {
                zip: 1000,
                country: 'USA'
            }
        },
        active: true
    },
    {
        id: 1,
        user: {
            name: {
                first: 'Jane',
                last: 'Doe'
            },
            email: 'jane@gmail.com',
            age: 23,
            address: {
                zip: 2000,
                country: 'England'
            }
        },
        active: true
    },
    {
        id: 2,
        user: {
            name: {
                first: 'Ivan',
                last: 'Ivanov'
            },
            email: 'ivanko@po6ta.bg',
            age: 33,
            address: {
                zip: 1700,
                country: 'Bulgaria'
            }
        },
        active: false
    },
    {
        id: 3,
        user: {
            name: {
                first: 'Bianka',
                last: 'Bartosik'
            },
            email: 'bbb@gmail.pl',
            age: 21,
            address: {
                zip: 6000,
                country: 'Poland'
            }
        },
        active: true
    }
];

const DATA2 = [
    {
        id: 0,
        productName: 'Chai',
        locations: [{
            id: 3,
            shop: 'MarMaMarket'
        }]
    },
    {
        id: 1,
        productName: 'Chang',
        locations: [{
            id: 0,
            shop: 'My Cool Market'
        },
        {
            id: 1,
            shop: 'MarMaMarket'
        }]
    },
    {
        id: 2,
        productName: 'Aniseed Syrup',
        locations: [{
            id: 1,
            shop: 'MarMaMarket'
        },
        {
            id: 2,
            shop: 'Fun-Tasty Co.'
        },
        {
            id: 3,
            shop: 'MarMaMarket'
        }]
    },
    {
        id: 3,
        productName: 'Uncle Bobs Organic Dried Pears',
        locations: [{
            id: 0,
            shop: 'My Cool Market'
        }, {
            id: 2,
            shop: 'Fun-Tasty Co.'
        }]
    },
];


const LOCATIONS = [
    {
        id: 0,
        shop: 'My Cool Market'
    },
    {
        id: 1,
        shop: 'MarMaMarket'
    },
    {
        id: 2,
        shop: 'Fun-Tasty Co.'
    },
    {
        id: 3,
        shop: 'MarMaMarket'
    }
]

@Component({
    template: `<igx-grid></igx-grid>`
})
class NestedPropertiesGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;
}

@Component({
    template: `<igx-grid #grid1 [autoGenerate]='false'>
        <igx-column field='id' header='ID' dataType='number'></igx-column>
        <igx-column field='user.name.first' header='First Name' editable='true' dataType='string'></igx-column>
        <igx-column field='user.name.last' header='Last Name' editable='true' dataType='string'></igx-column>
        <igx-column field='user.email' header='E-Mail' editable='true' dataType='string'></igx-column>
        <igx-column field='user.age' header='Age' [sortable]='true' editable='true' dataType='number'></igx-column>
        <igx-column field='user.address.zip' header='ZIP' editable='true' dataType='number'></igx-column>
        <igx-column field='user.address.country' header='Country' editable='true' dataType='string'></igx-column>
        <igx-column field='active' header='Active' editable='true' dataType='boolean'></igx-column>
    </igx-grid>`
})
class NestedPropertiesGrid2Component {
    @ViewChild('grid1', { static: true, read: IgxGridComponent })
    grid: IgxGridComponent;
}

@Component({
    template: `<igx-grid #grid1 [data]="data" [autoGenerate]='false'>
        <igx-column field='id' header='ID' dataType='number'></igx-column>
        <igx-column field='productName' header='Product Name' editable='true' dataType='string'></igx-column>
        <igx-column field="locations" header="Available At" [editable]="true" width="220px">
            <ng-template igxCell let-cell="cell">
                {{ parseArray(cell.value) }}
            </ng-template>
            <ng-template igxCellEditor let-cell="cell">
                <igx-combo #combo1 type="line" [data]="locations" [(ngModel)]="cell.editValue" [displayKey]="'shop'"
                    width="220px" [igxFocus]="true"></igx-combo>
            </ng-template>
        </igx-column>
    </igx-grid>`
})
class NestedPropertyGridComponent {
    @ViewChild('grid1', { static: true, read: IgxGridComponent })
    grid: IgxGridComponent;
    @ViewChild('combo1', { static: true, read: IgxComboComponent })
    combo: IgxComboComponent;
    public data = DATA2;
    public locations = LOCATIONS;
    public parseArray(arr: { id: number, shop: string }[]): string {
        return (arr || []).map((e) => e.shop).join(', ');
    }
}



describe('Grid - nested data source properties', () => {

    const NAMES = 'John Jane Ivan Bianka'.split(' ');
    const AGES = [30, 23, 33, 21];


    describe('API', () => {

        it('should correctly resolve key paths in nested data', () => {
            expect(
                DATA.map(record => resolveNestedPath(record, 'user.name.first'))
            ).toEqual(NAMES);
            expect(
                DATA.map(record => resolveNestedPath(record, 'user.age'))
            ).toEqual(AGES);
        });
    });

    describe('Grid base cases', () => {

        let fixture: ComponentFixture<NestedPropertiesGridComponent>;
        let grid: IgxGridComponent;

        const setupData = (data: Array<any>) => {
            grid.autoGenerate = true;
            grid.shouldGenerate = true;
            grid.data = data;
            fixture.detectChanges();
        };

        configureTestSuite();

        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [NestedPropertiesGridComponent],
                imports: [IgxGridModule, NoopAnimationsModule]
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(NestedPropertiesGridComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
        });

        it('should support column API with complex field', () => {
            setupData(DATA);

            const column = grid.getColumnByName('user');
            column.field = 'user.name.first';
            fixture.detectChanges();

            expect(grid.getColumnByName('user.name.first')).toBe(column);
        });

        it('should render the passed properties path', () => {
            setupData(DATA);

            const column = grid.getColumnByName('user');
            column.field = 'user.name.first';
            fixture.detectChanges();

            expect(column.cells.map(cell => cell.value)).toEqual(NAMES);
        });

        it('should work with sorting', () => {
            setupData(DATA);

            const key = 'user.age';

            const column = grid.getColumnByName('user');
            column.field = key;
            fixture.detectChanges();

            grid.sort({ fieldName: key, dir: SortingDirection.Asc });
            fixture.detectChanges();

            expect(first(column.cells.map(cell => cell.value))).toEqual(21);

            grid.sort({ fieldName: key, dir: SortingDirection.Desc });
            fixture.detectChanges();

            expect(first(column.cells.map(cell => cell.value))).toEqual(33);
        });

        it('should work with filtering', () => {
            setupData(DATA);

            const key = 'user.name.first';
            const operand = IgxStringFilteringOperand.instance().condition('equals');

            const column = grid.getColumnByName('user');
            column.field = key;
            fixture.detectChanges();

            grid.filter(key, 'Jane', operand);
            fixture.detectChanges();

            expect(grid.dataView.length).toEqual(1);
            expect(first(column.cells).value).toEqual('Jane');
        });

        it('should support copy/paste operations', () => {
            setupData(DATA);

            grid.getColumnByName('user').field = 'user.name.first';
            fixture.detectChanges();


            grid.setSelection({ columnStart: 'user.name.first', columnEnd: 'user.name.first', rowStart: 0, rowEnd: 0 });
            fixture.detectChanges();

            const selected = grid.getSelectedData();
            expect(selected.length).toEqual(1);
            expect(first(selected)['user.name.first']).toMatch('John');
        });

        it('should work with editing (cell)', () => {
            setupData(DATA);

            const key = 'user.name.first';
            const column = grid.getColumnByName('user');
            column.field = key;
            grid.primaryKey = 'id';
            fixture.detectChanges();

            grid.updateCell('Anonymous', 0, key);
            fixture.detectChanges();

            expect(first(DATA).user.name.first).toMatch('Anonymous');
        });

        it('should work with editing (row)', () => {
            setupData(DATA);

            grid.primaryKey = 'id';
            grid.getColumnByName('user').field = 'user.name.first';
            fixture.detectChanges();

            grid.updateRow({ user: { name: { first: 'Updated!' } } }, 0);
            fixture.detectChanges();

            expect(first(DATA).user.name.first).toMatch('Updated!');
        });

    });

    describe('Grid base cases1', () => {

        let fixture: ComponentFixture<NestedPropertiesGrid2Component>;
        let grid: IgxGridComponent;
        let gridContent: DebugElement;

        const setupData = (data: Array<any>) => {
            grid.data = data;
            fixture.detectChanges();
        };

        configureTestSuite();

        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [NestedPropertiesGrid2Component],
                imports: [IgxGridModule, NoopAnimationsModule]
            }).compileComponents();
        }));

        beforeEach(() => {
            fixture = TestBed.createComponent(NestedPropertiesGrid2Component);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        });

        it('test0', () => {
            // related to bug
            // grid.data = DATA;
            grid.data = JSON.parse(JSON.stringify(DATA));
            grid.primaryKey = 'id';
            grid.rowEditable = true;
            fixture.detectChanges();
            const cell1 = grid.getCellByColumn(0, 'user.name.first');
            const cell2 = grid.getCellByColumn(0, 'user.name.last');
            const cell3 = grid.getCellByColumn(0, 'user.email');
            debugger;

            UIInteractions.simulateDoubleClickAndSelectEvent(cell1);
            fixture.detectChanges();
            expect(cell1.editMode).toBe(true);
            cell1.editValue = 'Petar';

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            expect(cell1.editMode).toBe(false);
            expect(cell2.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            expect(cell2.editMode).toBe(false);
            expect(cell3.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('escape', gridContent);
            fixture.detectChanges();

            expect(cell3.editMode).toBe(false);

            expect(cell1.value).toBeDefined(true);
            // related to bug
            // expect(first(DATA).user.name.first).toMatch('Updated!');
            expect(cell2.value).toBeDefined(true);
            expect(first(DATA).user.name.last).toMatch('Doe');
        });

        it('test1', () => {
            grid.data = DATA;
            fixture.detectChanges();
            const cell1 = grid.getCellByColumn(0, 'user.name.first');
            const cell2 = grid.getCellByColumn(0, 'user.name.last');
            debugger;

            UIInteractions.simulateDoubleClickAndSelectEvent(cell1);
            fixture.detectChanges();
            expect(cell1.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            expect(cell1.editMode).toBe(false);
            expect(cell2.editMode).toBe(true);

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell1.editMode).toBe(false);
            expect(cell2.editMode).toBe(false);

            expect(cell1.value).toBeDefined(true);
            expect(first(DATA).user.name.first).toMatch('Updated!');
        });

        it('test2', () => {
            grid.data = DATA;
            fixture.detectChanges();
            const cell1 = grid.getCellByColumn(0, 'user.name.first');
            const cell2 = grid.getCellByColumn(0, 'user.name.last');
            const cell3 = grid.getCellByColumn(0, 'user.email');
            debugger;

            UIInteractions.simulateDoubleClickAndSelectEvent(cell1);
            fixture.detectChanges();
            expect(cell1.editMode).toBe(true);
            cell1.editValue = 'Petar';

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            expect(cell1.editMode).toBe(false);
            expect(cell2.editMode).toBe(true);
            cell2.editValue = 'Petrov';

            UIInteractions.triggerEventHandlerKeyDown('tab', gridContent);
            fixture.detectChanges();

            expect(cell2.editMode).toBe(false);
            expect(cell3.editMode).toBe(true);
            cell3.editValue = 'ppetrov@email.com';

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(cell1.value).toBeDefined(true);
            expect(cell2.value).toBeDefined(true);
            expect(cell3.value).toBeDefined(true);
            expect(first(DATA).user.name.last).toMatch('Petrov');
        });

        it('test3', () => {
            grid.data = DATA;
            fixture.detectChanges();
            debugger;

            const header = GridFunctions.getColumnHeader('user.age', fixture);
            UIInteractions.simulateClickAndSelectEvent(header);

            expect(grid.headerGroups.toArray()[0].isFiltered).toBeFalsy();
            GridFunctions.verifyHeaderSortIndicator(header, false, false);

            GridFunctions.clickHeaderSortIcon(header);
            GridFunctions.clickHeaderSortIcon(header);
            fixture.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(header, false, true);

            const cell1 = grid.getCellByColumn(0, 'user.address.zip');
            expect(cell1.value).toEqual(1700);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell1);
            fixture.detectChanges();
            expect(cell1.editMode).toBe(true);
            cell1.editValue = 1618;

            UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            fixture.detectChanges();

            expect(DATA[2].user.address.zip).toMatch('1618');
        });

    });

    describe('Grid base cases2', () => {

        let fixture: ComponentFixture<NestedPropertyGridComponent>;
        let grid: IgxGridComponent;
        let combo: IgxComboComponent;
        let gridContent: DebugElement;

        const setupData = (data: Array<any>) => {
            grid.data = data;
            fixture.detectChanges();
        };

        configureTestSuite();

        beforeAll(async(() => {
            TestBed.configureTestingModule({
                declarations: [NestedPropertyGridComponent],
                imports: [IgxGridModule, IgxComboModule, FormsModule, IgxToggleModule,
                    ReactiveFormsModule, IgxFocusModule, IgxInputGroupModule, NoopAnimationsModule]
            }).compileComponents();
        }));

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(NestedPropertyGridComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            gridContent = GridFunctions.getGridContent(fixture);
        }));

        it('test4', () => {
            debugger;

            const cell1 = grid.getCellByColumn(0, 'locations');
            cell1.setEditMode(true);
            fixture.detectChanges();
            combo = fixture.componentInstance.combo;
            fixture.detectChanges();
            debugger;
            // UIInteractions.triggerEventHandlerKeyDown('ArrowDown', gridContent);
            // UIInteractions.getKeyboardEvent('keyup', 'ArrowDown')
            // UIInteractions.simulateDoubleClickAndSelectEvent(cell1);
            fixture.detectChanges();

            // const header = GridFunctions.getColumnHeader('user.age', fixture);
            // UIInteractions.simulateClickAndSelectEvent(header);

            // expect(grid.headerGroups.toArray()[0].isFiltered).toBeFalsy();
            // GridFunctions.verifyHeaderSortIndicator(header, false, false);

            // GridFunctions.clickHeaderSortIcon(header);
            // GridFunctions.clickHeaderSortIcon(header);
            // fixture.detectChanges();

            // GridFunctions.verifyHeaderSortIndicator(header, false, true);

            // const cell1 = grid.getCellByColumn(0, 'user.address.zip');
            // expect(cell1.value).toEqual(1700);

            // UIInteractions.simulateDoubleClickAndSelectEvent(cell1);
            // fixture.detectChanges();
            // expect(cell1.editMode).toBe(true);
            // cell1.editValue = 1618;

            // UIInteractions.triggerEventHandlerKeyDown('enter', gridContent);
            // fixture.detectChanges();

            // const cell2 = grid.getCellByColumn(0, 'user.address.zip');
            // expect(DATA[2].user.address.zip).toMatch('1618');
        });

    });


});
