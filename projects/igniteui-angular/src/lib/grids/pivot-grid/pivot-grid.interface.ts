import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';

export interface IPivotConfiguration {
    rows: IPivotDimension[] | null;
    columns: IPivotDimension[] | null;
    values: IPivotValue[] | null;
    // A predefined or defined via the `igxPivotSelector` filter expression tree to be applied in the filter pipe.
    filters: FilteringExpressionsTree | null;
}

export interface IPivotDimension {
    // allow defining a hierarchy when multiple sub groups need to be extracted from single member.
    childLevels: IPivotDimension[];
    // field name which to use to extract value or function that extract the value.
    member: string | ((data: any) => any);
    // Enables/Disables a particular dimension from pivot structure.
    enabled: boolean;
}

export interface IPivotValue {
    member: string;
    // aggregate function - can use one of the predefined like IgxNumberSummaryOperand.sum etc.
    aggregate: (data: any[]) => any;
    // Enables/Disables a particular value from pivot aggregation.
    enabled: boolean;
}
