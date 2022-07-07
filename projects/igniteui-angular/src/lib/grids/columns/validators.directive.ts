import { Directive, forwardRef } from '@angular/core';
import { RequiredValidator, NG_VALIDATORS, Validators, ValidationErrors } from '@angular/forms';
import { IgxColumnComponent } from './column.component';


@Directive({
    providers: [{ provide: NG_VALIDATORS, useExisting: IgxColumnValidator, multi: true }]
})
export abstract class IgxColumnValidator extends Validators {
    constructor(private column?: IgxColumnComponent) {
        super();
        if (column) {
            column.validators.push(this);
        }
    }

    abstract validate(value : any) : ValidationErrors | null;
}

@Directive({
    selector:
        'igx-column[required]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => RequiredValidator),
        multi: true
    }]
})
export class IgxColumnRequiredValidator extends RequiredValidator {
    constructor(private column: IgxColumnComponent) {
        super();
        column.validators.push(this);
    }
}