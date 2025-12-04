import { IToggleView } from './IToggleView';
import { Injectable } from '@angular/core';

/**
 * Common service to be injected between components where those implementing common
 * ToggleView interface can register and toggle directives can call their methods.
 * TODO: Track currently active? Events?
 */
@Injectable({ providedIn: 'root' })
export class IgxNavigationService {
    private navs: { [id: string]: IToggleView };

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

    public toggle(id: string, ...args) {
        if (this.navs[id]) {
            return this.navs[id].toggle(...args);
        }
    }
    public open(id: string, ...args) {
        if (this.navs[id]) {
            return this.navs[id].open(...args);
        }
    }
    public close(id: string, ...args) {
        if (this.navs[id]) {
            return this.navs[id].close(...args);
        }
    }
}
