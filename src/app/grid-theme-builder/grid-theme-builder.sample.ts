import { ChangeDetectionStrategy, Component, OnInit, signal, viewChild } from '@angular/core';

import { SAMPLE_DATA } from '../shared/sample-data';

import { IGX_GRID_DIRECTIVES, IgxActionStripComponent, IgxGridComponent, IgxNumberSummaryOperand, IgxSummaryResult } from 'igniteui-angular';

class EmployeesSummary extends IgxNumberSummaryOperand {
    public override operate(data?: any[]): IgxSummaryResult[] {
        const result = super.operate(data);
        return result.filter(r => r.key === 'count' || r.key === 'sum');
    }
}

@Component({
    selector: 'app-grid-theme-builder-sample',
    styleUrls: ['grid-theme-builder.sample.scss'],
    templateUrl: 'grid-theme-builder.sample.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [IGX_GRID_DIRECTIVES, IgxActionStripComponent]
})
export class GridThemeBuilderSampleComponent implements OnInit {
    protected readonly gridForeground = signal('#f1f4ed');
    protected readonly gridBackground = signal('#092444');
    protected readonly gridAccentColor = signal('#d66620');

    protected readonly gridRef = viewChild.required<IgxGridComponent>('grid');

    public data: Array<any>;
    public readonly employeesSummary = EmployeesSummary;

    public ngOnInit(): void {
        this.data = SAMPLE_DATA;
    }
}
