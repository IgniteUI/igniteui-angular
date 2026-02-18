import { IgxNumberSummaryOperand, IgxSummaryResult } from 'igniteui-angular';

export class CustomGridSummary extends IgxNumberSummaryOperand {
    public override operate(data: number[] = []): IgxSummaryResult[] {
        const result = super.operate(data);
        result.push({
            key: 'test',
            label: 'Custom summary',
            summaryResult: data.filter((rec) => rec > 10 && rec < 30).length
        });
        return result;
    }
}

export class HierarchicalGridSummary extends IgxNumberSummaryOperand {
    public override operate(data: number[] = []): IgxSummaryResult[] {
        return [
            { key: 'min', label: 'Min', summaryResult: IgxNumberSummaryOperand.min(data) },
            { key: 'max', label: 'Max', summaryResult: IgxNumberSummaryOperand.max(data) },
            { key: 'avg', label: 'Avg', summaryResult: IgxNumberSummaryOperand.average(data) }
        ];
    }
}

export class HGridChildSummary extends IgxNumberSummaryOperand {
    public override operate(data?: any[]): IgxSummaryResult[] {
        const result = [];
        result.push(
        {
            key: 'count',
            label: 'Count',
            summaryResult: IgxNumberSummaryOperand.count(data)
        });
        return result;
    }
}