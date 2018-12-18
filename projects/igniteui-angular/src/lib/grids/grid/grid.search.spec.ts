import { async, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { IgxGridModule, IgxGridComponent } from './index';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { BasicGridSearchComponent } from '../../test-utils/grid-base-components.spec';
import { SampleTestData } from '../../test-utils/sample-test-data.spec';
import { GridWithAvatarComponent, GroupableGridSearchComponent, ScrollableGridSearchComponent } from '../../test-utils/grid-samples.spec';
import { IForOfState } from '../../directives/for-of/for_of.directive';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { wait } from '../../test-utils/ui-interactions.spec';

describe('IgxGrid - search API', () => {
    configureTestSuite();
    const CELL_CSS_CLASS = '.igx-grid__td';
    let fix, component, grid: IgxGridComponent, fixNativeElement;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                BasicGridSearchComponent,
                GridWithAvatarComponent,
                GroupableGridSearchComponent,
                ScrollableGridSearchComponent
            ],
            imports: [IgxGridModule.forRoot()]
        }).compileComponents();
    }));

    /* BasicGrid */
    describe('', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(BasicGridSearchComponent);
            fix.componentInstance.data = SampleTestData.personJobDataFull();
            fix.detectChanges();

            component = fix.componentInstance;
            grid = component.grid;
            fixNativeElement = fix.debugElement.nativeElement;
        });

        it('Should clear all highlights', () => {
            const count = grid.findNext('software');

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(5);
            expect(count).toBe(5);

            grid.clearSearch();

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(0);
        });

        it('findNext highlights the correct cells', () => {
            let count = grid.findNext('developer');

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(4);
            expect(count).toBe(4);

            let activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[0]);

            count = grid.findNext('developer');

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[1]);

            count = grid.findNext('developer');

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[2]);

            count = grid.findNext('developer');

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[3]);

            count = grid.findNext('developer');

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[0]);
        });

        it('findPrev highlights the correct cells', () => {
            let count = grid.findNext('developer');

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(4);
            expect(count).toBe(4);

            let activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[0]);

            count = grid.findPrev('developer');

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[3]);

            count = grid.findPrev('developer');

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[2]);

            count = grid.findPrev('developer');

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[1]);

            count = grid.findPrev('developer');

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[0]);
        });

        it('findPrev and findNext work properly for case sensitive searches', () => {
            grid.getCellByColumn(4, 'JobTitle').update('Senior Software DEVELOPER');
            fix.detectChanges();

            let count = grid.findNext('Developer', true);

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(3);
            expect(count).toBe(3);

            let activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[0]);

            count = grid.findPrev('Developer', true);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[2]);

            count = grid.findNext('Developer', true);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[0]);

            count = grid.findNext('Developer', true);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[1]);

            count = grid.findPrev('developer', true);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);

            expect(activeSpan).toBe(null);
            expect(count).toBe(0);
            expect(spans.length).toBe(0);
        });

        it('findNext and findPrev highlight nothing when there is no exact match, regardless of case sensitivity.', () => {
            let count = grid.findNext('Developer', false, true);

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(0);
            expect(count).toBe(0);

            count = grid.findNext('Developer', true, true);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(0);
            expect(count).toBe(0);

            count = grid.findPrev('Developer', false, true);
            fix.detectChanges();
            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(0);
            expect(count).toBe(0);

            count = grid.findPrev('Developer', true, true);
            fix.detectChanges();
            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(0);
            expect(count).toBe(0);
        });

        it('findNext and findPrev highlight only exact matches when searching by exact match', () => {
            let count = grid.findNext('Software Developer', false, false);

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(4);
            expect(count).toBe(4);

            count = grid.findNext('Software Developer', false, true);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            let activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[0]);
            expect(spans.length).toBe(1);
            expect(count).toBe(1);

            count = grid.findPrev('Software Developer', false, false);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(4);
            expect(count).toBe(4);

            count = grid.findPrev('Software Developer', false, true);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[0]);
            expect(spans.length).toBe(1);
            expect(count).toBe(1);
        });

        it('findNext and findPrev highlight only exact matches by respecting case sensitivity', () => {
            grid.getCellByColumn(5, 'JobTitle').update('director of Dev operations');
            fix.detectChanges();

            // Case INsensitive and exact match
            let count = grid.findNext('director', false, true);

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            let activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[0]);
            expect(spans.length).toBe(2);
            expect(count).toBe(2);

            count = grid.findPrev('director', false, true);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[1]);
            expect(spans.length).toBe(2);
            expect(count).toBe(2);

            // Case sensitive and exact match
            count = grid.findNext('director', true, true);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(0);
            expect(count).toBe(0);

            count = grid.findPrev('director', true, true);

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(0);
            expect(count).toBe(0);
        });

        it('Should update exact match highlights when filtering.', async () => {
            const count = grid.findNext('Software Developer', false, true);
            let activeHighlight = grid.nativeElement.querySelector('.' + component.activeClass);
            let highlights = grid.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.filter('JobTitle', 'Associate', IgxStringFilteringOperand.instance().condition('contains'));
            await wait();
            fix.detectChanges();

            activeHighlight = grid.nativeElement.querySelector('.' + component.activeClass);
            highlights = grid.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBeNull();

            grid.clearFilter('JobTitle');
            await wait();
            fix.detectChanges();
        });

        it('Should update exact match highlights when clearing filter.', async () => {
            grid.filter('JobTitle', 'Associate', IgxStringFilteringOperand.instance().condition('contains'));
            await wait();
            fix.detectChanges();

            const count = grid.findNext('Software Developer', false, true);
            let activeHighlight = grid.nativeElement.querySelector('.' + component.activeClass);
            let highlights = grid.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBeNull();

            grid.clearFilter('JobTitle');
            await wait();
            fix.detectChanges();

            activeHighlight = grid.nativeElement.querySelector('.' + component.activeClass);
            highlights = grid.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Should update the active highlight when sorting', () => {
            const allCells = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS));
            const rv = allCells[6].nativeElement;
            const cell = grid.getCellByColumn(0, 'JobTitle');
            const searchString = 'assoc';

            let activeHighlight = rv.querySelector('.' + component.activeClass);
            expect(activeHighlight !== null).toBeFalsy();

            cell.column.sortable = true;
            grid.findNext(searchString);
            grid.findNext(searchString);


            grid.sort({fieldName: 'JobTitle', dir: SortingDirection.Asc, ignoreCase: true });
            fix.detectChanges();

            activeHighlight = rv.querySelector('.' + component.activeClass);
            let highlights = rv.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.sort({fieldName: 'JobTitle', dir: SortingDirection.Desc, ignoreCase: true });
            fix.detectChanges();
            const scrolledCell = grid.getCellByColumn(grid.data.length - 1, 'JobTitle').nativeElement;

            activeHighlight = scrolledCell.querySelector('.' + component.activeClass);
            highlights = scrolledCell.querySelectorAll('.' + component.highlightClass);

            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Should scroll properly when using paging', async () => {
            grid.paging = true;
            grid.perPage = 7;
            const searchString = 'assoc';
            fix.detectChanges();

            grid.findNext(searchString);
            grid.findNext(searchString);
            await wait();
            fix.detectChanges();

            expect(grid.page).toBe(1);
            let highlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(highlight).not.toBeNull();

            grid.findPrev(searchString);
            await wait();
            fix.detectChanges();

            highlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(highlight).not.toBeNull();
            expect(grid.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass).length).toBe(1);
            expect(grid.page).toBe(0);
            grid.findPrev(searchString);
            await wait();
            fix.detectChanges();

            highlight = grid.nativeElement.querySelector('.' + fix.componentInstance.activeClass);
            expect(highlight).not.toBeNull();
            expect(grid.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass).length).toBe(1);
            expect(grid.page).toBe(1);
        });

        it('Hidden columns shouldn\'t be part of the search', () => {
            grid.columns[1].hidden = true;
            grid.findNext('casey');

            const activeHighlight = grid.nativeElement.querySelector('.' + component.activeClass);
            const highlights = grid.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBe(null);
        });

        it('Search should honor the visible columns order', () => {
            grid.columns[3].pinned = true;
            const cell = grid.getCellByColumn(0, 'HireDate').nativeElement;

            grid.findNext('1');

            const activeHighlight = cell.querySelector('.' + component.activeClass);
            const highlights = cell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(5);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Active highlight should be updated when a column is pinned/unpinned', () => {
            let cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            let activeHighlight: any;
            let highlights: any[];

            grid.findNext('casey');
            cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            activeHighlight = cellName.querySelector('.' + component.activeClass);
            highlights = cellName.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
            grid.columns[1].pinned = true;

            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            activeHighlight = cellName.querySelector('.' + component.activeClass);
            highlights = cellName.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.columns[1].pinned = false;

            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            activeHighlight = cellName.querySelector('.' + component.activeClass);
            highlights = cellName.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Active highlight should be updated when a column is hidden/shown', () => {
            let cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            let activeHighlight: any;
            let highlights: any[];

            grid.findNext('casey');

            activeHighlight = cellName.querySelector('.' + component.activeClass);
            highlights = cellName.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
            grid.columns[0].hidden = true;

            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            activeHighlight = cellName.querySelector('.' + component.activeClass);
            highlights = cellName.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.columns[0].hidden = false;

            fix.detectChanges();
            cellName = grid.getCellByColumn(0, 'Name').nativeElement;
            activeHighlight = cellName.querySelector('.' + component.activeClass);
            highlights = cellName.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Clear filter properly updates the highlights', async () => {
            let gilbertoDirectorCell = grid.getCellByColumn(1, 'JobTitle').nativeElement;
            let tanyaDirectorCell = grid.getCellByColumn(2, 'JobTitle').nativeElement;
            let activeHighlight: any;
            let highlights: any[];

            grid.findNext('director');
            await wait();
            fix.detectChanges();

            gilbertoDirectorCell = grid.getCellByColumn(1, 'JobTitle').nativeElement;
            activeHighlight = gilbertoDirectorCell.querySelector('.' + component.activeClass);
            highlights = gilbertoDirectorCell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.filter('Name', 'Tanya', IgxStringFilteringOperand.instance().condition('contains'));
            await wait();
            fix.detectChanges();

            tanyaDirectorCell = grid.getCellByColumn(0, 'JobTitle').nativeElement;
            activeHighlight = tanyaDirectorCell.querySelector('.' + component.activeClass);
            highlights = tanyaDirectorCell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.clearFilter();
            await wait();
            fix.detectChanges();

            tanyaDirectorCell = grid.getCellByColumn(2, 'JobTitle').nativeElement;
            activeHighlight = tanyaDirectorCell.querySelector('.' + component.activeClass);
            highlights = tanyaDirectorCell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.findNext('Director');
            await wait();
            fix.detectChanges();

            gilbertoDirectorCell = grid.getCellByColumn(1, 'JobTitle').nativeElement;
            activeHighlight = gilbertoDirectorCell.querySelector('.' + component.activeClass);
            highlights = gilbertoDirectorCell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Unsearchable column should not interfere with active highlight for other columns on its right', () => {
            grid.columns[1].searchable = false;
            grid.columns[3].searchable = false;

            const count = grid.findNext('Software');
            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            expect(spans.length).toBe(5);
            expect(count).toBe(5);

            let activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[0]);

            grid.findNext('Software');

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            activeSpan = fixNativeElement.querySelector('.' + component.activeClass);
            expect(activeSpan).toBe(spans[1]);
        });

        it('Highlights should be properly updated when a row is deleted', () => {
            // Specify primaryKey so record deletion is allowed.
            grid.primaryKey = 'ID';
            let jackSoftwareCell = grid.getCellByColumn(3, 'JobTitle').nativeElement;
            let celiaSoftwareCell = grid.getCellByColumn(4, 'JobTitle').nativeElement;
            let leslieSoftwareCell = grid.getCellByColumn(8, 'JobTitle').nativeElement;
            let activeHighlight: any;
            let highlights: any[];

            grid.findNext('software');
            jackSoftwareCell = grid.getCellByColumn(3, 'JobTitle').nativeElement;
            activeHighlight = jackSoftwareCell.querySelector('.' + component.activeClass);
            highlights = jackSoftwareCell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.deleteRow(4);
            fix.detectChanges();

            celiaSoftwareCell = grid.getCellByColumn(3, 'JobTitle').nativeElement;
            activeHighlight = celiaSoftwareCell.querySelector('.' + component.activeClass);
            highlights = celiaSoftwareCell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.findPrev('software');

            leslieSoftwareCell = grid.getCellByColumn(7, 'JobTitle').nativeElement;
            activeHighlight = leslieSoftwareCell.querySelector('.' + component.activeClass);
            highlights = leslieSoftwareCell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Highlights should be properly updated when a row is added', () => {
            const tanyaDirectorCell = grid.getCellByColumn(2, 'JobTitle').nativeElement;
            let activeHighlight: any;
            let highlights: any[];

            grid.findNext('director');
            grid.findNext('director');

            activeHighlight = tanyaDirectorCell.querySelector('.' + component.activeClass);
            highlights = tanyaDirectorCell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.addRow({
                ID: 11,
                Name: 'John Doe',
                JobTitle: 'Director',
                HireDate: new Date()
            });
            fix.detectChanges();

            activeHighlight = tanyaDirectorCell.querySelector('.' + component.activeClass);
            highlights = tanyaDirectorCell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            grid.findNext('director');

            const johnDirectorCell = grid.getCellByColumn(grid.rowList.length - 1, 'JobTitle').nativeElement;

            activeHighlight = johnDirectorCell.querySelector('.' + component.activeClass);
            highlights = johnDirectorCell.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Active highlight should be updated when filtering is applied', async () => {
            grid.findNext('developer');

            grid.filter('JobTitle', 'Associate', IgxStringFilteringOperand.instance().condition('contains'));
            await wait();
            fix.detectChanges();

            const activeHighlight = grid.nativeElement.querySelector('.' + component.activeClass);
            const highlights = grid.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(2);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Active highlight should be preserved when all rows are filtered out', async () => {
            grid.height = '500px';
            await wait();
            fix.detectChanges();

            grid.findNext('casey');

            let highlights = grid.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);

            grid.filter('Name', 'zxxz', IgxStringFilteringOperand.instance().condition('contains'));
            await wait();
            fix.detectChanges();

            let activeHighlight = grid.nativeElement.querySelector('.' + component.activeClass);
            highlights = grid.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBeNull();

            grid.clearFilter('Name');
            await wait();
            fix.detectChanges();
            activeHighlight = grid.nativeElement.querySelector('.' + component.activeClass);
            highlights = grid.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Active highlight should be preserved when a column is moved', () => {
            grid.findNext('casey');

            const columns = grid.columnList.toArray();
            grid.moveColumn(columns[0], columns[1]);

            const activeHighlight = grid.nativeElement.querySelector('.' + component.activeClass);
            const highlights = grid.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Should exit edit mode and search a cell', async () => {
            const cell = grid.getCellByColumn(0, 'Name');

            cell.column.editable = true;
            cell.inEditMode = true;
            await wait();
            fix.detectChanges();

            grid.findNext('casey');

            const highlights = cell.nativeElement.querySelectorAll('.' + fix.componentInstance.highlightClass);
            const activeHighlight = cell.nativeElement.querySelector('.' + fix.componentInstance.activeClass);

            expect(cell.inEditMode).toBeFalsy();
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);

            cell.inEditMode = false;
            await wait(30);
            fix.detectChanges();
        });
    });

    /* ScrollableGrid */
    describe('', () => {
        beforeEach(async () => {
            fix = TestBed.createComponent(ScrollableGridSearchComponent);
            fix.detectChanges();

            component = fix.componentInstance;
            grid = component.grid;
            grid.data[29] = { ID: 30, Name: 'Eduardo Ramirez', JobTitle: 'Manager', HireDate: '1887-11-28T11:23:17.714Z' };
            grid.width = '500px';
            grid.height = '600px';
            await wait();
            fixNativeElement = fix.debugElement.nativeElement;
            fix.detectChanges();
        });

        it('findNext scrolls to cells out of view', async () => {
            grid.findNext('30');
            await wait();
            expect(isInView(29, grid.virtualizationState)).toBeTruthy();

            grid.findNext('1887');
            await wait();
            expect(isInView(3, grid.rowList.first.virtDirRow.state)).toBeTruthy();
        });

        it('findPrev scrolls to cells out of view', async () => {
            grid.findPrev('30');
            await wait();
            fix.detectChanges();
            expect(isInView(29, grid.virtualizationState)).toBeTruthy();

            grid.findPrev('1887');
            await wait();
            fix.detectChanges();
            expect(isInView(3, grid.rowList.first.virtDirRow.state)).toBeTruthy();
        });

        it('should keep the active highlight when active cell enters and exits edit mode', () => {
            pending('When the cell enters edit mode, the highlight stays and the content is doubled! Happens in tests only!');
            const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS)).nativeElement;
            const cell = grid.getCellByColumn(0, 'ID');
            const initialValue = rv.textContent;
            let activeHighlight = rv.querySelector('.' + component.activeClass);
            expect(activeHighlight).toBeNull();

            cell.column.editable = true;
            fix.detectChanges();

            grid.findNext('1');

            activeHighlight = rv.querySelector('.' + component.activeClass);
            expect(activeHighlight).not.toBeNull();

            cell.inEditMode = true;
            fix.detectChanges();

            expect(cell.inEditMode).toBe(true);
            activeHighlight = rv.querySelector('.' + component.activeClass);
            expect(activeHighlight).toBeNull();

            cell.inEditMode = false;
            fix.detectChanges();

            expect(rv.textContent).toBe(initialValue);
            expect(rv.querySelectorAll('.' + component.highlightClass).length).toBe(1);
            activeHighlight = rv.querySelector('.' + component.activeClass);
            expect(activeHighlight).not.toBeNull();
        });

        it('should update highlights when a new value is entered', () => {
            pending('When the cell enters edit mode, the highlight stays and the content is doubled! Happens in tests only!');

            const rv = fix.debugElement.query(By.css(CELL_CSS_CLASS));
            const cell = grid.getCellByColumn(0, 'ID');
            cell.column.editable = true;
            fix.detectChanges();

            let activeHighlight = rv.nativeElement.querySelector('.' + component.activeClass);
            expect(activeHighlight).toBeNull();

            grid.findNext('1');
            fix.detectChanges();

            activeHighlight = rv.nativeElement.querySelector('.' + component.activeClass);
            expect(activeHighlight).not.toBeNull();

            cell.inEditMode = true;
            grid.nativeElement.dispatchEvent(new Event('onCellClick'));
            fix.detectChanges();
            expect(cell.inEditMode).toBe(true);

            const inputElem: HTMLInputElement = rv.nativeElement.querySelector('input') as HTMLInputElement;
            inputElem.value = '11';
            fix.detectChanges();

            cell.update(inputElem.value);
            fix.detectChanges();

            expect(rv.nativeElement.textContent).toBe('11');
            activeHighlight = rv.nativeElement.querySelector('.' + component.activeClass);
            const highlights = rv.nativeElement.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(2);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('should update highlights when the cell value is cleared', async () => {
            const rv = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[1].nativeElement;
            const rv2 = fix.debugElement.queryAll(By.css(CELL_CSS_CLASS))[2].nativeElement;
            const cell = grid.getCellByColumn(0, 'Name');

            let activeHighlight = rv.querySelector('.' + component.activeClass);
            expect(activeHighlight).toBeNull();

            cell.column.editable = true;

            grid.findNext('c');
            await wait();
            fix.detectChanges();

            activeHighlight = rv.querySelector('.' + component.activeClass);
            expect(activeHighlight).not.toBeNull();

            cell.inEditMode = true;
            fix.detectChanges();
            expect(cell.inEditMode).toBe(true);

            const inputElem: HTMLInputElement = rv.querySelector('input') as HTMLInputElement;
            inputElem.value = '';

            cell.update(inputElem.value);
            fix.detectChanges();

            activeHighlight = rv.querySelector('.' + component.activeClass);
            let highlights = rv.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(0);
            expect(activeHighlight).toBeNull();

            activeHighlight = rv2.querySelector('.' + component.activeClass);
            highlights = rv2.querySelectorAll('.' + component.highlightClass);
            expect(highlights.length).toBe(1);
            expect(activeHighlight).toBe(highlights[0]);
        });

        it('Should update highlight when setting perPage option', async () => {
            grid.paging = true;
            fix.detectChanges();

            const searchString = 'casey';

            grid.findNext(searchString);
            grid.findNext(searchString);
            await wait();
            fix.detectChanges();
            let highlight = grid.nativeElement.querySelector('.' + component.activeClass);
            expect(highlight).not.toBeNull();
            expect(grid.page).toBe(0);

            grid.perPage = 10;
            fix.detectChanges();

            highlight = grid.nativeElement.querySelector('.' + component.activeClass);
            expect(highlight).toBeNull();
            expect(grid.page).toBe(0);

            grid.page = 1;
            await wait(30);
            fix.detectChanges();
            highlight = grid.nativeElement.querySelector('.' + component.activeClass);
            expect(highlight).not.toBeNull();
        });
    });

    /* GroupableGrid */
    describe('', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(GroupableGridSearchComponent);
            fix.detectChanges();

            component = fix.componentInstance;
            grid = component.grid;
            fixNativeElement = fix.debugElement.nativeElement;
        });

        it('Should be able to navigate through highlights with grouping enabled', async () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            grid.findNext('Software');
            await wait();
            fix.detectChanges();

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            let highlight = fixNativeElement.querySelector('.' + component.activeClass);
            expect(spans.length).toBe(5);
            expect(highlight).toBe(spans[0]);

            grid.findNext('Software');
            grid.findNext('Software');
            await wait();
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            highlight = fixNativeElement.querySelector('.' + component.activeClass);
            expect(spans.length).toBe(5);
            expect(highlight).toBe(spans[2]);

            grid.findPrev('Software');
            await wait();
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            highlight = fixNativeElement.querySelector('.' + component.activeClass);
            expect(spans.length).toBe(5);
            expect(highlight).toBe(spans[1]);

            grid.findPrev('Software');
            grid.findPrev('Software');
            await wait();
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            highlight = fixNativeElement.querySelector('.' + component.activeClass);
            expect(spans.length).toBe(5);
            expect(highlight).toBe(spans[4]);
        });

        it('Should be able to react to changes in grouping', async () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });

            let cell = grid.getCellByColumn(1, 'JobTitle');
            grid.findNext('software');
            await wait();
            fix.detectChanges();

            let highlight = cell.nativeElement.querySelector('.' + component.activeClass);
            expect(highlight !== null).toBeTruthy();

            grid.clearGrouping();
            fix.detectChanges();

            cell = grid.getCellByColumn(6, 'JobTitle');
            highlight = cell.nativeElement.querySelector('.' + component.activeClass);
            expect(highlight !== null).toBeTruthy();

            grid.groupBy([{
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            }, {
                fieldName: 'Company',
                dir: SortingDirection.Desc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            }]);

            fix.detectChanges();

            cell = grid.getCellByColumn(4, 'JobTitle');
            highlight = cell.nativeElement.querySelector('.' + component.activeClass);
            expect(highlight !== null).toBeTruthy();

            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Desc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });

            grid.findNext('software');
            await wait();
            fix.detectChanges();
            cell = grid.getCellByColumn(5, 'JobTitle');
            highlight = cell.nativeElement.querySelector('.' + component.activeClass);
            expect(highlight !== null).toBeTruthy();
        });

        it('Should be able to navigate through highlights with grouping and paging enabled', async () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            grid.paging = true;
            grid.perPage = 6;

            grid.findNext('Software');
            await wait();
            fix.detectChanges();

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            let highlight = fixNativeElement.querySelector('.' + component.activeClass);

            expect(spans.length).toBe(2);
            expect(highlight).toBe(spans[0]);
            expect(grid.page).toBe(0);

            grid.findPrev('Software');
            await wait();
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            highlight = fixNativeElement.querySelector('.' + component.activeClass);

            expect(spans.length).toBe(3);
            expect(highlight).toBe(spans[2]);
            expect(grid.page).toBe(1);

            grid.findPrev('Software');
            grid.findPrev('Software');
            await wait();
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            highlight = fixNativeElement.querySelector('.' + component.activeClass);

            expect(spans.length).toBe(3);
            expect(highlight).toBe(spans[0]);
            expect(grid.page).toBe(1);
        });

        it('Should be able to properly handle perPage changes with gouping and paging', async () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });
            grid.paging = true;
            grid.perPage = 10;

            grid.findNext('Software');
            grid.findNext('Software');
            grid.findNext('Software');
            await wait();
            fix.detectChanges();

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            let highlight = fixNativeElement.querySelector('.' + component.activeClass);

            expect(spans.length).toBe(5);
            expect(highlight).toBe(spans[2]);
            expect(grid.page).toBe(0);

            grid.perPage = 5;
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            highlight = fixNativeElement.querySelector('.' + component.activeClass);

            expect(spans.length).toBe(2);
            expect(highlight).toBeNull();
            expect(grid.page).toBe(0);

            grid.page = 1;
            await wait();
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            highlight = fixNativeElement.querySelector('.' + component.activeClass);

            expect(spans.length).toBe(3);
            expect(highlight).toBe(spans[0]);
            expect(grid.page).toBe(1);
        });

        it('Should be able to properly handle navigating through collapsed rows', async () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });

            grid.findNext('software');
            grid.findNext('software');
            grid.findNext('software');

            grid.toggleGroup(grid.groupsRecords[0]);
            await wait();
            fix.detectChanges();

            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            let highlight = fixNativeElement.querySelector('.' + component.activeClass);

            expect(spans.length).toBe(3);
            expect(highlight).toBe(spans[0]);

            grid.findNext('software');
            grid.findNext('software');
            grid.findNext('software');
            await wait();
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            highlight = fixNativeElement.querySelector('.' + component.activeClass);

            expect(spans.length).toBe(5);
            expect(highlight).toBe(spans[0]);
            expect(grid.isExpandedGroup(grid.groupsRecords[0])).toBeTruthy();
        });

        xit('Should be able to properly handle navigating through collapsed rows with paging', async () => {
            grid.groupBy({
                fieldName: 'JobTitle',
                dir: SortingDirection.Asc,
                ignoreCase: true,
                strategy: DefaultSortingStrategy.instance()
            });

            grid.perPage = 5;
            grid.paging = true;
            fix.detectChanges();

            grid.findNext('software');
            grid.findNext('software');
            await wait();
            fix.detectChanges();

            grid.toggleGroup(grid.groupsRecords[0]);
            grid.findNext('software');

            await wait();
            fix.detectChanges();
            let spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            let highlight = fixNativeElement.querySelector('.' + component.activeClass);

            expect(spans.length).toBe(3);
            expect(highlight).toBe(spans[0]);
            expect(grid.page).toBe(1);

            grid.findNext('software');
            grid.findNext('software');
            grid.findNext('software');
            await wait();
            fix.detectChanges();

            spans = fixNativeElement.querySelectorAll('.' + component.highlightClass);
            highlight = fixNativeElement.querySelector('.' + component.activeClass);

            expect(spans.length).toBe(2);
            expect(highlight).toBe(spans[0]);
            expect(grid.isExpandedGroup(grid.groupsRecords[0])).toBeTruthy();
            expect(grid.page).toBe(0);
        });
    });

    /* Grid with Avatar */
    it('Cells with no text should be excluded from the search', () => {
        fix = TestBed.createComponent(GridWithAvatarComponent);
        grid = fix.componentInstance.grid;
        fix.detectChanges();

        const matches = grid.findNext('https');
        expect(matches).toBe(0);
    });

    function findNext(currentGrid: IgxGridComponent, text: string) {
        const promise = new Promise((resolve) => {
            currentGrid.verticalScrollContainer.onChunkLoad.subscribe((state) => {
                resolve(state);
            });

            currentGrid.findNext(text);
        });
        return promise;
    }

    function isInView(index, state: IForOfState): boolean {
        return index > state.startIndex && index <= state.startIndex + state.chunkSize;
    }
});
