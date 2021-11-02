import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IPivotDimensionStrategy } from '../../data-operations/pivot-strategy';



export type PivotAggregation = (members: any[], data: any[]) => any;

export interface IPivotConfiguration {
    rowStrategy?: IPivotDimensionStrategy | null;
    columnStrategy?: IPivotDimensionStrategy | null;
    rows: IPivotDimension[] | null;
    columns: IPivotDimension[] | null;
    values: IPivotValue[] | null;
    // A predefined or defined via the `igxPivotSelector` filter expression tree to be applied in the filter pipe.
    filters: FilteringExpressionsTree | null;
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
    dataType?: string;
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
    Column
}
