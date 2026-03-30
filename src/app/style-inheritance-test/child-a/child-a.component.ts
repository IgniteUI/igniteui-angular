import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BaseComponent } from '../base/base.component';

/**
 * Component A - Extends Base Component B
 *
 * NATIVE ANGULAR SOLUTION: Use `styleUrls` array to include base styles.
 * This ensures base styles are available even when BaseComponent isn't rendered.
 *
 * ⚠️ Note: This WILL duplicate base styles in each child's CSS bundle.
 */
@Component({
    selector: 'app-child-a',
    template: `
        <div class="base-container child-a-wrapper">
            <h3 class="base-title">Child A Component</h3>
            <p class="base-content">Value from parent: {{ value() }}</p>
            <div class="child-a-extra">
                <span class="child-a-badge">Component A</span>
            </div>
            <button class="base-button" (click)="increment()">Increment (A)</button>
        </div>
    `,
    styleUrls: [
        '../base/base.component.css',  // ← Include base styles
        './child-a.component.css'       // ← Child-specific styles
    ],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChildAComponent extends BaseComponent {
    // Inherits value signal and increment() from BaseComponent
}

