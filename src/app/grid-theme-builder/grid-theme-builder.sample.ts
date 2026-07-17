import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, OnInit, signal, TemplateRef, viewChild, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IGX_GRID_DIRECTIVES, IgxActionStripComponent, IgxButtonDirective, IgxButtonGroupComponent, IgxNumberSummaryOperand, IgxSummaryResult } from 'igniteui-angular';
import { IgxAccordionComponent } from 'igniteui-angular/accordion';
import { IGX_EXPANSION_PANEL_DIRECTIVES } from 'igniteui-angular/expansion-panel';
import { IgxHierarchicalGridComponent, IgxRowIslandComponent } from 'igniteui-angular/grids/hierarchical-grid';
import { IgxInputGroupComponent, IgxInputDirective } from 'igniteui-angular/input-group';
import { IGX_SELECT_DIRECTIVES } from 'igniteui-angular/select';
import { PropertyChangeService } from '../properties-panel/property-change.service';
import { SAMPLE_DATA } from '../shared/sample-data';
import { BorderRuleEditorComponent } from './border-rule-editor.component';
import { BORDER_DEFAULTS, BorderSignals, BorderTarget } from './border-rule-editor.types';
import { ColorPickerComponent } from './color-picker.component';
import { scrubKeydown, startScrub } from './scrub-utils';

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
    encapsulation: ViewEncapsulation.None,
    imports: [FormsModule, IGX_GRID_DIRECTIVES, IgxHierarchicalGridComponent, IgxRowIslandComponent, IgxActionStripComponent, IgxButtonDirective, IgxButtonGroupComponent, IgxAccordionComponent, IGX_EXPANSION_PANEL_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxInputGroupComponent, IgxInputDirective, ColorPickerComponent, BorderRuleEditorComponent]
})
export class GridThemeBuilderSampleComponent implements OnInit, AfterViewInit {
    protected readonly gridForeground = signal('');
    protected readonly gridBackground = signal('');
    protected readonly gridAccentColor = signal('');
    protected readonly gridHeaderBackground = signal('');
    protected readonly gridHeaderTextColor = signal('');
    protected readonly gridRowOddBackground = signal('');
    protected readonly gridRowOddTextColor = signal('');
    protected readonly gridRowEvenBackground = signal('');
    protected readonly gridRowEvenTextColor = signal('');
    protected readonly gridRowBorderWidth = signal('');
    protected readonly gridRowBorderStyle = signal('');
    protected readonly gridRowBorderColor = signal('');
    protected readonly gridHeaderBorderWidth = signal('');
    protected readonly gridHeaderBorderStyle = signal('');
    protected readonly gridHeaderBorderColor = signal('');
    protected readonly gridPinnedBorderWidth = signal('');
    protected readonly gridPinnedBorderStyle = signal('');
    protected readonly gridPinnedBorderColor = signal('');
    protected readonly gridSummaryPinnedBorderWidth = signal('');
    protected readonly gridSummaryPinnedBorderStyle = signal('');
    protected readonly gridSummaryBackground = signal('');
    protected readonly gridSummaryLabelColor = signal('');
    protected readonly gridSummaryResultColor = signal('');
    protected readonly gridSummaryPinnedBorderColor = signal('');
    protected readonly gridSummaryBorderColor = signal('');
    protected readonly gridSummaryBorderWidth = signal('');
    protected readonly gridSummaryBorderStyle = signal('');
    protected readonly gridToolbarBackground = signal('');
    protected readonly gridToolbarForeground = signal('');
    protected readonly gridToolbarAccentColor = signal('');
    protected readonly paginatorBackground = signal('');
    protected readonly paginatorForeground = signal('');
    protected readonly paginatorAccentColor = signal('');
    protected readonly advancedFilteringBackground = signal('');
    protected readonly advancedFilteringForeground = signal('');
    protected readonly advancedFilteringAccentColor = signal('');
    protected readonly excelStyleFilteringBackground = signal('');
    protected readonly excelStyleFilteringForeground = signal('');
    protected readonly excelStyleFilteringAccentColor = signal('');
    protected readonly gridCellActiveBorderWidth = signal('');
    protected readonly gridCellActiveBorderStyle = signal('');
    protected readonly gridCellActiveBorderColor = signal('');
    protected readonly gridCellSelectedWithinBackground = signal('');
    protected readonly gridCellSelectedWithinTextColor = signal('');
    protected readonly gridCellSelectedBackground = signal('');
    protected readonly gridCellSelectedTextColor = signal('');

