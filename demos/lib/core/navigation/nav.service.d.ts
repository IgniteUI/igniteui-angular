import { IToggleView } from "./IToggleView";
export declare class IgxNavigationService {
    private navs;
    constructor();
    add(id: string, navItem: IToggleView): void;
    remove(id: string): void;
    get(id: string): IToggleView;
    toggle(id: string, fireEvents?: boolean): any;
    open(id: string, fireEvents?: boolean): any;
    close(id: string, fireEvents?: boolean): any;
}
