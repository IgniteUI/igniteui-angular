
import { mkenum } from '../../core/utils';
/**
 * Enumeration representing different filter modes for grid filtering.
 * - quickFilter: default value
 * - excelStyleFilter: Filter mode where an Excel-style filter is used.
 */
export const FilterMode = mkenum({
    quickFilter: 'quickFilter',
    excelStyleFilter: 'excelStyleFilter'
});
/** Type alias for the keys of the FilterMode enumeration. */
export type FilterMode = (typeof FilterMode)[keyof typeof FilterMode];

/**
 * Enumeration representing the position of grid summary rows.
 * - top: Default value; Summary rows are displayed at the top of the grid.
 * - bottom: Summary rows are displayed at the bottom of the grid.
 */
export const GridSummaryPosition = mkenum({
    top: 'top',
    bottom: 'bottom'
});
/** Type alias for the keys of the GridSummaryPosition enumeration. */
export type GridSummaryPosition = (typeof GridSummaryPosition)[keyof typeof GridSummaryPosition];

/**
 * Enumeration representing different calculation modes for grid summaries.
 * - rootLevelOnly: Summaries are calculated only for the root level.
 * - childLevelsOnly: Summaries are calculated only for child levels.
 * - rootAndChildLevels: Default value; Summaries are calculated for both root and child levels.
 */
export const GridSummaryCalculationMode = mkenum({
    rootLevelOnly: 'rootLevelOnly',
    childLevelsOnly: 'childLevelsOnly',
    rootAndChildLevels: 'rootAndChildLevels'
});
/** Type alias for the keys of the GridSummaryCalculationMode enumeration. */
export type GridSummaryCalculationMode = (typeof GridSummaryCalculationMode)[keyof typeof GridSummaryCalculationMode];

/**
 * Type representing the triggers for grid cell validation.
 * - 'change': Validation is triggered when the cell value changes.
 * - 'blur': Validation is triggered when the cell loses focus.
 */
export type GridValidationTrigger = 'change' | 'blur' ;

/** Type representing the target types for keydown events in the grid. */
export type GridKeydownTargetType =
    'dataCell' |
    'summaryCell' |
    'groupRow' |
    'hierarchicalRow' |
    'headerCell' |
    'masterDetailRow';

/**
 * Enumeration representing different selection modes for the grid columns if can be selected.
 * - none: No selection is allowed.
 */
export const GridSelectionMode = mkenum({
    none: 'none',
    single: 'single',
    multiple: 'multiple',
    multipleCascade: 'multipleCascade'
});
/** Type alias for the keys of the GridSelectionMode enumeration. */
export type GridSelectionMode = (typeof GridSelectionMode)[keyof typeof GridSelectionMode];

/** Enumeration representing different column display order options. */
export const ColumnDisplayOrder = mkenum({
    Alphabetical: 'Alphabetical',
    DisplayOrder: 'DisplayOrder'
});
/** Type alias for the keys of the ColumnDisplayOrder enumeration. */
export type ColumnDisplayOrder = (typeof ColumnDisplayOrder)[keyof typeof ColumnDisplayOrder];

/**
 * Enumeration representing the possible positions for pinning columns.
 * - Start: Columns are pinned to the start of the grid.
 * - End: Columns are pinned to the end of the grid.
 */
export enum ColumnPinningPosition {
    Start,
    End
}

/**
 * Enumeration representing the possible positions for pinning rows.
 * - Top: Rows are pinned to the top of the grid.
 * - Bottom: Rows are pinned to the bottom of the grid.
 */
export enum RowPinningPosition {
    Top,
    Bottom
}

/**
 * Enumeration representing different paging modes for the grid.
 * - Local: Default value; The grid will paginate the data source based on the page
 */
export enum GridPagingMode {
    Local,
    Remote
}

/**
 * Enumeration representing different types of grid instances.
 * - Grid: The grid is a regular grid instance.
 * - TreeGrid: The grid is a tree grid instance.
 */
export enum GridInstanceType {
    Grid,
    TreeGrid
}
