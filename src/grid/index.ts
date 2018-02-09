import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxDatePickerModule } from "../date-picker/date-picker.component";
import { IgxButtonModule } from "../directives/button/button.directive";
import { IgxInputModule } from "../directives/input/input.directive";
import { IgxRippleModule } from "../directives/ripple/ripple.directive";
import { IgxVirtForModule } from "../directives/virtual-for/igx_virtual_for.directive";
import { IgxIconModule } from "../icon/icon.component";
import { IgxGridAPIService } from "./api.service";
import { IgxGridCellComponent } from "./cell.component";
import { IgxColumnComponent } from "./column.component";
import { IgxGridFilterComponent } from "./grid-filtering.component";
import { IgxGridHeaderComponent } from "./grid-header.component";
import {
  IgxCellFooterTemplateDirective,
  IgxCellHeaderTemplateDirective,
  IgxCellTemplateDirective
} from "./grid.common";
import { IgxGridComponent } from "./grid.component";
import { IgxGridFilterConditionPipe, IgxGridFilteringPipe, IgxGridPagingPipe, IgxGridSortingPipe } from "./grid.pipes";
import { IgxGridRowComponent } from "./row.component";

@NgModule({
  declarations: [
    IgxGridCellComponent,
    IgxColumnComponent,
    IgxGridComponent,
    IgxGridRowComponent,
    IgxGridHeaderComponent,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective,
    IgxGridFilterComponent,
    IgxGridSortingPipe,
    IgxGridPagingPipe,
    IgxGridFilteringPipe,
    IgxGridFilterConditionPipe
  ],
  entryComponents: [
    IgxColumnComponent
  ],
  exports: [
    IgxGridComponent,
    IgxGridCellComponent,
    IgxGridRowComponent,
    IgxColumnComponent,
    IgxGridHeaderComponent,
    IgxGridFilterComponent,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective
  ],
  imports: [
    CommonModule,
    FormsModule,
    IgxButtonModule,
    IgxDatePickerModule,
    IgxIconModule,
    IgxRippleModule,
    IgxInputModule,
    IgxVirtForModule
  ],
  providers: [IgxGridAPIService]
})
export class IgxGridModule {
  public static forRoot() {
    return {
      ngModule: IgxGridModule,
      providers: [IgxGridAPIService]
    };
  }
}
