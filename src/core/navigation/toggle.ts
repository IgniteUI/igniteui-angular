/**
 * Common interface for Components with show and collapse functionality
 */
export interface IToggleView {
    open(fireEvents?: boolean): Promise<any>;
    close(fireEvents?: boolean): Promise<any>;
    toggle(fireEvents?: boolean): Promise<any>;
}
