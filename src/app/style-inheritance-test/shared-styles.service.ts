import { Injectable } from '@angular/core';

/**
 * Shared Styles Service
 *
 * Creates CSSStyleSheet objects ONCE and shares them across components.
 * Uses the Constructable StyleSheets API (adoptedStyleSheets).
 *
 * This avoids style duplication when multiple components need the same base styles.
 */
@Injectable({ providedIn: 'root' })
export class SharedStylesService {
    private _baseStyles: CSSStyleSheet | null = null;

    /**
     * Get the shared base styles as a CSSStyleSheet.
     * The stylesheet is created once and reused.
     */
    public get baseStyles(): CSSStyleSheet {
        if (!this._baseStyles) {
            this._baseStyles = new CSSStyleSheet();
            this._baseStyles.replaceSync(this.getBaseCSS());
        }
        return this._baseStyles;
    }

    /**
     * Base CSS styles that will be shared across components.
     * These styles are defined ONCE in memory, not duplicated per component.
     */
    private getBaseCSS(): string {
        return `
            /* ===========================================
               SHARED BASE STYLES (from SharedStylesService)
               These styles exist ONCE in memory!
               =========================================== */
            
            .base-container {
                padding: 20px;
                border: 2px solid #3f51b5;
                border-radius: 8px;
                margin: 10px;
                background-color: #f5f5f5;
            }

            .base-title {
                color: #3f51b5;
                font-size: 1.5rem;
                margin: 0 0 10px 0;
                font-weight: 600;
            }

            .base-content {
                color: #333;
                font-size: 1rem;
                margin: 10px 0;
            }

            .base-button {
                padding: 10px 20px;
                background-color: #3f51b5;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 1rem;
                transition: background-color 0.3s ease;
            }

            .base-button:hover {
                background-color: #303f9f;
            }
        `;
    }

    /**
     * Create a new CSSStyleSheet from a CSS string.
     * Useful for child-specific styles.
     */
    public createStyleSheet(css: string): CSSStyleSheet {
        const sheet = new CSSStyleSheet();
        sheet.replaceSync(css);
        return sheet;
    }
}



