import { InjectionToken } from '@angular/core';

export interface GridSelectionRange {
    rowStart: number;
    rowEnd: number;
    columnStart: string | number;
    columnEnd: string | number;
}

export interface ISelectionNode {
    row: number;
    column: number;
    layout?: IMultiRowLayoutNode;
    isSummaryRow?: boolean;
}

export interface IMultiRowLayoutNode {
    rowStart: number;
    colStart: number;
    rowEnd: number;
    colEnd: number;
    columnVisibleIndex: number;
}

export interface ISelectionKeyboardState {
    node: null | ISelectionNode;
    shift: boolean;
    range: GridSelectionRange;
    active: boolean;
}

export interface ISelectionPointerState extends ISelectionKeyboardState {
    ctrl: boolean;
    primaryButton: boolean;
}

export interface IColumnSelectionState {
    field: null | string;
    range: string[];
}

export type SelectionState = ISelectionKeyboardState | ISelectionPointerState;

export const IgxGridTransaction = new InjectionToken<string>('IgxGridTransaction');
