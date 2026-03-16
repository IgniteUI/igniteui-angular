import { Directive, ElementRef, inject, OnInit } from '@angular/core';
import { SharedStylesService } from './shared-styles.service';

/**
 * Styled Base Directive
 *
 * A base directive that automatically applies shared styles via adoptedStyleSheets.
 * Components that extend this will automatically get the base styles WITHOUT duplication.
 *
 * IMPORTANT: Child components MUST use ViewEncapsulation.ShadowDom for this to work!
 */
@Directive()
export abstract class StyledBaseDirective implements OnInit {
    protected elementRef = inject(ElementRef);
    protected sharedStyles = inject(SharedStylesService);

    /**
     * Override this in child classes to provide child-specific CSS.
     */
    protected abstract getChildCSS(): string;

    public ngOnInit() {
        this.applyStyles();
    }

    /**
     * Apply both shared base styles and child-specific styles to the shadow root.
     * The base styles are SHARED (same CSSStyleSheet instance), not duplicated.
     */
    protected applyStyles() {
        const shadowRoot = this.elementRef.nativeElement.shadowRoot;

        if (shadowRoot) {
            // Create child-specific stylesheet
            const childStyleSheet = this.sharedStyles.createStyleSheet(this.getChildCSS());

            // Apply BOTH stylesheets - base styles are shared, not duplicated!
            shadowRoot.adoptedStyleSheets = [
                this.sharedStyles.baseStyles,  // Shared instance - no duplication!
                childStyleSheet                 // Child-specific styles
            ];
        } else {
            console.warn(
                'StyledBaseDirective: No shadow root found. ' +
                'Make sure to use ViewEncapsulation.ShadowDom in your component.'
            );
        }
    }
}


