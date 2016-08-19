import { Component, Input, Output, AfterContentInit, ContentChildren, QueryList, EventEmitter, Renderer } from '@angular/core';
import { ContainsPipe } from './filter-pipe';
import { ListItem, ListHeader } from './items';

declare var module: any;

@Component({
    selector: 'ig-list',
    host: { 'role': 'list' },
    pipes: [ ContainsPipe ],
    moduleId: module.id, // commonJS standard
    directives: [ListItem, ListHeader],
    templateUrl: 'list-content.html'
})

export class List implements AfterContentInit {
    @ContentChildren(ListItem) items: QueryList<ListItem>;
    @ContentChildren(ListHeader) headers: QueryList<ListHeader>;

    private _innerStyle: string = "ig-list-inner";

    searchInputElement: HTMLInputElement;
    isCaseSensitiveFiltering: boolean = false;

    @Input() searchInputId: string;
    @Output() filtering = new EventEmitter(false); // synchronous event emitter
    @Output() filtered = new EventEmitter();

    constructor(private _renderer: Renderer) {        
    }

    ngAfterContentInit() {
        var self = this;
        if(this.searchInputId) {
            this.searchInputElement = <HTMLInputElement>document.getElementById(this.searchInputId);
            if(this.searchInputElement) {
                this._renderer.listen(this.searchInputElement, 'input', this.filter.bind(this));
            }            
        }
    }

    filter() {
        var searchText, result, metConditionFunction, overdueConditionFunction, 
            filteringArgs, filteredArgs ;

        if(this.searchInputElement) {
            filteringArgs = { cancel: false };


            this.filtering.emit(filteringArgs);

            if(filteringArgs.cancel) { 
                return; 
            }

            searchText = (<HTMLInputElement>this.searchInputElement).value;        
            metConditionFunction = (item) => { item.hidden = false; }, 
            overdueConditionFunction = (item) => { item.hidden = true; };        

            result = new ContainsPipe().transform(this.items, searchText, this.isCaseSensitiveFiltering, metConditionFunction, overdueConditionFunction);

            filteredArgs = { result: result }
            this.filtered.emit(filteredArgs);
        }        
    }
}