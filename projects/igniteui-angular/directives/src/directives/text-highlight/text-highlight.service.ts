import { EventEmitter, Injectable } from '@angular/core';
import { IActiveHighlightInfo } from './text-highlight.directive';

@Injectable({
  providedIn: 'root'
})
export class IgxTextHighlightService {
    public highlightGroupsMap = new Map<string, IActiveHighlightInfo>();
    public onActiveElementChanged = new EventEmitter<string>();

    constructor() { }

    /**
     * Activates the highlight at a given index.
     * (if such index exists)
     */
    public setActiveHighlight(groupName: string, highlight: IActiveHighlightInfo) {
        this.highlightGroupsMap.set(groupName, highlight);
        this.onActiveElementChanged.emit(groupName);
    }

    /**
     * Clears any existing highlight.
     */
    public clearActiveHighlight(groupName) {
        this.highlightGroupsMap.set(groupName, {
            index: -1
        });
        this.onActiveElementChanged.emit(groupName);
    }

    /**
     * Destroys a highlight group.
     */
    public destroyGroup(groupName: string) {
        this.highlightGroupsMap.delete(groupName);
    }
}
