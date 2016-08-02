import { Component, Renderer, Input, Output, ElementRef, ViewChild, AfterContentInit, ContentChildren, QueryList, EventEmitter } from '@angular/core';
//import { HammerGesturesManager } from '../core/core';
import { ContainsPipe } from './filter-pipe';
import { ListItem } from './items';

declare var module: any;

// ====================== LIST ================================
// The `<ig-list>` component is a list container for 1..n `<ig-item>` tags.
@Component({
    selector: 'ig-list',
    host: { 'role': 'list' },
    pipes: [ ContainsPipe ],
    moduleId: module.id, // commonJS standard
    directives: [ListItem],
    templateUrl: 'list-content.html'
})

export class List implements AfterContentInit {
    @ContentChildren(ListItem) items: QueryList<ListItem>;

    private _innerStyle: string = "ig-list-inner";
    private _inputSearchBox: HTMLElement;

    isCaseSensitiveFiltering: boolean = false;

    @Input() searchBoxId: string;
    @Output() filtering = new EventEmitter();
    @Output() filtered = new EventEmitter();

    constructor() {        
    }

    ngAfterContentInit() {
        var self = this;
        if(this.searchBoxId) {
            this._inputSearchBox = document.getElementById(this.searchBoxId);
            this._inputSearchBox.addEventListener("input", function() {
                    self.filter();
                });
        }
    }

    filter() {
        var searchText, result, metConditionFunction, overdueConditionFunction;

        this.filtering.emit({

        });

        searchText = (<HTMLInputElement>this._inputSearchBox).value;        
        metConditionFunction = (item) => { item.hidden = false; }, 
        overdueConditionFunction = (item) => { item.hidden = true; };        

        var result = new ContainsPipe().transform(this.items, searchText, this.isCaseSensitiveFiltering, metConditionFunction, overdueConditionFunction);

        this.filtered.emit({
            result: result
        });
    }
}