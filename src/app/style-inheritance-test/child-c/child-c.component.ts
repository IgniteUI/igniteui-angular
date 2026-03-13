import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseComponent } from '../base/base.component';

/**
 * Component C - Extends Base Component B
 *
 * THIS COMPONENT DOES NOT INCLUDE BASE STYLES!
 * It only has its own styleUrl, so base styles (.base-container, etc.)
 * will NOT be applied.
 *
 * Compare this to Child A which uses styleUrls array.
 */
@Component({
    selector: 'app-child-c',
    template: `
        <div class="base-container child-c-wrapper">
            <h3 class="base-title">Child C Component</h3>
            <p class="base-content">Value from parent: {{ value() }}</p>
            <div class="child-c-extra">
                <span class="child-c-badge">Component C</span>
                <p class="missing-styles-note">⚠️ Notice: No padding, no border, no base styling!</p>
            </div>
            <button class="base-button" (click)="increment()">Increment (C)</button>
        </div>
    `,
    styleUrl: './child-c.component.css',  // ← Only child styles, NO base styles
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildCComponent extends BaseComponent {
    // Inherits value signal and increment() from BaseComponent
}

