// import { IgxColumnGroupComponent } from './column-group.component';
// import { IgxColumnLayoutComponent } from './column-layout.component';
// import { IgxColumnComponent } from './column.component';
// import {
//     IgxCellEditorTemplateDirective,
//     IgxCellFooterTemplateDirective,
//     IgxCellHeaderTemplateDirective,
//     IgxCellTemplateDirective,
//     IgxCellValidationErrorDirective,
//     IgxCollapsibleIndicatorTemplateDirective,
//     IgxFilterCellTemplateDirective,
//     IgxSummaryTemplateDirective
// } from './templates.directive';
import {
    IgxColumnMaxLengthValidatorDirective,
    IgxColumnEmailValidatorDirective,
    IgxColumnMaxValidatorDirective,
    IgxColumnMinLengthValidatorDirective,
    IgxColumnMinValidatorDirective,
    IgxColumnRequiredValidatorDirective,
    IgxColumPatternValidatorDirective
} from './validators.directive';

export * from './column.component';
export * from './column-group.component';
export * from './column-layout.component';
export * from './templates.directive';
export * from './validators.directive';
export * from './interfaces';

/* NOTE: Grid column validation directives collection for ease-of-use import in standalone components scenario */
export const IGX_GRID_VALIDATION_DIRECTIVES = [
    IgxColumnRequiredValidatorDirective,
    IgxColumnMinValidatorDirective,
    IgxColumnMaxValidatorDirective,
    IgxColumnEmailValidatorDirective,
    IgxColumnMinLengthValidatorDirective,
    IgxColumnMaxLengthValidatorDirective,
    IgxColumPatternValidatorDirective
] as const;

/* NOTE: Grid column validation directives collection for ease-of-use import in standalone components scenario */
// export const IGX_GRID_COLUMN_DIRECTIVES = [
//     IgxFilterCellTemplateDirective,
//     IgxSummaryTemplateDirective,
//     IgxCellTemplateDirective,
//     IgxCellValidationErrorDirective,
//     IgxCellHeaderTemplateDirective,
//     IgxCellFooterTemplateDirective,
//     IgxCellEditorTemplateDirective,
//     IgxCollapsibleIndicatorTemplateDirective,
//     IgxColumnComponent,
//     IgxColumnGroupComponent,
//     IgxColumnLayoutComponent
// ] as const;
