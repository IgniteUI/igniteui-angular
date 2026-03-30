import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, OnInit, signal, viewChild } from '@angular/core';
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
export class GridThemeBuilderSampleComponent implements OnInit, AfterViewInit {
    protected readonly gridForeground = signal('');
    protected readonly gridBackground = signal('');
    protected readonly gridAccentColor = signal('');

    protected readonly gridRef = viewChild.required<IgxGridComponent>('grid');
    private readonly sampleEl = viewChild.required<ElementRef>('sampleEl');

    public data: Array<any>;
    public readonly employeesSummary = EmployeesSummary;

    public ngOnInit(): void {
        this.data = SAMPLE_DATA;
    }

    public ngAfterViewInit(): void {
        const styles = getComputedStyle(this.sampleEl().nativeElement);
        this.gridBackground.set(styles.getPropertyValue('--ig-grid-background').trim());
        this.gridAccentColor.set(styles.getPropertyValue('--ig-grid-accent-color').trim());
    }

    protected resetForeground(): void {
        this.gridForeground.set('');
    }
}
