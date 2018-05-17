/**
 * Common interface for Components with show and collapse functionality
 */
export interface IToggleView {
    element;

    open(fireEvents?: boolean);
    close(fireEvents?: boolean);
    toggle(fireEvents?: boolean);

}
