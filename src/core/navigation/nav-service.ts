import {ToggleView} from './toggle';

/**
 * Common service to be injected between components where those implementing common 
 * ToggleView interface can register and toggle directives can call their methods.
 * TODO: Track currently active? Events?
 */
export class NavigationService {
    private navs: { [id: string] : ToggleView; };     
    
    constructor() {
        this.navs = {};
    }
    
    public add(id: string, navItem: ToggleView) {
        this.navs[id] = navItem;
    }
    
    public remove(id: string) {
        delete this.navs[id];
    }
    
    public get(id: string): ToggleView {
        if (id) {
            return this.navs[id];
        }
    }
       
    public toggle(id: string, fireEvents?: boolean) : Promise<any> {
        if (this.navs[id]) {
            return this.navs[id].toggle(fireEvents);
        } else {
            return Promise.reject("No ToggleView component found for id:" + id);
        }
    }        
    public open(id: string, fireEvents?: boolean) : Promise<any> {
        if (this.navs[id]) {
            return this.navs[id].open(fireEvents);
        } else {
            return Promise.reject("No ToggleView component found for id:" + id);
        }
    }
    public close(id: string, fireEvents?: boolean) : Promise<any> {
        if (this.navs[id]) {
            return this.navs[id].close(fireEvents);
        } else {
            return Promise.reject("No ToggleView component found for id:" + id);
        }
    }
}