import { ChangeDetectionStrategy, Component, signal, ViewEncapsulation } from '@angular/core';
import { StyledBaseDirective } from '../styled-base.directive';

/**
 * Child D Component - Uses Adopted StyleSheets
 *
 * This component extends StyledBaseDirective which applies shared base styles
 * via adoptedStyleSheets. The base styles are NOT duplicated - they're shared!
 *
 * KEY: Uses ViewEncapsulation.ShadowDom to enable adoptedStyleSheets.
 */
@Component({
    selector: 'app-child-d',
    template: `
        <div class="base-container child-d-wrapper">
            <h3 class="base-title">Child D Component</h3>
            <p class="base-content">Value: {{ value() }}</p>
            <div class="child-d-extra">
                <span class="child-d-badge">Component D (Adopted Styles)</span>
            </div>
            <button class="base-button" (click)="increment()">Increment (D)</button>
        </div>
    `,
    // NO styleUrl or styles! Styles come from adoptedStyleSheets
    encapsulation: ViewEncapsulation.ShadowDom,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildDComponent extends StyledBaseDirective {
    protected readonly value = signal(0);

    public increment() {
        this.value.update(v => v + 1);
    }

    /**
     * Child D specific styles - only the D-specific parts!
     * Base styles (.base-container, .base-button, etc.) come from shared service.
     */
    protected override getChildCSS(): string {
        return `
            /* Child D specific styles ONLY */
            .child-d-wrapper {
                border-color: #9c27b0;
                background-color: #f3e5f5;
            }

            .child-d-extra {
                margin: 15px 0;
            }

            .child-d-badge {
                display: inline-block;
                padding: 5px 12px;
                background-color: #9c27b0;
                color: white;
                border-radius: 16px;
                font-size: 0.875rem;
                font-weight: 500;
            }
        `;
    }
}


