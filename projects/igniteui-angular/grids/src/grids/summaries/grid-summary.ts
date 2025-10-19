import { IGroupByRecord } from '../../data-operations/groupby-record.interface';

/* tsPlainInterface */
/* marshalByValue */
export interface ISummaryExpression {
    fieldName: string;
    /* blazorCSSuppress */
    customSummary?: any;
}

/* tsPlainInterface */
/* marshalByValue */
export interface IgxSummaryResult {
    key: string;
    label: string;
    /* blazorAlternateName: Result */
    summaryResult: any;
    /**
     * Apply default formatting based on the grid column type.
     * ```typescript
     * const result: IgxSummaryResult = {
     *   key: 'key',
     *   label: 'label',
     *   defaultFormatting: true
     * }
     * ```
     *
     * @memberof IgxSummaryResult
     */
    defaultFormatting?: boolean;
}

export interface ISummaryRecord {
    summaries: Map<string, IgxSummaryResult[]>;
    max?: number;
    cellIndentation?: number;
}

const clear = (el) => el === 0 || Boolean(el);
const first = (arr) => arr[0];
const last = (arr) => arr[arr.length - 1];

/* blazorCSSuppress */
export class IgxSummaryOperand {
    /**
     * Counts all the records in the data source.
     * If filtering is applied, counts only the filtered records.
     * ```typescript
     * IgxSummaryOperand.count(dataSource);
     * ```
     *
     * @memberof IgxSummaryOperand
     */
    public static count(data: any[]): number {
        return data.length;
    }
    /**
     * Executes the static `count` method and returns `IgxSummaryResult[]`.
     * ```typescript
     * interface IgxSummaryResult {
     *   key: string;
     *   label: string;
     *   summaryResult: any;
     * }
     * ```
     * Can be overridden in the inherited classes to provide customization for the `summary`.
     * ```typescript
     * class CustomSummary extends IgxSummaryOperand {
     *   constructor() {
     *     super();
     *   }
     *   public operate(data: any[], allData: any[], fieldName: string, groupRecord: IGroupByRecord): IgxSummaryResult[] {
     *     const result = [];
     *     result.push({
     *       key: "test",
     *       label: "Test",
     *       summaryResult: IgxSummaryOperand.count(data)
     *     });
     *     return result;
     *   }
     * }
     * this.grid.getColumnByName('ColumnName').summaries = CustomSummary;
     * ```
     *
     * @memberof IgxSummaryOperand
     */
    public operate(data: any[] = [], _allData: any[] = [], _fieldName?: string, _groupRecord?: IGroupByRecord): IgxSummaryResult[] {
        return [{
            key: 'count',
            label: 'Count',
            defaultFormatting: false,
            summaryResult: IgxSummaryOperand.count(data)
        }];
    }
}

/* blazorCSSuppress */
// @dynamic
export class IgxNumberSummaryOperand extends IgxSummaryOperand {
    /**
     * Returns the minimum numeric value in the provided data records.
     * If filtering is applied, returns the minimum value in the filtered data records.
     * ```typescript
     * IgxNumberSummaryOperand.min(data);
     * ```
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static min(data: any[]): number {
        return data.length && data.filter(clear).length ? data.filter(clear).reduce((a, b) => Math.min(a, b)) : 0;
    }
    /**
     * Returns the maximum numeric value in the provided data records.
     * If filtering is applied, returns the maximum value in the filtered data records.
     * ```typescript
     * IgxNumberSummaryOperand.max(data);
     * ```
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static max(data: any[]): number {
        return data.length && data.filter(clear).length ? data.filter(clear).reduce((a, b) => Math.max(a, b)) : 0;
    }
    /**
     * Returns the sum of the numeric values in the provided data records.
     * If filtering is applied, returns the sum of the numeric values in the data records.
     * ```typescript
     * IgxNumberSummaryOperand.sum(data);
     * ```
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static sum(data: any[]): number {
        return data.length && data.filter(clear).length ? data.filter(clear).reduce((a, b) => +a + +b) : 0;
    }
    /**
     * Returns the average numeric value in the data provided data records.
     * If filtering is applied, returns the average numeric value in the filtered data records.
     * ```typescript
     * IgxSummaryOperand.average(data);
     * ```
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static average(data: any[]): number {
        return data.length && data.filter(clear).length ? this.sum(data) / this.count(data) : 0;
    }
    /**
     * Executes the static methods and returns `IgxSummaryResult[]`.
     * ```typescript
     * interface IgxSummaryResult {
     *   key: string;
     *   label: string;
     *   summaryResult: any;
     * }
     * ```
     * Can be overridden in the inherited classes to provide customization for the `summary`.
     * ```typescript
     * class CustomNumberSummary extends IgxNumberSummaryOperand {
     *   constructor() {
     *     super();
     *   }
     *   public operate(data: any[], allData: any[], fieldName: string, groupRecord: IGroupByRecord): IgxSummaryResult[] {
     *     const result = super.operate(data, allData, fieldName, groupRecord);
     *     result.push({
     *       key: "avg",
     *       label: "Avg",
     *       summaryResult: IgxNumberSummaryOperand.average(data)
     *     });
     *     result.push({
     *       key: 'mdn',
     *       label: 'Median',
     *       summaryResult: this.findMedian(data)
     *     });
     *     return result;
     *   }
     * }
     * this.grid.getColumnByName('ColumnName').summaries = CustomNumberSummary;
     * ```
     *
     * @memberof IgxNumberSummaryOperand
     */
    public override operate(data: any[] = [], allData: any[] = [], fieldName?: string, groupRecord?: IGroupByRecord): IgxSummaryResult[] {
        const result = super.operate(data, allData, fieldName, groupRecord);
        result.push({
            key: 'min',
            label: 'Min',
            defaultFormatting: true,
            summaryResult: IgxNumberSummaryOperand.min(data)
        });
        result.push({
            key: 'max',
            label: 'Max',
            defaultFormatting: true,
            summaryResult: IgxNumberSummaryOperand.max(data)
        });
        result.push({
            key: 'sum',
            label: 'Sum',
            defaultFormatting: true,
            summaryResult: IgxNumberSummaryOperand.sum(data)
        });
        result.push({
            key: 'average',
            label: 'Avg',
            defaultFormatting: true,
            summaryResult: IgxNumberSummaryOperand.average(data)
        });
        return result;
    }
}

