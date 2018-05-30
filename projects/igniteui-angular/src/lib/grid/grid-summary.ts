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
    public static count(data: any[]): any {
        return data.length;
    }

    public operate(data: any[]): IgxSummaryResult[] {
        return [{
            key: 'count',
            label: 'Count',
            summaryResult: IgxSummaryOperand.count(data)
        }];
    }
}

// @dynamic
export class IgxNumberSummaryOperand extends IgxSummaryOperand {

    public static min(data: any[]): any {
        return data.length ? data.reduce((a, b) => Math.min(a, b)) : [];
    }
    public static max(data: any[]): any {
        return data.length ? data.reduce((a, b) => Math.max(a, b)) : [];
    }
    public static sum(data: any[]): any {
        return data.length ? data.reduce((a, b) => +a + +b) : [];
    }
    public static average(data: any[]): any {
        return data.length ? this.sum(data) / this.count(data) : [];
    }

    public operate(data: any[]): IgxSummaryResult[] {
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
    public static latest(data: any[]) {
        return data.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[0];
    }
    public static earliest(data: any[]) {
        return data.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[data.length - 1];
    }

    public operate(data: any[]): IgxSummaryResult[] {
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
