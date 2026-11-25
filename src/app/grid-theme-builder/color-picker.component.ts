import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IgxInputGroupComponent, IgxInputDirective, IgxPrefixDirective, IgxSuffixDirective } from 'igniteui-angular/input-group';
import { normalizeHexColor } from './color-utils';

@Component({
    selector: 'app-color-picker',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './color-picker.component.html',
    styleUrl: './color-picker.component.scss',
    imports: [IgxInputGroupComponent, IgxInputDirective, IgxPrefixDirective, IgxSuffixDirective]
})
export class ColorPickerComponent {
    public readonly label = input.required<string>();
    public readonly value = input('');
    /** Swatch color shown for the native color-wheel input while value is empty ("auto"). */
    public readonly fallback = input('');
    /** Whether a "reset to auto" control is offered when value is set. */
    public readonly resettable = input(true);
    public readonly valueChange = output<string>();

    private pendingFrame: number | null = null;
    private latestPickedValue: string | null = null;

    // The native color-wheel input can fire dozens of `input` events per second while
    // dragging; coalescing to one emit per animation frame keeps the UI responsive
    // without forcing a change-detection pass per pixel of drag movement.
    protected onPick(event: Event): void {
        this.latestPickedValue = (event.target as HTMLInputElement).value;
        if (this.pendingFrame !== null) return;

        this.pendingFrame = requestAnimationFrame(() => {
            this.pendingFrame = null;
            if (this.latestPickedValue !== null) {
                this.valueChange.emit(this.latestPickedValue);
                this.latestPickedValue = null;
            }
        });
    }

    protected onTextChange(event: Event): void {
        const inputEl = event.target as HTMLInputElement;
        const normalized = normalizeHexColor(inputEl.value);
        if (normalized) {
            this.valueChange.emit(normalized);
            inputEl.value = normalized;
        } else {
            inputEl.value = this.value();
        }
    }

    protected reset(): void {
        this.valueChange.emit('');
    }
}
