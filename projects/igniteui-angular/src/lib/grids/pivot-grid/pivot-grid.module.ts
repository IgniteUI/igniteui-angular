import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { IgxDragDropModule } from "../../directives/drag-drop/drag-drop.directive";
import { IgxExpansionPanelModule } from "../../expansion-panel/expansion-panel.module";
import { IgxGridComponent } from "../grid/grid.component";
import { IgxGridModule } from "../grid/grid.module";
import {
    IgxFilterPivotItemsPipe,
    IgxPivotDataSelectorComponent
} from "./pivot-data-selector.component";
import { IgxPivotGridComponent } from "./pivot-grid.component";
import {
    IgxPivotCellMergingPipe,
    IgxPivotColumnPipe,
    IgxPivotGridColumnSortingPipe,
    IgxPivotGridFilterPipe,
    IgxPivotGridSortingPipe,
    IgxPivotRowExpansionPipe,
    IgxPivotRowPipe
} from "./pivot-grid.pipes";
import { IgxPivotHeaderRowComponent } from "./pivot-header-row.component";
import { IgxPivotRowDimensionContentComponent } from "./pivot-row-dimension-content.component";
import { IgxPivotRowDimensionHeaderGroupComponent } from "./pivot-row-dimension-header-group.component";
import { IgxPivotRowDimensionHeaderComponent } from "./pivot-row-dimension-header.component";
import { IgxPivotRowComponent } from "./pivot-row.component";

/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxPivotGridComponent,
        IgxPivotRowComponent,
        IgxPivotHeaderRowComponent,
        IgxPivotRowDimensionContentComponent,
        IgxPivotRowDimensionHeaderComponent,
        IgxPivotRowDimensionHeaderGroupComponent,
        IgxPivotRowPipe,
        IgxPivotRowExpansionPipe,
        IgxPivotColumnPipe,
        IgxPivotGridFilterPipe,
        IgxPivotGridSortingPipe,
        IgxPivotGridColumnSortingPipe,
        IgxPivotDataSelectorComponent,
        IgxPivotCellMergingPipe,
        IgxFilterPivotItemsPipe,
    ],
    exports: [
        IgxGridModule,
        IgxPivotGridComponent,
        IgxPivotRowComponent,
        IgxPivotHeaderRowComponent,
        IgxPivotRowDimensionContentComponent,
        IgxPivotRowDimensionHeaderComponent,
        IgxPivotRowDimensionHeaderGroupComponent,
        IgxPivotRowExpansionPipe,
        IgxPivotRowPipe,
        IgxPivotColumnPipe,
        IgxPivotGridFilterPipe,
        IgxPivotGridSortingPipe,
        IgxPivotGridColumnSortingPipe,
        IgxPivotDataSelectorComponent,
        IgxPivotCellMergingPipe,
        IgxFilterPivotItemsPipe,
    ],
    imports: [IgxGridModule, IgxExpansionPanelModule, IgxDragDropModule],
    entryComponents: [IgxGridComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class IgxPivotGridModule {}
