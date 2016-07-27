import { Component, Renderer, Input, ElementRef, ViewChild, AfterContentInit, ContentChildren, QueryList } from '@angular/core';
//import { HammerGesturesManager } from '../core/core';
import { ContainsPipe } from './filter-pipe';
import { Item } from './items';

declare var module: any;

// ====================== LIST ================================
// The `<ig-list>` component is a list container for 1..n `<ig-item>` tags.
@Component({
    selector: 'ig-list',
    host: { 'role': 'list' },
    pipes: [ ContainsPipe ],
    moduleId: module.id, // commonJS standard
    directives: [Item],
    templateUrl: 'list-content.html'
})

export class List implements AfterContentInit {
    @ContentChildren(Item) items: QueryList<Item>;

    private _innerStyle: string = "ig-list-inner";
    private _inputSearchBox: HTMLElement;

    @Input() searchBoxId: string;

    constructor() {
        
    }

    ngAfterContentInit() {
        var self = this;
        if(this.searchBoxId) {
            this._inputSearchBox = document.getElementById(this.searchBoxId);
            this._inputSearchBox.addEventListener("input", function() {
                    self.filter(false);
                });
        }
    }

    filter(isCaseSensitive: boolean) {
        var searchText = (<HTMLInputElement>this._inputSearchBox).value,
            metConditionFunction = (item) => { item.hidden = false; }, 
            overdueConditionFunction = (item) => { item.hidden = true; };
        
        console.log(searchText);

        var result = new ContainsPipe().transform(this.items, searchText, isCaseSensitive, metConditionFunction, overdueConditionFunction);

        console.log(result);
    }
}