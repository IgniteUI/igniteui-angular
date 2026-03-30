import { InjectionToken } from "@angular/core";

/**
 * Used for editor control components
 *
 * @hidden
 */
export interface EditorProvider {
    /** Return the focusable native element */
    getEditElement(): HTMLElement;
}

/**
 * Injection token is used to inject the EditorProvider token into components
 *
 * @hidden @internal
 */
export const EDITOR_PROVIDER = new InjectionToken<EditorProvider>('EditorProvider');
