import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { IgxButtonDirective, IgxIconButtonDirective, IgxIconComponent, IgxPageSizeSelectorComponent, IgxPaginatorComponent, IgxPaginatorContentDirective } from 'igniteui-angular';


@Component({
    selector: 'app-pagination',
    templateUrl: './pagination.template.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [IgxPaginatorComponent, IgxPaginatorContentDirective, IgxButtonDirective, IgxPageSizeSelectorComponent, IgxIconComponent, IgxIconButtonDirective]
})
export class PaginationSampleComponent implements OnInit {

    public totalPages: number;
    public totalRecords: number;

    public ngOnInit() {
        this.totalPages = 21;
        this.totalRecords = this.totalPages * 15;
    }

}
