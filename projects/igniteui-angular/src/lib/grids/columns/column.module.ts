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
import { IgxColumnRequiredValidator } from './validators.directive';

@NgModule({
    declarations: [
        IgxColumnRequiredValidator,
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
        IgxColumnRequiredValidator,
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
