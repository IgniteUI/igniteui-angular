import { NgModule } from '@angular/core';
import { IgxColumnComponent } from './column.component';
import { IgxColumnGroupComponent } from './column-group.component';
import { IgxColumnLayoutComponent } from './column-layout.component';
import {
    IgxCellEditorTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective,
    IgxCollapsibleIndicatorTemplateDirective,
    IgxFilterCellTemplateDirective,
    IgxSummaryTemplateDirective
} from './templates.directive';

@NgModule({
    declarations: [
        IgxFilterCellTemplateDirective,
        IgxSummaryTemplateDirective,
        IgxCellTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellFooterTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxCollapsibleIndicatorTemplateDirective,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent
    ],
    exports: [
        IgxFilterCellTemplateDirective,
        IgxSummaryTemplateDirective,
        IgxCellTemplateDirective,
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
