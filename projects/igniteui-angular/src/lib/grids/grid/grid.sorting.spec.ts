import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { IgxGridComponent } from './grid.component';
import { DefaultSortingStrategy, FormattedValuesSortingStrategy, SortingDirection } from '../../data-operations/sorting-strategy';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { GridDeclaredColumnsComponent, SortByParityComponent, GridWithPrimaryKeyComponent, SortByAnotherColumnComponent, SortOnInitComponent, IgxGridFormattedValuesSortingComponent } from '../../test-utils/grid-samples.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { CellType } from '../common/grid.interface';
import { NoopSortingStrategy } from '../common/strategy';
import { By } from '@angular/platform-browser';

describe('IgxGrid - Grid Sorting #grid', () => {

    let fixture;
    let grid: IgxGridComponent;

    configureTestSuite((() => {
        return TestBed.configureTestingModule({
            imports: [
                GridDeclaredColumnsComponent,
                SortByParityComponent,
                GridWithPrimaryKeyComponent,
                NoopAnimationsModule,
                IgxGridFormattedValuesSortingComponent
            ]
        });
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(GridDeclaredColumnsComponent);
        grid = fixture.componentInstance.grid;
        grid.width = '800px';
        fixture.detectChanges();
    });

    describe('API tests', () => {

        it('Should sort grid ascending by column name', fakeAsync(() => {
            spyOn(grid.sorting, 'emit').and.callThrough();
            spyOn(grid.sortingDone, 'emit').and.callThrough();
            const currentColumn = 'Name';
            const lastNameColumn = 'LastName';
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: false });
            tick(30);
            fixture.detectChanges();

            expect(grid.sorting.emit).toHaveBeenCalledWith({
                cancel: false,
                sortingExpressions: grid.sortingExpressions,
                owner: grid
            });

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual('ALex');
            expect(grid.getCellByColumn(0, lastNameColumn).value).toEqual('Smith');
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, lastNameColumn).value).toEqual('BRown');

            // Ignore case on sorting set to true
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: true });
            tick(30);
            fixture.detectChanges();
            expect(grid.sorting.emit).toHaveBeenCalledWith({
                cancel: false,
                sortingExpressions: grid.sortingExpressions,
                owner: grid
            });
            expect(grid.getCellByColumn(0, currentColumn).value).toEqual('ALex');
            expect(grid.sorting.emit).toHaveBeenCalledTimes(2);
            expect(grid.sortingDone.emit).toHaveBeenCalledTimes(2);
        }));

        it('Should sort grid descending by column name', () => {
            const currentColumn = 'Name';
            // Ignore case on sorting set to false
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();


            expect(grid.getCellByColumn(0, currentColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('ALex');

            // Ignore case on sorting set to true
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).not.toEqual('ALex');

        });

        it('Should sort grid by ISO 8601 date column', () => {
            fixture = TestBed.createComponent(GridWithPrimaryKeyComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;

            const currentColumn = 'HireDate';
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: false });

            fixture.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual('2005-10-14T11:23:17.714Z');
            expect(grid.getCellByColumn(1, currentColumn).value).toEqual('2005-11-18T11:23:17.714Z');
            expect(grid.getCellByColumn(2, currentColumn).value).toEqual('2005-11-19T11:23:17.714Z');
            expect(grid.getCellByColumn(3, currentColumn).value).toEqual('2007-12-19T11:23:17.714Z');
            expect(grid.getCellByColumn(4, currentColumn).value).toEqual('2008-12-18T11:23:17.714Z');
            expect(grid.getCellByColumn(5, currentColumn).value).toEqual('2011-11-28T11:23:17.714Z');
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('2017-06-19T11:43:07.714Z');

            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            expect(grid.getCellByColumn(9, currentColumn).value).toEqual('2005-10-14T11:23:17.714Z');
            expect(grid.getCellByColumn(8, currentColumn).value).toEqual('2005-11-18T11:23:17.714Z');
            expect(grid.getCellByColumn(7, currentColumn).value).toEqual('2005-11-19T11:23:17.714Z');
            expect(grid.getCellByColumn(6, currentColumn).value).toEqual('2007-12-19T11:23:17.714Z');
            expect(grid.getCellByColumn(5, currentColumn).value).toEqual('2008-12-18T11:23:17.714Z');
            expect(grid.getCellByColumn(4, currentColumn).value).toEqual('2011-11-28T11:23:17.714Z');
            expect(grid.getCellByColumn(0, currentColumn).value).toEqual('2017-06-19T11:43:07.714Z');
        });

        it('Should sort grid by milliseconds date column', () => {
            fixture = TestBed.createComponent(GridWithPrimaryKeyComponent);
            fixture.componentInstance.data = SampleTestData.personJobDataFull().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.HireDate = new Date(rec.HireDate).getTime();
                return newRec;
            });
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;

            const currentColumn = 'HireDate';
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: false });

            fixture.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual(new Date('2005-10-14T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(1, currentColumn).value).toEqual(new Date('2005-11-18T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(2, currentColumn).value).toEqual(new Date('2005-11-19T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(3, currentColumn).value).toEqual(new Date('2007-12-19T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(4, currentColumn).value).toEqual(new Date('2008-12-18T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(5, currentColumn).value).toEqual(new Date('2011-11-28T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual(new Date('2017-06-19T11:43:07.714Z').getTime());

            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            expect(grid.getCellByColumn(9, currentColumn).value).toEqual(new Date('2005-10-14T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(8, currentColumn).value).toEqual(new Date('2005-11-18T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(7, currentColumn).value).toEqual(new Date('2005-11-19T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(6, currentColumn).value).toEqual(new Date('2007-12-19T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(5, currentColumn).value).toEqual(new Date('2008-12-18T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(4, currentColumn).value).toEqual(new Date('2011-11-28T11:23:17.714Z').getTime());
            expect(grid.getCellByColumn(0, currentColumn).value).toEqual(new Date('2017-06-19T11:43:07.714Z').getTime());
        });

        it('Should sort grid by datetime column', () => {
            fixture = TestBed.createComponent(GridWithPrimaryKeyComponent);
            fixture.componentInstance.data = SampleTestData.personJobDataFull().map(rec => {
                const newRec = Object.assign({}, rec) as any;
                newRec.HireDate = new Date(rec.HireDate);
                return newRec;
            });
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            const hireDateCol = grid.columns.findIndex(col => col.field === "HireDate");
            grid.columns[hireDateCol].dataType = 'dateTime';
            fixture.detectChanges();

            const currentColumn = 'HireDate';
            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: false });

            fixture.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value.toISOString()).toEqual('2005-10-14T11:23:17.714Z');
            expect(grid.getCellByColumn(1, currentColumn).value.toISOString()).toEqual('2005-11-18T11:23:17.714Z');
            expect(grid.getCellByColumn(2, currentColumn).value.toISOString()).toEqual('2005-11-19T11:23:17.714Z');
            expect(grid.getCellByColumn(3, currentColumn).value.toISOString()).toEqual('2007-12-19T11:23:17.714Z');
            expect(grid.getCellByColumn(4, currentColumn).value.toISOString()).toEqual('2008-12-18T11:23:17.714Z');
            expect(grid.getCellByColumn(5, currentColumn).value.toISOString()).toEqual('2011-11-28T11:23:17.714Z');
            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value.toISOString()).toEqual('2017-06-19T11:43:07.714Z');

            grid.sort({ fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            expect(grid.getCellByColumn(9, currentColumn).value.toISOString()).toEqual('2005-10-14T11:23:17.714Z');
            expect(grid.getCellByColumn(8, currentColumn).value.toISOString()).toEqual('2005-11-18T11:23:17.714Z');
            expect(grid.getCellByColumn(7, currentColumn).value.toISOString()).toEqual('2005-11-19T11:23:17.714Z');
            expect(grid.getCellByColumn(6, currentColumn).value.toISOString()).toEqual('2007-12-19T11:23:17.714Z');
            expect(grid.getCellByColumn(5, currentColumn).value.toISOString()).toEqual('2008-12-18T11:23:17.714Z');
            expect(grid.getCellByColumn(4, currentColumn).value.toISOString()).toEqual('2011-11-28T11:23:17.714Z');
            expect(grid.getCellByColumn(0, currentColumn).value.toISOString()).toEqual('2017-06-19T11:43:07.714Z');
        });

        it('Should not mutate original data when sorting date column', () => {
            fixture = TestBed.createComponent(GridWithPrimaryKeyComponent);
            fixture.componentInstance.data = SampleTestData.personJobDataFull().map(rec => {
                return Object.assign({}, { ...rec, HireDate: new Date(rec.HireDate) });
            });
            fixture.detectChanges();

            grid = fixture.componentInstance.grid;
            const hireDateCol = grid.columns.findIndex(col => col.field === "HireDate");
            grid.columns[hireDateCol].dataType = 'date';
            fixture.detectChanges();

            grid.sort({ fieldName: 'HireDate', dir: SortingDirection.Asc });
            fixture.detectChanges();

            const timeParts = (date: Date) => date.getHours() + date.getMinutes() + date.getSeconds() + date.getMinutes();
            expect(grid.data.every(rec => timeParts(rec.HireDate) === 0)).toEqual(false);
        });

        it('Should not sort grid when trying to sort by invalid column', () => {
            const invalidColumn = 'Age';
            grid.sort({ fieldName: invalidColumn, dir: SortingDirection.Desc, ignoreCase: false });

            expect(grid.getCellByColumn(0, 'Name').value).toEqual('Jane');
            expect(grid.getCellByColumn(grid.data.length - 1, 'Name').value).toEqual('Connor');
        });

        it('Should sort grid by current column by expression (Ascending)', () => {
            const currentColumn = 'ID';
            grid.sortingExpressions = [{
                fieldName: currentColumn, dir: SortingDirection.Asc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            }];

            fixture.detectChanges();

            expect(grid.getCellByColumn(0, currentColumn).value).toEqual(1);
        });

        it('Should sort grid by current column by expression (Descending with ignoreCase)', () => {
            const currentColumn = 'Name';

            grid.sortingExpressions = [{
                fieldName: currentColumn, dir: SortingDirection.Desc, ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            }];

            fixture.detectChanges();

            expect(grid.getCellByColumn(grid.data.length - 1, currentColumn).value).toEqual('Alex');
        });

        it('Should sort grid by multiple expressions and clear sorting through API', () => {
            const firstColumn = 'ID';
            const secondColumn = 'Name';
            const thirdColumn = 'LastName';

            grid.sortingExpressions = [
                { fieldName: secondColumn, dir: SortingDirection.Asc, ignoreCase: true },
                { fieldName: firstColumn, dir: SortingDirection.Desc, ignoreCase: true }
            ];

            fixture.detectChanges();

            expect(grid.getCellByColumn(0, secondColumn).value).toEqual('ALex');
            expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(6);
            expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual('Jones');

            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader(secondColumn, fixture))).toEqual(1);
            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader(firstColumn, fixture))).toEqual(2);
            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader(thirdColumn, fixture))).toBeNull();

            // Clear sorting on a column
            grid.clearSort(firstColumn);
            fixture.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(1);
            expect(grid.sortingExpressions[0].fieldName).toEqual(secondColumn);
            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader(firstColumn, fixture))).toBeNull();
            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader(secondColumn, fixture))).toEqual(1);

            grid.sortingExpressions = [
                { fieldName: firstColumn, dir: SortingDirection.Desc, ignoreCase: true },
                { fieldName: secondColumn, dir: SortingDirection.Asc, ignoreCase: true }
            ];
            fixture.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(2);
            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader(firstColumn, fixture))).toEqual(1);
            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader(secondColumn, fixture))).toEqual(2);

            // Clear sorting on all columns
            grid.clearSort();
            fixture.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(0);
            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader(firstColumn, fixture))).toBeNull();
            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader(secondColumn, fixture))).toBeNull();
        });

        it('Should sort grid by multiple expressions through API using ignoreCase for the second expression', () => {
            const firstColumn = 'ID';
            const secondColumn = 'Name';
            const thirdColumn = 'LastName';
            const exprs = [
                { fieldName: secondColumn, dir: SortingDirection.Asc, ignoreCase: true },
                { fieldName: thirdColumn, dir: SortingDirection.Desc, ignoreCase: true }
            ];

            grid.sortingExpressions = exprs;

            fixture.detectChanges();
            expect(grid.getCellByColumn(0, secondColumn).value).toEqual('Alex');
            expect(grid.getCellByColumn(0, thirdColumn).value).toEqual('Wilson');
            expect(grid.getCellByColumn(0, firstColumn).value).toEqual(4);
            expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual('BRown');
            expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(7);

            grid.clearSort();
            fixture.detectChanges();

            expect(grid.sortingExpressions.length).toEqual(0);

            grid.sort(exprs);
            fixture.detectChanges();

            expect(grid.getCellByColumn(0, secondColumn).value).toEqual('Alex');
            expect(grid.getCellByColumn(0, thirdColumn).value).toEqual('Wilson');
            expect(grid.getCellByColumn(0, firstColumn).value).toEqual(4);
            expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual('BRown');
            expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(7);
        });

        // sort now allows only params of type ISortingExpression hence it is not possible to pass invalid expressions
        it(`Should sort grid by mixed valid and invalid expressions should update the
                data only by valid ones`, () => {
            const firstColumn = 'ID';
            const secondColumn = 'Name';
            const thirdColumn = 'LastName';
            const invalidAndValidExp = [
                { fieldName: secondColumn, dir: SortingDirection.Desc, ignoreCase: false },
                { fieldName: firstColumn, dir: SortingDirection.Asc, ignoreCase: true }
            ];

            grid.sort(invalidAndValidExp);

            fixture.detectChanges();

            expect(grid.getCellByColumn(0, secondColumn).value).toEqual('Rick');
            expect(grid.getCellByColumn(0, thirdColumn).value).toEqual('Jones');
            expect(grid.getCellByColumn(0, firstColumn).value).toEqual(6);
            expect(grid.getCellByColumn(grid.data.length - 1, secondColumn).value).toEqual('ALex');
            expect(grid.getCellByColumn(grid.data.length - 1, thirdColumn).value).toEqual('Smith');
            expect(grid.getCellByColumn(grid.data.length - 1, firstColumn).value).toEqual(5);

        });

        it(`Should allow sorting using a custom Sorting Strategy.`, () => {
            fixture = TestBed.createComponent(SortByParityComponent);
            grid = fixture.componentInstance.grid;
            fixture.componentInstance.data.push(
                { ID: 8, Name: 'Brad', LastName: 'Walker', Region: 'DD' },
                { ID: 9, Name: 'Mary', LastName: 'Smith', Region: 'OC' },
                { ID: 10, Name: 'Brad', LastName: 'Smith', Region: 'BD' },
            );
            fixture.detectChanges();
            grid.sort({
                fieldName: 'ID',
                dir: SortingDirection.Desc,
                ignoreCase: false,
                strategy: new SortByParityComponent()
            });
            fixture.detectChanges();
            const oddHalf: CellType[] = grid.getColumnByName('ID').cells.slice(0, 5);
            const evenHalf: CellType[] = grid.getColumnByName('ID').cells.slice(5);
            const isFirstHalfOdd: boolean = oddHalf.every(cell => cell.value % 2 === 1);
            const isSecondHalfEven: boolean = evenHalf.every(cell => cell.value % 2 === 0);
            expect(isFirstHalfOdd).toEqual(true);
            expect(isSecondHalfEven).toEqual(true);
        });

        it(`Should allow sorting using a custom Sorting Strategy in multiple mode`, () => {
            fixture = TestBed.createComponent(SortByAnotherColumnComponent);
            grid = fixture.componentInstance.grid;
            fixture.detectChanges();

            grid.primaryKey = 'ID';
            const column = grid.getColumnByName('ID');
            fixture.detectChanges();

            column.groupingComparer = (a: any, b: any, currRec: any, groupRec: any) => {
                return currRec.Name === groupRec.Name ? 0 : -1;
            }

            fixture.detectChanges();
            grid.sortingExpressions = [
                {
                    dir: SortingDirection.Asc,
                    fieldName: 'ID',
                    strategy: new SortByAnotherColumnComponent,
                },
                {
                    dir: SortingDirection.Asc,
                    fieldName: 'LastName',
                    strategy: DefaultSortingStrategy.instance(),
                },
            ];
            fixture.detectChanges();
            expect(grid.getCellByKey(6, 'LastName').row.index).toBeGreaterThan(grid.getCellByKey(7, 'LastName').row.index);
            expect(grid.getCellByKey(4, 'LastName').row.index).toBeGreaterThan(grid.getCellByKey(5, 'LastName').row.index);
        });

        it('Should sort grid by formatted values using FormattedValuesSortingStrategy', fakeAsync(() => {
            fixture = TestBed.createComponent(IgxGridFormattedValuesSortingComponent);
            tick();
            fixture.detectChanges();

            grid = fixture.componentInstance.grid;
            tick();
            fixture.detectChanges();

            const productNameColumn = grid.getColumnByName("ProductName");
            const quantityColumn = grid.getColumnByName("QuantityPerUnit");

            expect(productNameColumn.sortStrategy instanceof FormattedValuesSortingStrategy).toBeTruthy();
            expect(quantityColumn.sortStrategy instanceof FormattedValuesSortingStrategy).toBeTruthy();

            const productNameHeaderCell = GridFunctions.getColumnHeader('ProductName', fixture);

            GridFunctions.clickHeaderSortIcon(productNameHeaderCell);
            tick(30);
            fixture.detectChanges();

            const firstProductNameCell = fixture.debugElement.queryAll(By.css('.igx-grid__td'))[1];
            expect(firstProductNameCell.nativeElement.textContent.trim()).toBe("a-Alice Mutton");

            GridFunctions.clickHeaderSortIcon(productNameHeaderCell);
            tick(30);
            fixture.detectChanges();

            const lastProductNameCell = fixture.debugElement.queryAll(By.css('.igx-grid__td'))[1];
            expect(lastProductNameCell.nativeElement.textContent.trim()).toBe("b-Tofu");

            grid.clearSort();
            tick();
            fixture.detectChanges();

            const quantityPerUnitHeaderCell = GridFunctions.getColumnHeader('QuantityPerUnit', fixture);

            GridFunctions.clickHeaderSortIcon(quantityPerUnitHeaderCell);
            tick(30);
            fixture.detectChanges();

            const firstQuantityCell = fixture.debugElement.queryAll(By.css('.igx-grid__td'))[2];
            expect(firstQuantityCell.nativeElement.textContent.trim()).toBe("c");

            GridFunctions.clickHeaderSortIcon(quantityPerUnitHeaderCell);
            tick(30);
            fixture.detectChanges();

            const lastQuantityCell = fixture.debugElement.queryAll(By.css('.igx-grid__td'))[2];
            expect(lastQuantityCell.nativeElement.textContent.trim()).toBe("d-36 boxes");
        }));
    });

    describe('UI tests', () => {

        it('Should sort grid ascending by clicking once on first header cell UI', fakeAsync(() => {
            spyOn(grid.sorting, 'emit');
            spyOn(grid.sortingDone, 'emit');
            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            tick(30);
            fixture.detectChanges();

            expect(grid.sorting.emit).toHaveBeenCalledWith({
                cancel: false,
                sortingExpressions: grid.sortingExpressions,
                owner: grid
            });

            const firstRowFirstCell = GridFunctions.getCurrentCellFromGrid(grid, 0, 0);
            const firstRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, 0, 1);
            expect(GridFunctions.getValueFromCellElement(firstRowSecondCell)).toEqual('Brad');
            expect(GridFunctions.getValueFromCellElement(firstRowFirstCell)).toEqual('1');

            const lastRowFirstCell = GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 0);
            const lastRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 1);
            expect(GridFunctions.getValueFromCellElement(lastRowFirstCell)).toEqual('7');
            expect(GridFunctions.getValueFromCellElement(lastRowSecondCell)).toEqual('Rick');

            expect(grid.sorting.emit).toHaveBeenCalledTimes(1);
            expect(grid.sortingDone.emit).toHaveBeenCalledTimes(1);
        }));

        it('Should sort grid descending by clicking twice on sort icon UI', fakeAsync(() => {
            spyOn(grid.sorting, 'emit').and.callThrough();
            spyOn(grid.sortingDone, 'emit').and.callThrough();

            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            tick(30);
            fixture.detectChanges();

            expect(grid.sorting.emit).toHaveBeenCalledWith({
                cancel: false,
                sortingExpressions: grid.sortingExpressions,
                owner: grid
            });

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            tick(30);
            fixture.detectChanges();

            expect(grid.sorting.emit).toHaveBeenCalledWith({
                cancel: false,
                sortingExpressions: grid.sortingExpressions,
                owner: grid
            });

            const firstRowFirstCell = GridFunctions.getCurrentCellFromGrid(grid, 0, 0);
            const firstRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, 0, 1);
            expect(GridFunctions.getValueFromCellElement(firstRowFirstCell)).toEqual('7');
            expect(GridFunctions.getValueFromCellElement(firstRowSecondCell)).toEqual('Rick');

            const lastRowFirstCell = GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 0);
            const lastRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 1);
            expect(GridFunctions.getValueFromCellElement(lastRowFirstCell)).toEqual('1');
            expect(GridFunctions.getValueFromCellElement(lastRowSecondCell)).toEqual('Brad');

            expect(grid.sorting.emit).toHaveBeenCalledTimes(2);
            expect(grid.sortingDone.emit).toHaveBeenCalledTimes(2);
        }));

        it('Should sort grid none when we click three time on header sort icon UI', fakeAsync(() => {
            spyOn(grid.sorting, 'emit');
            spyOn(grid.sortingDone, 'emit');
            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            tick(30);
            fixture.detectChanges();
            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            tick(30);
            fixture.detectChanges();
            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader('ID', fixture))).toEqual(1);
            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            tick(30);
            fixture.detectChanges();

            expect(grid.sorting.emit).toHaveBeenCalledWith({
                cancel: false,
                sortingExpressions: [],
                owner: grid
            });

            const firstRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, 0, 1);
            expect(GridFunctions.getValueFromCellElement(firstRowSecondCell)).toEqual('Jane');

            const lastRowSecondCell = GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 1);
            expect(GridFunctions.getValueFromCellElement(lastRowSecondCell)).toEqual('Connor');

            expect(GridFunctions.getColumnSortingIndex(GridFunctions.getColumnHeader('ID', fixture))).toBeNull();
            expect(grid.sorting.emit).toHaveBeenCalledTimes(3);
            expect(grid.sortingDone.emit).toHaveBeenCalledTimes(3);
        }));

        it('Should have a valid sorting icon when sorting using the API.', () => {
            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);
            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, false, false);

            grid.sort({ fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: true });
            fixture.detectChanges();
            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, true);

            grid.sort({ fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: true });
            fixture.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, false, true);
            grid.clearSort();
            fixture.detectChanges();
            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, false, false);
        });

        it('Should sort grid on sorting icon click when FilterRow is visible.', fakeAsync(/** Filtering showHideArrowButtons RAF */() => {
            grid.allowFiltering = true;
            fixture.detectChanges();

            GridFunctions.clickFilterCellChipUI(fixture, 'Name');
            expect(GridFunctions.getFilterRow(fixture)).toBeDefined();

            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);
            UIInteractions.simulateClickAndSelectEvent(firstHeaderCell);

            expect(grid.headerGroupsList[0].isFiltered).toBeTruthy();

            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, false, false);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            fixture.detectChanges();

            GridFunctions.verifyHeaderSortIndicator(firstHeaderCell, false, true);
            expect(grid.getCellByColumn(0, 'ID').value).toEqual(7);

            const secondHeaderCell = GridFunctions.getColumnHeader('Name', fixture);
            UIInteractions.simulateClickAndSelectEvent(secondHeaderCell);
            fixture.detectChanges();

            expect(grid.headerGroupsList[1].isFiltered).toBeTruthy();
        }));

        it('Should disable sorting feature when using NoopSortingStrategy.', fakeAsync(() => {
            spyOn(grid.sorting, 'emit');
            spyOn(grid.sortingDone, 'emit');
            grid.sortStrategy = NoopSortingStrategy.instance();
            fixture.detectChanges();

            const firstHeaderCell = GridFunctions.getColumnHeader('ID', fixture);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            tick(30);
            fixture.detectChanges();

            expect(grid.sorting.emit).toHaveBeenCalledWith({
                cancel: false,
                sortingExpressions: grid.sortingExpressions,
                owner: grid
            });

            // Verify that the grid is NOT sorted.
            expect(GridFunctions.getValueFromCellElement(GridFunctions.getCurrentCellFromGrid(grid, 0, 1))).toEqual('Jane');
             
            expect(GridFunctions.getValueFromCellElement(GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 1))).toEqual('Connor');

            expect(GridFunctions.getColumnSortingIndex(firstHeaderCell)).toEqual(1);

            GridFunctions.clickHeaderSortIcon(firstHeaderCell);
            tick(30);
            fixture.detectChanges();

            expect(grid.sorting.emit).toHaveBeenCalledWith({
                cancel: false,
                sortingExpressions: grid.sortingExpressions,
                owner: grid
            });

            // Verify that the grid is NOT sorted.
            expect(GridFunctions.getValueFromCellElement(GridFunctions.getCurrentCellFromGrid(grid, 0, 1))).toEqual('Jane');
             
            expect(GridFunctions.getValueFromCellElement(GridFunctions.getCurrentCellFromGrid(grid, grid.data.length - 1, 1))).toEqual('Connor');

            expect(GridFunctions.getColumnSortingIndex(firstHeaderCell)).toEqual(1);
            expect(grid.sorting.emit).toHaveBeenCalledTimes(2);
            expect(grid.sortingDone.emit).toHaveBeenCalledTimes(2);
        }));

        it('Should allow setting custom templates for header sorting none/ascending/descending icons.', () => {
            fixture = TestBed.createComponent(SortByParityComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            const fieldName = 'Name';
            const header = GridFunctions.getColumnHeader(fieldName, fixture, grid);
            let icon = GridFunctions.getHeaderSortIcon(header);

            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('unfold_more');

            grid.sort({ fieldName, dir: SortingDirection.Asc, ignoreCase: false });
            fixture.detectChanges();
            icon = GridFunctions.getHeaderSortIcon(header);
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('expand_less');

            grid.sort({ fieldName, dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();
            icon = GridFunctions.getHeaderSortIcon(header);
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('expand_more');
        });

        it('Should allow setting custom templates for header sorting none/ascending/descending icons via Input.', () => {
            fixture = TestBed.createComponent(SortByParityComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            grid.sortHeaderIconTemplate = fixture.componentInstance.sortIconTemplate;
            grid.sortAscendingHeaderIconTemplate = fixture.componentInstance.sortAscIconTemplate;
            grid.sortDescendingHeaderIconTemplate = fixture.componentInstance.sortDescIconTemplate;
            fixture.detectChanges();
            const header = GridFunctions.getColumnHeader('Name', fixture, grid);
            let icon = GridFunctions.getHeaderSortIcon(header);
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('arrow_right');

            grid.sort({ fieldName: 'Name', dir: SortingDirection.Asc, ignoreCase: false });
            fixture.detectChanges();
            icon = GridFunctions.getHeaderSortIcon(header);
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('arrow_drop_up');

            grid.sort({ fieldName: 'Name', dir: SortingDirection.Desc, ignoreCase: false });
            fixture.detectChanges();
            icon = GridFunctions.getHeaderSortIcon(header);
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('arrow_drop_down');
        });

        it('Should be able to set single sorting mode and sort one column at a time', fakeAsync(() => {
            fixture = TestBed.createComponent(SortByParityComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            const fieldName = 'Name';
            const fieldLastName = 'LastName';
            const header = GridFunctions.getColumnHeader(fieldName, fixture, grid);
            const headerLastName = GridFunctions.getColumnHeader(fieldLastName, fixture, grid);
            let icon = GridFunctions.getHeaderSortIcon(header);

            grid.sortingOptions = { mode: 'single' };
            fixture.detectChanges();

            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('unfold_more');

            GridFunctions.clickHeaderSortIcon(header);
            tick(30);
            fixture.detectChanges();

            icon = GridFunctions.getHeaderSortIcon(header);
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('expand_less');

            GridFunctions.clickHeaderSortIcon(headerLastName);
            tick(30);
            fixture.detectChanges();

            icon = GridFunctions.getHeaderSortIcon(header);
            const iconLastName = GridFunctions.getHeaderSortIcon(headerLastName);
            expect(icon.nativeElement.textContent.toLowerCase().trim()).toBe('unfold_more');
            expect(iconLastName.nativeElement.textContent.toLowerCase().trim()).toBe('expand_less');
        }));


        it('should not display sorting index when sorting mode is set to "single"', fakeAsync(() => {
            fixture = TestBed.createComponent(SortByParityComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            const fieldName = 'Name';
            const fieldLastName = 'LastName';
            const header = GridFunctions.getColumnHeader(fieldName, fixture, grid);
            const headerLastName = GridFunctions.getColumnHeader(fieldLastName, fixture, grid);

            grid.sortingOptions = { mode: 'single' };
            fixture.detectChanges();

            GridFunctions.clickHeaderSortIcon(header);
            tick(30);
            fixture.detectChanges();
            expect(GridFunctions.getColumnSortingIndex(header)).toBeNull();
            expect(grid.sortingExpressions.length).toBe(1);

            GridFunctions.clickHeaderSortIcon(headerLastName);
            tick(30);
            fixture.detectChanges();

            expect(GridFunctions.getColumnSortingIndex(headerLastName)).toBeNull();
            expect(grid.sortingExpressions.length).toBe(1);
        }));

        it('should not clear sortingExpressions when setting sortingOptions on init. ', fakeAsync(() => {
            fixture = TestBed.createComponent(SortOnInitComponent);
            fixture.detectChanges();
            grid = fixture.componentInstance.grid;
            expect(grid.sortingExpressions.length).toBe(1);
        }));
    });
});
