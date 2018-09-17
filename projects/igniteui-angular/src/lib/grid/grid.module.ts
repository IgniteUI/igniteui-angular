import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxGridAPIService } from './grid-api.service';
import {
    IgxCellEditorTemplateDirective,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective,
    IgxGroupAreaDropDirective,
    IgxGroupByRowTemplateDirective
} from './grid.misc';
import { IgxGridComponent } from './grid.component';
import {
    IgxGridPagingPipe,
    IgxGridPostGroupingPipe,
    IgxGridPreGroupingPipe
} from './grid.pipes';
import { IgxGridGroupByRowComponent } from './groupby-row.component';
import { IgxGridRowComponent } from './grid-row.component';
import { IgxChipsModule } from '../chips/chips.module';
import { IgxGridCommonModule } from '../grid-common/common/grid-common.module';

@NgModule({
  declarations: [
    IgxGridComponent,
    IgxGridRowComponent,
    IgxGridGroupByRowComponent,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxGroupByRowTemplateDirective,
    IgxCellEditorTemplateDirective,
    IgxCellTemplateDirective,
    IgxGroupAreaDropDirective,
    IgxGridPreGroupingPipe,
    IgxGridPostGroupingPipe,
    IgxGridPagingPipe,
  ],
  exports: [
    IgxGridComponent,
    IgxGridGroupByRowComponent,
    IgxGridRowComponent,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxGroupByRowTemplateDirective,
    IgxCellEditorTemplateDirective,
    IgxCellTemplateDirective,
    IgxGroupAreaDropDirective,
    IgxGridCommonModule
  ],
  imports: [
    CommonModule,
    FormsModule,
    IgxChipsModule,
    IgxGridCommonModule.forRoot(IgxGridAPIService)
  ]
})
export class IgxGridModule {
    public static forRoot() {
        return {
            ngModule: IgxGridModule
        };
    }
}