/* blazorCSSuppress */
// @dynamic
export class IgxDateSummaryOperand extends IgxSummaryOperand {
    /**
     * Returns the latest date value in the data records.
     * If filtering is applied, returns the latest date value in the filtered data records.
     * ```typescript
     * IgxDateSummaryOperand.latest(data);
     * ```
     *
     * @memberof IgxDateSummaryOperand
     */
    public static latest(data: any[]) {
        return data.length && data.filter(clear).length ?
            first(data.filter(clear).sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())) : undefined;
    }
    /**
     * Returns the earliest date value in the data records.
     * If filtering is applied, returns the latest date value in the filtered data records.
     * ```typescript
     * IgxDateSummaryOperand.earliest(data);
     * ```
     *
     * @memberof IgxDateSummaryOperand
     */
    public static earliest(data: any[]) {
        return data.length && data.filter(clear).length ?
            last(data.filter(clear).sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())) : undefined;
    }
    /**
     * Executes the static methods and returns `IgxSummaryResult[]`.
     * ```typescript
     * interface IgxSummaryResult {
     *   key: string;
     *   label: string;
     *   summaryResult: any;
     * }
     * ```
     * Can be overridden in the inherited classes to provide customization for the `summary`.
     * ```typescript
     * class CustomDateSummary extends IgxDateSummaryOperand {
     *   constructor() {
     *     super();
     *   }
     *   public operate(data: any[], allData: any[], fieldName: string, groupRecord: IGroupByRecord): IgxSummaryResult[] {
     *     const result = super.operate(data, allData, fieldName, groupRecord);
     *     result.push({
     *       key: "deadline",
     *       label: "Deadline Date",
     *       summaryResult: this.calculateDeadline(data);
     *     });
     *     return result;
     *   }
     * }
     * this.grid.getColumnByName('ColumnName').summaries = CustomDateSummary;
     * ```
     *
     * @memberof IgxDateSummaryOperand
     */
    public override operate(data: any[] = [], allData: any[] = [],  fieldName?: string, groupRecord?: IGroupByRecord): IgxSummaryResult[] {
        const result = super.operate(data, allData, fieldName, groupRecord);
        result.push({
            key: 'earliest',
            label: 'Earliest',
            defaultFormatting: true,
            summaryResult: IgxDateSummaryOperand.earliest(data)
        });
        result.push({
            key: 'latest',
            label: 'Latest',
            defaultFormatting: true,
            summaryResult: IgxDateSummaryOperand.latest(data)
        });
        return result;
    }
}

/* blazorCSSuppress */
// @dynamic
export class IgxTimeSummaryOperand extends IgxSummaryOperand {
    /**
     * Returns the latest time value in the data records. Compare only the time part of the date.
     * If filtering is applied, returns the latest time value in the filtered data records.
     * ```typescript
     * IgxTimeSummaryOperand.latestTime(data);
     * ```
     *
     * @memberof IgxTimeSummaryOperand
     */
    public static latestTime(data: any[]) {
        return data.length && data.filter(clear).length ?
            first(data.filter(clear).map(v => new Date(v)).sort((a, b) =>
                new Date().setHours(b.getHours(), b.getMinutes(), b.getSeconds()) -
                new Date().setHours(a.getHours(), a.getMinutes(), a.getSeconds()))) : undefined;
    }

    /**
     * Returns the earliest time value in the data records. Compare only the time part of the date.
     * If filtering is applied, returns the earliest time value in the filtered data records.
     * ```typescript
     * IgxTimeSummaryOperand.earliestTime(data);
     * ```
     *
     * @memberof IgxTimeSummaryOperand
     */
    public static earliestTime(data: any[]) {
        return data.length && data.filter(clear).length ?
            last(data.filter(clear).map(v => new Date(v)).sort((a, b) => new Date().setHours(b.getHours(), b.getMinutes(), b.getSeconds()) -
            new Date().setHours(a.getHours(), a.getMinutes(), a.getSeconds()))) : undefined;
    }
    /**
     * @memberof IgxTimeSummaryOperand
     */
    public override operate(data: any[] = [], allData: any[] = [],  fieldName?: string, groupRecord?: IGroupByRecord): IgxSummaryResult[] {
        const result = super.operate(data, allData, fieldName, groupRecord);
        result.push({
            key: 'earliest',
            label: 'Earliest',
            defaultFormatting: true,
            summaryResult: IgxTimeSummaryOperand.earliestTime(data)
        });
        result.push({
            key: 'latest',
            label: 'Latest',
            defaultFormatting: true,
            summaryResult: IgxTimeSummaryOperand.latestTime(data)
        });
        return result;
    }
}
