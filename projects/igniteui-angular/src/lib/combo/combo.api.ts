import { EventEmitter, Injectable } from '@angular/core';
import { IgxDropDownAPIService } from '../drop-down/drop-down.api';
import { IgxComboBase } from './combo.common';

@Injectable({
    providedIn: 'root'
})
export class IgxComboAPIService {
    protected componentsMap: Map<string, IgxComboBase> = new Map<string, IgxComboBase>();

    public get(componentID: string): IgxComboBase {
        return this.componentsMap.get(componentID);
    }

    public register(componentID: string, component: IgxComboBase): void {
        this.componentsMap.set(componentID, component);
    }

    public clear(componentID): void {
        this.componentsMap.set(componentID, null);
    }

    public get item_focusable(): boolean {
        return false;
    }
    public isRemote(componentID: string): boolean {
        const combo = this.get(componentID);
        return combo.isRemote;
    }

    public add_custom_item(componentID: string): void {
        const combo = this.get(componentID);
        combo.addItemToCollection();
    }
}
