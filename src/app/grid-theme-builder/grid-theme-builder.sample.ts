import { AfterViewInit, ChangeDetectionStrategy, Component, computed, effect, ElementRef, inject, OnInit, signal, TemplateRef, viewChild, ViewEncapsulation, WritableSignal } from '@angular/core';
import { SAMPLE_DATA } from '../shared/sample-data';
import { IGX_GRID_DIRECTIVES, IgxActionStripComponent, IgxButtonDirective, IgxGridComponent, IgxNumberSummaryOperand, IgxSummaryResult } from 'igniteui-angular';
import { IgxAccordionComponent } from 'igniteui-angular/accordion';
import { IgxComboComponent } from 'igniteui-angular/combo';
import { IGX_EXPANSION_PANEL_DIRECTIVES } from 'igniteui-angular/expansion-panel';
import { IgxInputGroupComponent, IgxInputDirective, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { IGX_SELECT_DIRECTIVES } from 'igniteui-angular/select';
import { PropertyChangeService } from '../properties-panel/property-change.service';

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
    imports: [IGX_GRID_DIRECTIVES, IgxActionStripComponent, IgxButtonDirective, IgxAccordionComponent, IGX_EXPANSION_PANEL_DIRECTIVES, IgxComboComponent, IGX_SELECT_DIRECTIVES, IgxInputGroupComponent, IgxInputDirective, IgxPrefixDirective, IgxSuffixDirective]
})
export class GridThemeBuilderSampleComponent implements OnInit, AfterViewInit {
    protected readonly gridForeground = signal('');
    protected readonly gridBackground = signal('');
    protected readonly gridAccentColor = signal('');
    protected readonly gridHeaderBackground = signal('');
    protected readonly gridHeaderTextColor = signal('');
    protected readonly gridHeaderBorderWidth = signal('1px');
    protected readonly gridHeaderBorderStyle = signal('solid');
    protected readonly gridHeaderBorderColor = signal('');
    protected readonly gridPinnedBorderWidth = signal('2px');
    protected readonly gridPinnedBorderStyle = signal('solid');
    protected readonly gridPinnedBorderColor = signal('');
    protected readonly gridSummaryPinnedBorderWidth = signal('');
    protected readonly gridSummaryPinnedBorderStyle = signal('');
    protected readonly gridSummaryPinnedBorderColor = signal('');
    protected readonly gridSummaryBorderColor = signal('');
    protected readonly gridSummaryBorderWidth = signal('');
    protected readonly gridSummaryBorderStyle = signal('');
    protected readonly sharedBorderColor = signal('');
    protected readonly sharedBorderWidth = signal('1px');
    protected readonly sharedBorderStyle = signal('solid');
    protected readonly borderTargetsList = signal<string[]>([]);
    protected readonly borderOptions = [
        { value: 'header', label: 'Header' },
        { value: 'pinned', label: 'Pinned columns' },
        { value: 'summaryPinned', label: 'Summary Pinned Border' },
        { value: 'summary', label: 'Summary Borders' },
        { value: 'activeCell', label: 'Active cell' },
    ];
    protected readonly gridCellActiveBorderWidth = signal('1px');
    protected readonly gridCellActiveBorderStyle = signal('solid');
    protected readonly gridCellActiveBorderColor = signal('');
    protected readonly gridCellSelectedWithinBackground = signal('');
    protected readonly gridCellSelectedWithinTextColor = signal('');
    protected readonly gridCellSelectedBackground = signal('');
    protected readonly gridCellSelectedTextColor = signal('');

    protected readonly gridRef = viewChild.required<IgxGridComponent>('grid');
    private readonly sampleEl = viewChild.required<ElementRef>('sampleEl');
    private readonly customControlsTemplate = viewChild.required<TemplateRef<any>>('customControls');

    protected readonly showExport = signal(false);
    protected readonly exportCopied = signal(false);

