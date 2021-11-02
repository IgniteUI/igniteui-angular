import { FilteringExpressionsTree } from '../../data-operations/filtering-expressions-tree';
import { IPivotDimensionStrategy } from '../../data-operations/pivot-strategy';
import { PivotUtil } from './pivot-util';


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
    childLevels?: IPivotDimension[];
    // field name which to use to extract value or function that extract the value.
    member: string | ((data: any) => any);
    // Enables/Disables a particular dimension from pivot structure.
    enabled: boolean;
    // additional field name when using member as a function
    fieldName?: string;
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
    Column
}

// Equals to pretty much this configuration:
// {
//     member: () => 'All Periods',
//     enabled: true,
//     fieldName: 'AllPeriods',
//     childLevels: [{
//         fieldName: 'Years',
//         member: (rec) => {
//             const recordValue = rec['Date'];
//             return recordValue ? (new Date(recordValue)).getFullYear().toString() : rec['Years'];
//         },
//         enabled: true,
//         childLevels: [
//             {
//                 member: (rec) => {
//                     const recordValue = rec['Date'];
//                     return recordValue ? new Date(recordValue).toLocaleString('default', { month: 'long' }) : rec['Months'];
//                 },
//                 enabled: true,
//                 fieldName: 'Months',
//                 childLevels: [
//                     {
//                         member: 'Date',
//                         fieldName:'Date',
//                         enabled: true,
//                         childLevels: []
//                     }]
//             }]
//     }]
// },

export class IgxPivotDateDimension implements IPivotDimension {
    public member = () => 'All Periods';
    public fieldName = 'AllPeriods';
    public enabled = true;

    constructor(public childLevels: IPivotDimension[], public showQuarters = true) {
        if (childLevels.length === 0) {
            console.warn(`Please provide data child level to the pivot dimension.`);
            return;
        }

        const monthDimension = {
            fieldName: 'Months',
            member: (rec) => {
                const recordValue = PivotUtil.extractValueFromDimension(childLevels[0], rec);
                return recordValue ? new Date(recordValue).toLocaleString('default', { month: 'long' }) : rec['Months'];
            },
            enabled: true,
            childLevels: this.childLevels
        };

        const quarterDimension = {
            fieldName: 'Quarters',
            member: (rec) => {
                const recordValue = PivotUtil.extractValueFromDimension(childLevels[0], rec);
                return recordValue ? `Q` + Math.floor((new Date(recordValue).getMonth() + 1) / 3) : rec['Quarters'];
            },
            enabled: true,
            childLevels: [monthDimension]
        };

        this.childLevels = [
            {
                fieldName: 'Years',
                member: (rec) => {
                    const recordValue = PivotUtil.extractValueFromDimension(childLevels[0], rec);
                    return recordValue ? (new Date(recordValue)).getFullYear().toString() : rec['Years'];
                },
                enabled: true,
                childLevels: [showQuarters ? quarterDimension : monthDimension]
            }
        ];
    }
}