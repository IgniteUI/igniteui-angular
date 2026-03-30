import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

/**
 * Component B - The Base Component
 * This component provides base styles that should be shared by components that extend it.
 */
@Component({
    selector: 'app-base',
    template: `
        <div class="base-container">
            <h3 class="base-title">Base Component</h3>
            <p class="base-content">Value: {{ value() }}</p>
            <button class="base-button" (click)="increment()">Increment</button>
        </div>
    `,
    styleUrl: './base.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseComponent {
    protected readonly value = signal(0);

    increment() {
        this.value.update(v => v + 1);
    }
}

