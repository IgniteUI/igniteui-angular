import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IPivotDimensionStrategy } from '../../data-operations/pivot-strategy';


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
    childLevels?: IPivotDimension[];
    // field name which to use to extract value or function that extract the value.
    member: string | ((data: any) => any);
    // Enables/Disables a particular dimension from pivot structure.
    enabled: boolean;
    // additional field name when using member as a function
    fieldName?: string;
    // A predefined or defined via the `igxPivotSelector` filter expression tree for the current dimension to be applied in the filter pipe.
    filter?: FilteringExpressionsTree | null;
}

export interface IPivotValue {
    member: string;
    // aggregate function - can use one of the predefined like IgxNumberSummaryOperand.sum etc.
    aggregate: (data: any[]) => any;
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
    Column,
    Filter
}
