import { Directive } from '@angular/core';
import { RequiredValidator, NG_VALIDATORS, MinValidator, MaxValidator, EmailValidator, MinLengthValidator, MaxLengthValidator, PatternValidator } from '@angular/forms';

@Directive({
     
    selector: 'igx-column[required]',
    providers: [{
            provide: NG_VALIDATORS,
            useExisting: IgxColumnRequiredValidatorDirective,
            multi: true
        }],
    standalone: true
})
export class IgxColumnRequiredValidatorDirective extends RequiredValidator {
}

@Directive({
     
    selector: 'igx-column[min]',
    providers: [{
            provide: NG_VALIDATORS,
            useExisting: IgxColumnMinValidatorDirective,
            multi: true
        }],
    standalone: true
})
export class IgxColumnMinValidatorDirective extends MinValidator { }


@Directive({
     
    selector: 'igx-column[max]',
    providers: [{
            provide: NG_VALIDATORS,
            useExisting: IgxColumnMaxValidatorDirective,
            multi: true
        }],
    standalone: true
})
export class IgxColumnMaxValidatorDirective extends MaxValidator { }


@Directive({
     
    selector: 'igx-column[email]',
    providers: [{
            provide: NG_VALIDATORS,
            useExisting: IgxColumnEmailValidatorDirective,
            multi: true
        }],
    standalone: true
})
export class IgxColumnEmailValidatorDirective extends EmailValidator { }


@Directive({
     
    selector: 'igx-column[minlength]',
    providers: [{
            provide: NG_VALIDATORS,
            useExisting: IgxColumnMinLengthValidatorDirective,
            multi: true
        }],
    standalone: true
})
export class IgxColumnMinLengthValidatorDirective extends MinLengthValidator { }

@Directive({
     
    selector: 'igx-column[maxlength]',
    providers: [{
            provide: NG_VALIDATORS,
            useExisting: IgxColumnMaxLengthValidatorDirective,
            multi: true
        }],
    standalone: true
})
export class IgxColumnMaxLengthValidatorDirective extends MaxLengthValidator {
}

@Directive({
     
    selector: 'igx-column[pattern]',
    providers: [{
            provide: NG_VALIDATORS,
            useExisting: IgxColumPatternValidatorDirective,
            multi: true
        }],
    standalone: true
})
export class IgxColumPatternValidatorDirective extends PatternValidator {
}
