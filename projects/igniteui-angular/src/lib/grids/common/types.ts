import { InjectionToken } from '@angular/core';

/* tsPlainInterface */
/* marshalByValue */
/**
 * Represents a range selection between certain rows and columns of the grid.
 * Range selection can be made either through drag selection or through keyboard selection.
 */
export interface GridSelectionRange {
    /** The index of the starting row of the selection range. */
    rowStart: number;
     /** The index of the ending row of the selection range. */
    rowEnd: number;
    /* blazorAlternateType: double */
    /**
     * The identifier or index of the starting column of the selection range.
     * It can be either a string representing the column's field name or a numeric index.
     */
    columnStart: string | number;
    /* blazorAlternateType: double */
    /**
     * The identifier or index of the ending column of the selection range.
     * It can be either a string representing the column's field name or a numeric index.
     */
    columnEnd: string | number;
}

/**
 * Represents a single selected cell or node in a grid.
 */
export interface ISelectionNode {
    /**
     * The index of the selected row.
     */
    row: number;
    /**
     * The index of the selected column.
     */
    column: number;
    /**
     * (Optional)
     * Additional layout information for multi-row selection nodes.
     */
    layout?: IMultiRowLayoutNode;
    /**
     * (Optional)
     * Indicates if the selected node is a summary row.
     * This property is true if the selected row is a summary row; otherwise, it is false.
     */
    isSummaryRow?: boolean;
}

export interface IMultiRowLayoutNode {
    rowStart: number;
    colStart: number;
    rowEnd: number;
    colEnd: number;
    columnVisibleIndex: number;
}

/**
 * Represents the state of the keyboard when selecting.
 */
export interface ISelectionKeyboardState {
    /** The selected node in the grid, if any. Can be null if no node is selected. */
    node: null | ISelectionNode;
    /** Indicates whether the Shift key is currently pressed during the selection. */
    shift: boolean;
    /** The range of the selected cells in the grid. Can be null when resetting the selection. */
    range: GridSelectionRange;
    /** Indicates whether the selection is currently active (being performed). `False` when resetting the selection.  */
    active: boolean;
}

/**
 * Represents the state of the grid selection using pointer interactions (mouse).
 * Extends ISelectionKeyboardState to include pointer-specific properties.
 */
export interface ISelectionPointerState extends ISelectionKeyboardState {
    /** Indicates whether the Ctrl key is currently pressed during the selection. */
    ctrl: boolean;
    /** Indicates whether the primary pointer button is pressed during the selection (clicked). */
    primaryButton: boolean;
}

/**
 * Represents the state of the columns in the grid.
 */
export interface IColumnSelectionState {
     /** Represents the field name of the selected column, if any. Can be null if no column is selected. */
    field: null | string;
    /** An array of strings representing the ranges of selected columns in the grid. */
    range: string[];
}

/**
 * Represents the overall state of grid selection, combining both keyboard and pointer interaction states.
 * It can be either an ISelectionKeyboardState or an ISelectionPointerState.
 */
export type SelectionState = ISelectionKeyboardState | ISelectionPointerState;

/**
 * Injection token for accessing the grid transaction object.
 * This allows injecting the grid transaction object into components or services.
 */
export const IgxGridTransaction = /*@__PURE__*/new InjectionToken<string>('IgxGridTransaction');
