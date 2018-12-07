import { PositionSettings, Size } from './../utilities';

/**
 * [Documentation](https://www.infragistics.com/products/ignite-ui-angular/angular/components/overlay_position.html)
 * Position strategies determine where to display the component in the provided IgxOverlayService.
 */
export interface IPositionStrategy {
    /**
     * PositionSettings to use when position the component in the overlay
     */
    settings: PositionSettings;

    /**
     * Position the element based on the PositionStrategy implementing this interface.
     * @param contentElement The HTML element to be positioned
     * @param size Size of the element
     * @param document reference to the Document object
     * @param initialCall should be true if this is the initial call to the method
     * ```typescript
     * settings.positionStrategy.position(content, size, document, true);
     * ```
     */
    position(contentElement: HTMLElement, size?: Size, document?: Document, initialCall?: boolean): void;
}
