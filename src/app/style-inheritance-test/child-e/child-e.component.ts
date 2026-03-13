import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { StyledBaseDirective } from '../styled-base.directive';

/**
 * Child E Component - Uses Adopted StyleSheets
 *
 * This component extends StyledBaseDirective which applies shared base styles
 * via adoptedStyleSheets. The base styles are NOT duplicated - they're shared!
 *
 * KEY: Uses ViewEncapsulation.ShadowDom to enable adoptedStyleSheets.
 */
@Component({
    selector: 'app-child-e',
    template: `
        <div class="base-container child-e-wrapper">
            <h3 class="base-title">Child E Component</h3>
            <p class="base-content">Value: {{ value() }}</p>
            <div class="child-e-extra">
                <span class="child-e-badge">Component E (Adopted Styles)</span>
            </div>
            <button class="base-button" (click)="increment()">Increment (E)</button>
        </div>
    `,
    // NO styleUrl or styles! Styles come from adoptedStyleSheets
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildEComponent extends StyledBaseDirective {
    protected readonly value = signal(0);

    public increment() {
        this.value.update(v => v + 1);
    }

    /**
     * Child E specific styles - only the E-specific parts!
     * Base styles (.base-container, .base-button, etc.) come from shared service.
     */
    protected override getChildCSS(): string {
        return `
            /* Child E specific styles ONLY */
            .child-e-wrapper {
                border-color: #ff5722;
                background-color: #fbe9e7;
            }

            .child-e-extra {
                margin: 15px 0;
            }

            .child-e-badge {
                display: inline-block;
                padding: 5px 12px;
                background-color: #ff5722;
                color: white;
                border-radius: 16px;
                font-size: 0.875rem;
                font-weight: 500;
            }
        `;
    }
}