    // Passed to <app-border-rule-editor>, which reads/writes these same signal
    // instances directly; built once here since the live grid bindings below and
    // exportCode/exportCssVars also need direct read access to them.
    protected readonly borderTargetSignals: Record<BorderTarget, BorderSignals> = {
        header: { color: this.gridHeaderBorderColor, width: this.gridHeaderBorderWidth, style: this.gridHeaderBorderStyle },
        row: { color: this.gridRowBorderColor, width: this.gridRowBorderWidth, style: this.gridRowBorderStyle },
        pinned: { color: this.gridPinnedBorderColor, width: this.gridPinnedBorderWidth, style: this.gridPinnedBorderStyle },
        summaryPinned: { color: this.gridSummaryPinnedBorderColor, width: this.gridSummaryPinnedBorderWidth, style: this.gridSummaryPinnedBorderStyle },
        summary: { color: this.gridSummaryBorderColor, width: this.gridSummaryBorderWidth, style: this.gridSummaryBorderStyle },
        activeCell: { color: this.gridCellActiveBorderColor, width: this.gridCellActiveBorderWidth, style: this.gridCellActiveBorderStyle },
    };

    private readonly sampleEl = viewChild.required<ElementRef>('sampleEl');
    private readonly customControlsTemplate = viewChild.required<TemplateRef<any>>('customControls');

    // Only one grid preview is mounted at a time: both a flat grid and a
    // 4-level-deep hierarchical grid are expensive to initialize, and neither
    // is needed while the other is what's actually being themed.
    protected readonly activePreview = signal<'grid' | 'hierarchical'>('grid');

    protected readonly showExport = signal(false);
    protected readonly copiedExport = signal<'css' | 'scss' | null>(null);

