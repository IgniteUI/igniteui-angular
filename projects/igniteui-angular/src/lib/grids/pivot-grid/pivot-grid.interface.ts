import { GridColumnDataType } from '../../data-operations/data-util';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IPivotDimensionStrategy } from '../../data-operations/pivot-strategy';
import { IgxColumnComponent } from '../columns/column.component';

export type PivotAggregation = (members: any[], data: any[]) => any;

export interface IPivotConfiguration {
    rowStrategy?: IPivotDimensionStrategy | null;
    columnStrategy?: IPivotDimensionStrategy | null;
    rows: IPivotDimension[] | null;
    columns: IPivotDimension[] | null;
    values: IPivotValue[] | null;
    // dimensions to be displayed in the filter area.
    filters?: IPivotDimension[] | null;
}

export interface IPivotDimension {
    // allow defining a hierarchy when multiple sub groups need to be extracted from single member.
    childLevel?: IPivotDimension;
    // field name which to use to extract value
    memberName: string;
    // function that extract the value
    memberFunction?: (data: any) => any;
    // Enables/Disables a particular dimension from pivot structure.
    enabled: boolean;
    // A predefined or defined via the `igxPivotSelector` filter expression tree for the current dimension to be applied in the filter pipe.
    filter?: FilteringExpressionsTree | null;
}

export interface IPivotValue {
    member: string;
    // display name if present shows instead of member for the column header of this value
    displayName?: string;
    /**
     * Aggregation function - can be a custom implementation of PivotAggregation or
     * use predefined ones from IgxPivotAggregate and its variants
     */
    aggregate: PivotAggregation;
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
}

export enum PivotDimensionType {
    Row,
    Column,
    Filter
}

export interface IPivotDimensionData {
    column: IgxColumnComponent;
    dimension: IPivotDimension;
    prevDimensions: IPivotDimension[];
}
