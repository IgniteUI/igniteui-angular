import { configureTestSuite } from '../../test-utils/configure-suite';
import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { IgxGridModule } from './grid.module';
import { IgxGridComponent } from './grid.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { resolveNestedPath } from '../../core/utils';
import { Component, ViewChild } from '@angular/core';

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

@Component({
    template: `<igx-grid></igx-grid>`
})
class NestedPropertiesGridComponent {
    @ViewChild(IgxGridComponent, { read: IgxGridComponent })
    grid: IgxGridComponent;
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

        beforeAll(waitForAsync(() => {
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


            grid.setSelection({ columnStart: 'user.name.first',  columnEnd: 'user.name.first', rowStart: 0, rowEnd: 0 });
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

            grid.updateRow({ user: { name: { first: 'Updated!' }}}, 0);
            fixture.detectChanges();

            expect(first(DATA).user.name.first).toMatch('Updated!');
        });
    });
});
