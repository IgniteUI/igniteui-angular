import { NgModule } from '@angular/core';
import { IgxGridCellComponent } from './cell.component';
import { IgxColumnComponent, IgxColumnGroupComponent, IgxColumnLayoutComponent } from './column.component';
import { IgxGridHeaderComponent } from './grid-header.component';
import { IgxGridFilteringCellComponent } from './filtering/grid-filtering-cell.component';
import { IgxGridFilteringRowComponent } from './filtering/grid-filtering-row.component';
import { IgxGridFooterComponent } from './grid-footer/grid-footer.component';
import {
    IgxGridBodyDirective,
} from './grid.common';
import { IgxGridTransaction } from './grid-base.component';
import { IgxBaseTransactionService } from '../services/transaction/base-transaction';
import {
    IgxRowEditTemplateDirective,
    IgxRowEditActionsDirective,
    IgxRowEditTextDirective,
    IgxRowEditTabStopDirective
} from './grid.rowEdit.directive';
import { IgxGridHeaderGroupComponent } from './grid-header-group.component';
import { IgxPaginatorModule } from '../paginator/paginator.component';
import { IgxFilterModule } from '../directives/filter/filter.directive';
import { IgxGridPipesModule } from './common/grid-pipes.module';
import { IgxGridExcelStyleFilteringModule } from './filtering/excel-style/grid.excel-style-filtering.module';
import { IgxRowDragModule } from './row-drag.directive';
import { IgxAdvancedFilteringDialogComponent } from './filtering/advanced-filtering/advanced-filtering-dialog.component';
import {
    IgxCellFooterTemplateDirective,
    IgxCellHeaderTemplateDirective,
    IgxCellEditorTemplateDirective,
    IgxCellTemplateDirective,
    IgxFilterCellTemplateDirective
} from './common/templates';
import { IgxGridSelectionModule } from './selection/selection.module';
import { IgxGridResizingModule } from './resizing/resize.module';
import { IgxColumnMovingModule } from './moving/moving.module';
import { IgxGridSharedModules } from './common/shared.module';
import { IgxGridSummaryModule } from './summaries/summary.module';
import { IgxGridToolbarModule } from './toolbar/toolbar.module';
import { IgxColumnHidingModule } from './hiding/hiding.module';
import { IgxColumnPinningModule } from './pinning/pinning.module';
/**
 * @hidden
 */
@NgModule({
    declarations: [
        IgxGridCellComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent,
        IgxGridHeaderComponent,
        IgxCellFooterTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxCellTemplateDirective,
        IgxRowEditTemplateDirective,
        IgxRowEditActionsDirective,
        IgxRowEditTextDirective,
        IgxRowEditTabStopDirective,
        IgxGridBodyDirective,
        IgxGridFilteringCellComponent,
        IgxGridFilteringRowComponent,
        IgxGridHeaderGroupComponent,
        IgxFilterCellTemplateDirective,
        IgxGridFooterComponent,
        IgxAdvancedFilteringDialogComponent
    ],
    entryComponents: [
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent,
        IgxAdvancedFilteringDialogComponent
    ],
    exports: [
        IgxGridCellComponent,
        IgxColumnComponent,
        IgxColumnGroupComponent,
        IgxColumnLayoutComponent,
        IgxGridHeaderComponent,
        IgxCellFooterTemplateDirective,
        IgxCellHeaderTemplateDirective,
        IgxCellEditorTemplateDirective,
        IgxCellTemplateDirective,
        IgxRowEditTemplateDirective,
        IgxRowEditActionsDirective,
        IgxRowEditTextDirective,
        IgxRowEditTabStopDirective,
        IgxGridBodyDirective,
        IgxColumnHidingModule,
        IgxColumnPinningModule,
        IgxGridFilteringCellComponent,
        IgxGridFilteringRowComponent,
        IgxGridHeaderGroupComponent,
        IgxFilterModule,
        IgxGridPipesModule,
        IgxGridExcelStyleFilteringModule,
        IgxFilterCellTemplateDirective,
        IgxRowDragModule,
        IgxPaginatorModule,
        IgxGridFooterComponent,
        IgxGridResizingModule,
        IgxColumnMovingModule,
        IgxGridSelectionModule,
        IgxGridSummaryModule,
        IgxGridToolbarModule,
        IgxAdvancedFilteringDialogComponent,
        IgxGridSharedModules
    ],
    imports: [
        IgxColumnMovingModule,
        IgxGridResizingModule,
        IgxColumnPinningModule,
        IgxGridSelectionModule,
        IgxGridSummaryModule,
        IgxGridToolbarModule,
        IgxColumnHidingModule,
        IgxFilterModule,
        IgxGridPipesModule,
        IgxGridExcelStyleFilteringModule,
        IgxRowDragModule,
        IgxPaginatorModule,
        IgxGridSharedModules
    ],
    providers: [
        { provide: IgxGridTransaction, useClass: IgxBaseTransactionService }
    ]
})
export class IgxGridCommonModule { }
