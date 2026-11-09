import { ChangeDetectionStrategy, Component, ViewChild } from '@angular/core';
import { IColumnPipeArgs, IgxDateSummaryOperand, IgxNumberSummaryOperand, IgxSummaryOperand, IgxSummaryResult } from 'igniteui-angular/core';
import { IgxColumnComponent } from 'igniteui-angular/grids/core';
import { IgxGridComponent } from '../grids/grid/src/grid.component';
import { SampleTestData } from './sample-test-data.spec';

// Summary operands and host component shared by the grid summary and PDF exporter specs. They live
// here because importing a spec file that contains tests registers all of its suites in the importer.

export class DealsSummary extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public override operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'average' || obj.key === 'sum' || obj.key === 'count') {
                return obj;
            }
        });
        return result;
    }
}

export class DealsSummaryMinMax extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public override operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'min' || obj.key === 'max') {
                return obj;
            }
        });
        return result;
    }
}

export class EarliestSummary extends IgxDateSummaryOperand {
    constructor() {
        super();
    }

    public override operate(summaries?: any[]): IgxSummaryResult[] {
        const result = super.operate(summaries).filter((obj) => {
            if (obj.key === 'earliest') {
                return obj;
            }
        });
        result.push({
            key: 'test',
            label: 'Items InStock',
            summaryResult: 1337
        });
        return result;
    }
}

export class InStockSummary extends IgxNumberSummaryOperand {
    constructor() {
        super();
    }

    public override operate(summaries: any[], allData = [], field?): IgxSummaryResult[] {
        const result = super.operate(summaries);
        if (field && field === 'UnitsInStock') {
            result.push({
                key: 'test',
                label: 'Items InStock',
                summaryResult: allData.filter((rec) => rec.InStock).length
            });
        }
        return result;
    }
}

export class AllDataAvgSummary extends IgxSummaryOperand {
    constructor() {
        super();
    }

    public override operate(data: any[], _allData = [], fieldName = ''): IgxSummaryResult[] {
        const result = super.operate(data);
        if (fieldName === 'UnitsInStock') {
            result.push({
                key: 'long',
                label: 'Test 1',
                summaryResult: 50
            });
            result.push({
                key: 'long',
                label: 'Test 2',
                summaryResult: 150
            });
        }
        if (fieldName === 'OrderDate') {
            result.push({
                key: 'long',
                label: 'Test 3',
                summaryResult: 850
            });
        }
        return result;
    }
}

@Component({
    template: `
        <igx-grid #grid1 [data]="data" [primaryKey]="'ProductID'" [locale]="locale" [allowFiltering]="true">
            <igx-column field="ProductID" header="Product ID">
            </igx-column>
            <igx-column field="ProductName" [hasSummary]="true">
            </igx-column>
            <igx-column field="InStock" [dataType]="'boolean'" [hasSummary]="true">
            </igx-column>
            <igx-column field="UnitsInStock" [dataType]="'number'" [hasSummary]="true" [pipeArgs]="formatOptions"
            [summaries]="dealsSummary">
            </igx-column>
            <igx-column field="OrderDate" width="200px" [dataType]="'date'" [sortable]="true" [hasSummary]="true"
            [summaries]="earliest">
        </igx-column>
        </igx-grid>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxGridComponent, IgxColumnComponent]
})

export class CustomSummariesComponent {
    @ViewChild('grid1', { read: IgxGridComponent, static: true })
    public grid: IgxGridComponent;
    public data = SampleTestData.foodProductData();
    public dealsSummary = DealsSummary;
    public dealsSummaryMinMax = DealsSummaryMinMax;
    public earliest = EarliestSummary;
    public inStockSummary = InStockSummary;
    public allDataAvgSummary = AllDataAvgSummary;
    public formatOptions: IColumnPipeArgs = {
        digitsInfo: '1.0-2'
    };
    public locale = 'en-US';
}
