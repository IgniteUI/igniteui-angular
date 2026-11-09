/**
 * Common interface for Components with show and collapse functionality
 */
export interface IToggleView {
    element: any;

    open(...args: any[]): any;
    close(...args: any[]): any;
    toggle(...args: any[]): any;
}
