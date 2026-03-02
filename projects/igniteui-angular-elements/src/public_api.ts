import { registerI18n, setCurrentI18n } from 'igniteui-i18n-core';
import { ByLevelTreeGridMergeStrategy, ColumnPinningPosition, DefaultMergeStrategy, DefaultTreeGridMergeStrategy, FilteringExpressionsTree, FilteringExpressionsTreeType, FilteringLogic, HorizontalAlignment, IgxBooleanFilteringOperand, IgxDateFilteringOperand, IgxDateTimeFilteringOperand, IgxFilteringOperand, IgxNumberFilteringOperand, IgxStringFilteringOperand, IgxTimeFilteringOperand, NoopFilteringStrategy, NoopSortingStrategy, SortingDirection, VerticalAlignment } from 'igniteui-angular/core';
import { CsvFileTypes, DropPosition, GridPagingMode, IgxCsvExporterOptions, IgxDateSummaryOperand, IgxExcelExporterOptions, IgxNumberSummaryOperand, IgxPivotAggregate, IgxPivotDateAggregate, IgxPivotDateDimension, IgxPivotNumericAggregate, IgxPivotTimeAggregate, IgxSummaryOperand, IgxTimeSummaryOperand, NoopPivotDimensionsStrategy, PivotDimensionType, RowPinningPosition } from 'igniteui-angular/grids/core';
import { IgcExcelExporterService } from './lib/excel-exporter';
import { IgcCsvExporterService } from './lib/csv-exporter';

/** Export Public API, TODO: reorganize, Generate all w/ renames? */
export {
    //Grids API
    FilteringExpressionsTree as IgcFilteringExpressionsTree,
    FilteringLogic,
    FilteringExpressionsTreeType,
    IgxFilteringOperand as IgcFilteringOperand,
    IgxBooleanFilteringOperand as IgcBooleanFilteringOperand,
    IgxStringFilteringOperand as IgcStringFilteringOperand,
    IgxNumberFilteringOperand as IgcNumberFilteringOperand,
    IgxDateFilteringOperand as IgcDateFilteringOperand,
    IgxDateTimeFilteringOperand as IgcDateTimeFilteringOperand,
    IgxTimeFilteringOperand as IgcTimeFilteringOperand,

    IgxSummaryOperand as IgcSummaryOperand,
    IgxNumberSummaryOperand as IgcNumberSummaryOperand,
    IgxDateSummaryOperand as IgcDateSummaryOperand,
    IgxTimeSummaryOperand as IgcTimeSummaryOperand,

    NoopSortingStrategy as IgcNoopSortingStrategy,
    NoopFilteringStrategy as IgcNoopFilteringStrategy,
    DefaultMergeStrategy as IgcDefaultMergeStrategy,
    DefaultTreeGridMergeStrategy as IgcDefaultTreeGridMergeStrategy,
    ByLevelTreeGridMergeStrategy as IgcByLevelTreeGridMergeStrategy,

    // Pivot API
    IgxPivotDateDimension as IgcPivotDateDimension,
    IgxPivotNumericAggregate as IgcPivotNumericAggregate,
    IgxPivotDateAggregate as IgcPivotDateAggregate,
    IgxPivotTimeAggregate as IgcPivotTimeAggregate,
    IgxPivotAggregate as IgcPivotAggregate,
    NoopPivotDimensionsStrategy as IgcNoopPivotDimensionsStrategy,

    SortingDirection,
    ColumnPinningPosition,
    RowPinningPosition,
    GridPagingMode,
    DropPosition,
    PivotDimensionType,

    // overlay position settings (used in grids, paginator, toolbar)
    HorizontalAlignment,
    VerticalAlignment,

    // i18n
    registerI18n,
    setCurrentI18n,

    IgxExcelExporterOptions as IgcExcelExporterOptions,
    IgxCsvExporterOptions as IgcCsvExporterOptions,
    IgcExcelExporterService,
    IgcCsvExporterService,
    CsvFileTypes
}
