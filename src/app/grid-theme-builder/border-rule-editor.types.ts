import { WritableSignal } from '@angular/core';

export type BorderTarget = 'header' | 'row' | 'pinned' | 'summaryPinned' | 'summary' | 'activeCell';

export interface BorderSignals {
    color: WritableSignal<string>;
    style: WritableSignal<string>;
    /** Omitted for targets whose width is not themable on its own, e.g. the summary borders. */
    width?: WritableSignal<string>;
}

export interface BorderOption {
    value: BorderTarget;
    label: string;
}

export const BORDER_OPTIONS: BorderOption[] = [
    { value: 'header', label: 'Header' },
    { value: 'row', label: 'Rows' },
    { value: 'pinned', label: 'Pinned columns' },
    { value: 'summaryPinned', label: 'Summary pinned border' },
    { value: 'summary', label: 'Summary borders' },
    { value: 'activeCell', label: 'Active cell' },
];

export const BORDER_DEFAULTS: Record<BorderTarget, { color: string; width: string; style: string }> = {
    header:        { color: '', width: '1px', style: 'solid' },
    row:           { color: '', width: '1px', style: 'solid' },
    pinned:        { color: '', width: '2px', style: 'solid' },
    summaryPinned: { color: '', width: '2px', style: 'solid' },
    summary:       { color: '', width: '1px', style: 'solid' },
    activeCell:    { color: '', width: '1px', style: 'solid' },
};
