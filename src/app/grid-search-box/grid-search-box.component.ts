import { Component, Input } from '@angular/core';

import { IgxRippleDirective } from '../../../projects/igniteui-angular/src/lib/directives/ripple/ripple.directive';
import { IgxChipComponent } from '../../../projects/igniteui-angular/src/lib/chips/chip.component';
import { IgxChipsAreaComponent } from '../../../projects/igniteui-angular/src/lib/chips/chips-area.component';
import { IgxSuffixDirective } from '../../../projects/igniteui-angular/src/lib/directives/suffix/suffix.directive';
import { IgxInputDirective } from '../../../projects/igniteui-angular/src/lib/directives/input/input.directive';
import { FormsModule } from '@angular/forms';
import { IgxIconComponent } from '../../../projects/igniteui-angular/src/lib/icon/icon.component';
import { NgIf } from '@angular/common';
import { IgxPrefixDirective } from '../../../projects/igniteui-angular/src/lib/directives/prefix/prefix.directive';
import { IgxInputGroupComponent } from '../../../projects/igniteui-angular/src/lib/input-group/input-group.component';
import { IgxGridComponent, IgxHierarchicalGridComponent, IgxTreeGridComponent } from 'igniteui-angular';

@Component({
    selector: 'app-grid-search-box',
    styleUrls: ['./grid-search-box.component.scss'],
    templateUrl: './grid-search-box.component.html',
    standalone: true,
    imports: [IgxInputGroupComponent, IgxPrefixDirective, NgIf, IgxIconComponent, FormsModule, IgxInputDirective, IgxSuffixDirective, IgxChipsAreaComponent, IgxChipComponent, IgxRippleDirective]
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
