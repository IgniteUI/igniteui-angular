export interface IToggleView {
    element: any;
    open(fireEvents?: boolean): any;
    close(fireEvents?: boolean): any;
    toggle(fireEvents?: boolean): any;
}
