import { Component, TemplateRef, ViewChild } from '@angular/core';
import { fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ByLevelTreeGridMergeStrategy, DefaultMergeStrategy, DefaultSortingStrategy, GridCellMergeMode, GridColumnDataType, GridType, IgxColumnComponent, IgxGridComponent, IgxHierarchicalGridComponent, IgxPaginatorComponent, IgxStringFilteringOperand, SortingDirection } from 'igniteui-angular';
import { DataParent } from '../../test-utils/sample-test-data.spec';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import { By } from '@angular/platform-browser';
import { UIInteractions, wait } from '../../test-utils/ui-interactions.spec';
import { hasClass } from '../../test-utils/helper-utils.spec';
import { ColumnLayoutTestComponent } from './grid.multi-row-layout.spec';
import { IgxHierarchicalGridTestBaseComponent } from '../hierarchical-grid/hierarchical-grid.spec';
import { IgxHierarchicalRowComponent } from '../hierarchical-grid/hierarchical-row.component';
import { IgxTreeGridSelectionComponent } from '../../test-utils/tree-grid-components.spec';

describe('IgxGrid - Cell merging #grid', () => {
    let fix;
    let grid: IgxGridComponent;
    const MERGE_CELL_CSS_CLASS = '.igx-grid__td--merged';
    const CELL_CSS_CLASS = '.igx-grid__td';
    const CSS_CLASS_GRID_ROW = '.igx-grid__tr';
    const HIGHLIGHT_ACTIVE_CSS_CLASS = '.igx-highlight__active';

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule, DefaultCellMergeGridComponent, ColumnLayoutTestComponent,
                IgxHierarchicalGridTestBaseComponent, IgxTreeGridSelectionComponent
            ]
        }).compileComponents();
    }));



    describe('Basic', () => {

        beforeEach(() => {
            fix = TestBed.createComponent(DefaultCellMergeGridComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        describe('Configuration', () => {

            it('should allow enabling/disabling merging per column.', () => {

                const col = grid.getColumnByName('ProductName');
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 2 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);

                // disable merge
                col.merge = false;
                fix.detectChanges();

                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 1 },
                    { value: 'NetAdvantage', span: 1 }
                ]);
            });

            it('should always merge columns if mergeMode is always.', () => {
                const col = grid.getColumnByName('Released');
                col.merge = true;
                fix.detectChanges();
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: true, span: 9 }
                ]);
            });

            it('should merge only sorted columns if mergeMode is onSort.', () => {
                grid.cellMergeMode = 'onSort';
                fix.detectChanges();
                const col = grid.getColumnByName('ProductName');
                //nothing is merged initially
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 1 },
                    { value: 'NetAdvantage', span: 1 }
                ]);

                grid.sort({ fieldName: 'ProductName', dir: SortingDirection.Desc, ignoreCase: false });
                fix.detectChanges();

                // merge only after sorted
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'NetAdvantage', span: 2 },
                    { value: 'Ignite UI for JavaScript', span: 3 },
                    { value: 'Ignite UI for Angular', span: 3 },
                    { value: null, span: 1 }
                ]);
            });

            it('should allow setting a custom merge strategy via mergeStrategy on grid.', () => {
                grid.mergeStrategy = new NoopMergeStrategy();
                fix.detectChanges();
                const col = grid.getColumnByName('ProductName');
                // this strategy does no merging
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 1 },
                    { value: 'NetAdvantage', span: 1 }
                ]);
            });

            it('should allow setting a custom comparer for merging on particular column via mergingComparer.', () => {
                const col = grid.getColumnByName('ProductName');
                // all are same and should merge
                col.mergingComparer = (prev: any, rec: any, field: string) => {
                    return true;
                };
                grid.pipeTrigger += 1;
                fix.detectChanges();
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 9 }
                ]);
            });
        });

        describe('UI', () => {
            it('should properly align merged cells with their spanned rows.', () => {
                const mergedCell = fix.debugElement.queryAll(By.css(MERGE_CELL_CSS_CLASS))[0].nativeNode;
                const endRow = fix.debugElement.queryAll(By.css(CSS_CLASS_GRID_ROW))[2].nativeNode;
                expect(mergedCell.getBoundingClientRect().bottom).toBe(endRow.getBoundingClientRect().bottom);
            });

            it('should mark merged cell as hovered when hovering any row that intersects that cell.', () => {
                const secondRow = fix.debugElement.queryAll(By.css(CSS_CLASS_GRID_ROW))[2];
                UIInteractions.hoverElement(secondRow.nativeNode);
                fix.detectChanges();
                // hover 2nd row that intersects the merged cell in row 1
                const mergedCell = fix.debugElement.queryAll(By.css(MERGE_CELL_CSS_CLASS))[0].nativeNode;
                // merged cell should be marked as hovered
                hasClass(mergedCell, 'igx-grid__td--merged-hovered', true);
            });

            it('should set correct size to merged cell that spans multiple rows that have different sizes.', () => {
                const col = grid.getColumnByName('ID');
                col.bodyTemplate = fix.componentInstance.customTemplate;
                fix.detectChanges();
                grid.verticalScrollContainer.recalcUpdateSizes();
                grid.dataRowList.toArray().forEach(x => x.cdr.detectChanges());
                const mergedCell = fix.debugElement.queryAll(By.css(MERGE_CELL_CSS_CLASS))[0].nativeNode;
                // one row is 100px, other is 200, 4px border
                expect(mergedCell.getBoundingClientRect().height).toBe(100 + 200 + 4);
            });
        });
    });

    describe('Integration', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(IntegrationCellMergeGridComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
        });

        describe('Virtualization', () => {
            beforeEach(() => {
                fix.componentInstance.width = '400px';
                fix.componentInstance.height = '300px';
                fix.detectChanges();
            });
            it('should retain rows with merged cells that span multiple rows in DOM as long as merged cell is still in view.',  async() => {
                // initial row list is same as the virtualization chunk
                expect(grid.rowList.length).toBe(grid.virtualizationState.chunkSize);

                grid.navigateTo(grid.virtualizationState.chunkSize - 1, 0);
                await wait(100);
                fix.detectChanges();

                //virtualization starts from 1
                expect(grid.virtualizationState.startIndex).toBe(1);

                // check row is chunkSize + 1 extra row at the top
                expect(grid.rowList.length).toBe(grid.virtualizationState.chunkSize + 1);
                // first row at top is index 0
                expect(grid.rowList.first.index).toBe(0);
                // and has offset to position correctly the merged cell
                expect(grid.rowList.first.nativeElement.offsetTop).toBeLessThan(-50);
            });

            it('should remove row from DOM when merged cell is no longer in view.', async() => {
                // scroll so that first row with merged cell is not in view
                grid.navigateTo(grid.virtualizationState.chunkSize, 0);
                await wait(100);
                fix.detectChanges();

                 //virtualization starts from 2
                 expect(grid.virtualizationState.startIndex).toBe(2);

                 // no merge cells from previous chunks
                 expect(grid.rowList.length).toBe(grid.virtualizationState.chunkSize);
                 // first row is from the virtualization
                 expect(grid.rowList.first.index).toBe(grid.virtualizationState.startIndex);
            });

            it('horizontal virtualization should not be affected by vertically merged cells.', async() => {
                let mergedCell = grid.rowList.first.cells.find(x => x.column.field === 'ProductName');
                expect(mergedCell.value).toBe('Ignite UI for JavaScript');
                expect(mergedCell.nativeElement.parentElement.style.gridTemplateRows).toBe("51px 51px");

                // scroll horizontally
                grid.navigateTo(0, 4);
                await wait(100);
                fix.detectChanges();

                // not in DOM
                mergedCell = grid.rowList.first.cells.find(x => x.column.field === 'ProductName');
                expect(mergedCell).toBeUndefined();

                // scroll back
                grid.navigateTo(0, 0);
                await wait(100);
                fix.detectChanges();

                mergedCell = grid.rowList.first.cells.find(x => x.column.field === 'ProductName');
                expect(mergedCell.value).toBe('Ignite UI for JavaScript');
                expect(mergedCell.nativeElement.parentElement.style.gridTemplateRows).toBe("51px 51px");
            });
        });

        describe('Group By', () => {
            it('cells should merge only within their respective groups.', () => {
                grid.groupBy({
                    fieldName: 'ProductName', dir: SortingDirection.Desc,
                    ignoreCase: false, strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();

                const col = grid.getColumnByName('ProductName');
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'NetAdvantage', span: 2 },
                    { value: 'Ignite UI for JavaScript', span: 3 },
                    { value: 'Ignite UI for Angular', span: 3 },
                    { value: null, span: 1 }
                ]);

                grid.groupBy({
                    fieldName: 'ReleaseDate', dir: SortingDirection.Desc,
                    ignoreCase: false, strategy: DefaultSortingStrategy.instance()
                });
                fix.detectChanges();

                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'NetAdvantage', span: 1 },
                    { value: 'NetAdvantage', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 }
                ]);

            });

        });

        describe('Master-Detail', () => {

            it('should interrupt merge sequence if a master-detail row is expanded.', () => {
                grid.detailTemplate = fix.componentInstance.detailTemplate;
                fix.detectChanges();

                const col = grid.getColumnByName('ProductName');
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 2 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);

                GridFunctions.toggleMasterRow(fix, grid.rowList.first);
                fix.detectChanges();

                // should slit first merge group in 2
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);
            });


        });

        describe('Paging', () => {
            it('should merge cells only on current page of data.', () => {
                fix.componentInstance.paging = true;
                fix.detectChanges();
                grid.triggerPipes();
                fix.detectChanges();

                const col = grid.getColumnByName('ProductName');
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 2 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 }
                ]);

                grid.page = 2;
                fix.detectChanges();

                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);
            });
        });

        describe('Column Pinning', () => {
            it('should merge cells in pinned columns.', () => {
                const col = grid.getColumnByName('ProductName');
                col.pinned = true;
                fix.detectChanges();

                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 2 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);

                const mergedCell = grid.rowList.first.cells.find(x => x.column.field === 'ProductName');
                expect(mergedCell.value).toBe('Ignite UI for JavaScript');
                expect(mergedCell.nativeElement.parentElement.style.gridTemplateRows).toBe("51px 51px");
            });
        });

        describe('Row Pinning', () => {
            it('should merge adjacent pinned rows in pinned row area.', () => {
                const row1 = grid.rowList.toArray()[0];
                const row2 = grid.rowList.toArray()[1];
                const col = grid.getColumnByName('ProductName');
                row1.pin();
                row2.pin();
                fix.detectChanges();

                expect(grid.pinnedRows.length).toBe(2);
                const pinnedRow =  grid.pinnedRows[0];
                expect(pinnedRow.metaData.cellMergeMeta.get(col.field)?.rowSpan).toBe(2);
                const mergedPinnedCell = pinnedRow.cells.find(x => x.column.field === 'ProductName');
                expect(mergedPinnedCell.value).toBe('Ignite UI for JavaScript');
                expect(mergedPinnedCell.nativeElement.parentElement.style.gridTemplateRows).toBe("51px 51px");
            });

            it('should merge adjacent ghost rows in unpinned area.', () => {
                const row1 = grid.rowList.toArray()[0];
                const row2 = grid.rowList.toArray()[1];
                const col = grid.getColumnByName('ProductName');
                row1.pin();
                row2.pin();
                fix.detectChanges();

                const ghostRows = grid.rowList.filter(x => x.disabled);
                expect(ghostRows.length).toBe(2);
                const ghostRow = ghostRows[0];
                expect(ghostRow.metaData.cellMergeMeta.get(col.field)?.rowSpan).toBe(2);
                const mergedPinnedCell = ghostRow.cells.find(x => x.column.field === 'ProductName');
                expect(mergedPinnedCell.value).toBe('Ignite UI for JavaScript');
                expect(mergedPinnedCell.nativeElement.parentElement.style.gridTemplateRows).toBe("51px 51px");
            });

            it('should not merge ghost and data rows together.', () => {
                const col = grid.getColumnByName('ProductName');
                const row1 = grid.rowList.toArray()[0];
                row1.pin();
                fix.detectChanges();
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);
            });
        });

        describe('Activation', () => {

            it('should interrupt merge sequence so that active row has no merging.', async() => {
                const col = grid.getColumnByName('ProductName');
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 2 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);

                const row1 = grid.rowList.toArray()[0];

                UIInteractions.simulateClickAndSelectEvent(row1.cells.toArray()[1].nativeElement);
                await wait(1);
                fix.detectChanges();

                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);
            });

        });

        describe('Updating', () => {

            beforeEach(() => {
                grid.primaryKey = 'ID';
                grid.columns.forEach(x => x.editable = true);
                fix.detectChanges();
            });

            it('should edit the individual row values for the active row.', async() => {
                const col = grid.getColumnByName('ProductName');
                grid.rowEditable = true;
                fix.detectChanges();

                const row = grid.gridAPI.get_row_by_index(0);
                const cell = grid.gridAPI.get_cell_by_index(0, 'ProductName');
                UIInteractions.simulateDoubleClickAndSelectEvent(cell.nativeElement);
                await wait(1);
                fix.detectChanges();
                expect(row.inEditMode).toBe(true);

                // row in edit is not merged anymore
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);

                // enter new val
                const cellInput =  grid.gridAPI.get_cell_by_index(0, 'ProductName').nativeElement.querySelector('[igxinput]');
                UIInteractions.setInputElementValue(cellInput, "NewValue");
                fix.detectChanges();

                // Done button click
                const doneButtonElement = GridFunctions.getRowEditingDoneButton(fix);
                doneButtonElement.click();
                fix.detectChanges();

                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'NewValue', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);
            });

            it('should edit the individual cell value for the active row.', () => {
                const col = grid.getColumnByName('ProductName');
                let cell = grid.gridAPI.get_cell_by_index(0, 'ProductName');

                UIInteractions.simulateDoubleClickAndSelectEvent(cell.nativeElement);
                fix.detectChanges();

                cell = grid.gridAPI.get_cell_by_index(0, 'ProductName');
                expect(cell.editMode).toBe(true);

                // enter new val
                const cellInput =  grid.gridAPI.get_cell_by_index(0, 'ProductName').nativeElement.querySelector('[igxinput]');
                UIInteractions.setInputElementValue(cellInput, "NewValue");
                fix.detectChanges();

                UIInteractions.triggerEventHandlerKeyDown('enter', GridFunctions.getGridContent(fix));
                fix.detectChanges();

                 // row with edit cell is not merged anymore
                 GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'NewValue', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);
            });
        });

        describe('Row Selection', () => {

            it('should mark all merged cells that intersect with a selected row as selected.', () => {
                grid.rowSelection = 'multiple';
                fix.detectChanges();

                const secondRow = grid.rowList.toArray()[1];
                GridSelectionFunctions.clickRowCheckbox(secondRow);
                fix.detectChanges();

                expect(secondRow.selected).toBe(true);

                const mergedIntersectedCell = grid.gridAPI.get_cell_by_index(0, 'ProductName');
                // check cell has selected style
                hasClass(mergedIntersectedCell.nativeElement,'igx-grid__td--merged-selected', true);
            });

        });

        describe('Cell Selection', () => {
            it('should interrupt merge sequence so that selected cell has no merging.', () => {
                const col = grid.getColumnByName('ProductName');
                grid.cellSelection = 'multiple';
                fix.detectChanges();

                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 2 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 2 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);

                const startCell = grid.gridAPI.get_cell_by_index(4, 'ProductName');
                const endCell = grid.gridAPI.get_cell_by_index(0, 'ID');

                GridSelectionFunctions.selectCellsRangeNoWait(fix, startCell, endCell);
                fix.detectChanges();

                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for JavaScript', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: 'Ignite UI for Angular', span: 1 },
                    { value: null, span: 1 },
                    { value: 'NetAdvantage', span: 2 }
                ]);

                // check api
                expect(grid.getSelectedData().length).toBe(5);
                expect(grid.getSelectedData()).toEqual(grid.data.slice(0, 5).map(x => {
                    return { 'ID': x.ID, 'ProductName': x. ProductName};
                }));
            });
        });

        describe('Column selection', () => {
            it('should mark merged cells in selected column as selected.', () => {
                grid.columnSelection = 'multiple';
                fix.detectChanges();
                const col = grid.getColumnByName('ProductName');
                col.selected = true;
                fix.detectChanges();

                const mergedCells = fix.debugElement.queryAll(By.css(MERGE_CELL_CSS_CLASS));
                mergedCells.forEach(element => {
                    hasClass(element.nativeNode, 'igx-grid__td--column-selected', true);
                });
            });

            it('selected data API should return all associated data fields as selected.', () => {
                grid.columnSelection = 'multiple';
                fix.detectChanges();
                const col = grid.getColumnByName('ProductName');
                col.selected = true;
                fix.detectChanges();

                expect(grid.getSelectedColumnsData()).toEqual(grid.data.map(x => {
                    return {'ProductName': x. ProductName};
                }));
            });
        });

        describe('Filtering', () => {

            it('should merge cells in filtered data.', () => {
                grid.filter('ProductName', 'Net', IgxStringFilteringOperand.instance().condition('startsWith'), true);
                fix.detectChanges();
                const col = grid.getColumnByName('ProductName');
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'NetAdvantage', span: 2 }
                ]);
            });

        });

        describe('Searching', () => {

            it('findNext \ findPrev should count merged cells as 1 result and navigate once through them.', () => {
                const cell0 = grid.gridAPI.get_cell_by_index(0, 'ProductName').nativeElement;
                const cell3 = grid.gridAPI.get_cell_by_index(3, 'ProductName').nativeElement;
                const fixNativeElem = fix.debugElement.nativeElement;

                let matches = grid.findNext('JavaScript');
                fix.detectChanges();

                expect(matches).toBe(2);

                let activeHighlight = fixNativeElem.querySelectorAll(HIGHLIGHT_ACTIVE_CSS_CLASS);
                expect(activeHighlight[0].closest("igx-grid-cell")).toBe(cell0);

                matches = grid.findNext('JavaScript');
                fix.detectChanges();

                activeHighlight = fixNativeElem.querySelectorAll(HIGHLIGHT_ACTIVE_CSS_CLASS);
                expect(activeHighlight[0].closest("igx-grid-cell")).toBe(cell3);

                matches = grid.findPrev('JavaScript');
                fix.detectChanges();

                activeHighlight = fixNativeElem.querySelectorAll(HIGHLIGHT_ACTIVE_CSS_CLASS);
                expect(activeHighlight[0].closest("igx-grid-cell")).toBe(cell0);
            });

            it('should update matches if a cell becomes unmerged.', async() => {
                let matches = grid.findNext('JavaScript');
                fix.detectChanges();

                expect(matches).toBe(2);

                UIInteractions.simulateClickAndSelectEvent(grid.gridAPI.get_cell_by_index(0, 'ProductName').nativeElement);
                await wait(1);
                fix.detectChanges();

                matches = grid.findNext('JavaScript');
                fix.detectChanges();
                expect(matches).toBe(3);
            });

        });

        describe('Multi-row layout', () => {
            it('should throw warning and disallow merging with mrl.', () => {
                jasmine.getEnv().allowRespy(true);
                fix = TestBed.createComponent(ColumnLayoutTestComponent);
                fix.detectChanges();
                grid = fix.componentInstance.grid;
                spyOn(console, 'warn');
                grid.columns[1].merge = true;
                fix.detectChanges();

                expect(console.warn).toHaveBeenCalledWith('Merging is not supported with multi-row layouts.');
                expect(console.warn).toHaveBeenCalledTimes(1);
                jasmine.getEnv().allowRespy(false);
            });

        });

        describe('HierarchicalGrid', () => {

            beforeEach(() => {
                fix = TestBed.createComponent(IgxHierarchicalGridTestBaseComponent);
                fix.componentInstance.data = [
                    {
                        ID: 1, ChildLevels: 1,  ProductName: 'Product A' , Col1: 1,
                        childData: [
                            {
                                ID: 1, ChildLevels: 2,  ProductName: 'Product A' , Col1: 1,
                            },
                            {
                                ID: 2, ChildLevels: 2,  ProductName: 'Product A' , Col1: 1,
                            },
                            {
                                ID: 3, ChildLevels: 2,  ProductName: 'Product B' , Col1: 1,
                            },
                            {
                                ID: 4, ChildLevels: 2,  ProductName: 'Product A' , Col1: 1,
                            }
                        ]
                    },
                    {
                        ID: 2, ChildLevels: 1,  ProductName: 'Product A' , Col1: 1, childData: [
                            {
                                ID: 1, ChildLevels: 2,  ProductName: 'Product A' , Col1: 1,
                            },
                            {
                                ID: 2, ChildLevels: 2,  ProductName: 'Product A' , Col1: 1,
                            },
                            {
                                ID: 3, ChildLevels: 2,  ProductName: 'Product A' , Col1: 1,
                            },
                            {
                                ID: 4, ChildLevels: 2,  ProductName: 'Product A' , Col1: 1,
                            }
                        ]
                    },
                    {
                        ID: 3, ChildLevels: 1,  ProductName: 'Product B' , Col1: 1
                    },
                    {
                        ID: 4, ChildLevels: 1,  ProductName: 'Product B' , Col1: 1
                    },
                    {
                        ID: 5, ChildLevels: 1,  ProductName: 'Product C' , Col1: 1
                    },
                    {
                        ID: 6, ChildLevels: 1,  ProductName: 'Product B' , Col1: 1
                    }
                ];
                fix.detectChanges();
                grid = fix.componentInstance.hgrid;
                // enable merging
                grid.cellMergeMode = 'always';
                const col = grid.getColumnByName('ProductName');
                col.merge = true;
                fix.detectChanges();
            });

            it('should allow configuring and merging cells on each level of hierarchy.', () => {

                const col = grid.getColumnByName('ProductName');
                // root grid should be merged
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Product A', span: 2 },
                    { value: 'Product B', span: 2 },
                    { value: 'Product C', span: 1 },
                    { value: 'Product B', span: 1 }
                ]);

                const ri = fix.componentInstance.rowIsland;
                ri.cellMergeMode = 'always';
                ri.getColumnByName('ProductName').merge = true;
                fix.detectChanges();

                // toggle row
                const firstRow = grid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
                firstRow.toggle();
                fix.detectChanges();

                const childGrid = grid.gridAPI.getChildGrids(false)[0] as IgxHierarchicalGridComponent;
                expect(childGrid).toBeDefined();

                // merging enabled
                GridFunctions.verifyColumnMergedState(childGrid, childGrid.getColumnByName('ProductName'), [
                    { value: 'Product A', span: 2 },
                    { value: 'Product B', span: 1 },
                    { value: 'Product A', span: 1 }
                ]);
            });

            it('should merge cells within their respective grids only.', () => {
                const ri = fix.componentInstance.rowIsland;
                ri.cellMergeMode = 'always';
                ri.getColumnByName('ProductName').merge = true;
                fix.detectChanges();

                // toggle row 1
                const firstRow = grid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
                firstRow.toggle();
                fix.detectChanges();

                // toggle row 2
                const secondRow = grid.gridAPI.get_row_by_index(2) as IgxHierarchicalRowComponent;
                secondRow.toggle();
                fix.detectChanges();

                const childGrid1 = grid.gridAPI.getChildGrids(false)[0] as IgxHierarchicalGridComponent;
                expect(childGrid1).toBeDefined();

                GridFunctions.verifyColumnMergedState(childGrid1, childGrid1.getColumnByName('ProductName'), [
                    { value: 'Product A', span: 2 },
                    { value: 'Product B', span: 1 },
                    { value: 'Product A', span: 1 }
                ]);

                const childGrid2 = grid.gridAPI.getChildGrids(false)[1] as IgxHierarchicalGridComponent;
                expect(childGrid2).toBeDefined();

                GridFunctions.verifyColumnMergedState(childGrid2, childGrid2.getColumnByName('ProductName'), [
                    { value: 'Product A', span: 4 }
                ]);
            });

            it('should interrupt merge sequence if row is expanded and a child grid is shown between same value cells.', () => {
                const col = grid.getColumnByName('ProductName');
                // root grid should be merged
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Product A', span: 2 },
                    { value: 'Product B', span: 2 },
                    { value: 'Product C', span: 1 },
                    { value: 'Product B', span: 1 }
                ]);

                // toggle row 1
                const firstRow = grid.gridAPI.get_row_by_index(0) as IgxHierarchicalRowComponent;
                firstRow.toggle();
                fix.detectChanges();

                // first merge sequence interrupted due to expanded row
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: 'Product A', span: 1 },
                    { value: 'Product A', span: 1 },
                    { value: 'Product B', span: 2 },
                    { value: 'Product C', span: 1 },
                    { value: 'Product B', span: 1 }
                ]);
            });

        });

        describe('TreeGrid', () => {

            beforeEach(() => {
                fix = TestBed.createComponent(IgxTreeGridSelectionComponent);
                fix.detectChanges();
                grid = fix.componentInstance.treeGrid;
                // enable merging
                grid.cellMergeMode = 'always';
                const col = grid.getColumnByName('OnPTO');
                col.merge = true;
                fix.detectChanges();
            });

            it('should merge all cells with same values, even if on different levels by default.', () => {
                const col = grid.getColumnByName('OnPTO');
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: false, span: 2 },
                    { value: true, span: 1 },
                    { value: false, span: 1 },
                    { value: true, span: 1 },
                    { value: false, span: 2 },
                    { value: true, span: 1 },
                    { value: false, span: 3 },
                    { value: true, span: 1 }
                ]);
            });

            it('should allow setting the ByLevelTreeGridMergeStrategy as the mergeStrategy to merge only data on the same hierarchy level.', () => {
                grid.mergeStrategy = new ByLevelTreeGridMergeStrategy();
                fix.detectChanges();
                grid.triggerPipes();
                fix.detectChanges();
                const col = grid.getColumnByName('OnPTO');
                GridFunctions.verifyColumnMergedState(grid, col, [
                    { value: false, span: 1 },
                    { value: false, span: 1 },
                    { value: true, span: 1 },
                    { value: false, span: 1 },
                    { value: true, span: 1 },
                    { value: false, span: 1 },
                    { value: false, span: 1 },
                    { value: true, span: 1 },
                    { value: false, span: 1 },
                    { value: false, span: 1 },
                    { value: false, span: 1 },
                    { value: true, span: 1 }
                ]);
            });
        });
    });
});

