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
    public static count(data?: any[]): any {
        return data.length;
    }

    public operate(data?: any[]): IgxSummaryResult[] {
        if (!data) {
            return;
        }

        return [{
            key: 'count',
            label: 'Count',
            summaryResult: IgxSummaryOperand.count(data)
        }];
    }
}
export class IgxNumberSummaryOperand extends IgxSummaryOperand {

    public static min(data?: any[]): any {
        if (data && data.length > 0) {
            return data.reduce((a, b) => Math.min(a, b));
        } else {
            return;
        }
    }
    public static max(data?: any[]): any {
        if (data && data.length > 0) {
            return data.reduce((a, b) => Math.max(a, b));
        } else {
            return;
        }
    }
    public static sum(data?: any[]): any {
        if (data && data.length > 0) {
            return data.reduce((a, b) => +a + +b);
        } else {
            return;
        }
    }
    public static average(data?: any[]): any {
        if (data && data.length > 0) {
            return this.sum(data) / this.count(data);
        } else {
            return;
        }
    }

    public operate(data?: any[]): IgxSummaryResult[] {
        if (!data) {
            return;
        }

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
export class IgxDateSummaryOperand extends IgxSummaryOperand {
    public static latest(data?: any[]) {
        if (data && data.length > 0) {
            return data.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[0];
        } else {
            return;
        }
    }
    public static earliest(data?: any[]) {
        if (data && data.length > 0) {
            return data.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[data.length - 1];
        } else {
            return;
        }
    }

    public operate(data?: any[]): IgxSummaryResult[] {
        if (!data) {
            return;
        }

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
