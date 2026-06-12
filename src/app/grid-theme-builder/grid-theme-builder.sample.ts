import { NgTemplateOutlet } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, signal, TemplateRef, viewChild, ViewEncapsulation, WritableSignal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SAMPLE_DATA } from '../shared/sample-data';
import { IGX_GRID_DIRECTIVES, IgxActionStripComponent, IgxButtonDirective, IgxGridComponent, IgxNumberSummaryOperand, IgxSummaryResult } from 'igniteui-angular';
import { IgxAccordionComponent } from 'igniteui-angular/accordion';
import { IgxComboComponent } from 'igniteui-angular/combo';
import { IGX_EXPANSION_PANEL_DIRECTIVES } from 'igniteui-angular/expansion-panel';
import { IgxInputGroupComponent, IgxInputDirective, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IGX_SELECT_DIRECTIVES } from 'igniteui-angular/select';
import { PropertyChangeService } from '../properties-panel/property-change.service';

type BorderTarget = 'header' | 'row' | 'pinned' | 'summaryPinned' | 'summary' | 'activeCell';

interface BorderSignals {
    color: WritableSignal<string>;
    width: WritableSignal<string>;
    style: WritableSignal<string>;
}

interface BorderOption {
    value: BorderTarget;
    label: string;
}

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
    imports: [FormsModule, NgTemplateOutlet, IGX_GRID_DIRECTIVES, IgxActionStripComponent, IgxButtonDirective, IgxAccordionComponent, IgxComboComponent, IGX_EXPANSION_PANEL_DIRECTIVES, IGX_SELECT_DIRECTIVES, IgxInputGroupComponent, IgxInputDirective, IgxPrefixDirective, IgxSuffixDirective]
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
    protected readonly borderOptions: BorderOption[] = [
        { value: 'header', label: 'Header' },
        { value: 'row', label: 'Rows' },
        { value: 'pinned', label: 'Pinned columns' },
        { value: 'summaryPinned', label: 'Summary Pinned Border' },
        { value: 'summary', label: 'Summary Borders' },
        { value: 'activeCell', label: 'Active cell' },
    ];
    protected readonly borderRules = signal<BorderTarget[][]>([]);
    protected readonly borderEditorOpen = signal(true);
    protected readonly activeBorderRuleIndex = signal<number | null>(null);
    protected readonly activeBorderTargets = signal<BorderTarget[]>([]);
    protected readonly draftBorderColor = signal('');
    protected readonly draftBorderWidth = signal('');
    protected readonly draftBorderStyle = signal('');
    protected readonly availableBorderOptions = computed(() => {
        const activeIndex = this.activeBorderRuleIndex();
        const unavailableTargets = this.borderRules().flatMap((rule, index) => index === activeIndex ? [] : rule);
        return this.borderOptions.filter(option => !unavailableTargets.includes(option.value));
    });
    protected readonly isEditingBorderRule = computed(() => this.activeBorderRuleIndex() !== null);
    protected readonly gridCellActiveBorderWidth = signal('');
    protected readonly gridCellActiveBorderStyle = signal('');
    protected readonly gridCellActiveBorderColor = signal('');
    protected readonly gridCellSelectedWithinBackground = signal('');
    protected readonly gridCellSelectedWithinTextColor = signal('');
    protected readonly gridCellSelectedBackground = signal('');
    protected readonly gridCellSelectedTextColor = signal('');

    protected readonly gridRef = viewChild.required<IgxGridComponent>('grid');
    private readonly sampleEl = viewChild.required<ElementRef>('sampleEl');
    private readonly customControlsTemplate = viewChild.required<TemplateRef<any>>('customControls');

    protected readonly showExport = signal(false);
    protected readonly copiedExport = signal<'css' | 'scss' | null>(null);
    private borderEditorSnapshot = new Map<BorderTarget, { color: string; width: string; style: string }>();

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

    constructor() {
        effect(() => {
            this.exportCode();
            this.exportCssVars();
            this.copiedExport.set(null);
        }, { allowSignalWrites: true });
    }

    public data: Array<any>;
    public readonly employeesSummary = EmployeesSummary;

    private readonly borderDefaults: Record<BorderTarget, { color: string, width: string, style: string }> = {
        header:        { color: '', width: '1px', style: 'solid' },
        row:           { color: '', width: '1px', style: 'solid' },
        pinned:        { color: '', width: '2px', style: 'solid' },
        summaryPinned: { color: '', width: '1px', style: 'solid' },
        summary:       { color: '', width: '1px', style: 'solid' },
        activeCell:    { color: '', width: '1px', style: 'solid' },
    };

    private borderExportValue(target: BorderTarget, property: keyof BorderSignals): string {
        const value = this.getBorderSignals(target)[property]();
        return value === this.borderDefaults[target][property] ? '' : value;
    }

    protected addBorderRule(): void {
        this.borderEditorSnapshot.clear();
        this.activeBorderRuleIndex.set(null);
        this.activeBorderTargets.set([]);
        this.draftBorderColor.set('');
        this.draftBorderWidth.set('');
        this.draftBorderStyle.set('');
        this.borderEditorOpen.set(true);
    }

    protected setActiveBorderTargets(targets: BorderTarget[]): void {
        const previousTargets = this.activeBorderTargets();
        const addedTargets = targets.filter(target => !previousTargets.includes(target));
        const removedTargets = previousTargets.filter(target => !targets.includes(target));

        for (const target of addedTargets) {
            this.captureBorderTarget(target);
        }
        for (const target of removedTargets) {
            this.restoreBorderTarget(target);
        }

        if (!previousTargets.length && targets.length) {
            const signals = this.getBorderSignals(targets[0]);
            this.draftBorderColor.set(signals.color());
            this.draftBorderWidth.set(signals.width() || this.borderDefaults[targets[0]].width);
            this.draftBorderStyle.set(signals.style() || this.borderDefaults[targets[0]].style);
        }

        this.activeBorderTargets.set(targets);
        this.applyBorderDraft(targets);
    }

    protected completeBorderRule(): void {
        const targets = this.activeBorderTargets();
        if (!targets.length) return;

        const activeIndex = this.activeBorderRuleIndex();
        if (activeIndex === null) {
            this.borderRules.update(rules => [...rules, targets]);
        } else {
            const previousTargets = this.borderRules()[activeIndex];
            for (const target of previousTargets.filter(previousTarget => !targets.includes(previousTarget))) {
                this.resetBorderTarget(target);
            }
            this.borderRules.update(rules => rules.map((rule, index) => index === activeIndex ? targets : rule));
        }

        this.closeBorderEditor();
    }

    protected cancelBorderRule(): void {
        for (const [target, snapshot] of this.borderEditorSnapshot) {
            const signals = this.getBorderSignals(target);
            signals.color.set(snapshot.color);
            signals.width.set(snapshot.width);
            signals.style.set(snapshot.style);
        }
        this.closeBorderEditor();
    }

    protected editBorderRule(index: number): void {
        const targets = this.borderRules()[index];
        this.borderEditorSnapshot.clear();
        for (const target of targets) {
            this.captureBorderTarget(target);
        }

        const signals = this.getBorderSignals(targets[0]);
        this.activeBorderRuleIndex.set(index);
        this.activeBorderTargets.set([...targets]);
        this.draftBorderColor.set(signals.color());
        this.draftBorderWidth.set(signals.width() || this.borderDefaults[targets[0]].width);
        this.draftBorderStyle.set(signals.style() || this.borderDefaults[targets[0]].style);
        this.borderEditorOpen.set(true);
    }

    protected removeBorderRule(index: number): void {
        for (const target of this.borderRules()[index]) {
            this.resetBorderTarget(target);
        }
        this.borderRules.update(rules => rules.filter((_, ruleIndex) => ruleIndex !== index));
    }

    protected borderRuleLabel(targets: BorderTarget[]): string {
        return targets.map(target =>
            this.borderOptions.find(option => option.value === target)?.label ?? target
        ).join(', ');
    }

    protected borderRuleSummary(targets: BorderTarget[]): string {
        const target = targets[0];
        const signals = this.getBorderSignals(target);
        const defaults = this.borderDefaults[target];
        return `${signals.width() || defaults.width} ${signals.style() || defaults.style} ${signals.color() || 'auto'}`;
    }

    protected borderRuleColor(targets: BorderTarget[]): string {
        return this.getBorderSignals(targets[0]).color();
    }

    protected activeBorderDefaultWidth(): string {
        const target = this.activeBorderTargets()[0];
        return target ? this.borderDefaults[target].width : '1px';
    }

    protected activeBorderDefaultStyle(): string {
        const target = this.activeBorderTargets()[0];
        return target ? this.borderDefaults[target].style : 'Solid';
    }

    protected setActiveBorderColor(value: string): void {
        this.draftBorderColor.set(value);
        this.applyBorderDraft(this.activeBorderTargets());
    }

    protected applyActiveBorderColor(event: Event): void {
        const input = event.target as HTMLInputElement;
        let value = input.value.trim();
        if (!value.startsWith('#')) value = '#' + value;
        if (/^#[0-9a-fA-F]{3}$/.test(value)) {
            value = '#' + value[1] + value[1] + value[2] + value[2] + value[3] + value[3];
        }
        if (/^#[0-9a-fA-F]{6}$/i.test(value)) {
            this.setActiveBorderColor(value.toUpperCase());
        }
        input.value = this.draftBorderColor();
    }

    protected resetActiveBorderColor(): void {
        this.setActiveBorderColor('');
    }

    protected setActiveBorderWidth(value: string): void {
        this.draftBorderWidth.set(value.trim());
        this.applyBorderDraft(this.activeBorderTargets());
    }

    protected startActiveBorderWidthScrub(event: PointerEvent): void {
        this.startScrub(this.draftBorderWidth, this.activeBorderDefaultWidth(), event, () => {
            this.applyBorderDraft(this.activeBorderTargets());
        });
    }

    protected scrubActiveBorderWidth(event: KeyboardEvent): void {
        this.scrubKeydown(this.draftBorderWidth, this.activeBorderDefaultWidth(), event);
        this.applyBorderDraft(this.activeBorderTargets());
    }

    protected setActiveBorderStyle(style: string): void {
        this.draftBorderStyle.set(style);
        this.applyBorderDraft(this.activeBorderTargets());
    }

    private applyBorderDraft(targets: BorderTarget[]): void {
        for (const target of targets) {
            const signals = this.getBorderSignals(target);
            signals.color.set(this.draftBorderColor());
            signals.width.set(this.draftBorderWidth());
            signals.style.set(this.draftBorderStyle());
        }
    }

    private captureBorderTarget(target: BorderTarget): void {
        if (this.borderEditorSnapshot.has(target)) return;

        const signals = this.getBorderSignals(target);
        this.borderEditorSnapshot.set(target, {
            color: signals.color(),
            width: signals.width(),
            style: signals.style()
        });
    }

    private restoreBorderTarget(target: BorderTarget): void {
        const snapshot = this.borderEditorSnapshot.get(target);
        if (!snapshot) return;

        const signals = this.getBorderSignals(target);
        signals.color.set(snapshot.color);
        signals.width.set(snapshot.width);
        signals.style.set(snapshot.style);
    }

    private closeBorderEditor(): void {
        this.borderEditorSnapshot.clear();
        this.activeBorderRuleIndex.set(null);
        this.activeBorderTargets.set([]);
        this.borderEditorOpen.set(false);
    }

    private resetBorderTarget(target: BorderTarget): void {
        const signals = this.getBorderSignals(target);
        signals.color.set('');
        signals.width.set('');
        signals.style.set('');
    }

    private getBorderSignals(target: BorderTarget): BorderSignals {
        const map: Record<BorderTarget, BorderSignals> = {
            header: { color: this.gridHeaderBorderColor, width: this.gridHeaderBorderWidth, style: this.gridHeaderBorderStyle },
            row: { color: this.gridRowBorderColor, width: this.gridRowBorderWidth, style: this.gridRowBorderStyle },
            pinned: { color: this.gridPinnedBorderColor, width: this.gridPinnedBorderWidth, style: this.gridPinnedBorderStyle },
            summaryPinned: { color: this.gridSummaryPinnedBorderColor, width: this.gridSummaryPinnedBorderWidth, style: this.gridSummaryPinnedBorderStyle },
            summary: { color: this.gridSummaryBorderColor, width: this.gridSummaryBorderWidth, style: this.gridSummaryBorderStyle },
            activeCell: { color: this.gridCellActiveBorderColor, width: this.gridCellActiveBorderWidth, style: this.gridCellActiveBorderStyle },
        };
        return map[target];
    }

    protected applyColor(sig: WritableSignal<string>, event: Event): void {
        const input = event.target as HTMLInputElement;
        let v = input.value.trim();
        if (!v.startsWith('#')) v = '#' + v;
        if (/^#[0-9a-fA-F]{3}$/.test(v)) {
            v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
        }
        if (/^#[0-9a-fA-F]{6}$/i.test(v)) {
            sig.set(v.toUpperCase());
        }
        input.value = sig();
    }

    protected startScrub(sig: WritableSignal<string>, fallback: string, event: PointerEvent, onChange?: () => void): void {
        const el = event.currentTarget as HTMLElement;
        el.setPointerCapture(event.pointerId);
        let lastY = event.clientY;

        const onMove = (e: PointerEvent) => {
            const delta = lastY - e.clientY;
            lastY = e.clientY;
            if (delta === 0) return;
            const current = sig() || fallback;
            const match = current.match(/^([\d.]+)(\D*)$/);
            if (!match) return;
            const unit = match[2] || 'px';
            const step = unit === 'px' ? 1 : 0.1;
            const next = Math.max(0, Math.round((parseFloat(match[1]) + delta * step) * 10) / 10);
            sig.set(`${next}${unit}`);
            onChange?.();
        };

        const onUp = () => {
            el.removeEventListener('pointermove', onMove as EventListener);
            el.removeEventListener('pointerup', onUp);
        };

        el.addEventListener('pointermove', onMove as EventListener);
        el.addEventListener('pointerup', onUp);
    }

    protected scrubKeydown(sig: WritableSignal<string>, fallback: string, event: KeyboardEvent): void {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
        event.preventDefault();
        const current = sig() || fallback;
        const match = current.match(/^([\d.]+)(\D*)$/);
        if (!match) return;
        const unit = match[2] || 'px';
        const step = unit === 'px' ? 1 : 0.1;
        const delta = event.key === 'ArrowUp' ? step : -step;
        const next = Math.max(0, Math.round((parseFloat(match[1]) + delta) * 10) / 10);
        sig.set(`${next}${unit}`);
        (event.target as HTMLInputElement).value = sig();
    }

    protected copyExport(code: string | null, format: 'css' | 'scss'): void {
        if (!code) return;

        navigator.clipboard.writeText(code).then(() => {
            this.copiedExport.set(format);
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
