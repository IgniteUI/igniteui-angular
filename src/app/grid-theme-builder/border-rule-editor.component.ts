import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IgxButtonDirective } from 'igniteui-angular';
import { IgxComboComponent } from 'igniteui-angular/combo';
import { IgxInputGroupComponent, IgxInputDirective } from 'igniteui-angular/input-group';
import { IGX_SELECT_DIRECTIVES } from 'igniteui-angular/select';
import { ColorPickerComponent } from './color-picker.component';
import { BORDER_DEFAULTS, BORDER_OPTIONS, BorderOption, BorderSignals, BorderTarget } from './border-rule-editor.types';
import { scrubKeydown, startScrub } from './scrub-utils';

@Component({
    selector: 'app-border-rule-editor',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './border-rule-editor.component.html',
    styleUrl: './border-rule-editor.component.scss',
    imports: [FormsModule, IgxButtonDirective, IgxComboComponent, IgxInputGroupComponent, IgxInputDirective, IGX_SELECT_DIRECTIVES, ColorPickerComponent]
})
export class BorderRuleEditorComponent {
    // The parent owns these signals (it reads them directly for the live grid's
    // [style.--ig-*] bindings and for theme export), this component only edits them.
    public readonly targetSignals = input.required<Record<BorderTarget, BorderSignals>>();
    public readonly borderOptions = input<BorderOption[]>(BORDER_OPTIONS);

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
        return this.borderOptions().filter(option => !unavailableTargets.includes(option.value));
    });

    protected readonly canAddBorderRule = computed(() => {
        const activeIndex = this.activeBorderRuleIndex();
        const activeTargets = this.activeBorderTargets();
        const assignedTargets = this.borderRules().flatMap((rule, index) =>
            index === activeIndex ? activeTargets : rule
        );
        if (activeIndex === null) assignedTargets.push(...activeTargets);
        return this.borderOptions().some(option => !assignedTargets.includes(option.value));
    });

    private borderEditorSnapshot = new Map<BorderTarget, { color: string; width: string; style: string }>();

    protected addBorderRule(): void {
        if (this.borderEditorOpen()) {
            if (!this.activeBorderTargets().length) return;
            this.completeBorderRule();
        }

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
            const signals = this.targetSignals()[targets[0]];
            this.draftBorderColor.set(signals.color());
            this.draftBorderWidth.set(signals.width() || BORDER_DEFAULTS[targets[0]].width);
            this.draftBorderStyle.set(signals.style() || BORDER_DEFAULTS[targets[0]].style);
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
            const signals = this.targetSignals()[target];
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

        const signals = this.targetSignals()[targets[0]];
        this.activeBorderRuleIndex.set(index);
        this.activeBorderTargets.set([...targets]);
        this.draftBorderColor.set(signals.color());
        this.draftBorderWidth.set(signals.width() || BORDER_DEFAULTS[targets[0]].width);
        this.draftBorderStyle.set(signals.style() || BORDER_DEFAULTS[targets[0]].style);
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
            this.borderOptions().find(option => option.value === target)?.label ?? target
        ).join(', ');
    }

    protected borderRuleSummary(targets: BorderTarget[]): string {
        const target = targets[0];
        const signals = this.targetSignals()[target];
        const defaults = BORDER_DEFAULTS[target];
        return `${signals.width() || defaults.width} ${signals.style() || defaults.style} ${signals.color() || 'auto'}`;
    }

    protected borderRuleColor(targets: BorderTarget[]): string {
        return this.targetSignals()[targets[0]].color();
    }

    protected activeBorderDefaultWidth(): string {
        const target = this.activeBorderTargets()[0];
        return target ? BORDER_DEFAULTS[target].width : '1px';
    }

    protected activeBorderDefaultStyle(): string {
        const target = this.activeBorderTargets()[0];
        return target ? BORDER_DEFAULTS[target].style : 'Solid';
    }

    protected setActiveBorderColor(value: string): void {
        this.draftBorderColor.set(value);
        this.applyBorderDraft(this.activeBorderTargets());
    }

    protected setActiveBorderWidth(value: string): void {
        this.draftBorderWidth.set(value.trim());
        this.applyBorderDraft(this.activeBorderTargets());
    }

    protected startActiveBorderWidthScrub(event: PointerEvent): void {
        startScrub(this.draftBorderWidth, this.activeBorderDefaultWidth(), event, () => {
            this.applyBorderDraft(this.activeBorderTargets());
        });
    }

    protected scrubActiveBorderWidth(event: KeyboardEvent): void {
        scrubKeydown(this.draftBorderWidth, this.activeBorderDefaultWidth(), event);
        this.applyBorderDraft(this.activeBorderTargets());
    }

    protected setActiveBorderStyle(style: string): void {
        this.draftBorderStyle.set(style);
        this.applyBorderDraft(this.activeBorderTargets());
    }

    private applyBorderDraft(targets: BorderTarget[]): void {
        for (const target of targets) {
            const signals = this.targetSignals()[target];
            signals.color.set(this.draftBorderColor());
            signals.width.set(this.draftBorderWidth());
            signals.style.set(this.draftBorderStyle());
        }
    }

    private captureBorderTarget(target: BorderTarget): void {
        if (this.borderEditorSnapshot.has(target)) return;

        const signals = this.targetSignals()[target];
        this.borderEditorSnapshot.set(target, {
            color: signals.color(),
            width: signals.width(),
            style: signals.style()
        });
    }

    private restoreBorderTarget(target: BorderTarget): void {
        const snapshot = this.borderEditorSnapshot.get(target);
        if (!snapshot) return;

        const signals = this.targetSignals()[target];
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
        const signals = this.targetSignals()[target];
        signals.color.set('');
        signals.width.set('');
        signals.style.set('');
    }
}
