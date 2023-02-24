import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";

import { IgxPivotDataSelectorComponent } from "./pivot-data-selector.component";
import { IgxPivotGridComponent } from "./pivot-grid.component";
import {
    IgxFilterPivotItemsPipe,
    IgxPivotGridCellStyleClassesPipe,
    IgxPivotAutoTransform,
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
import { IgxPivotValueChipTemplateDirective } from './pivot-grid.directives';

/**
 * @hidden
 */
@NgModule({
    exports: [
        IgxPivotGridComponent,
        IgxPivotRowComponent,
        IgxPivotHeaderRowComponent,
        IgxPivotRowDimensionContentComponent,
        IgxPivotRowDimensionHeaderComponent,
        IgxPivotRowDimensionHeaderGroupComponent,
        IgxPivotRowExpansionPipe,
        IgxPivotAutoTransform,
        IgxPivotRowPipe,
        IgxPivotColumnPipe,
        IgxPivotGridFilterPipe,
        IgxPivotGridSortingPipe,
        IgxPivotGridColumnSortingPipe,
        IgxPivotCellMergingPipe,
        IgxFilterPivotItemsPipe,
        IgxPivotGridCellStyleClassesPipe,
        IgxPivotDataSelectorComponent,
        IgxPivotValueChipTemplateDirective,
    ],
    imports: [
        IgxPivotGridComponent,
        IgxPivotRowComponent,
        IgxPivotHeaderRowComponent,
        IgxPivotRowDimensionContentComponent,
        IgxPivotRowDimensionHeaderComponent,
        IgxPivotRowDimensionHeaderGroupComponent,
        IgxPivotRowPipe,
        IgxPivotRowExpansionPipe,
        IgxPivotAutoTransform,
        IgxPivotColumnPipe,
        IgxPivotGridFilterPipe,
        IgxPivotGridSortingPipe,
        IgxPivotGridColumnSortingPipe,
        IgxPivotCellMergingPipe,
        IgxFilterPivotItemsPipe,
        IgxPivotGridCellStyleClassesPipe,
        IgxPivotDataSelectorComponent,
        IgxPivotValueChipTemplateDirective
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IgxPivotGridModule {}