@Component({
    template: `
        <igx-grid [data]="data" [cellMergeMode]="mergeMode" #grid>
        @for(col of cols; track col) {
            <igx-column width="100px" [field]="col.field" [dataType]="col.dataType" [merge]="col.merge"></igx-column>
        }
        </igx-grid>
        <ng-template #customTemplate let-value let-cell="cell">
            <button [style.height.px]="cell.row.index % 2 === 0 ? 100 : 200" type="button">{{value}}</button>
        </ng-template>
    `,
    imports: [IgxGridComponent, IgxColumnComponent]
})
export class DefaultCellMergeGridComponent extends DataParent {
    public mergeMode: GridCellMergeMode = GridCellMergeMode.always;
    @ViewChild('grid', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;

    @ViewChild('customTemplate', { read: TemplateRef, static: true })
    public customTemplate: TemplateRef<any>;

    public cols = [
        { field: 'ID', merge: false },
        { field: 'ProductName', dataType: GridColumnDataType.String, merge: true },
        { field: 'Downloads', dataType: GridColumnDataType.Number, merge: false },
        { field: 'Released', dataType: GridColumnDataType.Boolean, merge: false },
        { field: 'ReleaseDate', dataType: GridColumnDataType.Date, merge: false }
    ];

    public override data = [
        {
            Downloads: 254,
            ID: 1,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.today,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 2,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.nextDay,
            Released: true
        },
        {
            Downloads: 20,
            ID: 3,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: true
        },
        {
            Downloads: null,
            ID: 4,
            ProductName: 'Ignite UI for JavaScript',
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 100,
            ID: 5,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: null,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 6,
            ProductName: 'Ignite UI for Angular',
            ReleaseDate: this.nextDay,
            Released: true
        },
        {
            Downloads: 0,
            ID: 7,
            ProductName: null,
            ReleaseDate: this.prevDay,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 8,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.today,
            Released: true
        },
        {
            Downloads: 1000,
            ID: 9,
            ProductName: 'NetAdvantage',
            ReleaseDate: this.prevDay,
            Released: true
        }
    ];

}

@Component({
    template: `
        <igx-grid [data]="data" [cellMergeMode]="mergeMode" #grid [height]="height" [width]="width">
        @for(col of cols; track col) {
            <igx-column width="200px" [field]="col.field" [dataType]="col.dataType" [merge]="col.merge"></igx-column>
        }
        @if (paging) {
            <igx-paginator [perPage]="5"></igx-paginator>
        }
        </igx-grid>
        <ng-template #detailTemplate>
            <button>Detail</button>
        </ng-template>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxPaginatorComponent]
})
export class IntegrationCellMergeGridComponent extends DefaultCellMergeGridComponent {
    public height = '100%';
    public width = '100%';
    public paging = false;

    @ViewChild('detailTemplate', { read: TemplateRef, static: true })
    public detailTemplate: TemplateRef<any>;
}

class NoopMergeStrategy extends DefaultMergeStrategy {
    public override merge(
        data: any[],
        field: string,
        comparer: (prevRecord: any, record: any, field: string) => boolean = this.comparer,
        result: any[],
        activeRowIndexes: number[],
        grid?: GridType
    ) {
        return data;
    }
}
