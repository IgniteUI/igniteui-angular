import { Component, Directive, ViewChild, Input } from '@angular/core';
import { data } from '../shared/data';

import {  IgxGridComponent, IgxTransactionService, Validity } from 'igniteui-angular';
import { AbstractControl, FormGroup, NG_VALIDATORS, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

export function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const forbidden = nameRe.test(control.value);
      return forbidden ? {forbiddenName: {value: control.value}} : null;
    };
  }

@Directive({
    selector: '[appForbiddenName]',
    providers: [{provide: NG_VALIDATORS, useExisting: ForbiddenValidatorDirective, multi: true}]
  })
  export class ForbiddenValidatorDirective extends Validators {
    @Input('appForbiddenName') 
    public forbiddenName = '';
  
    public validate(control: AbstractControl): ValidationErrors | null {
      return this.forbiddenName ? forbiddenNameValidator(new RegExp(this.forbiddenName, 'i'))(control)
                                : null;
    }
  }


@Component({
    selector: 'app-grid-row-edit',
    styleUrls: [`grid-validation.sample.component.css`],
    templateUrl: 'grid-validation.sample.component.html',
})
export class GridValidationSampleComponent {
    public rowEditWithTransactions = true;
    public rowEditNoTransactions = true;
    public transactionData = JSON.parse(JSON.stringify(data));
    public data = data;
    public columns = [
        { field: 'ProductID' },
        { field: 'ProductName' },
        { field: 'UnitPrice' },
        { field: 'UnitsInStock' }
    ];

    @ViewChild('gridTransactions', {read:  IgxGridComponent })
    public gridWithTransaction: IgxGridComponent;

    @ViewChild('gridNoTransactions', {read:  IgxGridComponent })
    public gridNoTransactions: IgxGridComponent;

    public commitWithTransactions() {
      const invalid = this.gridWithTransaction.validation.getInvalid();
        if (invalid.length > 0) {
           if (confirm('There are invalid values about to be submitted. Do you want to continue')) {
            this.gridWithTransaction.transactions.commit(this.transactionData);
           }
        } else {
            this.gridWithTransaction.transactions.commit(this.transactionData);
        }
    }

    public undo() {
      this.gridWithTransaction.transactions.undo();
    }

    public redo() {
      this.gridWithTransaction.transactions.redo();
    }

    public clearValidity() {
        this.gridNoTransactions.validation.clear();
        this.gridNoTransactions.markForCheck();
    }

    public cellEdit(evt) {
        // can cancel if there are validation errors
        // if (!evt.isValid && !this.rowEditNoTransactions) {
        //     evt.cancel = true;
        // }
    }

    public formCreateHandler(formGr: FormGroup) {
        // can add validators here 
        //    const prodName = formGr.get('ProductName');
        //    prodName.addValidators(forbiddenNameValidator(/bob/i));
    }

    public validationChange(evtArgs: Validity){
        console.log(evtArgs === Validity.Invalid ? 'state became INVALID' : 'state became VALID');
    }
}

