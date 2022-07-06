import { Directive, forwardRef } from '@angular/core';
import { RequiredValidator, NG_VALIDATORS } from '@angular/forms';
import { IgxColumnComponent } from './column.component';

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