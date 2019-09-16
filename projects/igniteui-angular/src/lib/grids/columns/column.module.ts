import { NgModule } from '@angular/core';
import { IgxColumnComponent } from './column.component';
import { IgxColumnGroupComponent } from './column-group.component';
import { IgxColumnLayoutComponent } from './column-layout.component';
import {
    IgxCellEditorTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective,
    IgxFilterCellTemplateDirective
} from './templates.directive';


@NgModule({
    declarations: [
        IgxFilterCellTemplateDirective,
        IgxCellTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellFooterTemplateDirective,
        IgxCellEditorTemplateDirective,
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
        IgxCellTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellFooterTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent
    ]
})
export class IgxGridColumnModule {}
