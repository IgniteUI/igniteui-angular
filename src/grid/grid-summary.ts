import { DataUtil } from "../data-operations/data-util";
import { ISortingExpression, SortingDirection } from "../data-operations/sorting-expression.interface";
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

    public operate(data?: any[]): IgxSummaryResult[] {
        return [{
            key: "count",
            label: "Count",
            summaryResult: this.count(data)
        }];
    }
    public count(data?: any[]): any {
        return data.length;
    }
}
export class IgxNumberSummaryOperand extends IgxSummaryOperand {

    public operate(data?: any[]): IgxSummaryResult[] {
        const result = super.operate(data);
        result.push({
            key: "min",
            label: "Min",
            summaryResult: this.min(data)});
        result.push({
            key: "max",
            label: "Max",
            summaryResult: this.max(data)});
        result.push({
            key: "sum",
            label: "Sum",
            summaryResult: this.sum(data)});
        result.push({
            key: "average",
            label: "Avg",
            summaryResult: this.average(data)});
        return result;
    }

    public min(data?: any[]): any {
        if (data.length > 0) {
            return data.reduce((a, b) => Math.min(a, b));
        } else {
            return;
        }
    }
    public max(data?: any[]): any {
        if (data.length > 0) {
            return data.reduce((a, b) => Math.max(a, b));
        } else {
            return;
        }
    }
    public sum(data?: any[]): any {
        if (data.length > 0) {
            return data.reduce((a, b) => +a + +b);
        } else {
            return;
        }
    }
    public average(data?: any[]): any {
        if (data.length > 0) {
            return this.sum(data) / this.count(data);
        } else {
            return;
        }
    }
}
export class IgxDateSummaryOperand extends IgxSummaryOperand {

    public operate(data?: any[]): IgxSummaryResult[] {
        const result = super.operate(data);
        result.push({
            key: "earliest",
            label: "Earliest",
            summaryResult: this.earliest(data)});
        result.push({
            key: "latest",
            label: "Latest",
            summaryResult: this.latest(data)});
        return result;
    }
    public latest(data?: any[]) {
        if (data.length > 0) {
            return data.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[0];
        } else {
            return;
        }
    }
    public earliest(data?: any[]) {
        if (data.length > 0) {
            return data.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[data.length - 1];
        } else {
            return;
        }
    }
}
