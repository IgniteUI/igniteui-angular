import {
    Component
} from '@angular/core';
import { IgxExcelStyleSearchComponent } from './excel-style-search.component';

/**
 * A component used for presenting Excel style search UI for hierarchical tree-view structured data.
 */
@Component({
    selector: 'igx-tree-grid-excel-style-search',
    templateUrl: './tree-grid-excel-style-search.component.html'
})
export class IgxTreeGridExcelStyleSearchComponent extends IgxExcelStyleSearchComponent {
    // /**
    //  * @hidden @internal
    //  */
    // public get containerSize() {
    //     if (this.esf.listData.length) {
    //         return this.list.element.nativeElement.offsetHeight;
    //     }

    //     // // GE Nov 1st, 2021 #10355 Return a numeric value, so the chunk size is calculated properly.
    //     // // If we skip this branch, on applying the filter the _calculateChunkSize() method off the ForOfDirective receives
    //     // // an igxForContainerSize = undefined, thus assigns the chunkSize to the igxForOf.length which leads to performance issues.
    //     return 0;
    // }
}