/**
 * Minimal type stubs for grid types to avoid circular dependencies.
 * These are simple interfaces that core uses for typing only.
 * The actual implementations are in igniteui-angular/grids.
 */

/**
 * Stub type for GridType - minimal interface for typing in core
 */
export interface GridType {
    primaryKey?: string;
    id?: string;
    data?: any[];
    [key: string]: any;
}

/**
 * Stub type for ColumnType - minimal interface for typing in core
 */
export interface ColumnType {
    field: string;
    dataType?: any;
    header?: string;
    [key: string]: any;
}

/**
 * Stub type for EntityType - minimal interface for typing in core
 */
export interface EntityType {
    [key: string]: any;
}

/**
 * Stub type for FieldType - minimal interface for typing in core
 */
export interface FieldType {
    field: string;
    dataType?: any;
    [key: string]: any;
}

/**
 * Stub type for ITreeGridRecord - minimal interface for typing in core
 */
export interface ITreeGridRecord {
    key: any;
    data: any;
    children?: ITreeGridRecord[];
    parent?: ITreeGridRecord;
    [key: string]: any;
}

/**
 * Stub type for IgxHierarchicalGridComponent - minimal interface for typing in core
 */
export interface IgxHierarchicalGridComponent extends GridType {
    [key: string]: any;
}

/**
 * Stub type for IgxTreeGridAPIService - minimal interface for typing in core
 */
export interface IgxTreeGridAPIService {
    get_row_id(rowData: any): any;
    [key: string]: any;
}

/**
 * Stub interface for IPathSegment
 */
export interface IPathSegment {
    /**
     * @deprecated Use rowKey instead
     */
    rowID?: any;
    rowKey: any;
    rowIslandKey: string;
}

/**
 * Stub interface for IgxSummaryResult
 */
export interface IgxSummaryResult {
    [key: string]: any;
}

/**
 * Stub enum for GridSummaryCalculationMode
 */
export enum GridSummaryCalculationMode {
    RootAndChildLevels = 0,
    ChildLevelsOnly = 1,
    RootLevelOnly = 2
}

/**
 * @hidden
 */
export const GridColumnDataType = {
    String: 'string',
    Number: 'number',
    Boolean: 'boolean',
    Date: 'date',
    DateTime: 'dateTime',
    Time: 'time',
    Currency: 'currency',
    Percent: 'percent',
    Image: 'image'
} as const;
export type GridColumnDataType = (typeof GridColumnDataType)[keyof typeof GridColumnDataType];
