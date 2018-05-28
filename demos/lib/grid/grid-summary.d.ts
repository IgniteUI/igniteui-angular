export interface ISummaryExpression {
    fieldName: string;
    customSummary?: any;
}
export interface IgxSummaryResult {
    key: string;
    label: string;
    summaryResult: any;
}
export declare class IgxSummaryOperand {
    operate(data?: any[]): IgxSummaryResult[];
    count(data?: any[]): any;
}
export declare class IgxNumberSummaryOperand extends IgxSummaryOperand {
    operate(data?: any[]): IgxSummaryResult[];
    min(data?: any[]): any;
    max(data?: any[]): any;
    sum(data?: any[]): any;
    average(data?: any[]): any;
}
export declare class IgxDateSummaryOperand extends IgxSummaryOperand {
    operate(data?: any[]): IgxSummaryResult[];
    latest(data?: any[]): any;
    earliest(data?: any[]): any;
}
