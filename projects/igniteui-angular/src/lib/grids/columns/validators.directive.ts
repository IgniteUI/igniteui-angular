import { Directive } from '@angular/core';
import { RequiredValidator, NG_VALIDATORS, MinValidator, MaxValidator, EmailValidator, MinLengthValidator, MaxLengthValidator, PatternValidator } from '@angular/forms';


@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-column[required]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: IgxColumnRequiredValidatorDirective,
        multi: true
    }]
})
export class IgxColumnRequiredValidatorDirective extends RequiredValidator {
}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-column[min]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: IgxColumnMinValidatorDirective,
        multi: true
    }]
})
export class IgxColumnMinValidatorDirective extends MinValidator { }


@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-column[max]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: IgxColumnMaxValidatorDirective,
        multi: true
    }]
})
export class IgxColumnMaxValidatorDirective extends MaxValidator { }


@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-column[email]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: IgxColumnEmailValidatorDirective,
        multi: true
    }]
})
export class IgxColumnEmailValidatorDirective extends EmailValidator { }


@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-column[minlength]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: IgxColumnMinLengthValidatorDirective,
        multi: true
    }]
})
export class IgxColumnMinLengthValidatorDirective extends MinLengthValidator { }

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-column[maxlength]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: IgxColumMaxLengthValidatorDirective,
        multi: true
    }]
})
export class IgxColumMaxLengthValidatorDirective extends MaxLengthValidator {
}

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: 'igx-column[pattern]',
    providers: [{
        provide: NG_VALIDATORS,
        useExisting: IgxColumPatternValidatorDirective,
        multi: true
    }]
})
export class IgxColumPatternValidatorDirective extends PatternValidator {
}