    protected readonly exportCode = computed(() => {
        const gridLines: string[] = [];
        const summaryLines: string[] = [];
        const toolbarLines: string[] = [];
        const paginatorLines: string[] = [];
        const advancedFilteringLines: string[] = [];
        const excelStyleFilteringLines: string[] = [];
        const add = (lines: string[], token: string, value: string) => {
            if (value) lines.push(`    ${token}: ${value},`);
        };

        add(gridLines, '$background', this.gridBackground());
        add(gridLines, '$foreground', this.gridForeground());
        add(gridLines, '$accent-color', this.gridAccentColor());
        add(gridLines, '$header-background', this.gridHeaderBackground());
        add(gridLines, '$header-text-color', this.gridHeaderTextColor());
        add(gridLines, '$row-odd-background', this.gridRowOddBackground());
        add(gridLines, '$row-odd-text-color', this.gridRowOddTextColor());
        add(gridLines, '$row-even-background', this.gridRowEvenBackground());
        add(gridLines, '$row-even-text-color', this.gridRowEvenTextColor());
        add(gridLines, '$row-border-width', this.borderExportValue('row', 'width'));
        add(gridLines, '$row-border-style', this.borderExportValue('row', 'style'));
        add(gridLines, '$row-border-color', this.borderExportValue('row', 'color'));
        add(gridLines, '$header-border-width', this.borderExportValue('header', 'width'));
        add(gridLines, '$header-border-style', this.borderExportValue('header', 'style'));
        add(gridLines, '$header-border-color', this.borderExportValue('header', 'color'));
        add(gridLines, '$pinned-border-width', this.borderExportValue('pinned', 'width'));
        add(gridLines, '$pinned-border-style', this.borderExportValue('pinned', 'style'));
        add(gridLines, '$pinned-border-color', this.borderExportValue('pinned', 'color'));
        add(gridLines, '$cell-active-border-width', this.borderExportValue('activeCell', 'width'));
        add(gridLines, '$active-state-border-style', this.borderExportValue('activeCell', 'style'));
        add(gridLines, '$cell-active-border-color', this.borderExportValue('activeCell', 'color'));
        add(gridLines, '$cell-selected-within-background', this.gridCellSelectedWithinBackground());
        add(gridLines, '$cell-selected-within-text-color', this.gridCellSelectedWithinTextColor());
        add(gridLines, '$cell-selected-background', this.gridCellSelectedBackground());
        add(gridLines, '$cell-selected-text-color', this.gridCellSelectedTextColor());

        add(summaryLines, '$background-color', this.gridSummaryBackground());
        add(summaryLines, '$label-color', this.gridSummaryLabelColor());
        add(summaryLines, '$result-color', this.gridSummaryResultColor());
        add(summaryLines, '$border-width', this.borderExportValue('summary', 'width'));
        add(summaryLines, '$border-style', this.borderExportValue('summary', 'style'));
        add(summaryLines, '$border-color', this.borderExportValue('summary', 'color'));
        add(summaryLines, '$pinned-border-width', this.borderExportValue('summaryPinned', 'width'));
        add(summaryLines, '$pinned-border-style', this.borderExportValue('summaryPinned', 'style'));
        add(summaryLines, '$pinned-border-color', this.borderExportValue('summaryPinned', 'color'));

        add(toolbarLines, '$background', this.gridToolbarBackground());
        add(toolbarLines, '$foreground', this.gridToolbarForeground());
        add(toolbarLines, '$accent-color', this.gridToolbarAccentColor());

        add(paginatorLines, '$background', this.paginatorBackground());
        add(paginatorLines, '$foreground', this.paginatorForeground());
        add(paginatorLines, '$accent-color', this.paginatorAccentColor());

        add(advancedFilteringLines, '$background', this.advancedFilteringBackground());
        add(advancedFilteringLines, '$foreground', this.advancedFilteringForeground());
        add(advancedFilteringLines, '$accent-color', this.advancedFilteringAccentColor());

        add(excelStyleFilteringLines, '$background', this.excelStyleFilteringBackground());
        add(excelStyleFilteringLines, '$foreground', this.excelStyleFilteringForeground());
        add(excelStyleFilteringLines, '$accent-color', this.excelStyleFilteringAccentColor());

        const themes: string[] = [];
        if (gridLines.length) {
            themes.push(`@include tokens(\n  grid-theme(\n${gridLines.join('\n')}\n  )\n);`);
        }
        if (summaryLines.length) {
            themes.push(`@include tokens(\n  grid-summary-theme(\n${summaryLines.join('\n')}\n  )\n);`);
        }
        if (toolbarLines.length) {
            themes.push(`@include tokens(\n  grid-toolbar-theme(\n${toolbarLines.join('\n')}\n  )\n);`);
        }
        if (paginatorLines.length) {
            themes.push(`@include tokens(\n  paginator-theme(\n${paginatorLines.join('\n')}\n  )\n);`);
        }
        if (advancedFilteringLines.length) {
            themes.push(`@include tokens(\n  query-builder-theme(\n${advancedFilteringLines.join('\n')}\n  )\n);`);
        }
        if (excelStyleFilteringLines.length) {
            themes.push(`@include tokens(\n  excel-filtering-theme(\n${excelStyleFilteringLines.join('\n')}\n  )\n);`);
        }

        return themes.length ? themes.join('\n\n') : null;
    });

