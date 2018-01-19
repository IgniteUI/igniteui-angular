import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { IgxButtonModule } from "../button/button.directive";
import { IgxDatePickerModule } from "../date-picker/date-picker.component";
import { IgxRippleModule } from "../directives/ripple.directive";
import { IgxIconModule } from "../icon/icon.component";
import { IgxInput } from "../input/input.directive";
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
import { IgxVirtGridComponent } from "./grid.component";
import { IgxGridFilterConditionPipe, IgxGridFilteringPipe, IgxGridPagingPipe, IgxGridSortingPipe } from "./grid.pipes";
import { IgxGridRowComponent } from "./row.component";
import { VirtualContainerV2Module } from "../virtual-container-v2/index";

@NgModule({
  declarations: [
    IgxGridCellComponent,
    IgxColumnComponent,
    IgxVirtGridComponent,
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
    IgxColumnComponent,
    IgxGridRowComponent,
    IgxGridCellComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    IgxButtonModule,
    IgxDatePickerModule,
    IgxIconModule,
    IgxRippleModule,
    IgxInput,
    VirtualContainerV2Module
  ],
  exports: [
    IgxVirtGridComponent,
    IgxGridCellComponent,
    IgxGridRowComponent,
    IgxColumnComponent,
    IgxGridHeaderComponent,
    IgxGridFilterComponent,
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellTemplateDirective
  ],
  providers: [
    IgxGridAPIService
  ]
})
export class IgxVirtualGridV2Module {
  public static forRoot() {
    return {
      ngModule: IgxVirtualGridV2Module,
      providers: [IgxGridAPIService]
    };
  }
}
