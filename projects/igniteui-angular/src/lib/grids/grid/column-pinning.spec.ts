
import { DebugElement } from '@angular/core';
import { TestBed, async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { IgxColumnPinningComponent, IgxColumnPinningModule } from '../column-pinning.component';
import { IgxGridComponent } from './grid.component';
import { IPinColumnEventArgs } from '../grid-base.component';
import { IgxGridModule } from './index';
import { IgxButtonModule } from '../../directives/button/button.directive';
import { HelperUtils } from '../../test-utils/helper-utils.spec';
import { ColumnPinningTestComponent, ColumnGroupsPinningTestComponent } from '../../test-utils/grid-base-components.spec';
import { GridFunctions } from '../../test-utils/grid-functions.spec';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';

describe('Column Pinning UI', () => {
    configureTestSuite();
    let fix;
    let grid: IgxGridComponent;
    let columnChooser: IgxColumnPinningComponent;
    let columnChooserElement: DebugElement;

    const verifyCheckbox = HelperUtils.verifyCheckbox;
    const verifyColumnIsPinned = GridFunctions.verifyColumnIsPinned;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [
                ColumnPinningTestComponent,
                ColumnGroupsPinningTestComponent
            ],
            imports: [
                NoopAnimationsModule,
                IgxGridModule.forRoot(),
                IgxColumnPinningModule,
                IgxButtonModule
            ]
        })
        .compileComponents();
    }));

    describe('', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(ColumnPinningTestComponent);
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
        });

        afterAll(() => {
            UIInteractions.clearOverlay();
        });

        it ('title is initially empty.', async(() => {
            const title = columnChooserElement.query(By.css('h4'));
            expect(title).toBe(null);
        }));

        it ('title can be successfully changed.', async(() => {
            columnChooser.title = 'Pin/Unpin Columns';
            fix.detectChanges();

            const titleElement = (columnChooserElement.query(By.css('h4')).nativeElement as HTMLHeadingElement);
            expect(columnChooser.title).toBe('Pin/Unpin Columns');
            expect(titleElement.textContent).toBe('Pin/Unpin Columns');

            columnChooser.title = undefined;
            fix.detectChanges();

            expect(columnChooserElement.query(By.css('h4'))).toBe(null);
            expect(columnChooser.title).toBe('');

            columnChooser.title = null;
            fix.detectChanges();

            expect(columnChooserElement.query(By.css('h4'))).toBe(null);
            expect(columnChooser.title).toBe('');
        }));

        it('shows all checkboxes unchecked.', async(() => {
            const checkboxes = GridFunctions.getCheckboxInputs(columnChooserElement);
            expect(checkboxes.filter((chk) => !chk.checked).length).toBe(5);
        }));

        it('- toggling column checkbox checked state successfully changes the column\'s pinned state.', async(() => {
            const checkbox = HelperUtils.getCheckboxInput('ReleaseDate', columnChooserElement, fix);
            verifyCheckbox('ReleaseDate', false, false, columnChooserElement, fix);

            const column = grid.getColumnByName('ReleaseDate');
            verifyColumnIsPinned(column, false, 0);

            checkbox.click();

            expect(checkbox.checked).toBe(true);
            verifyColumnIsPinned(column, true, 1);

            checkbox.click();

            expect(checkbox.checked).toBe(false);
            verifyColumnIsPinned(column, false, 0);
        }));

        it('reflects properly grid column pinned value changes.', async(() => {
            const name = 'ReleaseDate';
            verifyCheckbox(name, false, false, columnChooserElement, fix);
            const column = grid.getColumnByName(name);

            column.pinned = true;
            fix.detectChanges();

            verifyCheckbox(name, true, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, true, 1);

            column.pinned = false;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, false, 0);

            column.pinned = undefined;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, false, 0);

            column.pinned = true;
            fix.detectChanges();
            verifyColumnIsPinned(column, true, 1);

            column.pinned = null;
            fix.detectChanges();

            verifyCheckbox(name, false, false, columnChooserElement, fix);
            verifyColumnIsPinned(column, false, 0);
        }));

        it('onColumnPinning event is fired on toggling checkboxes.', async(() => {
            let currentArgs: IPinColumnEventArgs;
            let counter = 0;
            grid.onColumnPinning.subscribe((args: IPinColumnEventArgs) => {
                counter++;
                currentArgs = args;
            });

            GridFunctions.getCheckboxInput('ReleaseDate', columnChooserElement, fix).click();

            expect(counter).toBe(1);
            expect(currentArgs.column.field).toBe('ReleaseDate');
            expect(currentArgs.insertAtIndex).toBe(0);

            GridFunctions.getCheckboxInput('Downloads', columnChooserElement, fix).click();

            expect(counter).toBe(2);
            expect(currentArgs.column.field).toBe('Downloads');
            expect(currentArgs.insertAtIndex).toBe(1);

            GridFunctions.getCheckboxInput('ReleaseDate', columnChooserElement, fix).click();
            // TODO: Consider firing the event when unpinning!!!
            expect(counter).toBe(2);
            // expect(currentArgs.column.field).toBe('ReleaseDate');
            // expect(currentArgs.insertAtIndex).toBe(0);

            GridFunctions.getCheckboxInput('Downloads', columnChooserElement, fix).click();

            expect(counter).toBe(2);
            // expect(currentArgs.column.field).toBe('Downloads');
            // expect(currentArgs.insertAtIndex).toBe(0);

            GridFunctions.getCheckboxInput('ProductName', columnChooserElement, fix).click();

            expect(counter).toBe(3);
            expect(currentArgs.column.field).toBe('ProductName');
            expect(currentArgs.insertAtIndex).toBe(0);
        }));

        it('doesn\'t pin columns if unpinned area width will become less than the defined minimum.', async(() => {
            const checkboxes = GridFunctions.getCheckboxInputs(columnChooserElement);
            checkboxes[0].click();
            checkboxes[1].click();
            checkboxes[2].click();

            verifyColumnIsPinned(grid.columns[0], true, 2);
            verifyColumnIsPinned(grid.columns[1], true, 2);
            verifyColumnIsPinned(grid.columns[2], false, 2);

        }));

        it('doesn\'t pin columns if unpinned area width does not allow it even after hiding a pinned column.', async(() => {
            let checkboxes = GridFunctions.getCheckboxInputs(columnChooserElement);
            checkboxes[0].click();
            checkboxes[1].click();

            grid.columns[1].hidden = true;
            fix.detectChanges();

            expect(grid.pinnedColumns.length).toBe(1);

            checkboxes = GridFunctions.getCheckboxInputs(columnChooserElement);
            checkboxes[2].click();
            verifyColumnIsPinned(grid.columns[2], false, 1);

            checkboxes[0].click();
            verifyColumnIsPinned(grid.columns[0], false, 0);

            grid.columns[1].hidden = false;
            fix.detectChanges();

            verifyCheckbox('ProductName', true, false, columnChooserElement, fix);
            verifyColumnIsPinned(grid.columns[1], true, 1);
        }));

    });

    describe('', () => {
        beforeEach(() => {
            fix = TestBed.createComponent(ColumnGroupsPinningTestComponent);
            fix.showInline = false;
            fix.showPinningInline = true;
            fix.detectChanges();
            grid = fix.componentInstance.grid;
            columnChooser = fix.componentInstance.chooser;
            columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
        });

        it('shows only top level columns.', () => {
            const columnItems = columnChooser.columnItems;
            expect(columnItems.length).toBe(3);
            expect(columnItems[0].name).toBe('Missing');
            expect(columnItems[1].name).toBe('General Information');
            expect(columnItems[2].name).toBe('ID');
            expect(getColumnPinningItems().length).toBe(3);
        });

        it('- pinning group column pins all children.', () => {
            fix.detectChanges();
            const columnName = 'General Information';
            GridFunctions.getCheckboxInput('Missing', columnChooserElement, fix).click();
            GridFunctions.getCheckboxInput(columnName, columnChooserElement, fix).click();

            fix.detectChanges();
            verifyCheckbox(columnName, true, false, columnChooserElement, fix);
            expect(grid.columns[1].allChildren.every((col) => col.pinned)).toBe(true);
        });


        it('- unpinning group column unpins all children.', () => {
            const columnName = 'General Information';
            grid.columns[0].unpin();
            grid.columns[1].pin();
            fix.detectChanges();

            verifyCheckbox(columnName, true, false, columnChooserElement, fix);
            expect(grid.columns[1].allChildren.every((col) => col.pinned)).toBe(true);

            GridFunctions.getCheckboxInput(columnName, columnChooserElement, fix).click();

            fix.detectChanges();
            verifyCheckbox(columnName, false, false, columnChooserElement, fix);
            expect(grid.columns[1].allChildren.every((col) => !col.pinned)).toBe(true);
        });
    });

    function getColumnPinningItems() {
        if (!columnChooserElement) {
            columnChooserElement = fix.debugElement.query(By.css('igx-column-pinning'));
        }
        const checkboxElements = columnChooserElement.queryAll(By.css('igx-checkbox'));
        return checkboxElements;
    }
});
