import { configureTestSuite } from '../../test-utils/configure-suite';
import { async, TestBed, tick } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxHierarchicalGridModule } from './index';
import { Component, ViewChild } from '@angular/core';
import { IgxHierarchicalGridComponent } from './hierarchical-grid.component';
import { IgxRowIslandComponent } from './row-island.component';
import { wait, UIInteractions } from '../../test-utils/ui-interactions.spec';
import { SortingDirection } from '../../data-operations/sorting-expression.interface';
import { DefaultSortingStrategy } from '../../data-operations/sorting-strategy';
import { IgxGridGroupByRowComponent } from '../grid';
import { IgxHierarchicalRowComponent } from './hierarchical-row.component';
import { IgxChildGridRowComponent } from './child-grid-row.component';
import { IgxStringFilteringOperand } from '../../data-operations/filtering-condition';

describe('IgxHierarchicalGrid Integration', () => {
    configureTestSuite();
    let fixture;
    let hierarchicalGrid: IgxHierarchicalGridComponent;
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                IgxHierarchicalGridTestBaseComponent
            ],
            imports: [
                NoopAnimationsModule, IgxHierarchicalGridModule]
        }).compileComponents();
    }));

    beforeEach(async(() => {
        fixture = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
        fixture.detectChanges();
        hierarchicalGrid = fixture.componentInstance.hgrid;
    }));

    describe('MCH', () => {
        it('should allow declaring column groups.', async () => {
            const expectedColumnGroups = 1;
            const expectedLevel = 1;

            expect(hierarchicalGrid.columnList.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
            expect(hierarchicalGrid.getColumnByName('ProductName').level).toEqual(expectedLevel);

            expect(document.querySelectorAll('igx-grid-header').length).toEqual(4);

            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            // first child of the row should expand indicator
            firstRow.nativeElement.children[0].click();
            fixture.detectChanges();

            const childGrid = hierarchicalGrid.hgridAPI.getChildGrids(false)[0];

            expect(childGrid.columnList.filter(col => col.columnGroup).length).toEqual(expectedColumnGroups);
            expect(childGrid.getColumnByName('ProductName').level).toEqual(expectedLevel);

            expect(document.querySelectorAll('igx-grid-header').length).toEqual(8);
        });
    });

    describe('Selection', () => {
        it('should allow only one cell to be selected in the whole hierarchical grid.', (async () => {
            hierarchicalGrid.height = '500px';
            hierarchicalGrid.reflow();
            fixture.detectChanges();

        let firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            firstRow.nativeElement.children[0].click();
            fixture.detectChanges();
            expect(firstRow.expanded).toBeTruthy();

            let fCell = firstRow.cells.toArray()[0];

            // select parent cell
            fCell.nativeElement.focus();
            await wait(100);
            fixture.detectChanges();

            expect(fCell.selected).toBeTruthy();

            const childGrid =  hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const firstChildRow = childGrid.dataRowList.toArray()[0];
            const fChildCell =  firstChildRow.cells.toArray()[0];

            // select child cell
            fChildCell.nativeElement.focus();
            await wait(100);
            fixture.detectChanges();

            expect(fChildCell.selected).toBeTruthy();
            expect(fCell.selected).toBeFalsy();

            // select parent cell
            firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            fCell = firstRow.cells.toArray()[0];
            fCell.nativeElement.focus();
            await wait(100);
            fixture.detectChanges();
            expect(fChildCell.selected).toBeFalsy();
            expect(fCell.selected).toBeTruthy();
        }));
    });

    describe('Sorting', () => {
        it('should display correct child data for expanded row after sorting.', (async () => {
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            // expand 1st row
            firstRow.nativeElement.children[0].click();
            fixture.detectChanges();
            hierarchicalGrid.sort({
                fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fixture.detectChanges();

            hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fixture.detectChanges();
            hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fixture.detectChanges();

            const childGrid =  hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            const fChildCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
            expect(childGrid.data).toBe(fixture.componentInstance.data[0]['childData']);
            expect(fChildCell.value).toBe('00');
        }));

        it('should allow sorting via headers in child grids', () => {
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            // expand 1st row
            firstRow.nativeElement.children[0].click();
            fixture.detectChanges();
            // enable sorting
            const childGrid =  hierarchicalGrid.hgridAPI.getChildGrids(false)[0];
            childGrid.columnList.toArray()[0].sortable = true;
            fixture.detectChanges();

            const childHeaders = fixture.debugElement.query(By.css('igx-child-grid-row')).queryAll(By.css('igx-grid-header'));
            childHeaders[0].nativeElement.click();
            fixture.detectChanges();
            childHeaders[0].nativeElement.click();
            fixture.detectChanges();

            const fChildCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
            expect(fChildCell.value).toBe('09');
            const icon = childHeaders[0].query(By.css('.sort-icon'));
            expect(icon).not.toBeNull();
            expect(icon.nativeElement.textContent.toLowerCase()).toBe('arrow_downward');
        });
    });

    describe('GroupBy', () => {
        it('Data should be rendered correctly when children are expanded', () => {
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            // expand 1st row
            firstRow.nativeElement.children[0].click();
            fixture.detectChanges();

            hierarchicalGrid.groupBy({
                fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fixture.detectChanges();
            let rows = hierarchicalGrid.rowList.toArray();
            expect(rows[0] instanceof IgxGridGroupByRowComponent).toBeTruthy();
            expect(rows[1] instanceof IgxHierarchicalRowComponent).toBeTruthy();
            expect(rows[2] instanceof IgxChildGridRowComponent).toBeTruthy();

            hierarchicalGrid.clearGrouping('ID');
            hierarchicalGrid.cdr.detectChanges();
            fixture.detectChanges();
            rows = hierarchicalGrid.rowList.toArray();
            expect(rows[0] instanceof IgxHierarchicalRowComponent).toBeTruthy();
            expect(rows[1] instanceof IgxChildGridRowComponent).toBeTruthy();
            expect(rows[2] instanceof IgxHierarchicalRowComponent).toBeTruthy();
        });

        it('child grids data should be correct after grouping in parent grid.',  (async () => {
            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            // expand 1st row
            firstRow.nativeElement.children[0].click();
            fixture.detectChanges();

            const sRow = hierarchicalGrid.dataRowList.toArray()[1];
            // expand 2nd row
            sRow.nativeElement.children[0].click();
            fixture.detectChanges();

            hierarchicalGrid.groupBy({
                fieldName: 'ID', dir: SortingDirection.Desc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fixture.detectChanges();

            hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fixture.detectChanges();
            hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fixture.detectChanges();
            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid1 = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            const childGrid2 = childGrids[1].query(By.css('igx-hierarchical-grid')).componentInstance;

            expect(childGrid1.data).toBe(fixture.componentInstance.data[1]['childData']);
            expect(childGrid2.data).toBe(fixture.componentInstance.data[0]['childData']);
        }));

        it('virtualization should work as expected when scrolling in grid with expanded children and grouped columns.',  (async () => {
            // expand 1st row
            hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
            fixture.detectChanges();
            // expand 2nd row
            hierarchicalGrid.dataRowList.toArray()[1].nativeElement.children[0].click();
            fixture.detectChanges();

            hierarchicalGrid.groupBy({
                fieldName: 'ID', dir: SortingDirection.Asc, ignoreCase: false, strategy: DefaultSortingStrategy.instance()
            });
            fixture.detectChanges();

            hierarchicalGrid.verticalScrollContainer.scrollTo(5);
            await wait(100);
            fixture.detectChanges();

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            expect(childGrid.data).toBe(fixture.componentInstance.data[1]['childData']);

        }));
    });

    describe('Filtering', () => {
        it('should enable filter-row for root and child grids', (async () => {
            let filteringCells = fixture.debugElement.queryAll(By.css('igx-grid-filtering-cell'));

            expect(filteringCells.length).toEqual(3);
            filteringCells[0].query(By.css('igx-chip')).nativeElement.click();
            fixture.detectChanges();
            expect(document.querySelectorAll('igx-grid-filtering-row').length).toEqual(1);

            const firstRow = hierarchicalGrid.dataRowList.toArray()[0];
            // first child of the row should expand indicator
            firstRow.nativeElement.children[0].click();
            fixture.detectChanges();

            filteringCells = fixture.debugElement.queryAll(By.css('igx-grid-filtering-cell'));
            expect(filteringCells.length).toEqual(6);
            filteringCells[3].query(By.css('igx-chip')).nativeElement.click();
            fixture.detectChanges();
            expect(document.querySelectorAll('igx-grid-filtering-row').length).toEqual(2);
        }));

        it('should not lose child grid states after filtering in parent grid.', () => {
            // expand 1st row
            hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
            fixture.detectChanges();
            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            let childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            let fChildCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
            fChildCell.nativeElement.focus({preventScroll: true});
            fixture.detectChanges();
            expect(fChildCell.selected).toBe(true);
            hierarchicalGrid.filter('ID', '0', IgxStringFilteringOperand.instance().condition('contains'), true);
            fixture.detectChanges();
            const rows = hierarchicalGrid.rowList.toArray();
            expect(rows[0].expanded).toBe(true);
            expect(rows[0] instanceof IgxHierarchicalRowComponent).toBeTruthy();
            expect(rows[1] instanceof IgxChildGridRowComponent).toBeTruthy();

            childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            fChildCell =  childGrid.dataRowList.toArray()[0].cells.toArray()[0];
            expect(fChildCell.selected).toBe(true);
        });
    });

    describe('Summaries', () => {
        it('should allow defining summaries for child grid and child should be sized correctly.', () => {
            hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
            fixture.detectChanges();

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            const expander =  childGrid.dataRowList.toArray()[0].expander;

            // Expect expansion cell to be rendered and sized the same as the expansion cell inside the grid
            const summaryRow = childGrid.summariesRowList.first.nativeElement;
            expect(summaryRow.children.length).toEqual(2);
            expect(summaryRow.children[0].tagName.toLowerCase()).toEqual('div');
            expect(summaryRow.children[0].offsetWidth).toEqual(expander.nativeElement.offsetWidth);
            expect(summaryRow.children[1].tagName.toLowerCase()).toEqual('igx-display-container');

            const gridHeight = childGrid.nativeElement.offsetHeight;
            const childElems: HTMLElement[] = Array.from(childGrid.nativeElement.children);
            const elementsHeight = childElems.map(elem => elem.offsetHeight).reduce((total, height) => {
                return total + height;
            }, 0);

            // Expect the combined height of all elements (header, body, footer etc) to equal the calculated height of the grid.
            expect(elementsHeight).toEqual(gridHeight);
        });

        it('should render summaries for column inside a column group.', () => {
            fixture.componentInstance.rowIsland.childColumns.first.hasSummary = false;
            fixture.detectChanges();
            fixture.componentInstance.rowIsland.childColumns.last.hasSummary = true;
            fixture.detectChanges();

            hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
            fixture.detectChanges();

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;

            const summaryRow = childGrid.summariesRowList.first;
            expect(summaryRow.nativeElement.children.length).toEqual(2);
            expect(summaryRow.summaryCells.length).toEqual(3);
        });
    });

    describe('Paging', () => {
        it('should work on data records only when paging is enabled and should not be affected by child grid rows.', (async() => {
            hierarchicalGrid.paging = true;
            hierarchicalGrid.reflow();
            fixture.detectChanges();

            expect(hierarchicalGrid.verticalScrollContainer.igxForOf.length).toEqual(15);

            hierarchicalGrid.dataRowList.toArray()[1].nativeElement.children[0].click();
            fixture.detectChanges();
            expect(hierarchicalGrid.verticalScrollContainer.igxForOf.length).toEqual(16);

            hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
            fixture.detectChanges();
            expect(hierarchicalGrid.verticalScrollContainer.igxForOf.length).toEqual(17);

            hierarchicalGrid.verticalScrollContainer.scrollTo(hierarchicalGrid.verticalScrollContainer.igxForOf.length - 1);
            await wait(100);
            fixture.detectChanges();

            expect(hierarchicalGrid.dataRowList.last.cells.first.value).toEqual('14');
        }));

        it('should preserve expansion states after changing pages.', () => {
            hierarchicalGrid.paging = true;
            hierarchicalGrid.reflow();
            fixture.detectChanges();

            hierarchicalGrid.dataRowList.toArray()[1].nativeElement.children[0].click();
            fixture.detectChanges();
            hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
            fixture.detectChanges();

            expect(hierarchicalGrid.dataRowList.toArray()[0].expanded).toBeTruthy();
            expect(hierarchicalGrid.dataRowList.toArray()[1].expanded).toBeTruthy();
            expect(hierarchicalGrid.verticalScrollContainer.igxForOf.length).toEqual(17);

            let childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            let childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            expect(childGrids.length).toEqual(2);
            expect(childGrid.dataRowList.first.cells.first.value).toEqual('00');

            // Go to next page
            const pagingButtons = hierarchicalGrid.nativeElement.querySelectorAll('.igx-paginator > button');
            pagingButtons[2].dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(hierarchicalGrid.dataRowList.toArray()[0].cells.first.value).toEqual('15');
            expect(hierarchicalGrid.dataRowList.toArray()[0].expanded).toBeFalsy();
            expect(hierarchicalGrid.dataRowList.toArray()[1].expanded).toBeFalsy();
            expect(hierarchicalGrid.verticalScrollContainer.igxForOf.length).toEqual(15);

            childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            expect(childGrids.length).toEqual(0);

            // Return to previous page
            pagingButtons[1].dispatchEvent(new Event('click'));
            fixture.detectChanges();

            expect(hierarchicalGrid.dataRowList.toArray()[0].cells.first.value).toEqual('0');
            expect(hierarchicalGrid.dataRowList.toArray()[0].expanded).toBeTruthy();
            expect(hierarchicalGrid.dataRowList.toArray()[1].expanded).toBeTruthy();
            expect(hierarchicalGrid.verticalScrollContainer.igxForOf.length).toEqual(17);

            childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            expect(childGrids.length).toEqual(2);
            expect(childGrid.dataRowList.first.cells.first.value).toEqual('00');
        });
    });

    describe('Toolbar', () => {
        it('should be displayed correctly for child layout and hiding should apply to the correct child.', () => {
            hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
            fixture.detectChanges();

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            const toolbar = fixture.debugElement.query(By.css('igx-grid-toolbar'));
            const hideButton = toolbar.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnHiding');

            // Check visible columns and headers are rendered correctly
            let childHeaders = childGrids[0].queryAll(By.css('igx-grid-header'));
            expect(childGrid.visibleColumns.length).toEqual(4);
            expect(childHeaders.length).toEqual(3);

            // Check hiding button is rendered
            expect(hideButton).toBeDefined();
            hideButton.nativeElement.click();
            fixture.detectChanges();

            const hidingDropdown = toolbar.query(By.css('igx-column-hiding'));
            const columnsCheckboxes = hidingDropdown.queryAll(By.css('igx-checkbox')).map(elem => elem.componentInstance);

            // Check hiding dropdown is rendered when clicked with correct items in it
            expect(columnsCheckboxes.length).toEqual(4);
            expect(columnsCheckboxes[0].placeholderLabel.nativeElement.innerText.trim()).toEqual('ID');
            expect(columnsCheckboxes[1].placeholderLabel.nativeElement.innerText.trim()).toEqual('Information');
            expect(columnsCheckboxes[2].placeholderLabel.nativeElement.innerText.trim()).toEqual('ChildLevels');
            expect(columnsCheckboxes[3].placeholderLabel.nativeElement.innerText.trim()).toEqual('ProductName');

            columnsCheckboxes[2].nativeCheckbox.nativeElement.click();
            fixture.detectChanges();

            expect(columnsCheckboxes[2].checked).toBeTruthy();

            // Check visible columns and headers
            childHeaders = childGrids[0].queryAll(By.css('igx-grid-header'));
            expect(childGrid.visibleColumns.length).toEqual(3);
            expect(childHeaders.length).toEqual(2);
        });

        it('should be displayed correctly for child layout and pinning should apply to the correct child.', () => {
            hierarchicalGrid.dataRowList.toArray()[0].nativeElement.children[0].click();
            fixture.detectChanges();

            const childGrids =  fixture.debugElement.queryAll(By.css('igx-child-grid-row'));
            const childGrid = childGrids[0].query(By.css('igx-hierarchical-grid')).componentInstance;
            const toolbar = fixture.debugElement.query(By.css('igx-grid-toolbar'));
            const pinButton = toolbar.queryAll(By.css('button')).find((b) => b.nativeElement.name === 'btnColumnPinning');

            // Check visible columns and headers are rendered correctly
            let childHeaders = childGrids[0].queryAll(By.css('igx-grid-header'));
            expect(childGrid.pinnedColumns.length).toEqual(0);
            expect(childHeaders[0].nativeElement.innerText.trim()).toEqual('ID');
            expect(childHeaders[1].nativeElement.innerText.trim()).toEqual('ChildLevels');
            expect(childHeaders[2].nativeElement.innerText.trim()).toEqual('ProductName');

            // Check hiding button is rendered
            expect(pinButton).toBeDefined();

            pinButton.nativeElement.click();
            fixture.detectChanges();

            const pinningDropdown = toolbar.query(By.css('igx-column-pinning'));
            const columnsCheckboxes = pinningDropdown.queryAll(By.css('igx-checkbox')).map(elem => elem.componentInstance);

            // Check hiding dropdown is rendered when clicked with correct items in it
            expect(columnsCheckboxes.length).toEqual(2);
            expect(columnsCheckboxes[0].placeholderLabel.nativeElement.innerText.trim()).toEqual('ID');
            expect(columnsCheckboxes[1].placeholderLabel.nativeElement.innerText.trim()).toEqual('Information');

            columnsCheckboxes[1].nativeCheckbox.nativeElement.click();
            fixture.detectChanges();

            expect(columnsCheckboxes[1].checked).toBeTruthy();

            // Check visible columns and headers
            childHeaders = childGrids[0].queryAll(By.css('igx-grid-header'));
            expect(childGrid.pinnedColumns.length).toEqual(3);
            expect(childHeaders[0].nativeElement.innerText.trim()).toEqual('ChildLevels');
            expect(childHeaders[1].nativeElement.innerText.trim()).toEqual('ProductName');
            expect(childHeaders[2].nativeElement.innerText.trim()).toEqual('ID');
        });
    });
});

@Component({
    template: `
    <igx-hierarchical-grid #grid1 [data]="data" [allowFiltering]="true"
     [height]="'600px'" [width]="'700px'" #hierarchicalGrid primaryKey="ID">
        <igx-column field="ID" [groupable]='true' ></igx-column>
        <igx-column-group header="Information">
                <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true"></igx-column>
                <igx-column field="ProductName" [groupable]='true' [hasSummary]='true'></igx-column>
        </igx-column-group>
        <igx-row-island [key]="'childData'" #rowIsland [allowFiltering]="true" [showToolbar]="true" [columnHiding]="true" [columnPinning]="true">
            <igx-column field="ID" [groupable]='true' [hasSummary]='true' ></igx-column>
            <igx-column-group header="Information">
                    <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true"></igx-column>
                    <igx-column field="ProductName" [groupable]='true'></igx-column>
            </igx-column-group>
            <igx-row-island [key]="'childData'" #rowIsland2 >
                <igx-column field="ID" [groupable]='true' ></igx-column>
                <igx-column-group header="Information">
                        <igx-column field="ChildLevels" [groupable]='true' [sortable]='true' [editable]="true"></igx-column>
                        <igx-column field="ProductName" [groupable]='true' [hasSummary]='true'></igx-column>
                </igx-column-group>
            </igx-row-island>
        </igx-row-island>
    </igx-hierarchical-grid>`
})
export class IgxHierarchicalGridTestBaseComponent {
    public data;
    @ViewChild('hierarchicalGrid', { read: IgxHierarchicalGridComponent }) public hgrid: IgxHierarchicalGridComponent;
    @ViewChild('rowIsland', { read: IgxRowIslandComponent }) public rowIsland: IgxRowIslandComponent;
    @ViewChild('rowIsland2', { read: IgxRowIslandComponent }) public rowIsland2: IgxRowIslandComponent;

    constructor() {
        // 3 level hierarchy
        this.data = this.generateData(40, 3);
    }
    generateData(count: number, level: number, parendID?) {
        const prods = [];
        const currLevel = level;
        let children;
        for (let i = 0; i < count; i++) {
            const rowID = parendID ? parendID + i : i.toString();
           if (level > 0 ) {
                children = this.generateData(count / 2 , currLevel - 1, rowID);
           }
           prods.push({
            ID: rowID, ChildLevels: currLevel,  ProductName: 'Product: A' + i, 'Col1': i,
            'Col2': i, 'Col3': i, childData: children, childData2: children });
        }
        return prods;
    }
}