    protected readonly exportCode = computed(() => {
        const lines: string[] = [];
        const add = (token: string, value: string) => {
            if (value) lines.push(`    ${token}: ${value},`);
        };

        add('$background', this.gridBackground());
        add('$foreground', this.gridForeground());
        add('$accent-color', this.gridAccentColor());
        add('$header-background', this.gridHeaderBackground());
        add('$header-text-color', this.gridHeaderTextColor());
        add('$header-border-width', this.gridHeaderBorderWidth() !== '1px' || this.gridHeaderBorderColor() ? this.gridHeaderBorderWidth() : '');
        add('$header-border-style', this.gridHeaderBorderStyle() !== 'solid' || this.gridHeaderBorderColor() ? this.gridHeaderBorderStyle() : '');
        add('$header-border-color', this.gridHeaderBorderColor());
        add('$pinned-border-width', this.gridPinnedBorderWidth() !== '2px' || this.gridPinnedBorderColor() ? this.gridPinnedBorderWidth() : '');
        add('$pinned-border-style', this.gridPinnedBorderStyle() !== 'solid' || this.gridPinnedBorderColor() ? this.gridPinnedBorderStyle() : '');
        add('$pinned-border-color', this.gridPinnedBorderColor());
        add('$summary-pinned-border-width', this.gridSummaryPinnedBorderWidth());
        add('$summary-pinned-border-style', this.gridSummaryPinnedBorderStyle());
        add('$summary-pinned-border-color', this.gridSummaryPinnedBorderColor());
        add('$summary-border-color', this.gridSummaryBorderColor());
        add('$cell-active-border-width', this.gridCellActiveBorderWidth() !== '1px' || this.gridCellActiveBorderColor() ? this.gridCellActiveBorderWidth() : '');
        add('$active-state-border-style', this.gridCellActiveBorderStyle() !== 'solid' || this.gridCellActiveBorderColor() ? this.gridCellActiveBorderStyle() : '');
        add('$cell-active-border-color', this.gridCellActiveBorderColor());
        add('$cell-selected-within-background', this.gridCellSelectedWithinBackground());
        add('$cell-selected-within-text-color', this.gridCellSelectedWithinTextColor());
        add('$cell-selected-background', this.gridCellSelectedBackground());
        add('$cell-selected-text-color', this.gridCellSelectedTextColor());

        if (lines.length === 0) return null;

        return `@include tokens(\n  grid-theme(\n${lines.join('\n')}\n  )\n);`;
    });

    protected readonly exportCssVars = computed(() => {
        const vars: string[] = [];
        const add = (token: string, value: string) => {
            if (value) vars.push(`  --ig-grid-${token}: ${value};`);
        };

        add('background', this.gridBackground());
        add('foreground', this.gridForeground());
        add('accent-color', this.gridAccentColor());
        add('header-background', this.gridHeaderBackground());
        add('header-text-color', this.gridHeaderTextColor());
        add('header-border-width', this.gridHeaderBorderWidth() !== '1px' || this.gridHeaderBorderColor() ? this.gridHeaderBorderWidth() : '');
        add('header-border-style', this.gridHeaderBorderStyle() !== 'solid' || this.gridHeaderBorderColor() ? this.gridHeaderBorderStyle() : '');
        add('header-border-color', this.gridHeaderBorderColor());
        add('pinned-border-width', this.gridPinnedBorderWidth() !== '2px' || this.gridPinnedBorderColor() ? this.gridPinnedBorderWidth() : '');
        add('pinned-border-style', this.gridPinnedBorderStyle() !== 'solid' || this.gridPinnedBorderColor() ? this.gridPinnedBorderStyle() : '');
        add('pinned-border-color', this.gridPinnedBorderColor());
        add('summary-pinned-border-width', this.gridSummaryPinnedBorderWidth());
        add('summary-pinned-border-style', this.gridSummaryPinnedBorderStyle());
        add('summary-pinned-border-color', this.gridSummaryPinnedBorderColor());
        add('summary-border-color', this.gridSummaryBorderColor());
        add('cell-active-border-width', this.gridCellActiveBorderWidth() !== '1px' || this.gridCellActiveBorderColor() ? this.gridCellActiveBorderWidth() : '');
        add('active-state-border-style', this.gridCellActiveBorderStyle() !== 'solid' || this.gridCellActiveBorderColor() ? this.gridCellActiveBorderStyle() : '');
        add('cell-active-border-color', this.gridCellActiveBorderColor());
        add('cell-selected-within-background', this.gridCellSelectedWithinBackground());
        add('cell-selected-within-text-color', this.gridCellSelectedWithinTextColor());
        add('cell-selected-background', this.gridCellSelectedBackground());
        add('cell-selected-text-color', this.gridCellSelectedTextColor());

        if (vars.length === 0) return null;

        return `.my-grid {\n${vars.join('\n')}\n}`;
    });

