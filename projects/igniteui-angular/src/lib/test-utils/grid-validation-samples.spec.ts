import { NgFor, NgIf } from '@angular/common';
import { Component, Input, ViewChild, Directive, TemplateRef } from '@angular/core';
import { AbstractControl, FormsModule, NG_VALIDATORS, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { data } from '../../../../../src/app/shared/data';
import { GridColumnDataType } from '../data-operations/data-util';
import { IgxColumnComponent } from '../grids/columns/column.component';
import { IGX_GRID_VALIDATION_DIRECTIVES } from '../grids/columns/public_api';
import { IgxCellEditorTemplateDirective, IgxCellValidationErrorDirective } from '../grids/columns/templates.directive';
import { IgxGridComponent } from '../grids/grid/grid.component';
import { IgxTreeGridComponent } from '../grids/tree-grid/tree-grid.component';
import { SampleTestData } from './sample-test-data.spec';

@Directive({
    selector: '[igxAppForbiddenName]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenValidatorDirective, multi: true }],
    standalone: true
})
export class ForbiddenValidatorDirective extends Validators {
    @Input('igxAppForbiddenName')
    public forbiddenName = '';

    public validate(control: AbstractControl): ValidationErrors | null {
        return this.forbiddenName ? this.forbiddenNameValidator(new RegExp(this.forbiddenName, 'i'))(control)
            : null;
    }

    public forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
        return (control: AbstractControl): ValidationErrors | null => {
            const forbidden = nameRe.test(control.value);
            return forbidden ? { forbiddenName: { value: control.value } } : null;
        };
    }
}

@Component({
    template: `
    <igx-grid #grid primaryKey="ProductID" [data]="data" [rowEditable]="rowEditable" [batchEditing]="batchEditing"
        [width]="'1200px'" [height]="'800px'">
        <igx-column igxAppForbiddenName="bob" minlength="4" maxlength="8" required
            *ngFor="let c of columns"
            [editable]="true" [sortable]="true" [filterable]="true" [field]="c.field"
            [header]="c.field" [resizable]="true" [dataType]="c.dataType" >
        </igx-column>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, ForbiddenValidatorDirective, IGX_GRID_VALIDATION_DIRECTIVES, NgFor]
})
export class IgxGridValidationTestBaseComponent {
    public batchEditing = false;
    public rowEditable = true;
    public columns = [
        { field: 'ProductID', dataType: GridColumnDataType.String },
        { field: 'ProductName', dataType: GridColumnDataType.String },
        { field: 'UnitPrice', dataType: GridColumnDataType.String },
        { field: 'UnitsInStock', dataType: GridColumnDataType.Number }
    ];
    public data = [...data];

    @ViewChild('grid', { read: IgxGridComponent, static: true }) public grid: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid #grid primaryKey="ProductID" [data]="data" [rowEditable]="rowEditable"
        [width]="'1200px'" [height]="'800px'">
        <igx-column igxAppForbiddenName='bob' minlength="4" maxlength='8' required
            *ngFor="let c of columns"
            [editable]='true' [sortable]="true" [filterable]="true" [field]="c.field"
            [header]="c.field" [resizable]="true" [dataType]="c.dataType">
            <ng-template igxCellValidationError let-cell='cell' let-defaultErrorTemplate="defaultErrorTemplate">
                <div *ngIf="cell.validation.errors?.['forbiddenName'] else defaultErrorTemplate">
                    This name is forbidden.
                </div>
            </ng-template>
        </igx-column>
    </igx-grid>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxCellValidationErrorDirective, ForbiddenValidatorDirective, IGX_GRID_VALIDATION_DIRECTIVES, NgFor, NgIf]
})
export class IgxGridValidationTestCustomErrorComponent extends IgxGridValidationTestBaseComponent {
}

@Component({
    template: `
    <igx-grid #grid primaryKey="ProductID" [data]="data" [rowEditable]="rowEditable"
        [width]="'1200px'" [height]="'800px'">
        <igx-column igxAppForbiddenName='bob' minlength="4" maxlength='8' required
            *ngFor="let c of columns"
            [editable]='true' [sortable]="true" [filterable]="true" [field]="c.field"
            [header]="c.field" [resizable]="true" [dataType]="c.dataType">
        </igx-column>
    </igx-grid>
    <ng-template #modelTemplate igxCellEditor let-cell="cell">
       <input [(ngModel)]="cell.editValue"/>
    </ng-template>
    <ng-template #formControlTemplate igxCellEditor let-cell="cell" let-fc='formControl'>
        <input [formControl]="fc"/>
    </ng-template>
    `,
    imports: [IgxGridComponent, IgxColumnComponent, IgxCellEditorTemplateDirective, ForbiddenValidatorDirective, IGX_GRID_VALIDATION_DIRECTIVES, ReactiveFormsModule, FormsModule, NgFor]
})
export class IgxGridCustomEditorsComponent extends IgxGridValidationTestCustomErrorComponent {
    @ViewChild('modelTemplate', {read: TemplateRef })
    public modelTemplate: TemplateRef<any>;

    @ViewChild('formControlTemplate', {read: TemplateRef })
    public formControlTemplate: TemplateRef<any>;
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" primaryKey="ID"
     width="900px" height="600px" [rowEditable]="rowEditable" [batchEditing]="batchEditing">
        <igx-column igxAppForbiddenName='bob' minlength="4" required
            *ngFor="let c of columns"
            [editable]='true' [sortable]="true" [filterable]="true" [field]="c.field"
            [header]="c.field" [resizable]="true" [dataType]="c.dataType" >
            <ng-template igxCellValidationError let-cell='cell' let-defaultErrorTemplate="defaultErrorTemplate">
                <div *ngIf="cell.validation.errors?.['forbiddenName'] else defaultErrorTemplate">
                    This name is forbidden.
                </div>
            </ng-template>
        </igx-column>
    </igx-tree-grid>
    `,
    imports: [IgxTreeGridComponent, IgxColumnComponent, IgxCellValidationErrorDirective, ForbiddenValidatorDirective, IGX_GRID_VALIDATION_DIRECTIVES, NgFor, NgIf]
})
export class IgxTreeGridValidationTestComponent {
    public batchEditing = false;
    public rowEditable = true;
    public columns = [
        { field: 'ID', dataType: GridColumnDataType.String },
        { field: 'Name', dataType: GridColumnDataType.String },
        { field: 'HireDate', dataType: GridColumnDataType.Date },
        { field: 'Age', dataType: GridColumnDataType.Number }
    ];
    public data = [...SampleTestData.employeeSmallTreeData()];

    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
}
