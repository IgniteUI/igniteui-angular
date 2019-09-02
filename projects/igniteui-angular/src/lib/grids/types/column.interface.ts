import { TemplateRef } from '@angular/core';
import { DataType } from '../../data-operations/data-util';

export interface ColumnType {
    field: string;
    index: number;
    dataType: DataType;
    /**
     * @hidden
     * @internal
     */
    inlineEditorTemplate: TemplateRef<any>;
    visibleIndex: number;
    editable: boolean;
    resizable: boolean;
    searchable: boolean;
    columnGroup: boolean;
    movable: boolean;
    groupable: boolean;
    disablePinning: boolean;
    pinned: boolean;
    level: number;
    rowStart: number;
    rowEnd: number;
    colStart: number;
    colEnd: number;
    gridRowSpan: number;
    gridColumnSpan: number;
    columnLayoutChild: boolean;
    width: string;
    topLevelParent?: ColumnType;
    parent?: ColumnType;
}
