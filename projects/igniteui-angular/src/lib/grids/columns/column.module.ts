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
    IgxCustomSummaryCellTemplateDirective
} from './templates.directive';

@NgModule({
    declarations: [
        IgxFilterCellTemplateDirective,
        IgxCustomSummaryCellTemplateDirective,
        IgxCellTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellFooterTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxCollapsibleIndicatorTemplateDirective,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent
    ],
    entryComponents: [
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent
    ],
    exports: [
        IgxFilterCellTemplateDirective,
        IgxCustomSummaryCellTemplateDirective,
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
