import { ChangeDetectionStrategy, Component, ViewEncapsulation, signal } from '@angular/core';

/**
 * Base Component with ViewEncapsulation.None
 *
 * TEST: Will these styles be available globally even when this component
 * is NOT rendered on the page, but only its children are?
 */
@Component({
    selector: 'app-base-no-encapsulation',
    template: `
        <div class="base-no-encap-container">
            <h3 class="base-no-encap-title">Base (No Encapsulation)</h3>
            <p class="base-no-encap-content">Value: {{ value() }}</p>
            <button class="base-no-encap-button" (click)="increment()">Increment</button>
        </div>
    `,
    styles: [`
        /* =====================================================
           STYLES WITH ViewEncapsulation.None
           These styles should be GLOBAL - no scoping attributes
           ===================================================== */
        
        .base-no-encap-container {
            padding: 20px;
            border: 3px solid #673ab7;
            border-radius: 8px;
            margin: 10px;
            background-color: #ede7f6;
        }

        .base-no-encap-title {
            color: #673ab7;
            font-size: 1.5rem;
            margin: 0 0 10px 0;
            font-weight: 600;
        }

        .base-no-encap-content {
            color: #333;
            font-size: 1rem;
            margin: 10px 0;
        }

        .base-no-encap-button {
            padding: 10px 20px;
            background-color: #673ab7;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 1rem;
        }

        .base-no-encap-button:hover {
            background-color: #512da8;
        }
    `],
    encapsulation: ViewEncapsulation.None,  // KEY: Styles are global!
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BaseNoEncapsulationComponent {
    protected readonly value = signal(0);

    public increment() {
        this.value.update(v => v + 1);
    }
}

