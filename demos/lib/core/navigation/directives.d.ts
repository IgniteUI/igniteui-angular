import { IgxNavigationService } from "./nav.service";
export declare class IgxNavigationToggleDirective {
    state: IgxNavigationService;
    private target;
    constructor(nav: IgxNavigationService);
    toggleNavigationDrawer(): void;
}
export declare class IgxNavigationCloseDirective {
    state: IgxNavigationService;
    private target;
    constructor(nav: IgxNavigationService);
    closeNavigationDrawer(): void;
}
export declare class IgxNavigationModule {
}
