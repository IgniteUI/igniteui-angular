import { Component, Input, Output, AfterContentInit, ContentChildren, QueryList, EventEmitter, Renderer, NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { FilterPipe, FilterOptions } from './filter-pipe';
import { ListItem, ListHeader } from './items';

//declare var module: any;

@Component({
    selector: 'ig-list',
    host: { 'role': 'list' },
    moduleId: module.id, // commonJS standard
    templateUrl: 'list-content.html'
})

export class List { 
    private _innerStyle: string = "ig-list";
    private _items: ListItem[];

    items: ListItem[] = [];
    headers: ListHeader[] = [];

    @Output() filtering = new EventEmitter(false); // synchronous event emitter
    @Output() filtered = new EventEmitter();

    constructor(private _renderer: Renderer) {
    }

    addItem(item: ListItem) {
        this.items.push(item);
    }

    addHeader(header: ListHeader) {
        this.headers.push(header);
    }
}

@NgModule({
    declarations: [List, ListItem, ListHeader],
    imports: [CommonModule],
    exports: [List, ListItem, ListHeader]
})
export class ListModule {
}