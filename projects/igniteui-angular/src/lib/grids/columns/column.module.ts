import { NgModule } from '@angular/core';
import { IgxColumnComponent } from './column.component';
import { IgxColumnGroupComponent } from './column-group.component';
import { IgxColumnLayoutComponent } from './column-layout.component';
import {
    IgxCellEditorTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective,
    IgxCellValidationErrorDirective,
    IgxCollapsibleIndicatorTemplateDirective,
    IgxFilterCellTemplateDirective,
    IgxSummaryTemplateDirective
} from './templates.directive';
import { IgxColumMaxLengthValidatorDirective, IgxColumnEmailValidatorDirective, IgxColumnMaxValidatorDirective,
     IgxColumnMinLengthValidatorDirective, IgxColumnMinValidatorDirective, IgxColumnRequiredValidatorDirective,
      IgxColumPatternValidatorDirective } from './validators.directive';

@NgModule({
    declarations: [
        IgxColumnRequiredValidatorDirective,
        IgxColumnMinValidatorDirective,
        IgxColumnMaxValidatorDirective,
        IgxColumnMinLengthValidatorDirective,
        IgxColumMaxLengthValidatorDirective, 
        IgxColumnEmailValidatorDirective,
        IgxColumPatternValidatorDirective,
        IgxFilterCellTemplateDirective,
        IgxSummaryTemplateDirective,
        IgxCellTemplateDirective,
        IgxCellValidationErrorDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellFooterTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxCollapsibleIndicatorTemplateDirective,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent
    ],
    exports: [
        IgxColumnRequiredValidatorDirective,
        IgxColumnMinValidatorDirective,
        IgxColumnMaxValidatorDirective,
        IgxColumnMinLengthValidatorDirective,
        IgxColumMaxLengthValidatorDirective, 
        IgxColumnEmailValidatorDirective,
        IgxColumPatternValidatorDirective,
        IgxFilterCellTemplateDirective,
        IgxSummaryTemplateDirective,
        IgxCellTemplateDirective,
        IgxCellValidationErrorDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellFooterTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxCollapsibleIndicatorTemplateDirective,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent
    ]
})
export class IgxGridColumnModule {}
