import { Component, Input, ViewChild, Directive } from '@angular/core';
import { AbstractControl, NG_VALIDATORS, ValidationErrors, ValidatorFn } from '@angular/forms';
import { IgxColumnValidator, IgxGridComponent } from 'igniteui-angular';
import { data } from '../../../../../src/app/shared/data';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const forbidden = nameRe.test(control.value);
        return forbidden ? { forbiddenName: { value: control.value } } : null;
    };
}

@Directive({
    selector: '[appForbiddenName]',
    providers: [{ provide: NG_VALIDATORS, useExisting: ForbiddenValidatorDirective, multi: true }]
})
export class ForbiddenValidatorDirective extends IgxColumnValidator {
    @Input('appForbiddenName')
    public forbiddenName = '';

    public validate(control: AbstractControl): ValidationErrors | null {
        return this.forbiddenName ? forbiddenNameValidator(new RegExp(this.forbiddenName, 'i'))(control)
            : null;
    }
}

@Component({
    template: `
    <igx-grid #grid primaryKey="ProductID" [data]="data" [rowEditable]="rowEditable"
        [width]="'1200px'" [height]="'800px'">
            <igx-column appForbiddenName='bob' minlength="4" maxlength='8' required *ngFor="let c of columns" [editable]='true' [sortable]="true" [filterable]="true" [field]="c.field"
            [header]="c.field" [width]="c.width" [resizable]='true'>
        </igx-column>
    </igx-grid>
    `
})
export class IgxGridValidationTestBaseComponent {
    public rowEditable = true;
    public columns = [
        { field: 'ProductID' },
        { field: 'ProductName' },
        { field: 'UnitPrice' },
        { field: 'UnitsInStock' }
    ];
    public data = data;;

    @ViewChild('grid', { read: IgxGridComponent, static: true }) public grid: IgxGridComponent;
}

@Component({
    template: `
    <igx-grid #grid primaryKey="ProductID" [data]="data" [rowEditable]="rowEditable"
        [width]="'1200px'" [height]="'800px'">
            <igx-column appForbiddenName='bob' minlength="4" maxlength='8' required *ngFor="let c of columns" [editable]='true' [sortable]="true" [filterable]="true" [field]="c.field"
            [header]="c.field" [width]="c.width" [resizable]='true'>
            <ng-template igxCellValidationError let-cell='cell'>
                    <div *ngIf="cell.formGroup?.get(cell.column?.field).errors?.['forbiddenName'] else cell.defaultErrorTemplate">
                        This name is forbidden.
                    </div>
                </ng-template>
        </igx-column>
    </igx-grid>
    `
})
export class IgxGridValidationTestCustomErrorComponent {
    public rowEditable = true;
    public columns = [
        { field: 'ProductID' },
        { field: 'ProductName' },
        { field: 'UnitPrice' },
        { field: 'UnitsInStock' }
    ];
    public data = data;;

    @ViewChild('grid', { read: IgxGridComponent, static: true }) public grid: IgxGridComponent;
}