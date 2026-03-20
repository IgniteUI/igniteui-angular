import { IGroupByRecord, IgxSummaryResult } from 'igniteui-angular/core';

const clear = (el) => el === 0 || Boolean(el);
const first = (arr) => arr[0];
const last = (arr) => arr[arr.length - 1];

/* blazorCSSuppress */
export class IgxSummaryOperand {
    /**
     * Counts all the records in the data source.
     * If filtering is applied, counts only the filtered records.
     *
     * @memberof IgxSummaryOperand
     */
    public static count(data: any[]): number {
        return data.length;
    }
    /**
     * Executes the static `count` method and returns `IgxSummaryResult[]`.
     * Can be overridden in the inherited classes to provide customization for the `summary`.
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
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static min(data: any[]): number {
        return data.length && data.filter(clear).length ? data.filter(clear).reduce((a, b) => Math.min(a, b)) : 0;
    }
    /**
     * Returns the maximum numeric value in the provided data records.
     * If filtering is applied, returns the maximum value in the filtered data records.
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static max(data: any[]): number {
        return data.length && data.filter(clear).length ? data.filter(clear).reduce((a, b) => Math.max(a, b)) : 0;
    }
    /**
     * Returns the sum of the numeric values in the provided data records.
     * If filtering is applied, returns the sum of the numeric values in the data records.
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static sum(data: any[]): number {
        return data.length && data.filter(clear).length ? data.filter(clear).reduce((a, b) => +a + +b) : 0;
    }
    /**
     * Returns the average numeric value in the data provided data records.
     * If filtering is applied, returns the average numeric value in the filtered data records.
     *
     * @memberof IgxNumberSummaryOperand
     */
    public static average(data: any[]): number {
        return data.length && data.filter(clear).length ? this.sum(data) / this.count(data) : 0;
    }
    /**
     * Executes the static methods and returns `IgxSummaryResult[]`.
     * Can be overridden in the inherited classes to provide customization for the `summary`.
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
     *
     * @memberof IgxDateSummaryOperand
     */
    public static earliest(data: any[]) {
        return data.length && data.filter(clear).length ?
            last(data.filter(clear).sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())) : undefined;
    }
    /**
     * Executes the static methods and returns `IgxSummaryResult[]`.
     * Can be overridden in the inherited classes to provide customization for the `summary`.
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
