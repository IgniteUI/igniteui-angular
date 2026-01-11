import { IgxDateSummaryOperand, IgxSummaryResult } from 'igniteui-angular';

export class EarliestSummary extends IgxDateSummaryOperand {
  public override operate(
    summaries?: IgxSummaryResult[]
  ): IgxSummaryResult[] {
    return super.operate(summaries).filter(obj => {
      if (obj.key === 'earliest') {
        const date = obj.summaryResult
          ? new Date(obj.summaryResult)
          : undefined;

        obj.summaryResult = date
          ? new Intl.DateTimeFormat('en-US').format(date)
          : undefined;

        return obj;
      }
      return false;
    });
  }
}
