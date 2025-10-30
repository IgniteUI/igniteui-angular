
/**
 * Enumeration representing different filter modes for grid filtering.
 * - quickFilter: Default mode with a filter row UI between the column headers and the first row of records.
 * - excelStyleFilter: Filter mode where an Excel-style filter is used.
 */
export const FilterMode = {
    quickFilter: 'quickFilter',
    excelStyleFilter: 'excelStyleFilter'
} as const;
export type FilterMode = (typeof FilterMode)[keyof typeof FilterMode];

/**
 * Enumeration representing the position of grid summary rows.
 * - top: Default value; Summary rows are displayed at the top of the grid.
 * - bottom: Summary rows are displayed at the bottom of the grid.
 */
export const GridSummaryPosition = {
    top: 'top',
    bottom: 'bottom'
} as const;
export type GridSummaryPosition = (typeof GridSummaryPosition)[keyof typeof GridSummaryPosition];

/**
 * Enumeration representing different calculation modes for grid summaries.
 * - rootLevelOnly: Summaries are calculated only for the root level.
 * - childLevelsOnly: Summaries are calculated only for child levels.
 * - rootAndChildLevels: Default value; Summaries are calculated for both root and child levels.
 */
export const GridSummaryCalculationMode = {
    rootLevelOnly: 'rootLevelOnly',
    childLevelsOnly: 'childLevelsOnly',
    rootAndChildLevels: 'rootAndChildLevels'
} as const;
export type GridSummaryCalculationMode = (typeof GridSummaryCalculationMode)[keyof typeof GridSummaryCalculationMode];

/**
 * Type representing the triggers for grid cell validation.
 * - 'change': Validation is triggered when the cell value changes.
 * - 'blur': Validation is triggered when the cell loses focus.
 */
export type GridValidationTrigger = 'change' | 'blur' ;

/**
 * Type representing the type of the target object (elements of the grid) for keydown (fired when a key is pressed) events in the grid.
 * - 'dataCell': Represents a data cell within the grid. It contains and displays individual data values
 * - 'summaryCell': Summary cells display aggregated/summarized data at the bottom of the grid. They provide insights like total record count, min/max values, etc.
 * - 'groupRow': Group row within the grid. Group rows are used to group related data rows by columns. Contains the related group expression, level, sub-records and group value.
 * - 'hierarchicalRow': Hierarchical rows are similar to group rows, but represent a more complex hierarchical structure, allowing for nested grouping
 * - 'headerCell': Represents a header cell within the grid. Header cells are used to display column headers, providing context and labels for the columns.
 * - 'masterDetailRow': Represents a grid row that can be expanded in order to show additional information
 */
export type GridKeydownTargetType =
    'dataCell' |
    'summaryCell' |
    'groupRow' |
    'hierarchicalRow' |
    'headerCell' |
    'masterDetailRow';

/**
 * Enumeration representing different selection modes for the grid elements if can be selected.
 * - 'none': No selection is allowed. Default row and column selection mode.
 * - 'single': Only one element can be selected at a time. Selecting a new one will deselect the previously selected one.
 * - 'multiple': Default cell selection mode. More than one element can be selected at a time.
 * - 'multipleCascade': Similar to multiple selection. It is used in hierarchical or tree grids. Allows selection not only to an individual item but also all its related or nested items in a single action
 */
export const GridSelectionMode = {
    none: 'none',
    single: 'single',
    multiple: 'multiple',
    multipleCascade: 'multipleCascade'
} as const;
export type GridSelectionMode = (typeof GridSelectionMode)[keyof typeof GridSelectionMode];


/**
 * Enumeration representing different cell merging modes for the grid elements.
 * - 'never': Never merge cells.
 * - 'always': Always merge adjacent cells based on merge strategy.
 * - 'onSort': Only merge cells in column that are sorted.
 */
export const GridCellMergeMode = {
    always: 'always',
    onSort: 'onSort'
} as const;
export type GridCellMergeMode = (typeof GridCellMergeMode)[keyof typeof GridCellMergeMode];

/** Enumeration representing different column display order options. */
export const ColumnDisplayOrder = {
    Alphabetical: 'Alphabetical',
    DisplayOrder: 'DisplayOrder'
} as const;
export type ColumnDisplayOrder = (typeof ColumnDisplayOrder)[keyof typeof ColumnDisplayOrder];

/* mustCoerceToInt */
/**
 * Enumeration representing the possible positions for pinning columns.
 * - Start: Columns are pinned to the start of the grid.
 * - End: Columns are pinned to the end of the grid.
 */
export enum ColumnPinningPosition {
    Start,
    End
}

/* mustCoerceToInt */
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
 * - Local: The grid will use local data to extract pages during paging.
 * - Remote: The grid will expect pages to be delivered from a remote location and will only raise events during paging interactions.
 */
export const GridPagingMode = {
    Local: 'local',
    Remote: 'remote'
} as const;
export type GridPagingMode = (typeof GridPagingMode)[keyof typeof GridPagingMode];