    protected readonly exportCssVars = computed(() => {
        const gridVars: string[] = [];
        const toolbarVars: string[] = [];
        const paginatorVars: string[] = [];
        const advancedFilteringVars: string[] = [];
        const excelStyleFilteringVars: string[] = [];
        const add = (vars: string[], prefix: string, token: string, value: string) => {
            if (value) vars.push(`  --ig-${prefix}-${token}: ${value};`);
        };

        add(gridVars, 'grid', 'background', this.gridBackground());
        add(gridVars, 'grid', 'foreground', this.gridForeground());
        add(gridVars, 'grid', 'accent-color', this.gridAccentColor());
        add(gridVars, 'grid', 'header-background', this.gridHeaderBackground());
        add(gridVars, 'grid', 'header-text-color', this.gridHeaderTextColor());
        add(gridVars, 'grid', 'row-odd-background', this.gridRowOddBackground());
        add(gridVars, 'grid', 'row-odd-text-color', this.gridRowOddTextColor());
        add(gridVars, 'grid', 'row-even-background', this.gridRowEvenBackground());
        add(gridVars, 'grid', 'row-even-text-color', this.gridRowEvenTextColor());
        add(gridVars, 'grid', 'row-border-width', this.borderExportValue('row', 'width'));
        add(gridVars, 'grid', 'row-border-style', this.borderExportValue('row', 'style'));
        add(gridVars, 'grid', 'row-border-color', this.borderExportValue('row', 'color'));
        add(gridVars, 'grid', 'header-border-width', this.borderExportValue('header', 'width'));
        add(gridVars, 'grid', 'header-border-style', this.borderExportValue('header', 'style'));
        add(gridVars, 'grid', 'header-border-color', this.borderExportValue('header', 'color'));
        add(gridVars, 'grid', 'pinned-border-width', this.borderExportValue('pinned', 'width'));
        add(gridVars, 'grid', 'pinned-border-style', this.borderExportValue('pinned', 'style'));
        add(gridVars, 'grid', 'pinned-border-color', this.borderExportValue('pinned', 'color'));
        add(gridVars, 'grid', 'summary-background-color', this.gridSummaryBackground());
        add(gridVars, 'grid', 'summary-label-color', this.gridSummaryLabelColor());
        add(gridVars, 'grid', 'summary-result-color', this.gridSummaryResultColor());
        add(gridVars, 'grid', 'summary-pinned-border-width', this.borderExportValue('summaryPinned', 'width'));
        add(gridVars, 'grid', 'summary-pinned-border-style', this.borderExportValue('summaryPinned', 'style'));
        add(gridVars, 'grid', 'summary-pinned-border-color', this.borderExportValue('summaryPinned', 'color'));
        add(gridVars, 'grid', 'summary-border-width', this.borderExportValue('summary', 'width'));
        add(gridVars, 'grid', 'summary-border-style', this.borderExportValue('summary', 'style'));
        add(gridVars, 'grid', 'summary-border-color', this.borderExportValue('summary', 'color'));
        add(gridVars, 'grid', 'cell-active-border-width', this.borderExportValue('activeCell', 'width'));
        add(gridVars, 'grid', 'active-state-border-style', this.borderExportValue('activeCell', 'style'));
        add(gridVars, 'grid', 'cell-active-border-color', this.borderExportValue('activeCell', 'color'));
        add(gridVars, 'grid', 'cell-selected-within-background', this.gridCellSelectedWithinBackground());
        add(gridVars, 'grid', 'cell-selected-within-text-color', this.gridCellSelectedWithinTextColor());
        add(gridVars, 'grid', 'cell-selected-background', this.gridCellSelectedBackground());
        add(gridVars, 'grid', 'cell-selected-text-color', this.gridCellSelectedTextColor());

        add(toolbarVars, 'grid-toolbar', 'background', this.gridToolbarBackground());
        add(toolbarVars, 'grid-toolbar', 'foreground', this.gridToolbarForeground());
        add(toolbarVars, 'grid-toolbar', 'accent-color', this.gridToolbarAccentColor());

        add(paginatorVars, 'paginator', 'background', this.paginatorBackground());
        add(paginatorVars, 'paginator', 'foreground', this.paginatorForeground());
        add(paginatorVars, 'paginator', 'accent-color', this.paginatorAccentColor());

        add(advancedFilteringVars, 'query-builder', 'background', this.advancedFilteringBackground());
        add(advancedFilteringVars, 'query-builder', 'foreground', this.advancedFilteringForeground());
        add(advancedFilteringVars, 'query-builder', 'accent-color', this.advancedFilteringAccentColor());

        add(excelStyleFilteringVars, 'excel-filtering', 'background', this.excelStyleFilteringBackground());
        add(excelStyleFilteringVars, 'excel-filtering', 'foreground', this.excelStyleFilteringForeground());
        add(excelStyleFilteringVars, 'excel-filtering', 'accent-color', this.excelStyleFilteringAccentColor());

        const blocks: string[] = [];
        if (gridVars.length) blocks.push(`.my-grid {\n${gridVars.join('\n')}\n}`);
        if (toolbarVars.length) blocks.push(`.my-grid igx-grid-toolbar {\n${toolbarVars.join('\n')}\n}`);
        if (paginatorVars.length) blocks.push(`.my-grid igx-paginator {\n${paginatorVars.join('\n')}\n}`);
        if (advancedFilteringVars.length) blocks.push(`.my-grid igx-advanced-filtering-dialog {\n${advancedFilteringVars.join('\n')}\n}`);
        if (excelStyleFilteringVars.length) {
            blocks.push(`.my-grid igx-grid-excel-style-filtering,
                .my-grid .igx-excel-filter__secondary) {\n${excelStyleFilteringVars.join('\n')}\n}`);
        }

        return blocks.length ? blocks.join('\n\n') : null;
    });

