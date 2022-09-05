import { Component, Input, ViewChild, Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import {  IgxGridComponent, IgxTreeGridComponent } from 'igniteui-angular';
import { data } from '../../../../../src/app/shared/data';
import { SampleTestData } from './sample-test-data.spec';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const forbidden = nameRe.test(control.value);
        return forbidden ? { forbiddenName: { value: control.value } } : null;
    };
}

@Directive({
    selector: '[igxAppForbiddenName]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenValidatorDirective, multi: true }]
})
export class ForbiddenValidatorDirective extends Validators {
    @Input('igxAppForbiddenName')
    public forbiddenName = '';

    public validate(control: AbstractControl): ValidationErrors | null {
        return this.forbiddenName ? forbiddenNameValidator(new RegExp(this.forbiddenName, 'i'))(control)
            : null;
    }
}

@Component({
    template: `
    <igx-grid #grid primaryKey="ProductID" [data]="data" [rowEditable]="rowEditable" [batchEditing]="batchEditing"
        [width]="'1200px'" [height]="'800px'">
        <igx-column igxAppForbiddenName='bob' minlength="4" maxlength='8' required
            *ngFor="let c of columns"
            [editable]='true' [sortable]="true" [filterable]="true" [field]="c.field"
            [header]="c.field" [width]="c.width" [resizable]='true' [dataType]="c.dataType" >
        </igx-column>
    </igx-grid>
    `
})
export class IgxGridValidationTestBaseComponent {
    public batchEditing = false;
    public rowEditable = true;
    public columns = [
        { field: 'ProductID', dataType: 'string' },
        { field: 'ProductName', dataType: 'string' },
        { field: 'UnitPrice', dataType: 'string' },
        { field: 'UnitsInStock', dataType: 'number' }
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
            [header]="c.field" [width]="c.width" [resizable]='true' [dataType]="c.dataType">
            <ng-template igxCellValidationError let-cell='cell'>
                    <div *ngIf="cell.errors?.['forbiddenName'] else cell.defaultErrorTemplate">
                        This name is forbidden.
                    </div>
                </ng-template>
        </igx-column>
    </igx-grid>
    `
})
export class IgxGridValidationTestCustomErrorComponent {
    public batchEditing = false;
    public rowEditable = true;
    public columns = [
        { field: 'ProductID', dataType: 'string' },
        { field: 'ProductName', dataType: 'string' },
        { field: 'UnitPrice', dataType: 'string' },
        { field: 'UnitsInStock', dataType: 'number' }
    ];
    public data = [...data];

    @ViewChild('grid', { read: IgxGridComponent, static: true }) public grid: IgxGridComponent;
}

@Component({
    template: `
    <igx-tree-grid #treeGrid [data]="data" childDataKey="Employees" primaryKey="ID"
     width="900px" height="600px" [rowEditable]="rowEditable" [batchEditing]="batchEditing">
        <igx-column igxAppForbiddenName='bob' minlength="4" required
            *ngFor="let c of columns"
            [editable]='true' [sortable]="true" [filterable]="true" [field]="c.field"
            [header]="c.field" [width]="c.width" [resizable]='true' [dataType]="c.dataType" >
            <ng-template igxCellValidationError let-cell='cell'>
                <div *ngIf="cell.errors?.['forbiddenName'] else cell.defaultErrorTemplate">
                    This name is forbidden.
                </div>
            </ng-template>
        </igx-column>
    </igx-tree-grid>
    `
})
export class IgxTreeGridValidationTestComponent {
    public batchEditing = false;
    public rowEditable = true;
    public columns = [
        { field: 'ID', dataType: 'string' },
        { field: 'Name', dataType: 'string' },
        { field: 'HireDate', dataType: 'string' },
        { field: 'Age', dataType: 'number' }
    ];
    public data = [...SampleTestData.employeeSmallTreeData()];

    @ViewChild(IgxTreeGridComponent, { static: true }) public treeGrid: IgxTreeGridComponent;
}
