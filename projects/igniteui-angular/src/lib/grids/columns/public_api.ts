import {
    IgxColumnMaxLengthValidatorDirective,
    IgxColumnEmailValidatorDirective,
    IgxColumnMaxValidatorDirective,
    IgxColumnMinLengthValidatorDirective,
    IgxColumnMinValidatorDirective,
    IgxColumnRequiredValidatorDirective,
    IgxColumPatternValidatorDirective
} from './validators.directive';

export const IGX_GRID_VALIDATION_DIRECTIVES = [
    IgxColumnRequiredValidatorDirective,
    IgxColumnMinValidatorDirective,
    IgxColumnMaxValidatorDirective,
    IgxColumnEmailValidatorDirective,
    IgxColumnMinLengthValidatorDirective,
    IgxColumnMaxLengthValidatorDirective,
    IgxColumPatternValidatorDirective
] as const;
