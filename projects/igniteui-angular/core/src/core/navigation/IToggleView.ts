/**
 * Common interface for Components with show and collapse functionality
 */
export interface IToggleView {
    element;

    open(...args);
    close(...args);
    toggle(...args);
}