    private readonly propertyChangeService = inject(PropertyChangeService);

    constructor() {
        effect(() => {
            const c = this.sharedBorderColor();
            for (const t of this.borderTargetsList()) {
                this.getBorderSignals(t).color.set(c);
            }
        }, { allowSignalWrites: true });
        effect(() => {
            const w = this.sharedBorderWidth();
            for (const t of this.borderTargetsList()) {
                this.getBorderSignals(t).width.set(w);
            }
        }, { allowSignalWrites: true });
        effect(() => {
            const s = this.sharedBorderStyle();
            for (const t of this.borderTargetsList()) {
                this.getBorderSignals(t).style.set(s);
            }
        }, { allowSignalWrites: true });
        effect(() => {
            this.exportCode();
            this.exportCssVars();
            this.exportCopied.set(false);
        }, { allowSignalWrites: true });
    }

    public data: Array<any>;
    public readonly employeesSummary = EmployeesSummary;

    protected hasBorderTarget(target: string): boolean {
        return this.borderTargetsList().includes(target);
    }

    private readonly borderDefaults: Record<string, { color: string, width: string, style: string }> = {
        header:        { color: '', width: '1px', style: 'solid' },
        pinned:        { color: '', width: '2px', style: 'solid' },
        summaryPinned: { color: '', width: '',    style: ''      },
        summary:       { color: '', width: '',    style: ''      },
        activeCell:    { color: '', width: '1px', style: 'solid' },
    };

    protected onBorderSelectionChanging(event: any): void {
        for (const item of (event.removed as Array<{ value: string }>) ) {
            const s = this.getBorderSignals(item.value);
            const d = this.borderDefaults[item.value];
            if (s && d) {
                s.color.set(d.color);
                s.width.set(d.width);
                s.style.set(d.style);
            }
        }
        this.borderTargetsList.set(event.newValue as string[]);
    }

    private getBorderSignals(target: string): { color: WritableSignal<string>, width: WritableSignal<string>, style: WritableSignal<string> } {
        const map: Record<string, { color: WritableSignal<string>, width: WritableSignal<string>, style: WritableSignal<string> }> = {
            header: { color: this.gridHeaderBorderColor, width: this.gridHeaderBorderWidth, style: this.gridHeaderBorderStyle },
            pinned: { color: this.gridPinnedBorderColor, width: this.gridPinnedBorderWidth, style: this.gridPinnedBorderStyle },
            summaryPinned: { color: this.gridSummaryPinnedBorderColor, width: this.gridSummaryPinnedBorderWidth, style: this.gridSummaryPinnedBorderStyle },
            summary: { color: this.gridSummaryBorderColor, width: this.gridSummaryBorderWidth, style: this.gridSummaryBorderStyle },
            activeCell: { color: this.gridCellActiveBorderColor, width: this.gridCellActiveBorderWidth, style: this.gridCellActiveBorderStyle },
        };
        return map[target];
    }

    protected setHeaderTextColor(value: string): void {
        this.gridHeaderTextColor.set(value);
        if (!this.gridHeaderBackground()) {
            this.gridHeaderBackground.set('#e8e6e2');
        }
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

    protected applyHeaderTextColor(event: Event): void {
        const input = event.target as HTMLInputElement;
        let v = input.value.trim();
        if (!v.startsWith('#')) v = '#' + v;
        if (/^#[0-9a-fA-F]{3}$/.test(v)) {
            v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
        }
        if (/^#[0-9a-fA-F]{6}$/i.test(v)) {
            this.setHeaderTextColor(v.toUpperCase());
        }
        input.value = this.gridHeaderTextColor();
    }

    protected startScrub(sig: WritableSignal<string>, fallback: string, event: PointerEvent): void {
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

    protected copyExport(): void {
        const parts = [this.exportCssVars(), this.exportCode()].filter(Boolean);
        navigator.clipboard.writeText(parts.join('\n\n')).then(() => {
            this.exportCopied.set(true);
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
