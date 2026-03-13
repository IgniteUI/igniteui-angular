import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseNoEncapsulationComponent } from '../base-no-encapsulation/base-no-encapsulation.component';

/**
 * Child F - Extends Base with ViewEncapsulation.None
 *
 * This child has NO styles of its own.
 * It relies entirely on the base component's global styles.
 *
 * KEY QUESTION: If BaseNoEncapsulationComponent is never rendered,
 * will its styles still be available for this child?
 */
@Component({
    selector: 'app-child-f',
    template: `
        <div class="base-no-encap-container child-f-wrapper">
            <h3 class="base-no-encap-title">Child F Component</h3>
            <p class="base-no-encap-content">Value from parent: {{ value() }}</p>
            <div class="child-f-extra">
                <span class="child-f-badge">Component F (inherits None encapsulation)</span>
            </div>
            <button class="base-no-encap-button" (click)="increment()">Increment (F)</button>
        </div>
    `,
    styles: [`
        /* Only child-specific styles */
        .child-f-wrapper {
            border-color: #00bcd4 !important;
            background-color: #e0f7fa !important;
        }
        .child-f-extra {
            margin: 15px 0;
        }
        .child-f-badge {
            display: inline-block;
            padding: 5px 12px;
            background-color: #00bcd4;
            color: white;
            border-radius: 16px;
            font-size: 0.875rem;
        }
    `],
    // Using default encapsulation (Emulated) for child
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildFComponent extends BaseNoEncapsulationComponent {
    // Inherits value signal and increment() from base
}

