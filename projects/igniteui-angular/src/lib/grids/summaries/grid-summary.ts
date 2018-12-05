export interface ISummaryExpression {
    fieldName: string;
    customSummary?: any;
}
export interface IgxSummaryResult {
    key: string;
    label: string;
    summaryResult: any;
}

export interface ISummaryRecord {
    summaries: Map<string, IgxSummaryResult[]>;
    cellIndentation?: number;
}

export class IgxSummaryOperand {
    /**
     * Counts all the records in the data source.
     * If filtering is applied, counts only the filtered records.
     * ```typescript
     * IgxSummaryOperand.count(dataSource);
     * ```
     * @memberof IgxSummaryOperand
     */
    public static count(data: any[]): any {
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
     *   public operate(data?: any[]): IgxSummaryResult[] {
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
     * If filtering is applied, returns the minimum value in the filtered data records.
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
     * If filtering is applied, returns the maximum value in the filtered data records.
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
     * If filtering is applied, returns the sum of the numeric values in the data records.
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
     * If filtering is applied, returns the average numeric value in the filtered data records.
     * ```typescript
     * IgxSummaryOperand.average(data);
     * ```
     * @memberof IgxNumberSummaryOperand
     */
    public static average(data: any[]): any {
        return data.length ? this.sum(data) / this.count(data) : [];
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
     *   public operate(data?: any[]): IgxSummaryResult[] {
     *     const result = [];
     *     result.push({
     *       key: "avg",
     *       label: "Avg",
     *       summaryResult: IgxNumberSummaryOperand.average(data)
     *     });
     *     result.push({
     *       key: "max",
     *       label: "Max",
     *       summaryResult: IgxNumberSummaryOperand.max(data)
     *     });
     *     return result;
     *   }
     * }
     * this.grid.getColumnByName('ColumnName').summaries = CustomNumberSummary;
     * ```
     * @memberof IgxNumberSummaryOperand
     */
    public operate(data: any[] = []): IgxSummaryResult[] {
        const result = super.operate(data);
        result.push({
            key: 'min',
            label: 'Min',
            summaryResult: IgxNumberSummaryOperand.min(data)
        });
        result.push({
            key: 'max',
            label: 'Max',
            summaryResult: IgxNumberSummaryOperand.max(data)
        });
        result.push({
            key: 'sum',
            label: 'Sum',
            summaryResult: IgxNumberSummaryOperand.sum(data)
        });
        result.push({
            key: 'average',
            label: 'Avg',
            summaryResult: IgxNumberSummaryOperand.average(data)
        });
        return result;
    }
}

// @dynamic
export class IgxDateSummaryOperand extends IgxSummaryOperand {
    /**
     * Returns the latest date value in the data records.
     * If filtering is applied, returns the latest date value in the filtered data records.
     * ```typescript
     * IgxDateSummaryOperand.latest(data);
     * ```
     * @memberof IgxDateSummaryOperand
     */
    public static latest(data: any[]) {
        return data.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[0];
    }
    /**
     * Returns the earliest date value in the data records.
     * If filtering is applied, returns the latest date value in the filtered data records.
     * ```typescript
     * IgxDateSummaryOperand.earliest(data);
     * ```
     * @memberof IgxDateSummaryOperand
     */
    public static earliest(data: any[]) {
        return data.sort((a, b) => new Date(b).valueOf() - new Date(a).valueOf())[data.length - 1];
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
     *   public operate(data?: any[]): IgxSummaryResult[] {
     *     const result = [];
     *     result.push({
     *       key: "latest",
     *       label: "Latest Date",
     *       summaryResult: IgxDateSummaryOperand.latest(data)
     *     });
     *     return result;
     *   }
     * }
     * this.grid.getColumnByName('ColumnName').summaries = CustomDateSummary;
     * ```
     * @memberof IgxDateSummaryOperand
     */
    public operate(data: any[] = []): IgxSummaryResult[] {
        const result = super.operate(data);
        result.push({
            key: 'earliest',
            label: 'Earliest',
            summaryResult: IgxDateSummaryOperand.earliest(data)
        });
        result.push({
            key: 'latest',
            label: 'Latest',
            summaryResult: IgxDateSummaryOperand.latest(data)
        });
        return result;
    }
}
