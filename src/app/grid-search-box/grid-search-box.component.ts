import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IGX_CHIPS_DIRECTIVES, IGX_INPUT_GROUP_DIRECTIVES, IgxGridComponent, IgxHierarchicalGridComponent, IgxIconComponent, IgxRippleDirective, IgxTreeGridComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-search-box',
    styleUrls: ['./grid-search-box.component.scss'],
    templateUrl: './grid-search-box.component.html',
    imports: [NgIf, IgxIconComponent, FormsModule, IgxRippleDirective, IGX_INPUT_GROUP_DIRECTIVES, IGX_CHIPS_DIRECTIVES]
})
export class GridSearchBoxComponent {
    @Input()
    public grid: IgxGridComponent | IgxTreeGridComponent | IgxHierarchicalGridComponent;

    public searchText = '';
    public caseSensitive = false;
    public exactMatch = false;

    public clearSearch() {
        this.searchText = '';
        this.grid.clearSearch();
    }

    public searchKeyDown(ev) {
        if (ev.key === 'Enter' || ev.key === 'ArrowDown' || ev.key === 'ArrowRight') {
            ev.preventDefault();
            this.grid.findNext(this.searchText, this.caseSensitive, this.exactMatch);
        } else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') {
            ev.preventDefault();
            this.grid.findPrev(this.searchText, this.caseSensitive, this.exactMatch);
        }
    }

    public updateSearch() {
        this.caseSensitive = !this.caseSensitive;
        this.grid.findNext(this.searchText, this.caseSensitive, this.exactMatch);
    }

    public updateExactSearch() {
        this.exactMatch = !this.exactMatch;
        this.grid.findNext(this.searchText, this.caseSensitive, this.exactMatch);
    }
}
