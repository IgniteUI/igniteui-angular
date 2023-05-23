import { fakeAsync, flush, TestBed, tick } from '@angular/core/testing';
import { Validators } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators'
import { IgxInputDirective } from '../../directives/input/input.directive';
import { IgxTooltipTargetDirective } from '../../directives/tooltip/tooltip-target.directive';
import { configureTestSuite } from '../../test-utils/configure-suite';
import { GridFunctions, GridSelectionFunctions } from '../../test-utils/grid-functions.spec';
import {
    IgxGridCustomEditorsComponent,
    IgxGridValidationTestBaseComponent,
    IgxGridValidationTestCustomErrorComponent,
    IgxTreeGridValidationTestComponent
} from '../../test-utils/grid-validation-samples.spec';
import { UIInteractions } from '../../test-utils/ui-interactions.spec';
import { IGridFormGroupCreatedEventArgs } from '../common/grid.interface';
import { IgxTreeGridComponent } from '../tree-grid/tree-grid.component';
import { IgxGridComponent } from './grid.component';

describe('IgxGrid - Validation #grid', () => {

    configureTestSuite((() => {
        return TestBed.configureTestingModule({
            imports: [
                NoopAnimationsModule,
                IgxGridValidationTestBaseComponent,
                IgxGridValidationTestCustomErrorComponent,
                IgxGridCustomEditorsComponent,
                IgxTreeGridValidationTestComponent
            ]
        });
    }));

    describe('Basic Validation - ', () => {
        let fixture;
        const $destroyer = new Subject<boolean>();

        beforeEach(() => {
            fixture = TestBed.createComponent(IgxGridValidationTestBaseComponent);
            fixture.detectChanges();
        });

        afterEach(() => {
            UIInteractions.clearOverlay();
            $destroyer.next(true);
        });

        it('should allow setting built-in validators via template-driven configuration on the column', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            const firstColumn = grid.columnList.first;
            const validators = firstColumn.validators;
            expect(validators.length).toBeGreaterThanOrEqual(3);

            const minValidator = validators.find(validator => validator['inputName'] === 'minlength');
            const maxValidator = validators.find(validator => validator['inputName'] === 'maxlength');
            const requiredValidator = validators.find(validator => validator['inputName'] === 'required');

            expect(parseInt(minValidator['minlength'], 10)).toBe(4);
            expect(parseInt(maxValidator['maxlength'], 10)).toBe(8);
            expect(requiredValidator).toBeDefined();

            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.update('asd');
            fixture.detectChanges();

            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            //min length should be 4
            GridFunctions.verifyCellValid(cell, false);

            cell.editMode = true;
            cell.update('test');
            fixture.detectChanges();
            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            GridFunctions.verifyCellValid(cell, true);
        });

        it('should allow setting custom validators via template-driven configuration on the column', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            const firstColumn = grid.columnList.first;
            const validators = firstColumn.validators;


            const customValidator = validators.find(validator => validator['forbiddenName']);
            expect(customValidator).toBeDefined();
            expect(customValidator['forbiddenName']).toEqual('bob');
            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.update('bob');
            fixture.detectChanges();

            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            //the name should not contain bob
            GridFunctions.verifyCellValid(cell, false);

            cell.editMode = true;
            cell.update('valid');
            fixture.detectChanges();
            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            GridFunctions.verifyCellValid(cell, true);
        });

        it('should allow setting validators on the exposed FormGroup object', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            grid.formGroupCreated.pipe(takeUntil($destroyer)).subscribe((args: IGridFormGroupCreatedEventArgs) => {
                const prodName = args.formGroup.get('ProductName');
                prodName.addValidators(Validators.email);
            });


            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.update('test');
            fixture.detectChanges();

            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            //the name should be correct email
            GridFunctions.verifyCellValid(cell, false);
            expect(cell.formControl.errors.email).toBeTrue();

            cell.editMode = true;
            cell.update('m@in.com');
            fixture.detectChanges();
            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            GridFunctions.verifyCellValid(cell, true);
            expect(cell.formControl.errors).toBeFalsy();
        });

        it('should allow setting validation triggers - "change" , "blur".', async () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            //changing validation triger to blur
            grid.validationTrigger = 'blur';
            fixture.detectChanges();

            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            fixture.detectChanges();

            const input = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
            input.value = 'asd';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            //the cell should be invalid after blur event is fired
            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            GridFunctions.verifyCellValid(cell, true);

            input.dispatchEvent(new Event('blur'));
            fixture.detectChanges();
            // fix.detectChanges();

            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);

            GridFunctions.verifyCellValid(cell, false);
        });

        it('should mark invalid cell with igx-grid__td--invalid class and show the related error cell template', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;

            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.update('asd');
            fixture.detectChanges();

            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            //min length should be 4
            GridFunctions.verifyCellValid(cell, false);
            const erorrMessage = cell.errorTooltip.first.elementRef.nativeElement.children[0].textContent;
            expect(erorrMessage).toEqual(' Entry should be at least 4 character(s) long ');
        });

        it('should show the error message on error icon hover and when the invalid cell becomes active.', fakeAsync(() => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;

            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            const input = fixture.debugElement.query(By.directive(IgxInputDirective)).nativeElement;
            input.value = 'asd';
            input.dispatchEvent(new Event('input'));
            fixture.detectChanges();

            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            //min length should be 4
            GridFunctions.verifyCellValid(cell, false);
            GridSelectionFunctions.verifyCellActive(cell, true);
            const erorrMessage = cell.errorTooltip.first.elementRef.nativeElement.children[0].textContent;
            expect(erorrMessage).toEqual(' Entry should be at least 4 character(s) long ');

            cell.errorTooltip.first.close();
            tick();
            fixture.detectChanges();
            expect(cell.errorTooltip.first.collapsed).toBeTrue();

            const element = fixture.debugElement.query(By.directive(IgxTooltipTargetDirective)).nativeElement;
            element.dispatchEvent(new MouseEvent('mouseenter'));
            flush();
            fixture.detectChanges();
            expect(cell.errorTooltip.first.collapsed).toBeFalse();
        }));

        it('should allow preventing edit mode for cell/row to end by canceling the related event if isValid event argument is false', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            grid.cellEdit.pipe(takeUntil($destroyer)).subscribe((args) => {
                if (!args.valid) {
                    args.cancel = true;
                }
            });

            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);

            const lastValue = cell.value;
            cell.formControl.setValue('asd');
            fixture.detectChanges();
            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            // should have been canceled and left in editmode because of non valid value
            // should not have updated the value
            GridFunctions.verifyCellValid(cell, false);
            expect(!!grid.gridAPI.crudService.rowInEditMode).toEqual(true);
            expect(grid.gridAPI.crudService.cellInEditMode).toEqual(true);
            expect(cell.value).toEqual(lastValue);

            cell.update('test');
            fixture.detectChanges();
            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            GridFunctions.verifyCellValid(cell, true);
        });

        it('should trigger the validationStatusChange event on grid when validation status changes', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            spyOn(grid.validationStatusChange, "emit").and.callThrough();

            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.editMode = true;
            cell.update('asd');
            fixture.detectChanges();
            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);

            grid.crudService.endEdit(true);
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);
            expect(grid.validationStatusChange.emit).toHaveBeenCalledWith({ status: 'INVALID', owner: grid });

            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.editMode = true;
            cell.update('test');
            fixture.detectChanges();
            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);

            grid.crudService.endEdit(true);
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, true);
            expect(grid.validationStatusChange.emit).toHaveBeenCalledWith({ status: 'INVALID', owner: grid });
        });

        it('should return invalid transaction using the transaction service API', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;


            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.update('asd');
            fixture.detectChanges();
            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            let invalidRecords = grid.validation.getInvalid();

            GridFunctions.verifyCellValid(cell, false);
            expect(invalidRecords[0].fields[1].status).toEqual('INVALID');


            cell.editMode = true;
            cell.update('test');
            fixture.detectChanges();
            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);

            GridFunctions.verifyCellValid(cell, true);
            invalidRecords = grid.validation.getInvalid();
            expect(invalidRecords.length).toEqual(0);
        });

        it('should update formControl state when grid data is updated.', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            const originalDataCopy = JSON.parse(JSON.stringify(grid.data));

            grid.data = JSON.parse(JSON.stringify(grid.data));
            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.update('asd');
            fixture.detectChanges();
            grid.crudService.endEdit(true);
            fixture.detectChanges();

            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            //min length should be 4
            GridFunctions.verifyCellValid(cell, false);

            grid.data = originalDataCopy;
            fixture.detectChanges();

            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            GridFunctions.verifyCellValid(cell, true);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            expect(cell.editValue).toBe(originalDataCopy[1].ProductName);
        });

        it('should create formControl for dynamically added columns\' cells', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            expect(grid.columns.length).toBe(4);

            // edit the row prior to adding new column, so that the formGroup of the row is created
            let cell = grid.gridAPI.get_cell_by_visible_index(1, 3);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);

            fixture.detectChanges();
            cell.update(100);
            grid.crudService.endEdit(true);
            fixture.detectChanges();

            // add new column
            fixture.componentInstance.columns.push({ field: 'NewColumn', dataType: 'string' });
            fixture.detectChanges();
            expect(grid.columns.length).toBe(5);

            // edit the new field's cell of the previously edited row
            cell = grid.gridAPI.get_cell_by_visible_index(1, 4);
            // will throw if form control was not created
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.update('asd');
            fixture.detectChanges();
            grid.crudService.endEdit(true);
            fixture.detectChanges();
        });
    });

    describe('Custom Validation - ', () => {
        let fixture;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxGridValidationTestCustomErrorComponent);
            fixture.detectChanges();
        }));

        it('should allow setting custom validators via template-driven configuration on the column', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            let cell = grid.gridAPI.get_cell_by_visible_index(1, 1);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.update('bob');
            fixture.detectChanges();

            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            //bob cannot be the name
            GridFunctions.verifyCellValid(cell, false);
            const erorrMessage = cell.errorTooltip.first.elementRef.nativeElement.children[0].textContent;
            expect(erorrMessage).toEqual(' This name is forbidden. ');

            cell.editMode = true;
            cell.update('test');
            fixture.detectChanges();
            cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            GridFunctions.verifyCellValid(cell, true);
        });
    });

    describe('Custom Editor Templates - ', () => {
        let fixture;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxGridCustomEditorsComponent);
            fixture.componentInstance.grid.batchEditing = true;
            fixture.detectChanges();
        }));

        it('should trigger validation on change when using custom editor bound via formControl.', () => {
            // template bound via formControl
            const template = fixture.componentInstance.formControlTemplate;
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            const col = grid.columns[1];
            col.inlineEditorTemplate = template;
            fixture.detectChanges();

            const cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            const input = fixture.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(input, 'bob');
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);
            const erorrMessage = cell.errorTooltip.first.elementRef.nativeElement.children[0].textContent;
            expect(erorrMessage).toEqual(' Entry should be at least 4 character(s) long ');
        });

        it('should trigger validation on change when using custom editor bound via editValue.', () => {
            // template bound via ngModel to editValue
            const template = fixture.componentInstance.modelTemplate;
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            const col = grid.columns[1];
            col.inlineEditorTemplate = template;
            fixture.detectChanges();

            const cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            const input = fixture.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(input, 'bob');
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);
            const erorrMessage = cell.errorTooltip.first.elementRef.nativeElement.children[0].textContent;
            expect(erorrMessage).toEqual(' Entry should be at least 4 character(s) long ');
        });

        it('should trigger validation on blur when using custom editor bound via editValue.', () => {
            // template bound via ngModel to editValue
            const template = fixture.componentInstance.modelTemplate;
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            const col = grid.columns[1];
            col.inlineEditorTemplate = template;
            grid.validationTrigger = 'blur';
            fixture.detectChanges();

            const cell = grid.gridAPI.get_cell_by_visible_index(1, 1);
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            const input = fixture.debugElement.query(By.css('input'));
            UIInteractions.clickAndSendInputElementValue(input, 'bob');
            fixture.detectChanges();

            // invalid value is entered, but no blur has happened yet.
            // Hence validation state is still valid.
            GridFunctions.verifyCellValid(cell, true);
            expect(cell.errorTooltip.length).toBe(0);

            // exit edit mode
            grid.crudService.endEdit(true);
            fixture.detectChanges();
            GridFunctions.verifyCellValid(cell, false);
            const erorrMessage = cell.errorTooltip.first.elementRef.nativeElement.children[0].textContent;
            expect(erorrMessage).toEqual(' Entry should be at least 4 character(s) long ');
        });
    });

    describe('Transactions integration - ', () => {
        let fixture;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxGridValidationTestBaseComponent);
            fixture.componentInstance.batchEditing = true;
            fixture.detectChanges();
        }));

        it('should update validity when setting new value through grid API', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            const cell = grid.gridAPI.get_cell_by_visible_index(1, 1);

            grid.updateCell('IG', 2, 'ProductName');
            grid.validation.markAsTouched(2);
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);

            grid.transactions.undo();
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, true);

            grid.updateRow({
                ProductID: 2,
                ProductName: '',
                SupplierID: 1,
                CategoryID: 1,
                QuantityPerUnit: '24 - 12 oz bottles',
                UnitPrice: '19.0000',
                UnitsInStock: 66,
                UnitsOnOrder: 40,
                ReorderLevel: 25,
                Discontinued: false,
                OrderDate: new Date('2003-03-17').toISOString(),
                OrderDate2: new Date('2003-03-17').toISOString()
            }, 2);
            grid.validation.markAsTouched(2);
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);

            grid.transactions.undo();
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, true);

            grid.transactions.redo();
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);
        });

        it('should update validation status when using undo/redo api', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            const cell = grid.gridAPI.get_cell_by_visible_index(1, 1);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.editMode = true;
            cell.update('IG');
            fixture.detectChanges();

            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);

            grid.transactions.undo();
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, true);

            grid.transactions.redo();
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);

            grid.transactions.commit(grid.data);
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);
            expect((grid.validation as any).getValidity().length).toEqual(1);

            grid.validation.clear();
            fixture.detectChanges();
        });

        it('should not invalidate cleared number cell', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            const cell = grid.gridAPI.get_cell_by_visible_index(1, 3);

            // Set cell to null, which should invalidate
            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.editMode = true;
            cell.update(null);
            fixture.detectChanges();

            expect(grid.validation.getInvalid().length).toEqual(1);
            GridFunctions.verifyCellValid(cell, false);

            // Exit edit. CRUD service sets number value to 0
            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            expect(grid.validation.getInvalid().length).toEqual(0);
            GridFunctions.verifyCellValid(cell, true);

            // Undo. Expect previous value
            grid.transactions.undo();
            fixture.detectChanges();

            expect(grid.validation.getInvalid().length).toEqual(0);
            expect((grid.validation as any).getValidity().length).toEqual(1);
            GridFunctions.verifyCellValid(cell, true);

            // Redo. Expect value 0
            grid.transactions.redo();
            fixture.detectChanges();

            expect(grid.validation.getInvalid().length).toEqual(0);
            expect((grid.validation as any).getValidity().length).toEqual(1);
            GridFunctions.verifyCellValid(cell, true);

            grid.transactions.commit(grid.data);
            grid.validation.clear();
            fixture.detectChanges();

            expect((grid.validation as any).getValidity().length).toEqual(0);
        });

        it('should not show errors when the row is deleted', () => {
            const grid = fixture.componentInstance.grid as IgxGridComponent;
            const cell = grid.gridAPI.get_cell_by_visible_index(1, 1);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.editMode = true;
            cell.update('IG');
            fixture.detectChanges();

            grid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            expect(grid.validation.getInvalid().length).toEqual(1);
            GridFunctions.verifyCellValid(cell, false);

            grid.deleteRow(2);
            fixture.detectChanges();

            expect(grid.validation.getInvalid().length).toEqual(0);
            GridFunctions.verifyCellValid(cell, true);

            grid.transactions.undo();
            fixture.detectChanges();

            expect(grid.validation.getInvalid().length).toEqual(1);
            GridFunctions.verifyCellValid(cell, false);

            grid.transactions.redo();
            fixture.detectChanges();

            expect(grid.validation.getInvalid().length).toEqual(0);
            GridFunctions.verifyCellValid(cell, true);
        });
    });

    describe('TreeGrid integration - ', () => {
        let fixture;

        beforeEach(fakeAsync(() => {
            fixture = TestBed.createComponent(IgxTreeGridValidationTestComponent);
            fixture.componentInstance.batchEditing = true;
            fixture.detectChanges();
        }));

        it('should allow setting built-in validators via template-driven and mark cell invalid', () => {
            const treeGrid = fixture.componentInstance.treeGrid as IgxTreeGridComponent;
            const cell = treeGrid.gridAPI.get_cell_by_visible_index(4, 1);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.editMode = true;
            cell.update('IG');
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);

            treeGrid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);
        });

        it('should allow setting custom validators via template-driven and mark cell invalid', () => {
            const treeGrid = fixture.componentInstance.treeGrid as IgxTreeGridComponent;
            const cell = treeGrid.gridAPI.get_cell_by_visible_index(4, 1);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.editMode = true;
            cell.update('bob');
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);

            treeGrid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            GridFunctions.verifyCellValid(cell, false);
        });

        it('should update validation status when using undo/redo/delete api', () => {
            const treeGrid = fixture.componentInstance.treeGrid as IgxTreeGridComponent;
            const cell = treeGrid.gridAPI.get_cell_by_visible_index(4, 1);

            UIInteractions.simulateDoubleClickAndSelectEvent(cell.element);
            cell.editMode = true;
            cell.update('IG');
            fixture.detectChanges();

            treeGrid.gridAPI.crudService.endEdit(true);
            fixture.detectChanges();

            treeGrid.transactions.undo();
            fixture.detectChanges();

            expect(treeGrid.validation.getInvalid().length).toEqual(0);
            GridFunctions.verifyCellValid(cell, true);

            treeGrid.transactions.redo();
            fixture.detectChanges();

            expect(treeGrid.validation.getInvalid().length).toEqual(1);
            GridFunctions.verifyCellValid(cell, false);

            treeGrid.deleteRow(711);
            fixture.detectChanges();

            expect(treeGrid.validation.getInvalid().length).toEqual(0);
            GridFunctions.verifyCellValid(cell, true);
        });
    });
});
