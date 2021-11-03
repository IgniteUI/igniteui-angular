import { GridColumnDataType } from '../../data-operations/data-util';
import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IPivotDimensionStrategy } from '../../data-operations/pivot-strategy';
import { PivotUtil } from './pivot-util';



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
    Column
}

// Equals to pretty much this configuration:
// {
//     member: () => 'All Periods',
//     enabled: true,
//     fieldName: 'AllPeriods',
//     childLevel: {
//         fieldName: 'Years',
//         member: (rec) => {
//             const recordValue = rec['Date'];
//             return recordValue ? (new Date(recordValue)).getFullYear().toString() : rec['Years'];
//         },
//         enabled: true,
//         childLevel: {
//                 member: (rec) => {
//                     const recordValue = rec['Date'];
//                     return recordValue ? new Date(recordValue).toLocaleString('default', { month: 'long' }) : rec['Months'];
//                 },
//                 enabled: true,
//                 fieldName: 'Months',
//                 childLevel: {
//                         member: 'Date',
//                         fieldName:'Date',
//                         enabled: true
//                     }
//             }
//     }
// },

export class IgxPivotDateDimension implements IPivotDimension {
    public childLevel: IPivotDimension;
    public member = () => 'All Periods';
    public fieldName = 'AllPeriods';
    public enabled = true;

    constructor(public inChildLevel: IPivotDimension, public showQuarters = false) {
        if (!inChildLevel) {
            console.warn(`Please provide data child level to the pivot dimension.`);
            return;
        }

        const monthDimension: IPivotDimension = {
            fieldName: 'Months',
            member: (rec) => {
                const recordValue = PivotUtil.extractValueFromDimension(inChildLevel, rec);
                return recordValue ? new Date(recordValue).toLocaleString('default', { month: 'long' }) : rec['Months'];
            },
            enabled: true,
            childLevel: this.inChildLevel
        };

        const quarterDimension: IPivotDimension = {
            fieldName: 'Quarters',
            member: (rec) => {
                const recordValue = PivotUtil.extractValueFromDimension(inChildLevel, rec);
                return recordValue ? `Q` + Math.floor((new Date(recordValue).getMonth() + 1) / 3) : rec['Quarters'];
            },
            enabled: true,
            childLevel: monthDimension
        };

        this.childLevel = {
            fieldName: 'Years',
            member: (rec) => {
                const recordValue = PivotUtil.extractValueFromDimension(inChildLevel, rec);
                return recordValue ? (new Date(recordValue)).getFullYear().toString() : rec['Years'];
            },
            enabled: true,
            childLevel: showQuarters ? quarterDimension : monthDimension
        };
    }
}