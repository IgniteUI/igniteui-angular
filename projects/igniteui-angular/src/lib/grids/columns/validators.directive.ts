import { Directive, forwardRef } from '@angular/core';
import { RequiredValidator, NG_VALIDATORS, Validators, ValidationErrors, MinValidator, MaxValidator, EmailValidator, MinLengthValidator, MaxLengthValidator, PatternValidator } from '@angular/forms';
import { IgxColumnComponent } from './column.component';


@Directive({
    providers: [{ provide: NG_VALIDATORS, useExisting: IgxColumnValidator, multi: true }]
})
export abstract class IgxColumnValidator extends Validators {
    public value: any;
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

@Directive({
    selector:
        'igx-column[min]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => MinValidator),
        multi: true
    }]
})
export class IgxColumnMinValidator extends MinValidator {
    constructor(private column: IgxColumnComponent) {
        super();
        column.validators.push(this);
    }
}


@Directive({
    selector:
        'igx-column[max]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => MaxValidator),
        multi: true
    }]
})
export class IgxColumnMaxValidator extends MaxValidator {
    constructor(private column: IgxColumnComponent) {
        super();
        column.validators.push(this);
    }
}


@Directive({
    selector:
        'igx-column[email]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => EmailValidator),
        multi: true
    }]
})
export class IgxColumnEmailValidator extends EmailValidator {
    constructor(private column: IgxColumnComponent) {
        super();
        column.validators.push(this);
    }
}


@Directive({
    selector:
        'igx-column[minlength]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => MinLengthValidator),
        multi: true
    }]
})
export class IgxColumnMinLengthValidator extends MinLengthValidator {
    constructor(private column: IgxColumnComponent) {
        super();
        column.validators.push(this);
    }
}

@Directive({
    selector:
        'igx-column[maxlength]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => MaxLengthValidator),
        multi: true
    }]
})
export class IgxColumMaxLengthValidator extends MaxLengthValidator {
    constructor(private column: IgxColumnComponent) {
        super();
        column.validators.push(this);
    }
}

@Directive({
    selector:
        'igx-column[pattern]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: forwardRef(() => PatternValidator),
        multi: true
    }]
})
export class IgxColumPatternValidator extends PatternValidator {
    constructor(private column: IgxColumnComponent) {
        super();
        column.validators.push(this);
    }
}