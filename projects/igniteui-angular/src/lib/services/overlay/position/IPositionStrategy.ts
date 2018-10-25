import { PositionSettings } from './../utilities';

/**
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay_position.html)
 * Position strategies determine where to display the component in the provided IgxOverlayService.
 */
export interface IPositionStrategy {
    settings: PositionSettings;

    /**
     * Position the element based on the PositionStrategy implementing this interface.
     * ```typescript
     * settings.positionStrategy.position(content, size, Document, true);
     * ```
     */
     position(contentElement: HTMLElement, size?: {}, document?: Document, initialCall?: boolean): void;
}
