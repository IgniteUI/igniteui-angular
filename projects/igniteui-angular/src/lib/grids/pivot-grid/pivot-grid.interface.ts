import { GridColumnDataType } from '../../data-operations/data-util';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { SortingDirection } from '../../data-operations/sorting-strategy';
import { ColumnType } from '../common/grid.interface';

export const DEFAULT_PIVOT_KEYS = {
    aggregations: 'aggregations', records: 'records', children: 'children', level: 'level',
    rowDimensionSeparator: '_', columnDimensionSeparator: '-'
};

export interface IDimensionsChange {
    dimensions: IPivotDimension[],
    dimensionCollectionType: PivotDimensionType
}

export interface IValuesChange {
    values: IPivotValue[]
}

export interface IPivotDimensionStrategy {
    process(collection: any,
        dimensions: IPivotDimension[],
        values: IPivotValue[],
        pivotKeys?: IPivotKeys): any[];
}

export type PivotAggregation = (members: any[], data: any[]) => any;

export interface IPivotAggregator {
    /** Aggregation unique key. */
    key: string;
    /** Aggregation label to show in the UI. */
    label: string;
    /**
     * Aggregator function can be a custom implementation of `PivotAggregation`, or 
     * use predefined ones from `IgxPivotAggregate` and its variants.
     */
    aggregator: (members: any[], data?: any[]) => any;
}

/**
 * Configuration of the pivot grid.
 */
export interface IPivotConfiguration {
    /** A strategy to transform the rows. */
    rowStrategy?: IPivotDimensionStrategy | null;
    /** A strategy to transform the columns. */
    columnStrategy?: IPivotDimensionStrategy | null;
    /** A list of the rows. */
    rows: IPivotDimension[] | null;
    /** A list of the columns. */
    columns: IPivotDimension[] | null;
    /** A list of the values. */
    values: IPivotValue[] | null;
    /** Dimensions to be displayed in the filter area. */
    filters?: IPivotDimension[] | null;
    pivotKeys?: IPivotKeys;
}

export interface IPivotDimension {
    /** Allows defining a hierarchy when multiple sub groups need to be extracted from single member. */
    childLevel?: IPivotDimension;
    /** Field name to use in order to extract value. */
    memberName: string;
    /** Function that extracts the value */
    memberFunction?: (data: any) => any;
    /** Enables/Disables a particular dimension from pivot structure. */
    enabled: boolean;
    /**
     * A predefined or defined via the `igxPivotSelector` filter expression tree for the current dimension to be applied in the filter pipe.
     * */
    filter?: FilteringExpressionsTree | null;
    sortDirection?: SortingDirection;
    dataType?: GridColumnDataType;
    // The width of the dimension cells to be rendered.Can be pixel or %.
    width? : string;
}

export interface IPivotValue {
    member: string;
    // display name if present shows instead of member for the column header of this value
    displayName?: string;
    /**
     * Active aggregator definition with key, label and aggregator.
     */
    aggregate: IPivotAggregator;
    /**
     * List of aggregates to show in aggregate drop-down.
     */
    aggregateList?: IPivotAggregator[];
    // Enables/Disables a particular value from pivot aggregation.
    enabled: boolean;
    // Allow conditionally styling of the IgxPivotGrid cells
    styles?: any;
    // Enables a data type specific template of the cells
    dataType?: GridColumnDataType;
    // Applies display format to cell values.
    formatter?: (value: any, rowData?: any) => any;
}

export interface IPivotKeys {
    children: string;
    records: string;
    aggregations: string;
    level: string;
    columnDimensionSeparator: string;
    rowDimensionSeparator: string;
}

export enum PivotDimensionType {
    Row,
    Column,
    Filter
}

export interface IPivotDimensionData {
    column: ColumnType;
    dimension: IPivotDimension;
    prevDimensions: IPivotDimension[];
    isChild?: boolean;
}

export interface PivotRowHeaderGroupType {
    rowIndex: number;
    parent: any;
    header: any;
    headerID: string;
    grid: any;
}
