import { Component, Input, Output, AfterContentInit, ContentChildren, QueryList, EventEmitter, Renderer } from '@angular/core';
import { FilterPipe, FilterOptions } from './filter-pipe';
import { ListItem, ListHeader } from './items';

declare var module: any;

@Component({
    selector: 'ig-list',
    host: { 'role': 'list' },
    pipes: [ FilterPipe ],
    moduleId: module.id, // commonJS standard
    directives: [ ListItem, ListHeader ],
    templateUrl: 'list-content.html'
})

export class List implements AfterContentInit {
    @ContentChildren(ListItem) declarativeItems: QueryList<ListItem>; // TODO - merge them all
    @ContentChildren(ListHeader) headers: QueryList<ListHeader>;

    private _innerStyle: string = "ig-list-inner";
    private _items: ListItem[];

    searchInputElement: HTMLInputElement;
    isCaseSensitiveFiltering: boolean = false;
    get items() : ListItem[] {
        if(!this._items && this.declarativeItems) {
            this._items = this.declarativeItems.toArray();
        }

        return this._items;
    }

    @Input() searchInputId: string;
    @Input() filterOptions: FilterOptions;
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

    add(item: ListItem) {
        this.items.push(item);
    }

    filter() {
        var inputValue, result, filteringArgs, filteredArgs, items;

        if(this.searchInputElement) {
            filteringArgs = { cancel: false };

            this.filtering.emit(filteringArgs);

            if(filteringArgs.cancel) { // TODO - implmenet cancel
                return; 
            }            

            this.filterOptions = this.filterOptions || new FilterOptions();
            this.filterOptions.items = this.filterOptions.items || this.items;
            inputValue = (<HTMLInputElement>this.searchInputElement).value;
            result = new FilterPipe().transform(this.filterOptions, inputValue);

            filteredArgs = { result: result }
            this.filtered.emit(filteredArgs);
        }        
    }
}