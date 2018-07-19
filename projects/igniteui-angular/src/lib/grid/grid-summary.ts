import { DataUtil } from '../data-operations/data-util';
import { ISortingExpression, SortingDirection } from '../data-operations/sorting-expression.interface';
export interface ISummaryExpression {
    fieldName: string;
    customSummary?: any;
}
export interface IgxSummaryResult {
    key: string;
    label: string;
    summaryResult: any;
}

export class IgxSummaryOperand {
/**
 * Counts the records in the data source.
 * ```typescript
 * IgxSummaryOperand.count(dataSource);
 * ```
 * @memberof IgxSummaryOperand
 */
public static count(data: any[]): any {
        return data.length;
    }
/**
 * Executes the the static `count` method and returns `IgxSummaryResult[]`.
 * Can be overridden in children classes to provide customization for the `summary`.
 * ```typescript
 *     class MySummary extends IgxSummaryOperand {
 *
 *   constructor() {
 *     super();
 *   }
 *
 *   public operate(data?: any[]): IgxSummaryResult[] {
 *     const result = super.operate(data);
 *     result.push({
 *       key: "test",
 *       label: "Test",
 *       summaryResult: data.filter((rec) => rec > 10 && rec < 30).length
 *     });
 *
 *     return result;
 *   }
 * }
 * ```
 * @memberof IgxSummaryOperand
 */
public operate(data: any[] = []): IgxSummaryResult[] {
        return [{
            key: 'count',
            label: 'Count',
            summaryResult: IgxSummaryOperand.count(data)
        }];
    }
}

// @dynamic
export class IgxNumberSummaryOperand extends IgxSummaryOperand {
/**
 * Returns the minimum numeric value in the provided data records.
 * ```typescript
 * IgxNumberSummaryOperand.min(data);
 * ```
 * @memberof IgxNumberSummaryOperand
 */
public static min(data: any[]): any {
        return data.length ? data.reduce((a, b) => Math.min(a, b)) : [];
    }
/**
 * Returns the maximum numeric value in the provided data records.
 * ```typescript
 * IgxNumberSummaryOperand.max(data);
 * ```
 * @memberof IgxNumberSummaryOperand
 */
public static max(data: any[]): any {
        return data.length ? data.reduce((a, b) => Math.max(a, b)) : [];
    }
/**
 * Returns the sum of the numeric values in the provided data records.
 * ```typescript
 * IgxNumberSummaryOperand.sum(data);
 * ```
 * @memberof IgxNumberSummaryOperand
 */
public static sum(data: any[]): any {
        return data.length ? data.reduce((a, b) => +a + +b) : [];
    }
/**
 * Returns the average numeric value in the data provided data records.
 * @memberof IgxNumberSummaryOperand
 */
public static average(data: any[]): any {
        return data.length ? this.sum(data) / this.count(data) : [];
    }
/**
 * Returns the results of the static operations.
 * ```typescript
 * let mySummary = new IgxNumberSummary;
 * let summmaryResults = mySummary.operate(data);
 * ```
 * @memberof IgxNumberSummaryOperand
 */
public operate(data: any[] = []): IgxSummaryResult[] {
        const result = super.operate(data);
        result.push({
            key: 'min',
            label: 'Min',
            summaryResult: IgxNumberSummaryOperand.min(data)});
        result.push({
            key: 'max',
            label: 'Max',
            summaryResult: IgxNumberSummaryOperand.max(data)});
        result.push({
            key: 'sum',
            label: 'Sum',
            summaryResult: IgxNumberSummaryOperand.sum(data)});
        result.push({
            key: 'average',
            label: 'Avg',
            summaryResult: IgxNumberSummaryOperand.average(data)});
        return result;
    }
}

// @dynamic
export class IgxDateSummaryOperand extends IgxSummaryOperand {
/**
 * Returns the latest date value of the data records.
 * ```typescript
 * IgxDateSummaryOperand.latest(data);
 * ```
 * @memberof IgxDateSummaryOperand
 */
public static latest(data: any[]) {
        return data.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[0];
    }
/**
 * Returns the earliest date value of the data records.
 * ```typescript
 * IgxDateSummaryOperand.earliest(data);
 * ```
 * @memberof IgxDateSummaryOperand
 */
public static earliest(data: any[]) {
        return data.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[data.length - 1];
    }
/**
 * Returns the results of the static operations;
 * ```typescript
 * let mySummary = new IgxDateSummaryOperand;
 * let summmaryResults = mySummary.operate(data);
 * ```
 * @memberof IgxDateSummaryOperand
 */
public operate(data: any[] = []): IgxSummaryResult[] {
        const result = super.operate(data);
        result.push({
            key: 'earliest',
            label: 'Earliest',
            summaryResult: IgxDateSummaryOperand.earliest(data)});
        result.push({
            key: 'latest',
            label: 'Latest',
            summaryResult: IgxDateSummaryOperand.latest(data)});
        return result;
    }
}
