import { IToggleView } from "./IToggleView";

/**
 * Common service to be injected between components where those implementing common
 * ToggleView interface can register and toggle directives can call their methods.
 * TODO: Track currently active? Events?
 */
export class IgxNavigationService {
    private navs: { [id: string]: IToggleView; };

    constructor() {
        this.navs = {};
    }

    public add(id: string, navItem: IToggleView) {
        this.navs[id] = navItem;
    }

    public remove(id: string) {
        delete this.navs[id];
    }

    public get(id: string): IToggleView {
        if (id) {
            return this.navs[id];
        }
    }

    public toggle(id: string, fireEvents?: boolean) {
        if (this.navs[id]) {
            return this.navs[id].toggle(fireEvents);
        }
    }
    public open(id: string, fireEvents?: boolean) {
        if (this.navs[id]) {
            return this.navs[id].open(fireEvents);
        }
    }
    public close(id: string, fireEvents?: boolean) {
        if (this.navs[id]) {
            return this.navs[id].close(fireEvents);
        }
    }
}