    private readonly propertyChangeService = inject(PropertyChangeService);

    public data: Array<any>;
    public readonly hierarchicalData = this.generateHierarchicalData(10, 3);
    public readonly employeesSummary = EmployeesSummary;

    // Exposed for the Active Cell panel's own border-width scrub field; the
    // border-rule editor uses the same shared utility independently.
    protected readonly startScrub = startScrub;
    protected readonly scrubKeydown = scrubKeydown;

    private borderExportValue(target: BorderTarget, property: keyof BorderSignals): string {
        const value = this.borderTargetSignals[target][property]();
        return value === BORDER_DEFAULTS[target][property] ? '' : value;
    }

    private generateHierarchicalData(count: number, level: number, parentID: string = null): Array<any> {
        const rows = [];
        const currentLevel = level;
        let children;

        for (let i = 0; i < count; i++) {
            const rowID = parentID ? parentID + i : i.toString();
            if (level > 0) {
                children = this.generateHierarchicalData(((i % 2) + 1) * Math.round(count / 3), currentLevel - 1, rowID);
            }

            rows.push({
                ID: rowID,
                ChildLevels: currentLevel,
                ProductName: 'Product: A' + i,
                childData: children
            });
        }

        return rows;
    }

    protected copyExport(code: string | null, format: 'css' | 'scss'): void {
        if (!code) return;

        navigator.clipboard.writeText(code).then(() => {
            this.copiedExport.set(format);
            setTimeout(() => this.copiedExport.set(null), 2000);
        });
    }

    public ngOnInit(): void {
        this.data = SAMPLE_DATA;
    }

    public ngAfterViewInit(): void {
        const styles = getComputedStyle(this.sampleEl().nativeElement);
        this.gridBackground.set(styles.getPropertyValue('--ig-grid-background').trim());
        this.gridAccentColor.set(styles.getPropertyValue('--ig-grid-accent-color').trim());
        this.propertyChangeService.setCustomControls(this.customControlsTemplate());
        this.propertyChangeService.setPanelTitle('Grid Theming');
    }

}
